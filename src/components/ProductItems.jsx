import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import {PropTypes} from "prop-types"

const ProductItems = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);

  return <Link to={`/product/${id}`} className="text-gray-700 cursor-pointer">
      <div className="overflow-hidden aspect-square bg-gray-100">
        <img 
          src={image} 
          className="w-full h-full object-cover" 
          alt={name}
          loading="lazy"
        />
      </div>
    <p className="pt-3 pb-1 text-sm">{name}</p>
    <p className="text-sm font-medium">{currency} {price}</p>
  </Link>;
};

ProductItems.propTypes={
    id:PropTypes.string.isRequired,
    image:PropTypes.arrayOf(PropTypes.string).isRequired,
    name:PropTypes.string.isRequired,
    price:PropTypes.number.isRequired
}

export default ProductItems;
