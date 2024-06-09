const express = require('express');
const { registerUser, authUser, allUsers, sendFriendRequest, acceptFriendRequest, updateProfileUser } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers);
router.route("/login").post(authUser);
router.route("/profile").put(protect, updateProfileUser);

// // Đường dẫn để gửi yêu cầu kết bạn
// router.post("/user/send-friend-request/:userId", protect, sendFriendRequest);

// // Đường dẫn để chấp nhận yêu cầu kết bạn
// router.post("/user/accept-friend-request/:requesterId", protect, acceptFriendRequest);

module.exports = router;