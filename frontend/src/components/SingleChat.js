import React, { useEffect } from "react";
import { ChatState } from "../Context/ChatProvider";
import { Box, Text } from "@chakra-ui/layout";
import {
  IconButton,
  Spinner,
  FormControl,
  Input,
  Effect,
  Button,
} from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useState } from "react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import "../components/style.css";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing-animation.json";
import { Flex } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import Picker from "emoji-picker-react";

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const toast = useToast();

  const MESSAGE_TYPES = {
    TEXT: "text",
    FILE: "file",
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    redenrerSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
     // setLoading(true); // hiệu ứng quay quay nhảm nhí
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
     // setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Đã có lỗi xảy ra!",
        description: "Không thể tải các tin nhắn",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  const sendMessage = async (event) => {
    if (newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Đã có lỗi xảy ra!",
          description: "Gửi tin nhắn thất bại",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const [selectedFile, setSelectedFile] = useState(null);
  //xử lý sự kiện khi người dùng chọn file để gửi:
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const sendFile = async () => {
    if (selectedFile) {
      try {
        // Tạo formData để chứa file cần gửi
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("chatId", selectedChat._id);

        // Cấu hình header cho request
        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        };

        // Gửi request lên server
        const { data } = await axios.post(
          "/api/message/upload-file",
          formData,
          config
        );

        // Tạo tin nhắn mới cho file gửi
        const fileMessage = {
          content: "Đã gửi một file",
          type: MESSAGE_TYPES.FILE, // Bổ sung type để server nhận biết đây là tin nhắn chứa file
          // Các thông tin khác của tin nhắn file, tuỳ theo cách bạn lưu trữ
        };

        // Thêm tin nhắn file vào mảng messages
        setMessages([...messages, fileMessage]);

        // Log dữ liệu nhận được từ server (tùy theo cách server trả về)
        console.log(data);

        // Reset selectedFile sau khi đã gửi
        setSelectedFile(null);

        // Thông báo thành công
        toast({
          title: "Gửi file thành công",
          description: "File đã được gửi thành công.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      } catch (error) {
        // Xử lý lỗi nếu gửi file không thành công
        console.error(error);
        toast({
          title: "Đã có lỗi xảy ra!",
          description: "Không thể gửi file.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    } else {
      // Thông báo nếu chưa chọn file
      toast({
        title: "Vui lòng chọn một file",
        description: "Bạn cần chọn một file để gửi.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const handleEmojiClick = (event, emojiObject) => {
    setNewMessage((newMessage) => newMessage + emojiObject.emoji);
  };

  useEffect(() => {
    // Lắng nghe sự kiện "delete message" từ server
    socket.on("delete message", (deletedMessageId) => {
      // Lọc tin nhắn bị xóa ra khỏi danh sách messages
      const updatedMessages = messages.filter(
        (message) => message._id !== deletedMessageId
      );
      // Cập nhật lại danh sách tin nhắn
      setMessages(updatedMessages);
    });

    // Xóa sự kiện khi component unmount để tránh memory leak
    return () => {
      socket.off("delete message");
    };
  }, [messages]); // Thêm messages vào dependencies để useEffect được gọi lại khi messages thay đổi
  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />} // Nút quay lại trang khi thu nhỏ web
              onClick={() => setSelectedChat("")}
            />
            {/* Đẩy tên lên làm tên chatbox */}
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal
                  user={getSenderFull(user, selectedChat.users)}
                />{" "}
                {/* Con mắt */}
              </>
            ) : (
              <>
                {/* Xem nhóm để update  */}
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            width="100%"
            height="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                width={20}
                height={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat
                  messages={messages}
                  fetchMessages={fetchMessages} // Truyền hàm fetchMessages xuống component con
                  setMessages={setMessages} // Truyền hàm setMessages xuống component con
                />
              </div>
            )}
            <FormControl isRequired marginTop={3}>
              {isTyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Flex align="center">
                <div className="button-container">
                  <div className="emoji-icon">
                    <img
                      src="https://icons.getbootstrap.com/assets/icons/emoji-smile.svg"
                      onClick={() => setShowPicker((val) => !val)}
                    />
                    {showPicker && (
                      <Picker
                        pickerStyle={{ width: "100%" }}
                        onEmojiClick={handleEmojiClick}
                      />
                    )}
                  </div>
                </div>

                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Nhập tin nhắn..."
                  onChange={typingHandler}
                  value={newMessage}
                  float="right"
                  width="90%"
                />
                <IconButton
                  color="white"
                  backgroundColor="blue"
                  icon={<ArrowForwardIcon />}
                  onClick={sendMessage}
                  aria-label="Gửi"
                  ml={2}
                />

                <input type="file" onChange={handleFileChange} />
                <Button colorScheme="blue" onClick={sendFile}>
                  Gửi File
                </Button>
              </Flex>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Nhấn vào một người dùng để bắt đầu trò chuyện
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
