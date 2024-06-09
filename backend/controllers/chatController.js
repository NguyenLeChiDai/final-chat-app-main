const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;
  
    if (!userId) {
      console.log("UserId param not sent with request");
      return res.sendStatus(400);
    }
  
    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");
  
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
  
    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };
  
      try {
        const createdChat = await Chat.create(chatData);
        const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
          "users",
          "-password"
        );
        res.status(200).json(FullChat);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
    }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
      return res.status(400).send({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
  
    var users = JSON.parse(req.body.users);
  
    if (users.length < 2) {
      return res
        .status(400)
        .send("Phải có hơn 2 thành viên mới tạo được nhóm trò chuyện");
    }
  
    users.push(req.user);
  
    try {
      const groupChat = await Chat.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: req.user,
      });
  
      const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
  
      res.status(200).json(fullGroupChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
});

const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;
  
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
  
    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(updatedChat);
    }
});

const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
  
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
  
    if (!removed) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(removed);
    }
});

const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
  
    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
  
    if (!added) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(added);
    }
});

// const deleteGroupChat = asyncHandler(async (req, res) => {
//   const { chatId } = req.params.chatId;

//   try {
//     const chat = await Chat.findById(chatId);

//     // Kiểm tra xem nhóm chat tồn tại và có phải là nhóm chat không
//     if (!chat) {
//       return res.status(404).json({ message: "Không tìm thấy nhóm chat" });
//     }

//     if (!chat.isGroupChat) {
//       return res.status(404).json({ message: "Đây không phải nhóm chat" });
//     }

//     // Kiểm tra xem người gửi yêu cầu có phải là admin của nhóm không
//     if (!chat.groupAdmin.equals(req.user._id)) {
//       return res.status(403).json({ message: "Bạn không có quyền xóa nhóm" });
//     }

//     // Xóa nhóm chat
//     const deletedChat = await Chat.findByIdAndDelete(chatId);

//     if (deletedChat) {
//       return res.status(200).json({ message: "Xóa nhóm chat thành công" });
//     }
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Lỗi khi xóa nhóm chat", error: error.message });
//   }
// });

const deleteGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId);

    // Kiểm tra xem nhóm chat tồn tại và có phải là nhóm chat không
    if (!chat) {
      return res.status(404).json({ message: "Không tìm thấy nhóm chat" });
    }

    if (!chat.isGroupChat) {
      return res.status(404).json({ message: "Đây không phải nhóm chat" });
    }

    // Kiểm tra xem người gửi yêu cầu có phải là admin của nhóm không
    if (!chat.groupAdmin.equals(req.user._id)) {
      return res.status(403).json({ message: "Bạn không có quyền xóa nhóm" });
    }

    // Xóa nhóm chat
    const deletedChat = await Chat.findByIdAndDelete(chatId);

    if (deletedChat) {
      return res.status(200).json({ message: "Xóa nhóm chat thành công" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa nhóm chat", error: error.message });
  }
});

module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, removeFromGroup, addToGroup, deleteGroupChat }