import { createContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getProducts, searchProducts } from "../services/productService";
import api from "../services/axiosInstance";
import { getUserId } from "../services/userService";
import { addCartItem, getCartItems, updateCartItem, deleteCartItem } from "../services/cartService";

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
  const [cartTotal, setCartTotal] = useState(0);
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
        try {
          const response = await addCartItem(itemId, size, 1);
          if(response.status === 200){
            // Update cart items and total from response
            setCartItems(response.data.cart || {});
            setCartTotal(response.data.total || 0);
            toast.success(response.data.message || "Product is added to cart");
            // Fetch latest cart details from backend
            if(userId) {
              await fetchCartItems(userId);
            }
          }else{
            toast.error(response.data.message || "Failed to add item to cart");
          }
        } catch (error) {
          console.error("Error adding to cart:", error);
          toast.error("Failed to add item to cart");
        }
    }
  };

  const fetchCartItems = async (userId) =>{
      try {
        const response = await getCartItems(userId);
        if(response.status === 200){
          setCartItems(response.data.cart || response.data || {});
          setCartTotal(response.data.total || 0);
        }else{
          toast.error(response.data.message || "Failed to fetch cart items");
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
        toast.error("Failed to fetch cart items");
      }
  }

  const getCartCount = () => {
    let totalCount = 0;
    for (const productId in cartItems) {
      const items = cartItems[productId];
      if (Array.isArray(items)) {
        items.forEach((item) => {
          if (item && item.quantity) {
            totalCount += item.quantity;
          }
        });
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    try {
      if (quantity > 0) {
        // Update quantity via API
        const response = await updateCartItem(itemId, size, quantity);
        if (response.status === 200) {
          // Update local state with the updated cart and total from API
          setCartItems(response.data.cart || {});
          setCartTotal(response.data.total || 0);
          toast.success("Cart updated successfully");
          // Fetch latest cart details from backend
          if(userId) {
            await fetchCartItems(userId);
          }
        }
      } else {
        // For deletion (quantity = 0), call delete API
        const response = await deleteCartItem(itemId);
        if (response.status === 200) {
          setCartItems(response.data.cart || {});
          setCartTotal(response.data.total || 0);
          toast.success(response.data.message || "Item removed from cart");
          // Fetch latest cart details from backend
          if(userId) {
            await fetchCartItems(userId);
          }
        }
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error(error.response?.data?.error || "Failed to update cart");
      // Revert to previous state by refetching cart
      if (userId) {
        fetchCartItems(userId);
      }
    }
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
    navigate,
    isAuthenticated,
    setAuthToken,
    userId,
    cartTotal,
  }), [
    products,
    search,
    showSearch,
    isSearching,
    filters,
    cartItems,
    navigate,
    isAuthenticated,
    cartTotal,
  ]);

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

ShopContextProvider.propTypes={
  children: PropTypes.node.isRequired
};

export default ShopContextProvider;
