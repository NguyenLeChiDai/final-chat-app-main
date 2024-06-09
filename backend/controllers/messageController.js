const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  try {
    // Tìm kiếm thông tin cuộc trò chuyện từ chatId
    const chat = await Chat.findById(chatId);

    // Lấy danh sách người nhận từ thông tin cuộc trò chuyện
    const receiverIds = chat.users;
    const senderIndex = receiverIds.indexOf(req.user._id.toString());

    // Tạo tin nhắn mới chỉ với danh sách người nhận
    var message = await Message.create({
      sender: req.user._id,
      receiver: receiverIds,
      content: content,
      chat: chatId,
    });
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const allMessages = asyncHandler(async (req, res) => {
  try {
    // Tìm tin nhắn theo chatId
    const messages = await Message.find({ chat: req.params.chatId });

    // Lọc tin nhắn chỉ cho những người dùng có tên trong danh sách receiver
    const filteredMessages = messages.filter(message =>
      message.receiver.includes(req.user._id.toString())
    );

    // Populate thông tin sender và chat cho tin nhắn
    const populatedMessages = await Message.populate(filteredMessages, [
      { path: "sender", select: "name pic email" },
      { path: "chat" }
    ]);

    res.json(populatedMessages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// const deleteMessage = asyncHandler(async (req, res) => {
//   const messageId = req.params.messageId;

//   try {
//     // Kiểm tra xem tin nhắn tồn tại không
//     const message = await Message.findById(messageId);
//     if (!message) {
//       res.status(404);
//       throw new Error("Không tìm thấy tin nhắn");
//     }

//     if (message.sender.toString() !== req.user._id.toString()) {
//       // Lấy danh sách người nhận từ tin nhắn
//       let receiverIds = message.receiver;

//       // Loại bỏ id của người dùng khỏi danh sách người nhận
//       const userIndex = receiverIds.indexOf(req.user._id.toString());
//       if (userIndex !== -1) {
//         receiverIds.splice(userIndex, 1);
//       }

//       // Cập nhật tin nhắn với danh sách người nhận mới
//       await Message.findByIdAndUpdate(messageId, { receiver: receiverIds });
//     }
//     else
//     {
//       await Message.findByIdAndDelete(messageId);
//     }

//     res.json({ message: "Xóa tin nhắn thành công" });
//   } catch (error) {
//     res.status(400);
//     throw new Error(error.message);
//   }
// });

// Gỡ tin nhắn
const removeReceiver = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;

  try {
    // Kiểm tra xem tin nhắn tồn tại không
    const message = await Message.findById(messageId);
    if (!message) {
      res.status(404);
      throw new Error("Không tìm thấy tin nhắn");
    }

    // Lấy danh sách người nhận từ tin nhắn
    let receiverIds = message.receiver;

    // Loại bỏ id của người dùng khỏi danh sách người nhận
    const userIndex = receiverIds.indexOf(req.user._id.toString());
    if (userIndex !== -1) {
      receiverIds.splice(userIndex, 1);
    }

    // Cập nhật tin nhắn với danh sách người nhận mới
    await Message.findByIdAndUpdate(messageId, { receiver: receiverIds });

    res.json({ message: "Gỡ người nhận khỏi tin nhắn thành công" });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Xóa tin nhắn
const deleteMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;

  try {
    // Kiểm tra xem tin nhắn tồn tại không
    const message = await Message.findById(messageId);
    if (!message) {
      res.status(404);
      throw new Error("Không tìm thấy tin nhắn");
    }

    // Kiểm tra xem người dùng có phải là người gửi không
    if (message.sender.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Bạn không có quyền thu hồi tin nhắn này");
    }

    // Xóa tin nhắn
    await Message.findByIdAndDelete(messageId);

    res.json({ message: "Thu hồi tin nhắn thành công" });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});



//xử lý gửi file ,vs message
const uploadFile = asyncHandler(async (req, res) => {
  const { chatId } = req.body;
  const file = req.file;

  if (!file || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  // Lưu file vào thư mục uploads trên server
  const filePath = `/uploads/${file.filename}`;

  try {
    // Tạo tin nhắn mới chứa đường dẫn của file
    const message = await Message.create({
      sender: req.user._id,
      content: filePath,
      chat: chatId,
    });

    res.json({ filePath }); // Trả về đường dẫn của file cho client
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const replyMessage = asyncHandler(async (req, res) => {
  const { content, originalMessageId } = req.body;

  if (!content || !originalMessageId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  try {
    // Lấy thông tin tin nhắn gốc
    const originalMessage = await Message.findById(originalMessageId);
    const receiverIds = originalMessage.receiver; // Lấy danh sách người nhận từ tin nhắn gốc

    if (!originalMessage) {
      console.log("Original message not found");
      return res.sendStatus(404);
    }

    // Tạo tin nhắn trả lời
    const newMessage = {
      sender: req.user._id,
      receiver: receiverIds,
      content: content,
      chat: originalMessage.chat, // Sử dụng chat của tin nhắn gốc
      originalMessage: originalMessageId, // Lưu ID của tin nhắn gốc
    };

    const message = await Message.create(newMessage);

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessage, allMessages, deleteMessage, uploadFile, replyMessage, removeReceiver };
