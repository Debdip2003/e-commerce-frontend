import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import RelatedProducts from "../components/RelatedProducts";
import { getProductById } from "../services/productService";
import starIcon from "../assets/frontend_assets/star_icon.png"
import starDullIcon from "../assets/frontend_assets/star_dull_icon.png"

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");

  const fetchProductData = async () => {
    try{
      const response = await getProductById(productId);
      setProductData(response.data);
      setImage(response.data.image);
    }catch(error){
      console.error("Error fetching product data:", error);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  const productSizes = Array.isArray(productData?.size)
    ? productData.size
    : productData?.size
      ? [productData.size]
      : [];

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* Product Data */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* Product Images */}
        <div className="flex flex-1 flex-col-reverse gap-3 sm:flex-row">
          <div className="w-full sm:w-[80%]">
            <img src={image} alt="productImage" className="w-full h-auto" />
          </div>
        </div>

        {/* Product Information */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            <img
              src={starIcon}
              alt="product_rating"
              className="w-3 5"
            />
            <img
              src={starIcon}
              alt="product_rating"
              className="w-3 5"
            />
            <img
              src={starIcon}
              alt="product_rating"
              className="w-3 5"
            />
            <img
              src={starIcon}
              alt="product_rating"
              className="w-3 5"
            />
            <img
              src={starDullIcon}
              alt="product_rating"
              className="w-3 5"
            />
            <p className="pl-2">(122)</p>
          </div>
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <p className="text-3xl font-medium">
              {currency} {productData.price}
            </p>
            {productData.olderPrice && productData.olderPrice > productData.price && (
              <p className="text-xl text-gray-400 line-through">
                {currency} {productData.olderPrice}
              </p>
            )}
            {productData.discountPercent > 0 && (
              <span className="bg-red-500 text-white text-sm font-semibold px-2 py-0.5 rounded">
                -{productData.discountPercent}% OFF
              </span>
            )}
          </div>
          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productSizes.map((item, index) => (
                <button
                  className={`border py-2 px-4 bg-gray-100 ${
                    item === size ? "border-orange-500" : ""
                  }`}
                  key={index}
                  onClick={() => setSize(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
            onClick={() => {
              addToCart(productData._id, size);
            }}
          >
            ADD TO CART
          </button>
          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original Product</p>
            <p>Cash on delivery is available on this product</p>
            <p>Easy return and exchange policy within 7 days</p>
          </div>
        </div>
      </div>
      {/* Description and Review section */}
      <div className="mt-20">
        <div className="flex ">
          <b className="border px-5 py-3 text-sm">Description</b>
          <p className="border px-5 py-3 text-sm">Reviews (122)</p>
        </div>
        <div className="flex flex-col gap-4 border p-6 text-sm text-gray-500">
          <p>
            {productData.description}
          </p>
        </div>
      </div>
      {/* display related products */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
