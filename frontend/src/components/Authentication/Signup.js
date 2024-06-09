import React, { useState } from "react";
import { VStack } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Button } from "@chakra-ui/button";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../firebase/Config";

function Signup() {
  //các const dùng để thực thi otp
  const [user, setUser] = useState(null);
  const [otp, setOtp] = useState("");
  const [valid, setValid] = useState(true);
  const [otpVerified, setOtpVerified] = useState(false);

  //các const xử lý thông số
  const [show, setShow] = useState(false);
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [password, setPassword] = useState();
  const [pic, setPic] = useState();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const validatePhoneNumber = (phoneNumber) => {
    const phoneNumberPattern = /^\+?[1-9]\d{1,14}$/;

    return phoneNumberPattern.test(phoneNumber);
  };

  const sendOtp = async (event) => {
    event.preventDefault(); // Ngăn chặn hành động mặc định của form
    try {
      const recaptcha = new RecaptchaVerifier(auth, "recaptcha", {});
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptcha
      ); // Add await here
      setUser(confirmation);
    } catch (err) {
      console.error(err);
    }
  };

  //xác nhận otp
  const verifyOtp = async () => {
    try {
      // Gọi hàm confirm từ đối tượng user với mã OTP
      const data = await user.confirm(otp);

      // Xử lý dữ liệu sau khi xác nhận OTP
      console.log("Xác thực OTP thành công", data);

      // Cập nhật trạng thái xác thực OTP thành công
      setOtpVerified(true);

      // Chuyển hướng đến trang ChatRoom sau khi xác thực OTP thành công
      // navigate("/");
    } catch (err) {
      // Xử lý lỗi nếu có bất kỳ lỗi nào xảy ra trong quá trình xác nhận OTP
      console.error("Lỗi xác thực OTP", err);
    }
  };

  const navigate = useNavigate();

  const handleClick = () => setShow(!show);

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
          setPic(data.url.toString());
          console.log(data.url.toString());
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

  const submitHandler = async () => {
    setLoading(true);
    if (!name || !email || !password || !phoneNumber || !confirmPassword) {
      toast({
        title: "Vui lòng nhập đầy đủ thông tin",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Nhập lại mật khẩu không trùng khớp",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      // const { data } = await axios.post(
      //   "http://localhost:5000/api/user/",
      //   { name, email, phoneNumber, password, pic },
      //   config
      // );
      const { data } = await axios.post(
        "/api/user/",
        { name, email, phoneNumber, password, pic },
        config
      );
      toast({
        title: "Đăng ký thành công",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Đã có lỗi xảy ra",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const handlePhoneChange = (value) => {
    setPhoneNumber("+" + value);
    setValid(validatePhoneNumber("+" + value));
  };

  // const handleChange = (event) => {

  //   setValues({
  //       ...values, [event.target.name]:event.target.value
  //   });
  // }

  return (
    <VStack spacing={"5px"} color="black">
      {/* Name */}
      <FormControl id="name" isRequired>
        <FormLabel>Họ tên</FormLabel>
        <Input
          placeholder="Nhập họ tên"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      {/* Email */}
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Nhập email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      {/* PhoneNumber */}
      {/* <div className="phonecontent" style={{ textAlign: 'left' }}>
    <style>
        {`
            .react-tel-input .country-list .country .country-name {
                color: black;
            }
        `}
    </style> */}
      {/* PhoneNumber */}
      <FormControl id="phoneNumber" isRequired>
        <FormLabel>Số điện thoại</FormLabel>
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
      </FormControl>

      {!valid && (
        <p style={{ color: "white" }}>
          Vui lòng nhập một số điện thoại hợp lệ.
        </p>
      )}
      {/* </div> */}

      <div style={{ display: "flex", flexDirection: "column" }}>
        <button
          onClick={sendOtp}
          style={{ backgroundColor: "blue", color: "white", width: "100%" }}
        >
          {" "}
          Gửi OTP{" "}
        </button>

        <div style={{ marginTop: "10px" }} id="recaptcha"></div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <input
            onChange={(e) => setOtp(e.target.value)}
            style={{
              width: "50%",
              marginTop: "10px",
              border: "1px solid gray",
            }}
            type="text"
            placeholder="Nhập OTP 6 số"
          />
          <button
            onClick={verifyOtp}
            style={{
              width: "50%",
              marginTop: "10px",
              height: "46px",
              marginLeft: "7px",
              backgroundColor: "green",
              color: "white",
            }}
          >
            {" "}
            Xác minh OTP{" "}
          </button>
        </div>
      </div>

      {otpVerified && (
        <>
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
          {/* Confirm password */}
          <FormControl id="password" isRequired>
            <FormLabel>Nhập lại mật khẩu</FormLabel>
            <InputGroup>
              <Input
                type={show ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <InputRightElement width={"4.5rem"}>
                <Button h={"1.75rem"} size={"sm"} onClick={handleClick}>
                  {show ? "Ẩn" : "Hiện"}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {/* Pic */}
          <FormControl id="pic" isRequired>
            <FormLabel>Chọn hình đại diện</FormLabel>
            <Input
              type="file"
              p={1.5}
              accept="image/*"
              onChange={(e) => postDetails(e.target.files[0])}
            />
          </FormControl>

          <Button
            colorScheme="blue"
            width={"100%"}
            style={{ marginTop: 15 }}
            onClick={submitHandler}
            isLoading={loading}
          >
            Đăng ký
          </Button>
        </>
      )}
    </VStack>
  );
}

export default Signup;
