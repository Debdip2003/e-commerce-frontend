import api from "./axiosInstance";

export const placeOrder = (orderData) => {
    return api.post('/orders', orderData);
}

export const requestOrderOtp = (payload) => {
    return api.post('/orders/request-otp', payload);
}

export const verifyOrderOtp = (payload) => {
    return api.post('/orders/verify-otp', payload);
}

export const getOrders = (userId) => {
    return api.get(`/orders/user/${userId}`);
}

export const getOrderDetails = (orderId) => {
    return api.get(`/orders/${orderId}`);
}

export const updateOrderStatus = (orderId, orderStatus) => {
    return api.put(`/orders/${orderId}`, { orderStatus });
}

export const cancelOrder = (orderId) => {
    return api.delete(`/orders/${orderId}`);
}
