import { Avatar } from "@chakra-ui/avatar";
import { Box, Text } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import { useState } from "react";
import axios from 'axios';

const UserListItem = ({ user, handleFunction }) => {
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading

  const handleSendFriendRequest = async (userId) => {
    try {
      setLoading(true); // Đặt trạng thái loading thành true khi gửi yêu cầu

      const token = localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo')).token
        : null;
  
      if (!token) {
        // Xử lý khi không có token
        return;
      }
  
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
  
      const response = await axios.post(`/api/user/send-friend-request/${userId}`, {}, config);

      // Kiểm tra nếu yêu cầu đã được gửi thành công
      if (response.status === 200) {
        setIsRequestSent(true); // Cập nhật trạng thái để chỉ ra yêu cầu đã được gửi thành công
      }
      
      setLoading(false); // Đặt lại trạng thái loading
    } catch (error) {
      // Xử lý lỗi
      console.error('Lỗi khi gửi yêu cầu kết bạn:', error);
      setLoading(false); // Đặt lại trạng thái loading trong trường hợp có lỗi
    }
  };

  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      width="100%"
      display="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
    >
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={user.name}
        src={user.pic}
      />
      <Box>
        <Text>{user.name}</Text>
        <Text fontSize="xs">
          <b>Email : </b>
          {user.email}
        </Text>
        <Text fontSize="xs">
          <b>Phone: </b>
          {user.phoneNumber}
        </Text>

           {/* Hiển thị nút chỉ khi yêu cầu chưa được gửi */}
      {!isRequestSent && (
        <Box ml="auto">
      {/*     <Button
            colorScheme="teal"
            variant="outline"
            size="sm"
            onClick={() => handleSendFriendRequest(user._id)}
            isLoading={loading} // Hiển thị trạng thái loading khi đang gửi yêu cầu
            loadingText="Đang gửi..." // Tùy chỉnh văn bản khi đang gửi yêu cầu
            disabled={loading} // Vô hiệu hóa nút trong quá trình loading
          >
            Gửi Yêu Cầu Kết Bạn
          </Button> */}
        </Box>
      )}
      </Box>
    </Box>
  );
};

export default UserListItem;
