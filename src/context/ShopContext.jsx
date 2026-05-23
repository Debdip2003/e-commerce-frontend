import { createContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getProducts, searchProducts } from "../services/productService";
import api from "../services/axiosInstance";
import { getUserId } from "../services/userService";
import { addCartItem, getCartItems } from "../services/cartService";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "Rs";
  const delivery_fee = 10;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("access-token"))
  );
  const [userId, setUserId] = useState("");
  const navigate=useNavigate()

  useEffect(()=>{
    const timer = setTimeout(()=>{
      if(!search || search.trim().length === 0){
        setIsSearching(false);
        return;
      }
      
      if(search.trim().length >= 2){
        fetchSearchResults();
      }
    }, 500)

    return () => clearTimeout(timer);
  }, [search])

  useEffect(() => {
    if (!isSearching && (!search || search.trim().length === 0)) {
      fetchProducts(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(()=>{
    if(isAuthenticated){
      fetchUserDetails();
    }
  }, [isAuthenticated])

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const accessToken = localStorage.getItem("access-token");
      const refreshToken = localStorage.getItem("refresh-token");

      if (accessToken || !refreshToken) return;

      try {
        const response = await api.post("/user/refresh-token", { refreshToken });
        const newAccessToken = response?.data?.accessToken || response?.data?.token;

        if (!newAccessToken) {
          throw new Error("No access token returned from refresh endpoint");
        }

        if (!cancelled) {
          setAuthToken(newAccessToken, refreshToken);
        }
      } catch (error) {
        if (!cancelled) {
          setAuthToken(null);
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const syncAuth = () => setIsAuthenticated(Boolean(localStorage.getItem("access-token")));
    window.addEventListener("storage", syncAuth); // cross-tab sync
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  useEffect(()=>{
    if(userId){
      fetchCartItems(userId);
    }
  },[userId])

  const fetchUserDetails = async () =>{
    const userId = await getUserId();
    setUserId(userId);
  }

  const fetchSearchResults = async () => {
        if (showSearch && search && search.trim().length > 0) {
          setIsSearching(true);
          try {
            const response = await searchProducts(search);
            const data = response.data;
            if(data){
              setProducts(data);
              setIsSearching(false);
            }
          } catch (error) {
            console.error("Error searching products:", error);
            setProducts([]);
          }
    }
  };

  const fetchProducts = async(filterParams = {}) =>{
    try{
      const response = await getProducts(filterParams);
      const data = response.data;
      if(data){
        setProducts(data);
      } else {
        console.error("Failed to fetch products");
      }
    }catch(error){
      console.error(error);
    }
  }

  const setAuthToken = (accessToken, refreshToken = "") => {
    if (accessToken) {
      localStorage.setItem("access-token", accessToken);
      if (refreshToken) localStorage.setItem("refresh-token", refreshToken);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("access-token");
      localStorage.removeItem("refresh-token");
      setIsAuthenticated(false);
    }
  };

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }else{
        const response = await addCartItem(itemId, size, 1);
        if(response.status === 200){
          toast.success(response.data.message || "Product is added to cart");
        }else{
          toast.error(response.data.message || "Failed to add item to cart");
        }
    }
  };

  const fetchCartItems = async (userId) =>{
      const response = await getCartItems(userId);
      if(response.status === 200){
        setCartItems(response.data || {});
      }else{
        toast.error(response.data.message || "Failed to fetch cart items");
      }
  }

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
    isSearching,
    filters,
    setFilters,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    isAuthenticated,
    setAuthToken,
    userId,
  }), [
    products,
    search,
    showSearch,
    isSearching,
    filters,
    cartItems,
    navigate,
    isAuthenticated,
  ]);

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

ShopContextProvider.propTypes={
  children: PropTypes.node.isRequired
};

export default ShopContextProvider;
