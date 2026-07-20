

var profileMain = document.querySelector(".profile-main");
var tabs = document.querySelectorAll(".tab");
var followBtns = document.querySelectorAll(".follow-btn");

var profileName = document.querySelector(".profile-name");
var profileHandle = document.querySelector(".profile-handle");
var profileBio = document.querySelector(".profile-bio");
var profileAvatar = document.querySelector(".profile-avatar");
var topbarName = document.querySelector(".topbar-name");


var saved = localStorage.getItem("fomogram_profile");
if (saved) {
  var data = JSON.parse(saved);

  if (data.name) {
    if (profileName) profileName.textContent = data.name;
    if (topbarName) topbarName.textContent = data.name;
    document.querySelectorAll(".post-name").forEach(function (el) {
      el.textContent = data.name;
    });
  }

  if (data.handle) {
    if (profileHandle) profileHandle.textContent = "@" + data.handle;
    document.querySelectorAll(".post-handle").forEach(function (el) {
      el.textContent = "@" + data.handle;
    });
  }

  if (data.bio && profileBio) profileBio.textContent = data.bio;

  if (data.avatar) {
    if (profileAvatar) profileAvatar.src = data.avatar;
    document.querySelectorAll(".post .avatar").forEach(function (el) {
      el.src = data.avatar;
    });
  }
}


document.addEventListener("click", function (e) {
  if (e.target.closest(".back-btn")) {
    if (document.referrer) {
      history.back();
    } else {
      window.location.href = "home.html";
    }
  }

  if (e.target.closest(".edit-profile-btn")) {
    window.location.href = "edit.html";
  }

  if (e.target.closest(".post-btn")) {
    window.location.href = "home.html";
  }

  if (e.target.closest(".profile-follow-stats span:first-child")) {
    window.location.href = "connections.html?tab=following";
  }

  if (e.target.closest(".profile-follow-stats span:last-child")) {
    window.location.href = "connections.html?tab=followers";
  }
});

document.querySelectorAll(".profile-follow-stats span").forEach(function (span) {
  span.style.cursor = "pointer";
});


var allPosts = Array.from(document.querySelectorAll(".post"));


var repostList = [];

for (var i = 0; i < tabs.length; i++) {
  tabs[i].addEventListener("click", function () {
    for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove("active");
    this.classList.add("active");

    var tabName = this.textContent.trim();
    document.querySelectorAll(".post, .repost-wrapper, .empty-tab-state").forEach(function (el) {
      el.remove();
    });

    if (tabName === "Posts") {
      allPosts.forEach(function (post) {
        profileMain.appendChild(post);
      });
    } else if (tabName === "Repost") {
      if (repostList.length === 0) {
        var empty = document.createElement("div");
        empty.className = "empty-tab-state";
        empty.textContent = "No reposts yet";
        profileMain.appendChild(empty);
      } else {
        repostList.forEach(function (wrapper) {
          profileMain.appendChild(wrapper);
        });
      }
    } else {
      var empty = document.createElement("div");
      empty.className = "empty-tab-state";
      empty.textContent = "No " + tabName.toLowerCase() + " yet";
      profileMain.appendChild(empty);
    }
  });
}


for (var i = 0; i < followBtns.length; i++) {
  followBtns[i].addEventListener("click", function () {
    var following = this.classList.toggle("following");
    this.textContent = following ? "Following" : "Follow";
  });
}


profileMain.addEventListener("click", function (e) {
  var actionSpan = e.target.closest(".post-actions span");
  if (!actionSpan) return;

  var icon = actionSpan.querySelector("i");
  if (!icon) return;

  var count = parseInt(actionSpan.textContent.trim()) || 0;

  if (icon.classList.contains("fa-heart")) {
    var liked = icon.classList.contains("fa-solid");
    if (liked) {
      icon.classList.remove("fa-solid");
      icon.classList.add("fa-regular");
      count--;
    } else {
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");
      count++;
    }
    actionSpan.innerHTML = "";
    actionSpan.appendChild(icon);
    actionSpan.append(" " + Math.max(0, count));
  }

  else if (icon.classList.contains("fa-retweet")) {
    showRepostMenu(actionSpan, icon);
  }

  else if (icon.classList.contains("fa-comment")) {
    var reply = prompt("Write a reply:");
    if (reply !== null && reply.trim() !== "") {
      actionSpan.innerHTML = "";
      actionSpan.appendChild(icon);
      actionSpan.append(" " + (count + 1));
    }
  }

  else if (icon.classList.contains("fa-arrow-up-from-bracket")) {
    var text = actionSpan.closest(".post-content").querySelector(".post-text").textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(text);

    var original = icon.className;
    icon.className = "fa-solid fa-check";
    setTimeout(function () {
      icon.className = original;
    }, 1200);
  }
});


function showRepostMenu(actionSpan, icon) {
  closeRepostMenu();

  var rect = actionSpan.getBoundingClientRect();

  var menu = document.createElement("div");
  menu.className = "repost-menu";
  menu.style.top = (rect.bottom + 6) + "px";
  menu.style.left = rect.left + "px";

  menu.innerHTML =
    "<div class='repost-option' data-action='repost'>" +
      "<i class='fa-solid fa-retweet'></i> Repost" +
    "</div>" +
    "<div class='repost-option' data-action='quote'>" +
      "<i class='fa-solid fa-pen'></i> Quote" +
    "</div>";

  menu.querySelectorAll(".repost-option").forEach(function (opt) {
    opt.addEventListener("click", function (e) {
      e.stopPropagation();
      var action = opt.getAttribute("data-action");

      if (action === "repost") {
        doRepost(actionSpan, icon);
      } else {
        doQuote(actionSpan);
      }

      closeRepostMenu();
    });
  });

  document.body.appendChild(menu);


  setTimeout(function () {
    document.addEventListener("click", outsideClickCloser);
  }, 0);
}

function outsideClickCloser(e) {
  var menu = document.querySelector(".repost-menu");
  if (menu && !menu.contains(e.target)) {
    closeRepostMenu();
  }
}

function closeRepostMenu() {
  var existing = document.querySelector(".repost-menu");
  if (existing) existing.remove();
  document.removeEventListener("click", outsideClickCloser);
}

function doRepost(actionSpan, icon) {
  var reposted = actionSpan.classList.toggle("active-retweet");
  var count = parseInt(actionSpan.textContent.trim()) || 0;
  count = reposted ? count + 1 : Math.max(0, count - 1);

  actionSpan.innerHTML = "";
  actionSpan.appendChild(icon);
  actionSpan.append(" " + count);

  var originalPost = actionSpan.closest(".post");

  if (reposted) {
    var wrapper = document.createElement("div");
    wrapper.className = "repost-wrapper";
    wrapper.dataset.sourcePost = originalPost.querySelector(".post-text").textContent;

    var label = document.createElement("div");
    label.className = "repost-label";
    label.innerHTML = "<i class='fa-solid fa-retweet'></i> You reposted";

    var clone = originalPost.cloneNode(true);

    wrapper.appendChild(label);
    wrapper.appendChild(clone);
    repostList.unshift(wrapper);
  } else {
    
    var textToRemove = originalPost.querySelector(".post-text").textContent;
    repostList = repostList.filter(function (w) {
      return w.dataset.sourcePost !== textToRemove;
    });
  }
}

function doQuote(actionSpan) {
  var comment = prompt("Add a comment:");
  if (comment === null || comment.trim() === "") return;

  var originalPost = actionSpan.closest(".post");
  var originalText = originalPost.querySelector(".post-text").textContent;
  var originalName = originalPost.querySelector(".post-name").textContent;
  var originalHandle = originalPost.querySelector(".post-handle").textContent;

  var newPost = document.createElement("div");
  newPost.className = "post";
  newPost.innerHTML =
    "<img src='shh.jpeg' class='avatar'>" +
    "<div class='post-content'>" +
      "<div class='post-meta'>" +
        "<span class='post-name'>You</span>" +
        "<span class='post-handle'>@you</span>" +
        "<span class='post-time'>· now</span>" +
      "</div>" +
      "<p class='post-text'></p>" +
      "<div class='quoted-post'>" +
        "<span class='quoted-name'></span> " +
        "<span class='quoted-handle'></span>" +
        "<div class='quoted-text'></div>" +
      "</div>" +
      "<div class='post-actions'>" +
        "<span><i class='fa-regular fa-comment'></i> 0</span>" +
        "<span><i class='fa-solid fa-retweet'></i> 0</span>" +
        "<span><i class='fa-regular fa-heart'></i> 0</span>" +
        "<span><i class='fa-solid fa-arrow-up-from-bracket'></i></span>" +
      "</div>" +
    "</div>";

  newPost.querySelector(".post-text").textContent = comment;
  newPost.querySelector(".quoted-name").textContent = originalName;
  newPost.querySelector(".quoted-handle").textContent = originalHandle;
  newPost.querySelector(".quoted-text").textContent = originalText;

  profileMain.insertBefore(newPost, profileMain.querySelector(".post"));

  
  allPosts.unshift(newPost);


  var wrapper = document.createElement("div");
  wrapper.className = "repost-wrapper";
  wrapper.dataset.sourcePost = "quote:" + comment;

  var label = document.createElement("div");
  label.className = "repost-label";
  label.innerHTML = "<i class='fa-solid fa-pen'></i> You quoted";

  wrapper.appendChild(label);
  wrapper.appendChild(newPost.cloneNode(true));
  repostList.unshift(wrapper);
}