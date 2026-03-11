import React from "react";
import { toast } from "react-toastify";
import api from "../services/axiosInstance";

const NewsletterBox = () => {
const registerEmail = async (emailData) => {
  try {
    const { data } = await api.post("/register-email", emailData);
    if (data) {
      toast.success(data.message);
    } else {
      toast.error("Failed to register email");
    }
  } catch (error) {
    console.error(error);
    toast.error("This email is already registered");
  }
};

const onSubmitHandler = (event) => {
    event.preventDefault();
    registerEmail({ email: event.target[0].value })
    event.target[0].value = "";
  };

  return (
    <div className="text-center">
      <p className="text-2xl font-medium text-gray-800">
        Subscribe now and get notifications about our latest offers and discounts!
      </p>
      <p className="text-gray-400 mt-3">
        Join our newsletter to stay updated on the latest products and special offers.
      </p>
      <form
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3"
        onSubmit={onSubmitHandler}
      >
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full sm:flex-1 outline-none"
          required
        />
        <button
          type="submit"
          className="bg-black text-white text-xs px-10 py-4"
        >
          SUBSCRIBE
        </button>
      </form>
    </div>
  );
};

export default NewsletterBox;
