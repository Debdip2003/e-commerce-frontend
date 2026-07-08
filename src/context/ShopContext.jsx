import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getProducts, searchProducts } from "../services/productService";
import { getUserProfile } from "../services/userService";
import { addCartItem, getCartItems, updateCartItem, deleteCartItem } from "../services/cartService";
import { requestOrderOtp as requestOrderOtpApi, verifyOrderOtp as verifyOrderOtpApi, getOrders } from "../services/orderService";
import { AuthContext } from "./AuthContext";

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
  const [userId, setUserId] = useState("");
  const [cartTotal, setCartTotal] = useState(0);
  const navigate=useNavigate()
  const { isAuthenticated } = useContext(AuthContext);

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

  useEffect(()=>{
    if(userId){
      fetchCartItems(userId);
    }
  },[userId])



  const fetchUserDetails = async () =>{
    const userId = await getUserProfile();
    setUserId(userId);
  }

  const fetchSearchResults = async () => {
        if (showSearch && search && search.trim().length > 0) {
          setIsSearching(true);
          try {
            const response = await searchProducts(search);
            // AI search endpoint returns products inside data.products
            const products = response.data?.products || [];
            if(products){
              setProducts(products);
              setIsSearching(false);
            }
          } catch (error) {
            toast.error("Search failed. Please try again.");
            setProducts([]);
            setIsSearching(false);
          }
    }
  };

  const fetchProducts = async(filterParams = {}) =>{
    try{
      const response = await getProducts(filterParams);
      const data = response.data;
      if(data){
        setProducts(data);
      }
    }catch(error){
      // Silent fail for product fetching
    }
  }

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
          }else{
            toast.error(response.data.message || "Failed to add item to cart");
          }
        } catch (error) {
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
        }
      } else {
        // For deletion (quantity = 0), call delete API
        const response = await deleteCartItem(itemId);
        if (response.status === 200) {
          setCartItems(response.data.cart || {});
          setCartTotal(response.data.total || 0);
          toast.success(response.data.message || "Item removed from cart");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update cart");
      // Revert to previous state by refetching cart
      if (userId) {
        fetchCartItems(userId);
      }
    }
  };

  const fetchUserOrders = async (userId) => {
    try {
      const response = await getOrders(userId);
      if (response.status === 200) {
        return response.data.orders || [];
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch orders");
      return [];
    }
  };

  const requestOrderOtp = async (orderData) => {
    if (!isAuthenticated) {
      toast.error("Please login before placing an order");
      navigate("/login");
      return;
    }

    try {
      const otpPayload = {
        firstName: orderData.firstName,
        lastName: orderData.lastName,
        email: orderData.email,
        street: orderData.street,
        city: orderData.city,
        state: orderData.state,
        zipcode: orderData.zipcode,
        country: orderData.country,
        phoneNumber: orderData.phoneNumber,
        totalPrice: orderData.totalPrice,
        paymentMethod: orderData.paymentMethod,
      };

      const response = await requestOrderOtpApi(otpPayload);
      if (response.status === 200) {
        toast.success(response.data.message || "OTP sent successfully");
        return response.data;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to request OTP");
      throw error;
    }
  };

  const verifyOrderOtp = async ({ verificationId, otp }) => {
    if (!isAuthenticated) {
      toast.error("Please login before placing an order");
      navigate("/login");
      return;
    }

    try {
      const response = await verifyOrderOtpApi({ verificationId, otp });
      if (response.status === 201) {
        setCartItems({});
        setCartTotal(0);
        toast.success(response.data.message || "Order placed successfully");
        navigate('/orders');
        return response.data;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to verify OTP");
      throw error;
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
    requestOrderOtp,
    verifyOrderOtp,
    fetchUserOrders,
    navigate,
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
