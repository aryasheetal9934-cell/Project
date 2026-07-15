// connections.js

var listBox = document.getElementById("connections-list");
var tabs = document.querySelectorAll(".conn-tab");
var followState = {};

var following = [
  { id: "aham_g", name: "Aham", handle: "aham_g", bio: "Some feeling dont need words", pic: "https://tse4.mm.bing.net/th/id/OIP.XttC9UBnclUetGfuw2JYtwAAAA?pid=Api&P=0&h=180" },
  { id: "snehap", name: "Neha Patil", handle: "snehap", bio: "Elegance lives in simplicity🐼", pic: "https://tse2.mm.bing.net/th/id/OIP.PhJFjFCemtVCEGSOO8BgXAHaHa?pid=Api&P=0&h=180" },
  { id: "maneet__", name: "Maneet Singh", handle: "maneet__", bio: "just existing,beautifully🕊️", pic: "https://tse4.mm.bing.net/th/id/OIP.2_6b4lk660eaWdELhk3BnwAAAA?pid=Api&P=0&h=180" },
  { id: "riasharma", name: "Ria Sharma", handle: "riasharma", bio: "chasing sunsets, not approval🌅", pic: "shh.jpeg" },
  { id: "kabirv", name: "Kabir Verma", handle: "kabirv", bio: "coffee first, thoughts later☕", pic: "shh.jpeg" },
  { id: "ishitam", name: "Ishita Mehta", handle: "ishitam", bio: "soft life advocate🌷", pic: "shh.jpeg" }
];

var followers = [
  { id: "aham_g", name: "Aham", handle: "aham_g", bio: "Some feeling dont need words", pic: "https://tse4.mm.bing.net/th/id/OIP.XttC9UBnclUetGfuw2JYtwAAAA?pid=Api&P=0&h=180" },
  { id: "devanshr", name: "Devansh Rao", handle: "devanshr", bio: "building things, breaking things", pic: "shh.jpeg" },
  { id: "priyaj", name: "Priya Jain", handle: "priyaj", bio: "words are my love language📝", pic: "shh.jpeg" },
  { id: "arjunk", name: "Arjun Kapoor", handle: "arjunk", bio: "gym, code, repeat🏋️", pic: "shh.jpeg" },
  { id: "snehap", name: "Neha Patil", handle: "snehap", bio: "Elegance lives in simplicity🐼", pic: "https://tse2.mm.bing.net/th/id/OIP.PhJFjFCemtVCEGSOO8BgXAHaHa?pid=Api&P=0&h=180" },
  { id: "tanviu", name: "Tanvi Unni", handle: "tanviu", bio: "quiet mornings, loud playlists🎧", pic: "shh.jpeg" },
  { id: "rohanm", name: "Rohan Mistry", handle: "rohanm", bio: "sea over city, always🌊", pic: "shh.jpeg" },
  { id: "zoyak", name: "Zoya Khan", handle: "zoyak", bio: "collecting moments, not things📸", pic: "shh.jpeg" }
];

// load saved follow/unfollow clicks from localStorage
var saved = localStorage.getItem("fomogram_follow_state");
if (saved) {
  followState = JSON.parse(saved);
}

function checkFollowing(person) {
  if (followState[person.id] !== undefined) {
    return followState[person.id];
  }
  for (var i = 0; i < following.length; i++) {
    if (following[i].id === person.id) return true;
  }
  return false;
}

function showList(tab) {
  listBox.innerHTML = "";

  var data = tab === "followers" ? followers : following;

  if (data.length === 0) {
    listBox.innerHTML = "<div class='connections-empty'>Nothing here yet</div>";
    return;
  }

  for (var i = 0; i < data.length; i++) {
    var person = data[i];
    var isFollowing = checkFollowing(person);

    var row = document.createElement("div");
    row.className = "conn-row";
    row.innerHTML =
      "<img src='" + person.pic + "' class='avatar'>" +
      "<div class='conn-info'>" +
        "<div class='conn-name-row'>" +
          "<span class='conn-name'>" + person.name + "</span>" +
          "<span class='conn-handle'>@" + person.handle + "</span>" +
        "</div>" +
        "<p class='conn-bio'>" + person.bio + "</p>" +
      "</div>" +
      "<button class='conn-follow-btn " + (isFollowing ? "following" : "") + "' data-id='" + person.id + "'>" +
        "<span>" + (isFollowing ? "Following" : "Follow") + "</span>" +
      "</button>";

    listBox.appendChild(row);
  }
}

// follow / unfollow click
listBox.addEventListener("click", function (e) {
  var btn = e.target.closest(".conn-follow-btn");
  if (!btn) return;

  var id = btn.getAttribute("data-id");
  var willFollow = !btn.classList.contains("following");

  followState[id] = willFollow;
  localStorage.setItem("fomogram_follow_state", JSON.stringify(followState));

  if (willFollow) {
    btn.classList.add("following");
    btn.querySelector("span").textContent = "Following";
  } else {
    btn.classList.remove("following");
    btn.querySelector("span").textContent = "Follow";
  }
});

// tab switch
for (var i = 0; i < tabs.length; i++) {
  tabs[i].addEventListener("click", function () {
    for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove("active");
    this.classList.add("active");
    showList(this.getAttribute("data-tab"));
  });
}

// check url for ?tab=followers or ?tab=following, default to following
var urlParams = new URLSearchParams(window.location.search);
var startTab = urlParams.get("tab") === "followers" ? "followers" : "following";

for (var i = 0; i < tabs.length; i++) {
  if (tabs[i].getAttribute("data-tab") === startTab) {
    tabs[i].classList.add("active");
  } else {
    tabs[i].classList.remove("active");
  }
}
showList(startTab);

// back button
var backBtn = document.querySelector(".back-btn");
if (backBtn) {
  backBtn.addEventListener("click", function () {
    if (document.referrer) {
      history.back();
    } else {
      window.location.href = "profile.html";
    }
  });
}

// post button in sidebar
var postBtn = document.querySelector(".post-btn");
if (postBtn) {
  postBtn.addEventListener("click", function () {
    window.location.href = "home.html";
  });
}