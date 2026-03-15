import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import logo from "../assets/frontend_assets/logo.png"
import searchIcon from "../assets/frontend_assets/search_icon.png"
import profileIcon from "../assets/frontend_assets/profile_icon.png"
import cartIcon from "../assets/frontend_assets/cart_icon.png"
import menuIcon from "../assets/frontend_assets/menu_icon.png"
import dropdownIcon from "../assets/frontend_assets/dropdown_icon.png"
import { deleteUserAccount, logoutUser } from "../services/userService";

const NavBar = () => {
  const { isAuthenticated, setAuthToken } = useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const { setShowSearch, getCartCount } = useContext(ShopContext);
  const navigate = useNavigate();

  const logoutHandler = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const data = await logoutUser();
      if (data?.error) {
        setAuthToken(null);
        toast.error(data.error || "Logout failed");
        return;
      }
      setAuthToken(null);
      toast.success(data?.message || "Logout successful");
      navigate("/");
    } catch (error) {
      setAuthToken(null);
      toast.error(error?.response?.data?.error || "Logout failed");
    }
  };

  const deleteUserHandler = async() =>{
    if(!isAuthenticated){
      navigate("/login");
      return;
    }

    try{
      const data = await deleteUserAccount();
      if(data?.error){
        toast.error(data.error || "Account deletion failed");
        return;
      }
      toast.success(data?.message || "Account deleted successfully");
      setAuthToken(null);
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Account deletion failed");

    }

  }

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      <Link to={"/"}>
        {" "}
        <img src={logo} alt="logo" className="w-36" />
      </Link>
      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink className="flex flex-col items-center gap-1" to="/">
          <p>HOME</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink className="flex flex-col items-center gap-1" to="/collections">
          <p>COLLECTIONS</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink className="flex flex-col items-center gap-1" to="/about">
          <p>ABOUT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink className="flex flex-col items-center gap-1" to="/contact">
          <p>CONTACT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
      </ul>

      <div className="flex items-center gap-6">
        <img
          src={searchIcon}
          alt="search_icon"
          className="w-5 cursor-pointer"
          onClick={() => setShowSearch(true)}
        />
        <div className="group relative">
      <Link>
        <img
            src={profileIcon}
            className="w-5 cursor-pointer"
            alt="profile_icon"
          /></Link>
          <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4 z-50">
            <div className="flex flex-col w-44 bg-white border border-gray-200 rounded text-sm text-gray-700 overflow-hidden">
              {isAuthenticated ? (
                <>
                  <p className="px-4 py-2 cursor-pointer" onClick={() => navigate("/orders")}>Orders</p>
                  <p className="px-4 py-2 cursor-pointer" onClick={() => navigate("/profile")}>My Profile</p>
                  <p className="px-4 py-2.5 border-b border-gray-100 font-medium text-gray-900 cursor-default select-none" onClick={() => deleteUserHandler()}>Delete Account</p>
                  <p className="px-4 py-2 cursor-pointer text-red-500" onClick={logoutHandler}>Logout</p>
                </>
              ) : (
                <>
                  <p className="px-4 py-2 cursor-pointer" onClick={() => navigate("/login")}>Sign Up</p>
                </>
              )}
            </div>
          </div>
        </div>
        <Link to="/cart" className="relative">
          <img src={cartIcon} className="w-5 min-w-5" alt="cart_icon" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>

        <img
          src={menuIcon}
          className="w-5 cursor-pointer sm:hidden"
          alt="menu_icon"
          onClick={() => setVisible(true)}
        />
      </div>

      {/* sidebar menu for small screen */}
      <div
        className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${
          visible === true ? "w-full" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-600 ">
          <div
            className="flex items-center gap-4 p-3 cursor-pointer"
            onClick={() => setVisible(false)}
          >
            <img
              src={dropdownIcon}
              className="h-4 rotate-180"
              alt="dropdown_menu"
            />
            <p>Back</p>
          </div>
          <NavLink
            to="/"
            className="py-2 pl-6 border"
            onClick={() => setVisible(false)}
          >
            HOME
          </NavLink>
          <NavLink
            to="/collections"
            className="py-2 pl-6 border"
            onClick={() => setVisible(false)}
          >
            COLLECTIONS
          </NavLink>
          <NavLink
            to="/about"
            className="py-2 pl-6 border"
            onClick={() => setVisible(false)}
          >
            ABOUT
          </NavLink>
          <NavLink
            to="/contact"
            className="py-2 pl-6 border"
            onClick={() => setVisible(false)}
          >
            CONTACT
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default NavBar;