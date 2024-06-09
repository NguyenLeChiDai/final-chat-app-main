import React, { useState } from "react";
import { VStack, useToast } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Button } from "@chakra-ui/button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";


const Login = () => {
    
    const [show, setShow] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState();
    const [password, setPassword] = useState();
    const [loading, setLoading] = useState();
    const toast = useToast();
    const navigate = useNavigate();
  
    const handleClick = () => setShow(!show);
    const submitHandler = async () => {
      setLoading(true);
      if (!phoneNumber || !password) {
        toast({
          title: "Vui lòng nhập đầy đủ thông tin",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom"
        });
        setLoading(false);
        return;
      }

      try {
        const config = {
          headers: {
            "Content-type": "application/json",
          },
        };
        // const {data} = await axios.post("http://localhost:5000/api/user/login", {phoneNumber, password}, config);
        const {data} = await axios.post("/api/user/login", {phoneNumber, password}, config);
        toast({
          title: "Đăng nhập thành công",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        localStorage.setItem("userInfo", JSON.stringify(data));
        setLoading(false);
        navigate("/chats");
      }
      catch(error) {
        toast({
          title: "Đã có lỗi xảy ra",
          description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom"
        });
        setLoading(false);
      }
    }

    const [valid, setValid] = useState(true);
    const validatePhoneNumber = (phoneNumber) => {
      const phoneNumberPattern = /^\+?[1-9]\d{1,14}$/;
  
      return phoneNumberPattern.test(phoneNumber);
    };
  
    const handlePhoneChange = (value) => {
      setPhoneNumber("+" + value);
      setValid(validatePhoneNumber("+" + value));
    };
  
  
    return (
      <VStack spacing={"5px"} color="black">
        {/* PhoneNumber */}
        <FormControl id="phoneNumber" isRequired>
          <FormLabel>Số điện thoại</FormLabel>
          {/* <Input
            placeholder="Nhập Số điện thoại"
            onChange={(e) => setPhoneNumber(e.target.value)}
          /> */}
          <PhoneInput
          name="phoneNumber"
          placeholder="Số điện thoại"
          country={"vn"}
          value={phoneNumber}
          onChange={(value, country, event, formattedValue) => {
            handlePhoneChange(value);
          }}
          inputStyle={{
            background: "white",
            color: "black",
            border: "1px solid gray",
            width: "100%",
          }}
        />
    
      {!valid && (
        <p style={{ color: "white" }}>
          Vui lòng nhập một số điện thoại hợp lệ.
        </p>
      )}
        </FormControl>
        {/* Password */}
        <FormControl id="password" isRequired>
          <FormLabel>Mật khẩu</FormLabel>
          <InputGroup>
            <Input
              type={show ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputRightElement width={"4.5rem"}>
              <Button h={"1.75rem"} size={"sm"} onClick={handleClick}>
                {show ? "Ẩn" : "Hiện"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
  
        <Button
          colorScheme="blue"
          width={"100%"}
          style={{ marginTop: 15 }}
          onClick={submitHandler}
          isLoading={loading}
        >
        Đăng nhập
        </Button>

        {/* <Button
        variant={"solid"} colorScheme="red" width={"100%"} onClick={() =>{
            setEmail("default@gmail.com");
            setPassword("123123");
        }}
        >
          Truy cập với quyền Guest
        </Button> */}
      </VStack>
    );
  };

export default Login
