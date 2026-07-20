// edit-profile.js - handles the edit profile form

document.addEventListener("DOMContentLoaded", () => {

  const STORAGE_KEY = "fomogram_profile";

  const nameInput = document.getElementById("name-input");
  const handleInput = document.getElementById("handle-input");
  const bioInput = document.getElementById("bio-input");
  const bioCount = document.getElementById("bio-count");

  const avatarInput = document.getElementById("avatar-upload");
  const avatarPreview = document.getElementById("avatar-preview");
  const bannerInput = document.getElementById("banner-upload");
  const bannerEl = document.querySelector(".edit-banner");

  const saveBtn = document.querySelector(".save-btn");
  const closeBtn = document.querySelector(".close-btn");
  const sidebarPostBtn = document.querySelector(".post-btn");

  // defaults, used the first time someone opens this page
  const defaults = {
    name: "Sheetal Arya",
    handle: "sheetal_arya",
    bio: "A little chaos,a lot of peace☘️",
    avatar: "shh.jpeg",
    banner: null
  };

  let current = { ...defaults };

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      current = { ...defaults, ...JSON.parse(saved) };
    } catch {
      current = { ...defaults };
    }
  }

  // pre-fill the form with current values
  nameInput.value = current.name;
  handleInput.value = current.handle;
  bioInput.value = current.bio;
  avatarPreview.src = current.avatar;
  updateBioCount();

  if (current.banner) {
    bannerEl.style.background = `center / cover no-repeat url(${current.banner})`;
  }

  bioInput.addEventListener("input", updateBioCount);

  function updateBioCount() {
    bioCount.textContent = `${bioInput.value.length}/160`;
  }

  // avatar upload -> preview immediately as a data URL
  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      avatarPreview.src = reader.result;
      current.avatar = reader.result;
    };
    reader.readAsDataURL(file);
  });

  // banner upload -> same idea
  bannerInput.addEventListener("change", () => {
    const file = bannerInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      bannerEl.style.background = `center / cover no-repeat url(${reader.result})`;
      current.banner = reader.result;
    };
    reader.readAsDataURL(file);
  });

  // close/back without saving
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      window.location.href = "profile.html";
    });
  }

  if (sidebarPostBtn) {
    sidebarPostBtn.addEventListener("click", () => {
      window.location.href = "home.html";
    });
  }

  // save everything and go back to the profile page
  saveBtn.addEventListener("click", () => {
    const updated = {
      name: nameInput.value.trim() || defaults.name,
      handle: handleInput.value.trim().replace(/^@/, "") || defaults.handle,
      bio: bioInput.value.trim(),
      avatar: current.avatar,
      banner: current.banner
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.location.href = "profile.html";
  });

});