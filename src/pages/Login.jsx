import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import OtpVerification from "../components/OtpVerification";
import {
  loginUser,
  registerUser,
  resendLoginOtp,
  resendRegisterOtp,
  verifyLoginOtp,
  verifyRegisterOtp,
} from "../services/userService";

const Login = () => {
  const { setAuthToken } = useContext(AuthContext);
  const [currentState, setCurrentState] = useState("Sign Up");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [otpCode, setOtpCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [isOtpResending, setIsOtpResending] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const navigate = useNavigate();

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (otpRequested) {
      setOtpRequested(false);
      setOtpCode("");
      setVerificationId("");
    }
  };

  const resetAuthState = () => {
    setFormData({ name: "", email: "", password: "" });
    setOtpCode("");
    setVerificationId("");
    setOtpRequested(false);
  };

  const startOtpChallenge = async (response, fallbackMessage) => {
    const nextVerificationId =
      response?.verificationId ||
      response?.data?.verificationId ||
      response?.data?.verification_id ||
      response?.verification_id ||
      "";

    if (!nextVerificationId) {
      throw new Error("OTP verification ID was not returned");
    }

    setVerificationId(nextVerificationId);
    setOtpRequested(true);
    toast.success(response?.message || fallbackMessage);
  };

  const handleAuthSubmit = async () => {
    if (currentState === "Sign Up") {
      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      await startOtpChallenge(response, "OTP sent successfully");
      return;
    }

    const response = await loginUser({
      email: formData.email,
      password: formData.password,
    });
    await startOtpChallenge(response, "OTP sent successfully");
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (otpRequested) {
        toast.info("Please verify the OTP before submitting again");
        return;
      }

      setIsAuthSubmitting(true);
      await handleAuthSubmit();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Authentication failed";
      toast.error(errorMessage);
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const finalizeAuth = (response) => {
    const accessToken = response?.accessToken || response?.data?.accessToken || "";
    const refreshToken = response?.refreshToken || response?.data?.refreshToken || "";

    if (accessToken) {
      setAuthToken(accessToken, refreshToken);
    }

    resetAuthState();
    navigate("/");
  };

  const verifyAuthOtp = async () => {
    if (!otpCode.trim()) {
      toast.error("Enter the OTP sent to your email");
      return;
    }

    if (!verificationId && !pendingAuth.verificationId) {
      toast.error("Please request a new OTP before verifying");
      return;
    }

    try {
      setIsOtpVerifying(true);
      const otpPayload = {
        verificationId,
        otp: otpCode.trim(),
      };

      const response =
        currentState === "Login"
          ? await verifyLoginOtp(otpPayload)
          : await verifyRegisterOtp(otpPayload);

      toast.success(response?.message || "OTP verified successfully");
      finalizeAuth(response);
    } catch (error) {
      toast.error(
        error?.response?.data?.error || error?.response?.data?.message || "Invalid OTP"
      );
    } finally {
      setIsOtpVerifying(false);
    }
  };

  const resendSignupOtp = async () => {
    try {
      setIsOtpResending(true);
      const resendPayload = {
        verificationId,
        email: formData.email,
      };

      const response =
        currentState === "Login"
          ? await resendLoginOtp(resendPayload)
          : await resendRegisterOtp(resendPayload);

      const nextVerificationId =
        response?.verificationId || response?.data?.verificationId || verificationId;

      setVerificationId(nextVerificationId);
      toast.success(response?.message || "OTP resent successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.error || error?.response?.data?.message || "Failed to resend OTP"
      );
    } finally {
      setIsOtpResending(false);
    }
  };

  const toggleAuthMode = (nextState) => {
    setCurrentState(nextState);
    setOtpCode("");
    setVerificationId("");
    setOtpRequested(false);
  };

  return (
    <form className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800" onSubmit={onSubmitHandler}>
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>
      {currentState === "Login" ? (
        ""
      ) : (
        <input
          name="name"
          type="text"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Name"
          value={formData.name}
          onChange={onChangeHandler}
          required
        />
      )}
      <input
        name="email"
        type="email"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Email"
        value={formData.email}
        onChange={onChangeHandler}
        required
      />
      <input
        name="password"
        type="password"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Password"
        value={formData.password}
        onChange={onChangeHandler}
        required
      />
      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p className="cursor-pointer">Forgot your password</p>
        {currentState === "Login" ? (
          <p
            className="cursor-pointer"
            onClick={() => toggleAuthMode("Sign Up")}
          >
            Create account
          </p>
        ) : (
          <p
            className="cursor-pointer"
            onClick={() => toggleAuthMode("Login")}
          >
            Login here
          </p>
        )}
      </div>
      <OtpVerification
        visible={otpRequested}
        recipient={formData.email}
        title={currentState === "Login" ? "Verify your login" : "Verify your account"}
        description="We sent a verification code to"
        otpValue={otpCode}
        onOtpChange={setOtpCode}
        onVerify={verifyAuthOtp}
        onResend={resendSignupOtp}
        isVerifying={isOtpVerifying}
        isResending={isOtpResending}
        verifyButtonText="VERIFY OTP"
        resendButtonText="RESEND OTP"
        inputPlaceholder="Enter OTP"
        inputMaxLength={6}
      />
      <button
        className="bg-black text-white font-light px-8 py-2 mt-4 disabled:bg-gray-400"
        disabled={isAuthSubmitting || isOtpVerifying || isOtpResending}
      >
        {currentState === "Login"
          ? isAuthSubmitting
            ? "SENDING OTP..."
            : otpRequested
                ? "VERIFY OTP ABOVE"
                : "Sign In"
          : isAuthSubmitting
            ? "SENDING OTP..."
            : otpRequested
              ? "VERIFY OTP ABOVE"
              : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;
