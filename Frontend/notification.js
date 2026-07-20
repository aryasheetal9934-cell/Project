// notification.js
// simple js for the fomogram notifications page

window.onload = function () {

  // tabs - All / Mentions
  var tabs = document.querySelectorAll(".notif-tabs .tab");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].onclick = function () {
      for (var j = 0; j < tabs.length; j++) {
        tabs[j].classList.remove("active");
      }
      this.classList.add("active");
    };
  }

  // settings gear icon
  var settingsIcon = document.querySelector(".settings-icon");
  if (settingsIcon) {
    settingsIcon.onclick = function () {
      alert("notification settings coming soon");
    };
  }

  // sidebar post button - nothing to post here, just take them to home
  var sidebarPostBtn = document.querySelector(".post-btn");
  if (sidebarPostBtn) {
    sidebarPostBtn.onclick = function () {
      window.location.href = "home.html";
    };
  }

  // search box - press enter to search
  var searchInput = document.querySelector(".search-box input");
  if (searchInput) {
    searchInput.onkeypress = function (e) {
      if (e.key === "Enter") {
        alert("searching for: " + searchInput.value);
      }
    };
  }

};