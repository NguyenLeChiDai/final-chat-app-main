import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import UpdateChatModal from "./miscellaneous/UpdateChatModal";
import axios from "axios";
import { FaReply } from "react-icons/fa";
import "../components/style.css";
import { io } from "socket.io-client";

const ScrollableChat = ({ messages, fetchMessages, setMessages }) => {
  const { user } = ChatState();
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [originalMessage, setOriginalMessage] = useState(null);
  const [lastRepliedMessageId, setLastRepliedMessageId] = useState(null);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const socket = io("http://localhost:5000");

  const handleMouseEnter = (messageId) => {
    setIsHovered(true);
    setHoveredMessageId(messageId);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setHoveredMessageId(null);
  };



  useEffect(() => {
    // Lắng nghe sự kiện xóa tin nhắn từ server
    socket.on("messageDeleted", () => {
      // Cập nhật giao diện (ví dụ: xóa tin nhắn có messageId tương ứng ra khỏi danh sách tin nhắn)
      fetchMessages();
    });
  
    // Hủy lắng nghe khi component unmount
    return () => {
      socket.off("messageDeleted");
    };
  }, [messages, setMessages, socket]);
  

  const handleReplyMessage = (message) => {
    setOriginalMessage(message);
    setReplyMessage(`@${message.sender.name}: ${message.content} :`);
    setShowReplyBox(true);
    setTimeout(() => {
      const textarea = document.getElementById("replyTextarea");
      if (textarea) {
        textarea.setSelectionRange(
          textarea.value.length,
          textarea.value.length
        );
        textarea.focus();
      }
    }, 0);
  };


//reply tin nhắn
  useEffect(() => {
    socket.on("reply received", () => {
      fetchMessages();
    });
  
    return () => {
      socket.off("reply received");
    };
  }, [messages, setMessages, socket]);


  const sendReplyMessage = async () => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      // const { data } = await axios.post(
      //   "http://localhost:5000/api/message/reply",
      //   {
      //     content: replyMessage,
      //     originalMessageId: originalMessage._id, // ID của tin nhắn gốc
      //   },
      //   config
      // );
      const { data } = await axios.post(
        "/api/message/reply",
        {
          content: replyMessage,
          originalMessageId: originalMessage._id, // ID của tin nhắn gốc
        },
        config
      );
     
      const socket = io("http://localhost:5000");
      socket.emit("send reply", data);
      fetchMessages(); // Cập nhật tin nhắn sau khi gửi reply
      setOriginalMessage(null);
      setReplyMessage("");
      setShowReplyBox(false); // Ẩn textarea sau khi gửi
      
    } catch (error) {
      console.error("Error sending reply message:", error);
    }
  };

  // Các useEffect và phần render không thay đổi


  useEffect(() => {
    // Nếu có tin nhắn cuối cùng được trả lời, cuộn đến nó
    if (lastRepliedMessageId) {
      const element = document.getElementById(lastRepliedMessageId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      // Đặt lại lastRepliedMessageId sau khi đã cuộn
      setLastRepliedMessageId(null);
    }
  }, [lastRepliedMessageId]);

  useEffect(() => {
    // Tự động đặt trỏ chuột vào textarea khi có tin nhắn để trả lời
    if (originalMessage && showReplyBox) {
      const textarea = document.getElementById("replyTextarea");
      if (textarea) {
        textarea.focus();
      }
    }
  }, [originalMessage, showReplyBox]);



  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            )}

            <span
              style={{
                backgroundColor: `${
                  m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
              }}
              onMouseEnter={() => handleMouseEnter(m._id)}
              onMouseLeave={handleMouseLeave}
            >
              {m.content}
              {isHovered && hoveredMessageId === m._id && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <UpdateChatModal
                    messageId={m._id}
                    messages={messages}
                    fetchMessages={fetchMessages}
                    setMessages={setMessages}
                    messageSenderId={m.sender._id}
                  />

                  <FaReply
                    onClick={() => handleReplyMessage(m)}
                    style={{ cursor: "pointer", marginLeft: "5px" }}
                  />

                  {originalMessage && originalMessage._id === m._id && (
                    <div style={{ marginLeft: "5px" }}>
                      <textarea
                        id="replyTextarea" // Đặt id cho TextArea
                        defaultValue={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Nhập tin nhắn trả lời..."
                        rows={2}
                        style={{ resize: "vertical", width: "100%" }}
                      />
                      <button onClick={sendReplyMessage}>Gửi</button>
                    </div>
                  )}
                </div>
              )}
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
