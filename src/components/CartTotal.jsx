import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";

const CartTotal = () => {
  const { currency, delivery_fee, cartTotal, cartItems, products } = useContext(ShopContext);
  const hasItems = Object.entries(cartItems).length > 0;

  return (
    <div className="w-full">
      <div className="tex-2xl">
        <Title text1={"CART"} text2={"TOTAL"} />
      </div>
      <div className="flex flex-col gap-2 mt-2 text-sm">
        {/* Products Breakdown */}
        <div className="mb-4 pb-4 border-b">
          <h3 className="font-semibold mb-2 text-gray-800">Order Summary</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {hasItems ? (
              Object.entries(cartItems).map(([productId, items]) => {
                const productData = products.find(
                  (product) => product._id === productId
                );

                if (!productData) return null;

                return items.map((item, index) => (
                  <div key={`${productId}-${index}`} className="flex justify-between text-gray-700 text-xs">
                    <div className="flex-1">
                      <p className="font-medium">{productData.name}</p>
                      <p className="text-gray-500">Size: {item.size}</p>
                    </div>
                    <div className="text-right">
                      <p>Qty: {item.quantity}</p>
                      <p className="text-gray-500">{currency}{(productData.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ));
              })
            ) : (
              <p className="text-gray-500">No items in cart</p>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>
            {currency}
            {cartTotal}.00
          </p>
        </div>
        <hr />
        {hasItems && (
          <>
            <div className="flex justify-between">
              <p>Shipping Fee</p>
              <p>
                {currency}
                {delivery_fee}
              </p>
            </div>
            <hr />
          </>
        )}
        <div className="flex justify-between">
          <b>Total</b>
          <b>
            {currency}
            {cartTotal === 0 ? "0" : hasItems ? cartTotal + delivery_fee : cartTotal}
          </b>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
