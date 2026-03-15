import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { loginUser, registerUser } from "../services/userService";

const Login = () => {
  const {setAuthToken} = useContext(ShopContext);
  const [currentState, setCurrentState] = useState("Sign Up");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
      };

      if (currentState === "Sign Up") {
        payload.name = formData.name;
      }

      const response =
        currentState === "Sign Up"
          ? await registerUser(payload)
          : await loginUser(payload);

      const accessToken =
        response?.accessToken ||
        response?.data?.accessToken || "";

      const refreshToken =
        response?.refreshToken || response?.data?.refreshToken || "";

      if (accessToken) {
        setAuthToken(accessToken, refreshToken);
      } else if (currentState === "Login") {
        toast.error("Login succeeded but token was not returned");
        return;
      }

      toast.success(
        response?.message ||
          (currentState === "Sign Up"
            ? "Registration successful"
            : "Login successful")
      );

      setFormData({ name: "", email: "", password: "" });
      navigate("/");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Authentication failed";
      toast.error(errorMessage);
    }
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
            onClick={() => setCurrentState("Sign Up")}
          >
            Create account
          </p>
        ) : (
          <p
            className="cursor-pointer"
            onClick={() => setCurrentState("Login")}
          >
            Login here
          </p>
        )}
      </div>
      <button className="bg-black text-white font-light px-8 py-2 mt-4">{currentState==='Login'? 'Sign In':'Sign Up'}</button>
    </form>
  );
};

export default Login;
