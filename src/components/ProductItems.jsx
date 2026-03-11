import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import {PropTypes} from "prop-types"

const ProductItems = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);
  
  // Handle both array and string image formats
  const imageUrl = Array.isArray(image) ? image[0] : image;

  return (
    <Link to={`/product/${id}`} className="group block">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
        <div className="relative overflow-hidden aspect-square bg-gray-100">
          <img 
            src={imageUrl} 
            className="w-full h-full object-cover" 
            alt={name}
            loading="lazy"
          />
          
          {/* View Details Badge */}
          <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-semibold shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View Details
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-gray-800 font-medium text-base mb-3 line-clamp-2">
            {name}
          </h3>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-gray-500">{currency}</span>
              <span className="text-2xl font-bold text-gray-900">{price.toLocaleString()}</span>
            </div>
          </div>
          <button className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium">
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
};

ProductItems.propTypes={
    id:PropTypes.string.isRequired,
    image:PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]).isRequired,
    name:PropTypes.string.isRequired,
    price:PropTypes.number.isRequired
}

export default ProductItems;
