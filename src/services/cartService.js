import api from "./axiosInstance";

export const addCartItem = (productId, size, quantity) =>{
    return api.post('/cart', { productId, size, quantity });
}

export const getCartItems = (userId) => {
    return api.get(`/cart/${userId}`);
}

export const updateCartItem = (productId, size, quantity) =>{
    return api.put(`/cart/update/${productId}`, { size, quantity });
}

export const deleteCartItem = (productId) =>{
    return api.delete(`/cart/${productId}`);
}