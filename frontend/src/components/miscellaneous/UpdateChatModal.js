import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";
import io from "socket.io-client";

const UpdateChatModal = ({ messageId, messageSenderId, fetchMessages, chatId, fetchAgain, setFetchAgain }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDeleteMessage = async (action) => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      let response;
      if (action === 'delete') {
        response = await axios.delete(`/api/message/${messageId}`, config);
      } else if (action === 'removeReceiver') {
        response = await axios.put(`/api/message/remove-receiver/${messageId}`, {}, config);
      }
      setLoading(false);
      fetchMessages();
      const socket = io("http://localhost:5000");
      socket.emit("messageDeleted", messageId);
      handleClose();
      toast({
        title: "Success",
        description: action === 'delete' ? "Xóa tin nhắn thành công" : "Ẩn tin nhắn thành công",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Unknown error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<DeleteIcon />}
        onClick={handleOpen}
      />

      <Modal onClose={handleClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Xác nhận xóa</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {messageSenderId === user._id ? (
              <>
                <p>Bạn muốn gỡ tin nhắn này ở phía ai?</p>
                <Button
                  colorScheme="red"
                  mt={4}
                  onClick={() => handleDeleteMessage('delete')}
                  isLoading={loading}
                  width="50%"
                >
                  Thu hồi tin nhắn
                </Button>
                <Button
                  colorScheme="yellow"
                  mt={4}
                  onClick={() => handleDeleteMessage('removeReceiver')}
                  isLoading={loading}
                  width="50%"
                >
                  Gỡ ở phía bạn
                </Button>
              </>
            ) : (
              <>
                <p>Tin nhắn này sẽ được gỡ khỏi thiết bị của bạn?</p>
                <Button
                  colorScheme="yellow"
                  mt={4}
                  onClick={() => handleDeleteMessage('removeReceiver')}
                  isLoading={loading}
                  width="100%"
                >
                  Gỡ ở phía bạn
                </Button>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={handleClose}>
              Hủy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateChatModal;
