import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ProfileModal from "./ProfileModal";
import { ChatState } from "../../Context/ChatProvider";
import UserListItem from "../UserAvatar/UserListItem";
import { Spinner } from "@chakra-ui/spinner";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Input } from "@chakra-ui/input";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import { getSender } from "../../config/ChatLogics";
import { Effect } from "react-notification-badge";
import NotificationBadge from "react-notification-badge/lib/components/NotificationBadge";
import FriendRequestModal from "./FriendRequestModal";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    setSelectedChat,
    user,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  // State để lưu trữ thông tin của người gửi yêu cầu kết bạn
  const [requester, setRequester] = useState(null);


   // Hàm mở modal yêu cầu kết bạn và thiết lập thông tin của người gửi yêu cầu
   const openFriendRequestModal = (user) => {
     setRequester(user);
     setIsModalOpen(true);
   };
 
   // Hàm đóng modal yêu cầu kết bạn
   const closeFriendRequestModal = () => {
     setRequester(null);
     setIsModalOpen(false);
     
   };

    // Hàm để xử lý việc chấp nhận yêu cầu kết bạn
 const handleAcceptRequest = (requesterId) => {
   // Gọi API hoặc thực hiện hành động cần thiết khi người dùng chấp nhận yêu cầu
   console.log("Đã chấp nhận yêu cầu từ:", requesterId);
   // Sau khi xử lý xong, bạn có thể đóng modal
   closeFriendRequestModal();
 };

 // Hàm để xử lý việc từ chối yêu cầu kết bạn
 const handleRejectRequest = (requesterId) => {
   // Gọi API hoặc thực hiện hành động cần thiết khi người dùng từ chối yêu cầu
   console.log("Đã từ chối yêu cầu từ:", requesterId);
   // Sau khi xử lý xong, bạn có thể đóng modal
   closeFriendRequestModal();
 };


  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Nhập số điện thoại hoặc họ tên để tìm kiếm",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Đã có lỗi xảy ra!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Không thể tải các tin nhắn",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/user/send-friend-request/${userId}`,
        {},
        config
      );
      toast({
        title: "Yêu cầu kết bạn đã được gửi",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    } catch (error) {
      toast({
        title: "Đã có lỗi xảy ra khi gửi yêu cầu kết bạn",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const acceptFriendRequest = async (requesterId) => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/user/accept-friend-request/${requesterId}`,
        {},
        config
      );
      toast({
        title: "Đã chấp nhận yêu cầu kết bạn",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    } catch (error) {
      toast({
        title: "Đã có lỗi xảy ra khi chấp nhận yêu cầu kết bạn",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Tìm bạn bè trò chuyện" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text d={{ base: "none", md: "flex" }} px={4}>
              Tìm bạn bè
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans">
          ZOLA
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "Không có tin nhắn mới"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `Có tin nhắn mới trong nhóm ${notif.chat.chatName}`
                    : `Có tin nhắn mới từ ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>Xem hồ sơ</MenuItem>{" "}
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Đăng xuất</MenuItem>
              <MenuDivider />
              <MenuItem onClick={() => openFriendRequestModal(user)}>Xem yêu cầu kết bạn</MenuItem>
              <FriendRequestModal
              isOpen={isModalOpen}
              onClose={closeFriendRequestModal}
              requester={requester}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
            />
            </MenuList>
          </Menu>
        </div>
      </Box>

      {/*   {user.friendRequests && user.friendRequests.length > 0 && (
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Yêu Cầu Kết Bạn:
          </Text>
          {user.friendRequests.map((requesterId) => (
            <Box key={requesterId}>
              <Button onClick={() => acceptFriendRequest(requesterId)}>Chấp Nhận</Button>
            </Box>
          ))}
        </Box>
      )} */}

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px" textAlign="center">
            Tìm bạn bè
          </DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Tìm theo tên hoặc số điện thoại"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Tìm</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
