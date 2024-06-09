import { CloseIcon } from "@chakra-ui/icons";
import { Badge, useDisclosure, Button, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from "@chakra-ui/react";
import { useRef } from "react";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const onDeleteClick = () => {
    onOpen();
  };

  const onConfirmDelete = () => {
    handleFunction();
    onClose();
  };

  return (
    <>
      <Badge
        px={2}
        py={1}
        borderRadius="lg"
        m={1}
        mb={2}
        variant="solid"
        fontSize={12}
        colorScheme="purple"
        cursor="pointer"
      >
      
        {user.name}
        {admin === user._id && <span> (Admin)</span>}
        
        <CloseIcon pl={1} onClick={onDeleteClick} />
      </Badge>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Xác nhận xóa thành viên
            </AlertDialogHeader>

            <AlertDialogBody>
              Bạn có chắc chắn muốn xóa thành viên này ra khỏi nhóm không?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Quay lại
              </Button>
              <Button colorScheme="red" onClick={onConfirmDelete} ml={3}>
                Xóa
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default UserBadgeItem;