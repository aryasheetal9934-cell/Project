const express = require("express");
const router = express.Router();

const { getProfile } = require("../controllers/profileController");
const { getMessages, addMessage } = require("../controllers/messageController");

router.get("/profile", getProfile);
router.get("/messages", getMessages);
router.post("/messages", addMessage);

module.exports = router;