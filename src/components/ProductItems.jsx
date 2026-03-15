import PropTypes from "prop-types";
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItems = ({ id, image, name, price, olderPrice, discountPercent }) => {
  const { currency } = useContext(ShopContext);
  const imageUrl = Array.isArray(image) ? image[0] : image;

  return (
    <Link to={`/product/${id}`} className="group block">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
        <div className="relative overflow-hidden aspect-square bg-gray-100">
          <img src={imageUrl} className="w-full h-full object-cover" alt={name} loading="lazy" />

          {/* Discount badge */}
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
              -{discountPercent}%
            </div>
          )}

          <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-semibold shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View Details
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-gray-800 font-medium text-base mb-3 line-clamp-1">{name}</h3>
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-gray-500">{currency}</span>
                <span className="text-2xl font-bold text-gray-900">{price.toLocaleString()}</span>
              </div>
              {olderPrice && olderPrice > price && (
                <div className="flex items-baseline gap-1 text-gray-400">
                  <span className="text-xs">{currency}</span>
                  <span className="text-sm line-through">{olderPrice.toLocaleString()}</span>
                </div>
              )}
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

ProductItems.propTypes = {
  id: PropTypes.string.isRequired,
  image: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  olderPrice: PropTypes.number,
  discountPercent: PropTypes.number,
};

export default ProductItems;