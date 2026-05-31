import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";

const Orders = () => {
  const { userId, fetchUserOrders, currency, navigate } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (userId) {
        setIsLoading(true);
        const userOrders = await fetchUserOrders(userId);
        setOrders(userOrders);
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [userId, fetchUserOrders]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500";
      case "Processing":
        return "bg-blue-500";
      case "Shipped":
        return "bg-purple-500";
      case "Delivered":
        return "bg-green-500";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (isLoading) {
    return (
      <div className="border-t pt-16">
        <div className="text-2xl">
          <Title text1={"MY"} text2={"ORDERS"} />
        </div>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="border-t pt-16">
        <div className="text-2xl">
          <Title text1={"MY"} text2={"ORDERS"} />
        </div>
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <p className="text-gray-500 text-lg">No orders yet</p>
          <button
            onClick={() => navigate("/collections")}
            className="bg-black text-white px-8 py-2 rounded"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-16">
      <div className="text-2xl mb-8">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="border rounded-lg p-4 md:p-6 bg-white">
            {/* Order Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Order ID: <span className="font-medium text-gray-700">{order._id}</span></p>
                <p className="text-sm text-gray-500">Date: <span className="font-medium text-gray-700">{formatDate(order.createdAt)}</span></p>
              </div>
              <div className="flex items-center gap-3">
                <p className={`min-w-2 h-2 rounded-full ${getStatusDot(order.orderStatus)}`}></p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>
            </div>

            {/* Products in Order */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Items Ordered</h3>
              <div className="space-y-3">
                {order.cart && Object.entries(order.cart).map(([productId, items]) => {
                  return items.map((item, index) => (
                    <div
                      key={`${productId}-${index}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                          <span>Size: {item.size}</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/product/${productId}`)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium underline ml-4"
                      >
                        View Product
                      </button>
                    </div>
                  ));
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-6 pb-4 border-b space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{currency}{(order.totalPrice - 10).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping Fee:</span>
                <span className="font-medium">{currency}10</span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2">
                <span>Total:</span>
                <span>{currency}{order.totalPrice}</span>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="mb-6 pb-4 border-b">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Delivery Address</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{order.firstName} {order.lastName}</p>
                <p>{order.street}, {order.city}</p>
                <p>{order.state}, {order.zipcode}, {order.country}</p>
                <p className="mt-2">Email: {order.email}</p>
                <p>Phone: {order.phoneNumber}</p>
              </div>
            </div>

            {/* Payment & Additional Info */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Payment Method: <span className="font-medium text-gray-800">{order.paymentMethod}</span></p>
              </div>
              <button className="border border-gray-300 px-6 py-2 text-sm font-medium rounded hover:bg-gray-50">
                Track Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
