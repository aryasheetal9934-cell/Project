let messages = [
  { id: 1, text: "Hello World" },
  { id: 2, text: "Second message" },
];

exports.getMessages = (req, res) => {
  res.json(messages);
};

exports.addMessage = (req, res) => {
  const newMsg = { id: messages.length + 1, text: req.body.text };
  messages.push(newMsg);
  res.status(201).json(newMsg);
};