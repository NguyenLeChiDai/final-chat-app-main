import { Button } from "@chakra-ui/react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Text
} from "@chakra-ui/react";
const FriendRequests = ({
  isOpen,
  onClose,
  requester,
  requesterUsername, // Thêm requesterUsername
  onAccept,
  onReject
}) => {
  return (
    <Drawer
      placement="right"
      onClose={onClose}
      isOpen={isOpen}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">Các yêu cầu kết bạn</DrawerHeader>
        <DrawerBody>
          {requester && (
            <>
              <Text>
                {requester.name ? requester.name : requesterUsername} muốn kết bạn với bạn.
              </Text>
              <Button
                colorScheme="teal"
                size="sm"
                onClick={() => onAccept(requester._id)}
              >
                Đồng ý
              </Button>
              <Button
                colorScheme="red"
                size="sm"
                ml={2}
                onClick={() => onReject(requester._id)}
              >
                Từ chối
              </Button>
            </>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default FriendRequests;