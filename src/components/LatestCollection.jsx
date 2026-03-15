import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItems from "./ProductItems";
import { getProductsOnSaleOverview } from "../services/productService";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setlatestProducts] = useState([]);

  useEffect(() => {
    getproductsonsaleoverview();
  }, [products]);

  const getproductsonsaleoverview = async () => {
    try {
      const response = await getProductsOnSaleOverview();
      setlatestProducts(response.data);
    } catch (error) {
      console.error("Error fetching products on sale overview:", error);
    }
  };

  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1={"PRODUCTS"} text2={"FOR SALE"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
        Grab the best deals on our top products. Enjoy limited-time discounts on high-quality items designed to bring you style, comfort, and great value.
        </p>
      </div>
      {/* Rendering products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {latestProducts.map((item) => (
          <ProductItems
            key={item._id}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
            olderPrice={item.olderPrice}
            discountPercent={item.discountPercent}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
