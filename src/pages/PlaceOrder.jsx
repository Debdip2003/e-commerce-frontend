import React, { useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import OtpVerification from "../components/OtpVerification";
import { ShopContext } from "../context/ShopContext";
import { getUserProfile, getUserById } from "../services/userService";

const PlaceOrder = () => {
  const [method, setMethod] = useState("CashOnDelivery");
  const { navigate, requestOrderOtp, verifyOrderOtp, cartTotal, delivery_fee, cartItems } = useContext(ShopContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [useDifferentAddress, setUseDifferentAddress] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationId, setVerificationId] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phoneNumber: ""
  });

  // Track which fields were pre-filled from profile
  const [prefilled, setPrefilled] = useState({});

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Step 1: Get user ID from profile endpoint
        const userId = await getUserProfile();
        
        if (!userId) {
          toast.error("Unable to identify user");
          setIsLoadingProfile(false);
          return;
        }

        // Step 2: Use the user ID to fetch full user details
        const fullUserDetails = await getUserById(userId);
        
        // Handle name splitting if only name field is present
        let firstName = fullUserDetails.firstName || "";
        let lastName = fullUserDetails.lastName || "";
        
        if (!firstName && !lastName && fullUserDetails.name) {
          // Split the name into firstName and lastName
          const nameParts = fullUserDetails.name.trim().split(" ");
          firstName = nameParts[0] || "";
          lastName = nameParts.slice(1).join(" ") || "";
        }
        
        // Pre-fill available user data from full user details
        const userData = {
          firstName: firstName,
          lastName: lastName,
          email: fullUserDetails.email || "",
          street: fullUserDetails.address?.street || "",
          city: fullUserDetails.address?.city || "",
          state: fullUserDetails.address?.state || "",
          zipcode: fullUserDetails.address?.zipcode || "",
          country: fullUserDetails.address?.country || "",
          phoneNumber: fullUserDetails.phoneNumber || ""
        };

        setFormData(userData);
        
        // Check if profile is complete (all required fields filled)
        const isComplete = 
          firstName && 
          lastName && 
          fullUserDetails.email && 
          fullUserDetails.phoneNumber &&
          fullUserDetails.address?.street &&
          fullUserDetails.address?.city &&
          fullUserDetails.address?.state &&
          fullUserDetails.address?.zipcode &&
          fullUserDetails.address?.country;
        
        setIsProfileComplete(isComplete);
        
        // Mark which fields were pre-filled
        const prefilledFields = {};
        if (isComplete) {
          // If profile is complete, disable all address-related fields
          prefilledFields.firstName = true;
          prefilledFields.lastName = true;
          prefilledFields.email = true;
          prefilledFields.street = true;
          prefilledFields.city = true;
          prefilledFields.state = true;
          prefilledFields.zipcode = true;
          prefilledFields.country = true;
          prefilledFields.phoneNumber = true;
        } else {
          // If profile is incomplete, only disable the fields that have values
          Object.keys(userData).forEach(key => {
            if (userData[key]) {
              prefilledFields[key] = true;
            }
          });
        }
        setPrefilled(prefilledFields);
      } catch (error) {
        toast.error("Failed to load user profile");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (otpRequested && !otpVerified) {
      setOtpRequested(false);
      setOtpCode("");
      setVerificationId("");
    }
  };

  const buildOrderData = () => ({
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    street: formData.street,
    city: formData.city,
    state: formData.state,
    zipcode: formData.zipcode,
    country: formData.country,
    phoneNumber: formData.phoneNumber,
    cart: cartItems,
    totalPrice: cartTotal === 0 ? 0 : cartTotal + delivery_fee,
    paymentMethod: method
  });

  const hasCartItems = Object.values(cartItems).some((items) => Array.isArray(items) && items.length > 0);

  const getErrorMessage = (error, fallbackMessage) => {
    return error?.response?.data?.error || fallbackMessage;
  };

  const resetOtpFlow = () => {
    setOtpCode("");
    setOtpRequested(false);
    setOtpVerified(false);
    setVerificationId("");
  };

  const maskEmail = (email) => {
    const [localPart, domainPart] = email.split("@");
    if (!domainPart) return email;

    const visibleStart = localPart.slice(0, 2);
    const visibleEnd = localPart.slice(-1);
    const maskedLocal = `${visibleStart}${localPart.length > 3 ? "***" : "*"}${visibleEnd}`;
    return `${maskedLocal}@${domainPart}`;
  };

  const sendOtp = async () => {
    if (!formData.email) {
      toast.error("Email address is required to send the OTP");
      return;
    }

    try {
      setIsOtpSending(true);
      const orderData = buildOrderData();

      const response = await requestOrderOtp({
        email: orderData.email,
        firstName: orderData.firstName,
        lastName: orderData.lastName,
        street: orderData.street,
        city: orderData.city,
        state: orderData.state,
        zipcode: orderData.zipcode,
        country: orderData.country,
        phoneNumber: orderData.phoneNumber,
        totalPrice: orderData.totalPrice,
        paymentMethod: orderData.paymentMethod
      });

      setVerificationId(response?.verificationId || "");
      setOtpRequested(true);
      setOtpVerified(false);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error(getErrorMessage(error, "Failed to send OTP"));
    } finally {
      setIsOtpSending(false);
    }
  };

  const confirmOtp = async () => {
    if (!otpCode.trim()) {
      toast.error("Enter the OTP sent to your email");
      return;
    }

    if (!verificationId) {
      toast.error("Please request a new OTP before verifying");
      return;
    }

    try {
      setIsOtpVerifying(true);
      await verifyOrderOtp({
        verificationId,
        otp: otpCode.trim()
      });

      setOtpVerified(true);
      resetOtpFlow();
    } catch (error) {
      toast.error(getErrorMessage(error, "Invalid OTP"));
    } finally {
      setIsOtpVerifying(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.street || 
        !formData.city || !formData.state || !formData.zipcode || !formData.country || !formData.phoneNumber) {
      toast.error("Please fill all delivery information fields");
      return;
    }

    if (!otpRequested) {
      await sendOtp();
      return;
    }

    if (!otpVerified) {
      toast.error("Verify the OTP sent to your email before placing the order");
      return;
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="border-t pt-14 min-h-[80vh] flex justify-center items-center">
        <p className="text-gray-500 text-lg">Loading your information...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/* Left Side */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>
        {isProfileComplete ? (
          <div className="bg-green-50 border border-green-200 rounded p-3 mb-2">
            <p className="text-xs text-green-700">
              ✓ Your profile is complete. Address fields are locked to your saved address. To change your address, please update your <span className="font-semibold cursor-pointer hover:underline" onClick={() => navigate("/profile")}>profile</span>.
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-2">
            <p className="text-xs text-yellow-700">
              Your profile is incomplete. Please fill in the missing fields below. <span className="font-semibold cursor-pointer hover:underline" onClick={() => navigate("/profile")}>Complete your profile</span> to auto-fill delivery address on future orders.
            </p>
          </div>
        )}
        
        {isProfileComplete && (
          <button
            onClick={() => setUseDifferentAddress(!useDifferentAddress)}
            className="text-xs text-blue-600 hover:text-blue-800 underline mb-3 text-left"
          >
            {useDifferentAddress ? "Use Saved Address" : "Use Different Address"}
          </button>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            name="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleInputChange}
            disabled={prefilled.firstName}
            className={`border border-gray-300 rounded py-1.5 px-3.5 w-full ${prefilled.firstName ? 'bg-gray-100 text-gray-800 cursor-not-allowed' : 'bg-white'}`}
          ></input>
          <input
            type="text"
            name="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleInputChange}
            disabled={prefilled.lastName}
            className={`border border-gray-300 rounded py-1.5 px-3.5 w-full ${prefilled.lastName ? 'bg-gray-100 text-gray-800 cursor-not-allowed' : 'bg-white'}`}
          ></input>
        </div>
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleInputChange}
          disabled={prefilled.email}
          className={`border border-gray-300 rounded py-1.5 px-3.5 w-full ${prefilled.email ? 'bg-gray-100 text-gray-800 cursor-not-allowed' : 'bg-white'}`}
        ></input>
        <input
          type="text"
          name="street"
          placeholder="Street"
          value={formData.street}
          onChange={handleInputChange}
          disabled={isProfileComplete && !useDifferentAddress && prefilled.street}
          className={`border border-gray-300 rounded py-1.5 px-3.5 w-full ${(isProfileComplete && !useDifferentAddress && prefilled.street) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        ></input>
        <div className="flex gap-3">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleInputChange}
            disabled={isProfileComplete && !useDifferentAddress && prefilled.city}
            className={`border border-gray-300 rounded py-1.5 px-3.5 w-full ${(isProfileComplete && !useDifferentAddress && prefilled.city) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          ></input>
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleInputChange}
            disabled={isProfileComplete && !useDifferentAddress && prefilled.state}
            className={`border border-gray-300 rounded py-1.5 px-3.5 w-full ${(isProfileComplete && !useDifferentAddress && prefilled.state) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          ></input>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            name="zipcode"
            placeholder="Zipcode"
            value={formData.zipcode}
            onChange={handleInputChange}
            disabled={isProfileComplete && !useDifferentAddress && prefilled.zipcode}
            className={`border border-gray-300 rounded py-1.5 px-3.5 w-full ${(isProfileComplete && !useDifferentAddress && prefilled.zipcode) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          ></input>
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleInputChange}
            disabled={isProfileComplete && !useDifferentAddress && prefilled.country}
            className={`border border-gray-300 rounded py-1.5 px-3.5 w-full ${(isProfileComplete && !useDifferentAddress && prefilled.country) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          ></input>
        </div>
        <input
          type="number"
          name="phoneNumber"
          placeholder="Phone"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          disabled={prefilled.phoneNumber}
          className={`border border-gray-300 rounded py-1.5 px-3.5 w-full ${prefilled.phoneNumber ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        ></input>
      </div>
      {/* Right Side */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>
        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          {/* Payment method selection */}
          <div className="flex gap-3 flex-col lg:flex-row">
            <div
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer hover:bg-gray-50"
              onClick={() => setMethod("NetBanking")}
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "NetBanking" ? "bg-green-400" : ""
                }`}
              ></p>
              <p className="text-gray-700 text-sm font-medium mx-2">
                NET BANKING
              </p>
            </div>
            <div
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer hover:bg-gray-50"
              onClick={() => setMethod("UPI")}
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "UPI" ? "bg-green-400" : ""
                }`}
              ></p>
              <p className="text-gray-700 text-sm font-medium mx-2">
                UPI
              </p>
            </div>
            <div
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer hover:bg-gray-50"
              onClick={() => setMethod("CashOnDelivery")}
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "CashOnDelivery" ? "bg-green-400" : ""
                }`}
              >
                {" "}
              </p>
              <p className="text-gray-700 text-sm font-medium mx-2">
                CASH ON DELIVERY
              </p>
            </div>
          </div>
          <div className="w-full text-end mt-8">
            <button 
              className={`text-white px-16 py-3 text-sm ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black cursor-pointer'} disabled:bg-gray-400`}
              onClick={handlePlaceOrder}
              disabled={isSubmitting || isOtpSending || isOtpVerifying}
            >
              {isSubmitting
                ? "PLACING ORDER..."
                : isOtpSending
                  ? "SENDING OTP..."
                  : isOtpVerifying
                    ? "VERIFYING OTP..."
                    : otpRequested && !otpVerified
                      ? "VERIFY OTP TO PLACE ORDER"
                      : "PLACE ORDER"}
            </button>
          </div>
          <OtpVerification
            visible={hasCartItems && otpRequested && !otpVerified}
            recipient={maskEmail(formData.email)}
            title="Verification Code"
            description="We sent a verification code to"
            otpValue={otpCode}
            onOtpChange={setOtpCode}
            onVerify={confirmOtp}
            onResend={sendOtp}
            isVerifying={isOtpVerifying}
            isResending={isOtpSending}
            verifyButtonText="VERIFY OTP"
            resendButtonText="RESEND OTP"
            inputPlaceholder="Enter OTP"
          />
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
