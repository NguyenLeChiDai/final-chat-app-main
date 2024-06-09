const express = require("express");
const multer = require("multer");
const { protect } = require("../middlewares/authMiddleware");
const { allMessages, sendMessage, deleteMessage, uploadFile, replyMessage, removeReceiver } = require("../controllers/messageController");
const router = express.Router();

// Cấu hình lưu trữ file với multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Thư mục lưu trữ file
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Tên file
  },
});

const upload = multer({ storage: storage });

// Endpoint để lấy tất cả các tin nhắn trong một cuộc trò chuyện
router.get("/:chatId", protect, allMessages);

// Endpoint để gửi một tin nhắn mới
router.post("/", protect, sendMessage);

// Endpoint để xóa một tin nhắn (xóa hoàn toàn tin nhắn)
router.delete("/:messageId", protect, deleteMessage);

// Endpoint để gỡ người nhận khỏi tin nhắn
router.put("/remove-receiver/:messageId", protect, removeReceiver);

// Endpoint để gửi file
router.post('/upload-file', protect, upload.single('file'), uploadFile);

// Endpoint để gửi tin nhắn reply
router.post('/reply', protect, replyMessage);

module.exports = router;
