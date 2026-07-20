document.addEventListener("DOMContentLoaded", () => {
  const MAX_CHARS = 280;

  const feed = document.querySelector(".feed");
  const shareToast = document.getElementById("shareToast");
  let toastTimer = null;

  // ---------- Shared helpers ----------

  function updateCharCount(textarea, countEl, submitBtn, getExtraState) {
    const remaining = MAX_CHARS - textarea.value.length;
    countEl.textContent = remaining;

    if (remaining <= 20) {
      countEl.classList.add("warning");
    } else {
      countEl.classList.remove("warning");
    }

    const hasText = textarea.value.trim().length > 0;
    const extra = getExtraState ? getExtraState() : {};
    const hasImage = !!extra.image;
    const hasValidPoll = !!extra.poll;

    submitBtn.disabled = (!hasText && !hasImage && !hasValidPoll) || remaining < 0;
  }

  function insertAtCursor(textarea, text) {
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    textarea.value = before + text + after;
    const newPos = start + text.length;
    textarea.setSelectionRange(newPos, newPos);
    textarea.focus();
    textarea.dispatchEvent(new Event("input"));
  }

  function closeAllPopups() {
    document.querySelectorAll(".emoji-backdrop, .poll-builder").forEach((el) => el.remove());
    document.querySelectorAll(".icons i.active-tool").forEach((el) => el.classList.remove("active-tool"));
  }

  function showToast(message) {
    shareToast.textContent = message;
    shareToast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => shareToast.classList.remove("show"), 1800);
  }

  // ---------- Composer factory (works for both inline box and modal) ----------

  function setupComposer({ textarea, charCountEl, submitBtn, iconsBar, extrasContainer, onSubmit }) {
    const state = { image: null, poll: null };

    const imageIcon = iconsBar.querySelector(".fa-image");
    const pollIcon = iconsBar.querySelector(".fa-square-poll-vertical");
    const emojiIcon = iconsBar.querySelector(".fa-face-smile");

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    function refreshCount() {
      updateCharCount(textarea, charCountEl, submitBtn, () => state);
    }

    // ----- Image -----
    imageIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAllPopups();
      fileInput.click();
    });

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        state.image = reader.result;
        renderImagePreview();
        refreshCount();
      };
      reader.readAsDataURL(file);
      fileInput.value = "";
    });

    function renderImagePreview() {
      let preview = extrasContainer.querySelector(".image-preview");
      if (!preview) {
        preview = document.createElement("div");
        preview.className = "image-preview";
        extrasContainer.appendChild(preview);
      }
      preview.innerHTML = `
        <img src="${state.image}" alt="preview">
        <button type="button" class="remove-image-btn" title="Remove image">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;
      preview.querySelector(".remove-image-btn").addEventListener("click", () => {
        state.image = null;
        preview.remove();
        refreshCount();
      });
    }

    // ----- Poll -----
    pollIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      const existing = extrasContainer.querySelector(".poll-builder");
      if (existing) {
        existing.remove();
        state.poll = null;
        pollIcon.classList.remove("active-tool");
        refreshCount();
        return;
      }
      closeAllPopups();
      pollIcon.classList.add("active-tool");
      renderPollBuilder();
    });

    function renderPollBuilder() {
      const builder = document.createElement("div");
      builder.className = "poll-builder";
      builder.innerHTML = `
        <input type="text" class="poll-question" placeholder="Ask a question" maxlength="100">
        <div class="poll-options">
          <input type="text" class="poll-option" placeholder="Option 1" maxlength="40">
          <input type="text" class="poll-option" placeholder="Option 2" maxlength="40">
        </div>
        <div class="poll-builder-actions">
          <button type="button" class="add-option-btn"><i class="fa-solid fa-plus"></i> Add option</button>
          <button type="button" class="remove-poll-btn"><i class="fa-solid fa-trash"></i> Remove poll</button>
        </div>
      `;
      extrasContainer.appendChild(builder);

      const optionsWrap = builder.querySelector(".poll-options");
      const addBtn = builder.querySelector(".add-option-btn");
      const removeBtn = builder.querySelector(".remove-poll-btn");

      function syncPollState() {
        const question = builder.querySelector(".poll-question").value.trim();
        const options = [...builder.querySelectorAll(".poll-option")]
          .map((i) => i.value.trim())
          .filter((v) => v.length > 0);

        state.poll = (question && options.length >= 2) ? { question, options } : null;
        refreshCount();
      }

      builder.addEventListener("input", syncPollState);

      addBtn.addEventListener("click", () => {
        const count = optionsWrap.querySelectorAll(".poll-option").length;
        if (count >= 4) return;
        const input = document.createElement("input");
        input.type = "text";
        input.className = "poll-option";
        input.maxLength = 40;
        input.placeholder = `Option ${count + 1}`;
        optionsWrap.appendChild(input);
        if (count + 1 >= 4) addBtn.disabled = true;
      });

      removeBtn.addEventListener("click", () => {
        builder.remove();
        state.poll = null;
        pollIcon.classList.remove("active-tool");
        refreshCount();
      });
    }

    // ----- Emoji -----
    emojiIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      const existing = document.querySelector(".emoji-backdrop");
      if (existing) {
        closeAllPopups();
        return;
      }
      closeAllPopups();
      emojiIcon.classList.add("active-tool");

      const backdrop = document.createElement("div");
      backdrop.className = "emoji-backdrop";

      const popup = document.createElement("div");
      popup.className = "emoji-popup";

      backdrop.appendChild(popup);
      document.body.appendChild(backdrop);

      backdrop.addEventListener("click", (ev) => {
        if (ev.target === backdrop) {
          backdrop.remove();
          emojiIcon.classList.remove("active-tool");
        }
      });

      if (customElements.get("emoji-picker")) {
        const picker = document.createElement("emoji-picker");
        popup.appendChild(picker);
        picker.addEventListener("emoji-click", (event) => {
          insertAtCursor(textarea, event.detail.unicode);
          backdrop.remove();
          emojiIcon.classList.remove("active-tool");
        });
      } else {
        popup.innerHTML = `<p class="emoji-fallback-msg">Emoji library not loaded. Add the emoji-picker-element script tag to your HTML head.</p>`;
      }
    });

    // fallback outside-click safety net (backdrop click already handles the main case)
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".emoji-popup") && !e.target.closest(".fa-face-smile")) {
        document.querySelectorAll(".emoji-backdrop").forEach((el) => el.remove());
        document.querySelectorAll(".fa-face-smile.active-tool").forEach((el) => el.classList.remove("active-tool"));
      }
    });

    textarea.addEventListener("input", refreshCount);

    submitBtn.addEventListener("click", () => {
      if (submitBtn.disabled) return;
      onSubmit({ text: textarea.value.trim(), image: state.image, poll: state.poll });

      // reset composer
      textarea.value = "";
      state.image = null;
      state.poll = null;
      extrasContainer.innerHTML = "";
      iconsBar.querySelectorAll("i.active-tool").forEach((el) => el.classList.remove("active-tool"));
      refreshCount();
    });

    refreshCount();
  }

  // ---------- Post rendering ----------

  function actionsMarkup() {
    return `
      <div class="post-actions">
        <span class="action-btn comment-btn">
          <i class="fa-regular fa-comment"></i>
          <span class="action-count">0</span>
        </span>
        <span class="action-btn retweet-btn">
          <i class="fa-solid fa-retweet"></i>
          <span class="action-count">0</span>
        </span>
        <span class="action-btn like-btn">
          <i class="fa-regular fa-heart"></i>
          <span class="action-count">0</span>
        </span>
        <span class="action-btn share-btn">
          <i class="fa-solid fa-arrow-up-from-bracket"></i>
        </span>
      </div>

      <div class="comment-section">
        <div class="comment-list"></div>
        <div class="comment-input-row">
          <img src="shh.jpeg" alt="You" class="avatar comment-avatar">
          <input type="text" class="comment-input" placeholder="Post your reply" maxlength="200">
          <button class="comment-send-btn" disabled>Reply</button>
        </div>
      </div>
    `;
  }

  function createPostElement({ text, image, poll }) {
    const post = document.createElement("div");
    post.className = "post new-post";

    let mediaHtml = "";
    if (image) {
      mediaHtml += `<div class="post-image"><img src="${image}" alt="post image"></div>`;
    }
    if (poll) {
      const optionsHtml = poll.options
        .map(() => `
          <div class="poll-option-display">
            <span class="poll-option-text"></span>
          </div>
        `).join("");
      mediaHtml += `
        <div class="post-poll">
          <p class="poll-question-display"></p>
          <div class="poll-options-display">${optionsHtml}</div>
        </div>
      `;
    }

    post.innerHTML = `
      <img src="shh.jpeg" alt="You" class="avatar">
      <div class="post-content">
        <div class="post-meta">
          <span class="post-name">You</span>
          <span class="post-handle">@you</span>
          <span class="post-time">· now</span>
        </div>
        <p class="post-text"></p>
        ${mediaHtml}
        ${actionsMarkup()}
      </div>
    `;

    if (text) {
      post.querySelector(".post-text").textContent = text;
    } else {
      post.querySelector(".post-text").remove();
    }

    if (poll) {
      post.querySelector(".poll-question-display").textContent = poll.question;
      post.querySelectorAll(".poll-option-text").forEach((el, i) => {
        el.textContent = poll.options[i];
      });
    }

    setupCommentInput(post);

    return post;
  }

  function insertNewPost(data) {
    if (!data.text && !data.image && !data.poll) return;
    const newPost = createPostElement(data);
    const firstExistingPost = feed.querySelector(".post");
    if (firstExistingPost) {
      feed.insertBefore(newPost, firstExistingPost);
    } else {
      feed.appendChild(newPost);
    }
  }

  // ---------- Wire up inline composer ----------

  const createPostBox = document.querySelector(".create-post");
  if (createPostBox) {
    const inlineTextarea = createPostBox.querySelector("textarea");
    const inlineCharCount = createPostBox.querySelector(".char-count");
    const inlineSubmitBtn = createPostBox.querySelector(".post-submit");
    const inlineIconsBar = createPostBox.querySelector(".icons");

    let inlineExtras = createPostBox.querySelector(".composer-extras");
    if (!inlineExtras) {
      inlineExtras = document.createElement("div");
      inlineExtras.className = "composer-extras";
      createPostBox.querySelector(".create-post-input").appendChild(inlineExtras);
    }

    setupComposer({
      textarea: inlineTextarea,
      charCountEl: inlineCharCount,
      submitBtn: inlineSubmitBtn,
      iconsBar: inlineIconsBar,
      extrasContainer: inlineExtras,
      onSubmit: insertNewPost,
    });
  }

  // ---------- Wire up modal composer ----------

  const modalOverlay = document.getElementById("postModalOverlay");
  const modalTextarea = document.getElementById("modalTextarea");
  const modalCharCount = document.getElementById("modalCharCount");
  const modalPostBtn = document.getElementById("modalPostBtn");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const sidebarPostBtn = document.querySelector(".sidebar .post-btn");

  if (modalOverlay) {
    const modalIconsBar = modalOverlay.querySelector(".post-modal-footer .icons");

    let modalExtras = modalOverlay.querySelector(".composer-extras");
    if (!modalExtras) {
      modalExtras = document.createElement("div");
      modalExtras.className = "composer-extras";
      modalOverlay.querySelector(".post-modal-input").appendChild(modalExtras);
    }

    function openModal() {
      modalOverlay.classList.add("active");
      setTimeout(() => modalTextarea.focus(), 0);
    }

    function closeModal() {
      modalOverlay.classList.remove("active");
      closeAllPopups();
    }

    sidebarPostBtn.addEventListener("click", openModal);
    modalCloseBtn.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalOverlay.classList.contains("active")) closeModal();
    });

    setupComposer({
      textarea: modalTextarea,
      charCountEl: modalCharCount,
      submitBtn: modalPostBtn,
      iconsBar: modalIconsBar,
      extrasContainer: modalExtras,
      onSubmit: (data) => {
        insertNewPost(data);
        closeModal();
      },
    });
  }

  // ---------- Comment input wiring (per post) ----------

  function setupCommentInput(post) {
    const input = post.querySelector(".comment-input");
    const sendBtn = post.querySelector(".comment-send-btn");
    if (!input || !sendBtn) return;

    input.addEventListener("input", () => {
      sendBtn.disabled = input.value.trim().length === 0;
    });

    function submitComment() {
      const text = input.value.trim();
      if (!text) return;

      const list = post.querySelector(".comment-list");
      const item = document.createElement("div");
      item.className = "comment-item";
      item.innerHTML = `
        <img src="shh.jpeg" alt="You" class="avatar">
        <div class="comment-bubble">
          <span class="comment-author">You</span><span class="comment-text"></span>
        </div>
      `;
      item.querySelector(".comment-text").textContent = text;
      list.appendChild(item);

      bumpCount(post.querySelector(".comment-btn"));

      input.value = "";
      sendBtn.disabled = true;
    }

    sendBtn.addEventListener("click", submitComment);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitComment();
    });
  }

  // wire up comment inputs for the posts already in the page (static markup)
  feed.querySelectorAll(".post").forEach(setupCommentInput);

  // ---------- Helpers for count bump / read ----------

  function bumpCount(btn, delta = 1) {
    const countEl = btn.querySelector(".action-count");
    if (!countEl) return;
    const current = parseInt(countEl.textContent, 10) || 0;
    countEl.textContent = current + delta;
  }

  function spawnHeartBurst(likeBtn) {
    for (let i = 0; i < 5; i++) {
      const spark = document.createElement("i");
      spark.className = "fa-solid fa-heart like-burst";
      const angle = (Math.PI * 2 * i) / 5 + Math.random() * 0.5;
      const distance = 18 + Math.random() * 10;
      spark.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      spark.style.setProperty("--dy", `${Math.sin(angle) * distance - 10}px`);
      likeBtn.appendChild(spark);
      spark.addEventListener("animationend", () => spark.remove());
    }
  }

  // ---------- Like / Retweet / Comment toggle / Share (event delegation) ----------

  feed.addEventListener("click", (e) => {
    const likeBtn = e.target.closest(".like-btn");
    const retweetBtn = e.target.closest(".retweet-btn");
    const commentBtn = e.target.closest(".comment-btn");
    const shareBtn = e.target.closest(".share-btn");

    if (likeBtn) {
      const icon = likeBtn.querySelector("i");
      const isLiked = likeBtn.classList.toggle("liked");
      icon.classList.toggle("fa-regular", !isLiked);
      icon.classList.toggle("fa-solid", isLiked);
      bumpCount(likeBtn, isLiked ? 1 : -1);
      if (isLiked) spawnHeartBurst(likeBtn);
      return;
    }

    if (retweetBtn) {
      const isRetweeted = retweetBtn.classList.toggle("retweeted");
      bumpCount(retweetBtn, isRetweeted ? 1 : -1);
      return;
    }

    if (commentBtn) {
      const post = commentBtn.closest(".post");
      const section = post.querySelector(".comment-section");
      const isOpen = section.classList.toggle("open");
      commentBtn.classList.toggle("open", isOpen);
      if (isOpen) {
        setTimeout(() => post.querySelector(".comment-input").focus(), 50);
      }
      return;
    }

    if (shareBtn) {
      shareBtn.classList.remove("shared");
      // force reflow so the animation can retrigger on repeated clicks
      void shareBtn.offsetWidth;
      shareBtn.classList.add("shared");
      showToast("Link copied to clipboard!");
      return;
    }
  });
});