import api from "./axiosInstance";

export const addCartItem = (productId, size, quantity) =>{
    return api.post('/cart', { productId, size, quantity });
}

export const getCartItems = (userId) => {
    return api.get(`/cart/${userId}`);
}