const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phoneNumber, password, pic } = req.body;

  if (!name || !email || !phoneNumber || !password) {
    res.status(400);
    throw new Error("Vui lòng nhập đầy đủ thông tin");
  }

  const userExists = await User.findOne({ phoneNumber });

  if (userExists) {
    res.status(400);
    throw new Error("Tài khoản đã tồn tại");
  }

  const user = await User.create({
    name,
    email,
    phoneNumber,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Tạo tài khoản thất bại");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { phoneNumber, password } = req.body;
  const user = await User.findOne({ phoneNumber });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Sai số điện thoại hoặc mật khẩu");
  }
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { phoneNumber: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

// Gửi yêu cầu kết bạn
const sendFriendRequest = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const senderId = req.user._id;

  // Kiểm tra xem người nhận có tồn tại không
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Kiểm tra xem yêu cầu kết bạn đã được gửi trước đó hay không
  if (user.friendRequests.includes(senderId)) {
    res.status(400);
    throw new Error("Friend request already sent");
  }

  // Thêm yêu cầu kết bạn vào người nhận
  user.friendRequests.push(senderId);
  await user.save();

  res.status(200).json({ message: "Friend request sent successfully" });
});

// Chấp nhận yêu cầu kết bạn
// Chấp nhận yêu cầu kết bạn
const acceptFriendRequest = asyncHandler(async (req, res) => {
  const requesterId = req.params.requesterId;
  const userId = req.user._id;

  const requester = await User.findById(requesterId);
  if (!requester) {
    res.status(404);
    throw new Error("Requester not found");
  }

  if (!requester.friendRequests.includes(userId)) {
    res.status(400);
    throw new Error("Friend request not found");
  }

  requester.friendRequests = requester.friendRequests.filter(
    (id) => id.toString() !== userId.toString()
  );

  requester.friends.push(userId);
  req.user.friends.push(requesterId);

  await requester.save();
  await req.user.save();

  res.status(200).json({ message: "Friend request accepted successfully" });
});

// Cập nhật thông tin người dùng
const updateProfileUser = asyncHandler(async (req, res) => {
    const { name, email, phoneNumber, pic, password } = req.body;
  
    const user = await User.findById(req.user._id);
  
    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.pic = pic || user.pic;
  
      if (password) {
        user.password = password;
      }
  
      const updatedUser = await user.save();
  
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        pic: updatedUser.pic,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error("Không tìm thấy người này");
    }
  });

module.exports = {
  registerUser,
  authUser,
  allUsers,
  acceptFriendRequest,
  sendFriendRequest,
  updateProfileUser,
};
