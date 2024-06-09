const express = require("express");
const app = express();
require("dotenv").config();
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const path = require("path");
const cors = require("cors");
const colors = require("colors");

//------- Kết nối CSDL
const connectDB = require("./config/db");
connectDB();

//------- Cấu hình CORS
const whitelist = ['http://localhost:3000', 'https://zola-3q9b.onrender.com'];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};


app.use(cors(corsOptions));

//------- Định nghĩa các Route
app.use(express.json());

const userRoute = require("./routes/userRoute");
app.use("/api/user/", userRoute);

const chatRoute = require("./routes/chatRoute");
app.use("/api/chat", chatRoute);

const messageRoute = require("./routes/messageRoute");
app.use("/api/message", messageRoute);

//------- Deploy
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "../frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running successfully");
  });
}

//-------
app.use(notFound);
app.use(errorHandler);

//------- Định nghĩa port
const port = process.env.PORT;
const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`.yellow.bold)
);

//------- Cấu hình socket.io
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: whitelist,
    methods: ["GET", "POST"],
    credentials: true
  },
});


io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users không xác định");
    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("messageDeleted", (messageId) => {
    socket.broadcast.emit("messageDeleted", messageId);
  });

  socket.on("send reply", async (data) => {
    try {
      io.emit("reply received", data);
    } catch (error) {
      console.error("Error handling reply message:", error);
    }
  });

  socket.on("groupDeleted", (chatId) => {
    socket.broadcast.emit("groupDeleted received", chatId);
  });

  socket.on("new group", (newGroup) => {
    socket.broadcast.emit("new group created", newGroup);
  });

  socket.on("rename group", async (data) => {
    try {
      io.emit("renameGroup received", data);
    } catch (error) {
      console.error("Error handling reply message:", error);
    }
  });
});
