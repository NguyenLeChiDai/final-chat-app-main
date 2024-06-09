import React, { useState } from 'react';
import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  IconButton,
  Text,
  Image,
  Input,
  useToast,
} from "@chakra-ui/react";
import axios from 'axios';
import { ChatState } from "../../Context/ChatProvider";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = ChatState();
  const toast = useToast();

  const [userData, setUserData] = useState({
    name: user.name,
    email: user.email,
    password: '', // Add password field
    pic: user.pic,
  });

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const postDetails = (pics) => {
    setLoading(true);
    if (pics === undefined) {
      toast({
        title: "Chưa chọn ảnh đại diện",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    if (
      pics.type === "image/jpg" ||
      pics.type === "image/jpeg" ||
      pics.type === "image/png"
    ) {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "zola-chat-app");
      data.append("cloud_name", "ddw5ifo2x");
      fetch("https://api.cloudinary.com/v1_1/ddw5ifo2x/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setUserData({ ...userData, pic: data.url.toString() });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      toast({
        title: "Chỉ chọn file theo định dạng png, jpg, jpeg",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
  };

  const updateUser = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put('/api/user/profile', userData, config);

      setUser(data);
      toast({
        title: "Cập nhật thành công!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setIsEditing(false);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Lỗi cập nhật",
        description: error.response.data.message || "Đã có lỗi xảy ra",
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
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          display={{ base: "flex" }}
          icon={<ViewIcon />}
          onClick={onOpen}
        />
      )}
      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent h="auto">
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            {isEditing ? 'Chỉnh sửa thông tin' : user.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <Image
              borderRadius="full"
              boxSize="150px"
              src={userData.pic}
              alt={user.name}
            />
            {isEditing ? (
              <>
                <Input
                  name="name"
                  placeholder="Tên"
                  value={userData.name}
                  onChange={handleChange}
                  mt={4}
                />
                <Input
                  name="email"
                  placeholder="Email"
                  value={userData.email}
                  onChange={handleChange}
                  mt={4}
                />
                <Text fontSize={{ base: "28px", md: "30px" }} fontFamily="Work sans" mt={4}>
                  Số điện thoại: {user.phoneNumber}
                </Text>
                <Input
                  name="password"
                  placeholder="Mật khẩu"
                  type="password"
                  value={userData.password}
                  onChange={handleChange}
                  mt={4}
                />
                <Text fontSize={{ base: "28px", md: "30px" }} fontFamily="Work sans" mt={4}>
                  Chỉnh sửa ảnh đại diện
                </Text>
                <Input
                  type="file"
                  p={1.5}
                  accept="image/*"
                  onChange={(e) => postDetails(e.target.files[0])}
                  mt={4}
                />
              </>
            ) : (
              <>
                <Text fontSize={{ base: "28px", md: "30px" }} fontFamily="Work sans">
                  Email: {user.email}
                </Text>
                <Text fontSize={{ base: "28px", md: "30px" }} fontFamily="Work sans">
                  Số điện thoại: {user.phoneNumber}
                </Text>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            {isEditing ? (
              <>
                <Button colorScheme="blue" onClick={updateUser} isLoading={loading}>
                  Lưu
                </Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Hủy
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
            )}
            <Button onClick={onClose} ml={3}>Đóng</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
