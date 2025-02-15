import { CircularProgress } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "~/components";
import { useMutationHook } from "~/hooks/useMutationHook";
import { updateUser } from "~/redux/Slices/userSlice";
import * as UserService from "~/services/UserService";

const OtpVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const [otp, setOtp] = useState(new Array(6).fill(""));

  const handleChange = (index, event) => {
    const { value } = event.target;
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const mutation = useMutationHook((newData) => UserService.login(newData));
  const { data, isPending, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      navigate("/");
      localStorage.setItem("token", data?.result?.token);
      if (data?.result?.token) {
        const decoded = jwtDecode(data?.result?.token);
        if (decoded?.userId) {
          handleGetDetailUser(decoded?.userId);
        }
      }
    }
  }, [isSuccess]);

  const handleGetDetailUser = async (id) => {
    const res = await UserService.getDetailUserByUserId(id);
    dispatch(updateUser({ ...res?.result, token }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (location?.state?.userData) {
      const test = { ...location?.state?.userData, otp: Number(enteredOtp) };
      mutation.mutate(test);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-12">
      <div className="relative bg-primary border-1 border-borderNewFeed px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
        <div
          className="w-8 h-8 mb-5 active:scale-90 rounded-lg bg-blue flex items-center justify-center hover:scale-110 cursor-pointer transition-transform"
          onClick={() => navigate("/login")}
        >
          <FaArrowLeft color="#fff" />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-col space-y-16">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="font-semibold text-3xl">
              <p className="text-ascent-1">Email Verification</p>
            </div>
            <div className="flex flex-row text-sm font-medium text-ascent-2">
              <p>We have sent a OTP code to your email</p>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col space-y-16">
                <div className="flex flex-row items-center justify-between mx-auto gap-x-2 w-full max-w-sm">
                  {otp.map((digit, index) => (
                    <div key={index} className="w-16 h-16">
                      <input
                        ref={(el) => (inputRefs.current[index] = el)}
                        className="w-full h-full flex flex-col items-center text-black justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(index, e)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col space-y-5">
                  <div className="relative w-full flex items-center justify-center">
                    <Button
                      type="submit"
                      title="Verify"
                      disable={isPending}
                      containerStyles="flex w-80 flex-row uppercase active:scale-95 hover:scale-105 transition-transform font-semibold items-center justify-center text-center w-full border rounded-xl outline-none py-3 bg-blue border-none text-white text-md shadow-sm"
                    >
                      Verify Account
                    </Button>
                    {isPending && (
                      <CircularProgress
                        size={30}
                        className="absolute top-3 left-1/2"
                      />
                    )}
                  </div>

                  <div className="flex flex-row  items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                    <p>Didn't receive code?</p>
                    <span className="flex flex-row text-blue cursor-pointer items-center text-blue-600">
                      Resend
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationPage;
