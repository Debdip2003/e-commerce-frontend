import { createContext, useEffect, useMemo, useState } from "react";
import { products } from "../assets/frontend_assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "Rs";
  const delivery_fee = 10;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const navigate=useNavigate()

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }else{
      toast.success("Product is added to cart");
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item]) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          console.error("Error occurred while updating cart count:", error);
        }
      }
    }
    return totalCount;
  };

  useEffect(()=>{
  },[cartItems])

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((products) => products._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item]) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {
          console.error("Error occurred while calculating cart amount:", error);
        }
      }
    }
    return totalAmount;
  };

  const value = useMemo(() => ({
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
  }), [search, showSearch, cartItems, navigate]);

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

ShopContextProvider.propTypes={
  children: PropTypes.node.isRequired
};

export default ShopContextProvider;
