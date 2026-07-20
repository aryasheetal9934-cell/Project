// messages.js
// simple js for the fomogram messages page

window.onload = function () {

  var chatList = document.querySelector(".chat-list");
  var inboxEmpty = document.querySelector(".inbox-empty");
  var convoPanel = document.querySelector(".convo-panel");

  var chats = []; // keeping all chats in this array for now

  // compose icon - start a new chat
  var composeBtn = document.querySelector(".compose-icon");
  if (composeBtn) {
    composeBtn.onclick = function () {
      startNewChat();
    };
  }

  // new chat button inside the empty convo panel
  var newChatBtn = document.querySelector(".new-chat-btn");
  if (newChatBtn) {
    newChatBtn.onclick = function () {
      startNewChat();
    };
  }

  function startNewChat() {
    var name = prompt("Start a chat with (enter a name):");
    if (name == null || name.trim() == "") {
      return;
    }
    name = name.trim();

    // hide the "empty inbox" message the first time we add a chat
    if (inboxEmpty) {
      inboxEmpty.style.display = "none";
    }

    var chat = {
      name: name,
      messages: []
    };
    chats.push(chat);

    addChatToList(chat);
    openChat(chat);
  }

  function addChatToList(chat) {
    var chatItem = document.createElement("div");
    chatItem.className = "chat-item";
    chatItem.innerHTML =
      '<img src="https://tse4.mm.bing.net/th/id/OIP.XttC9UBnclUetGfuw2JYtwAAAA?pid=Api&P=0&h=180" alt="' + chat.name + '" class="avatar">' +
      '<div class="chat-item-info">' +
      '<span class="chat-item-name">' + chat.name + "</span>" +
      '<span class="chat-item-last">Say hi 👋</span>' +
      "</div>";

    chatItem.onclick = function () {
      openChat(chat);
    };

    chatList.appendChild(chatItem);
  }

  function openChat(chat) {
    // clear whatever is in the convo panel right now
    convoPanel.innerHTML = "";

    var header = document.createElement("div");
    header.className = "convo-header";
    header.innerHTML =
      '<img src="https://tse4.mm.bing.net/th/id/OIP.XttC9UBnclUetGfuw2JYtwAAAA?pid=Api&P=0&h=180" alt="' + chat.name + '" class="avatar">' +
      "<span>" + chat.name + "</span>";
    convoPanel.appendChild(header);

    var msgArea = document.createElement("div");
    msgArea.className = "convo-messages";
    convoPanel.appendChild(msgArea);

    // show whatever messages already exist in this chat
    for (var i = 0; i < chat.messages.length; i++) {
      addMessageBubble(msgArea, chat.messages[i]);
    }

    var inputRow = document.createElement("div");
    inputRow.className = "convo-input-row";
    inputRow.innerHTML =
      '<input type="text" placeholder="Start a new message" class="convo-input">' +
      '<button class="convo-send-btn">Send</button>';
    convoPanel.appendChild(inputRow);

    var inputBox = inputRow.querySelector(".convo-input");
    var sendBtn = inputRow.querySelector(".convo-send-btn");

    sendBtn.onclick = function () {
      sendMessage(chat, inputBox, msgArea);
    };

    // allow pressing enter to send too
    inputBox.onkeypress = function (e) {
      if (e.key === "Enter") {
        sendMessage(chat, inputBox, msgArea);
      }
    };
  }

  function sendMessage(chat, inputBox, msgArea) {
    var text = inputBox.value.trim();
    if (text == "") {
      return;
    }

    var message = { from: "me", text: text };
    chat.messages.push(message);
    addMessageBubble(msgArea, message);
    inputBox.value = "";

    // update the last message preview in the chat list
    updateLastPreview(chat, text);
  }

  function addMessageBubble(msgArea, message) {
    var bubble = document.createElement("div");
    bubble.className = "convo-bubble";
    if (message.from === "me") {
      bubble.classList.add("bubble-sent");
    } else {
      bubble.classList.add("bubble-received");
    }
    bubble.innerHTML = "<p>" + message.text + "</p>";
    msgArea.appendChild(bubble);

    // scroll down to the newest message
    msgArea.scrollTop = msgArea.scrollHeight;
  }

  function updateLastPreview(chat, text) {
    var chatItems = document.querySelectorAll(".chat-item");
    for (var i = 0; i < chatItems.length; i++) {
      var nameEl = chatItems[i].querySelector(".chat-item-name");
      if (nameEl.innerHTML === chat.name) {
        chatItems[i].querySelector(".chat-item-last").innerHTML = text;
      }
    }
  }

  // search box in the chat list - filters chats by name
  var searchInput = document.querySelector(".msg-search input");
  if (searchInput) {
    searchInput.oninput = function () {
      var query = searchInput.value.toLowerCase();
      var chatItems = document.querySelectorAll(".chat-item");

      for (var i = 0; i < chatItems.length; i++) {
        var name = chatItems[i].querySelector(".chat-item-name").innerHTML.toLowerCase();
        if (name.indexOf(query) != -1) {
          chatItems[i].style.display = "flex";
        } else {
          chatItems[i].style.display = "none";
        }
      }
    };
  }

  // sidebar post button - not much to post here, just an alert
  var sidebarPostBtn = document.querySelector(".sidebar .post-btn");
  if (sidebarPostBtn) {
    sidebarPostBtn.onclick = function () {
      alert("go to home page to post something!");
    };
  }

};
