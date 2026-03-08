import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItems from "./ProductItems";
import { getBestSellingProductsOverview } from "../services/productService";
import { toast } from "react-toastify";

const Bestseller = () => {
  const { products } = useContext(ShopContext);
  const [bestseller, setBestSeller] = useState([]);

  useEffect(() => {
    getbestsellingproductsoverview();
  }, [products]);

  const getbestsellingproductsoverview =async () => {
    try{
      const response = await getBestSellingProductsOverview();
      setBestSeller(response.data); 
    }catch(error){
      toast.error("Failed to fetch bestselling products overview");
      console.error("Error fetching bestselling products overview:", error);
    }
  }

  return (
    <div className="my-10">
      <div className="text-center text-3xl py-8">
        <Title text1={"BEST"} text2={"SELLER"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
         Discover our most popular products loved by customers. These best sellers combine quality, style, and performance that people trust every day.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {bestseller.map((item, index) => (
          <ProductItems
            key={index}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
};

export default Bestseller;
