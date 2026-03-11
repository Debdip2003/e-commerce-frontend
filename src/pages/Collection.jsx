import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "..//context/ShopContext";
import { assets } from "../assets/frontend_assets/assets";
import Title from "..//components/Title";
import ProductItem from "..//components/ProductItems";
import { getProducts, filterOptions } from "../services/productService";

const Collection = () => {
  const { products, isSearching, search, showSearch, setFilters } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [bestSellerOnly, setBestSellerOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sortType, setSortType] = useState("relevant");
  
  // Only fetch dynamic filters from API
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);

  // Fetch only dynamic filters (categories, subcategories, brands) once on mount
  useEffect(() => {
    fetchDynamicFilters();
  }, []);

  const fetchDynamicFilters = async () => {
    try {
      const response = await getProducts();
      const data = response.data;
      if (data && data.length > 0) {
        const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
        setAvailableCategories(categories);
        const subCategories = [...new Set(data.map(item => item.subCategory).filter(Boolean))];
        setAvailableSubCategories(subCategories);
        const brands = [...new Set(data.map(item => item.brand).filter(Boolean))];
        setAvailableBrands(brands);
      }
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const togglesubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleBrand = (e) => {
    if (selectedBrands.includes(e.target.value)) {
      setSelectedBrands((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSelectedBrands((prev) => [...prev, e.target.value]);
    }
  };

  const handlePriceRangeChange = (e) => {
    const selectedRange = filterOptions.priceRanges[e.target.value];
    setSelectedPriceRange(e.target.value === "" ? null : selectedRange);
  };

  const handleRatingChange = (e) => {
    setSelectedRating(e.target.value === "" ? null : Number(e.target.value));
  };

  // Update filters in context when any filter changes
  useEffect(() => {
    const newFilters = {};
    
    if (category.length > 0) newFilters.category = category.join('|');
    if (subCategory.length > 0) newFilters.subCategory = subCategory.join('|');
    if (selectedBrands.length > 0) newFilters.brand = selectedBrands.join('|');
    if (selectedColors.length > 0) newFilters.color = selectedColors.join('|');
    if (selectedSizes.length > 0) newFilters.size = selectedSizes.join('|');
    
    if (selectedPriceRange) {
      if (selectedPriceRange.min) newFilters.minPrice = selectedPriceRange.min;
      if (selectedPriceRange.max) newFilters.maxPrice = selectedPriceRange.max;
    }

    if (selectedRating) newFilters.minRating = selectedRating;
    if (bestSellerOnly) newFilters.bestSeller = true;
    if (onSaleOnly) newFilters.onSale = true;
    
    // Handle sorting
    const sortOption = filterOptions.sortOptions.find(opt => 
      sortType === 'relevant' ? opt.sortBy === null : `${opt.sortBy}-${opt.order}` === sortType
    );
    if (sortOption && sortOption.sortBy) {
      newFilters.sortBy = sortOption.sortBy;
      newFilters.order = sortOption.order;
    }

    setFilters(newFilters);
  }, [category, subCategory, selectedBrands, selectedColors, selectedSizes, selectedPriceRange, selectedRating, bestSellerOnly, onSaleOnly, sortType, setFilters]);

  const clearAllFilters = () => {
    setCategory([]);
    setSubCategory([]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedPriceRange(null);
    setSelectedRating(null);
    setBestSellerOnly(false);
    setOnSaleOnly(false);
    setSortType("relevant");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 pt-4 sm:pt-10 px-4 sm:px-0 border-t">
      {/* Filter Sidebar */}
      <div className="w-full sm:w-40 sm:min-w-[160px] sm:max-w-[180px] bg-gray-50 sm:bg-transparent sm:border sm:border-gray-300 sm:shadow-sm rounded-lg p-3 sm:p-2">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
          <p
            className="text-sm sm:text-base font-semibold flex items-center cursor-pointer gap-2"
            onClick={() => setShowFilter(!showFilter)}
          >
            FILTERS
            <img
              src={assets.dropdown_icon}
              alt="dropdown_icon"
              className={`h-2.5 sm:hidden ${showFilter ? "rotate-90" : ""}`}
            />
          </p>
          <button 
            onClick={clearAllFilters}
            className="text-[9px] sm:text-[10px] text-gray-500 hover:text-black underline"
          >
            Clear All
          </button>
        </div>

        {/* Category Filter */}
        <div
          className={`border-2 border-gray-400 bg-white pl-2 py-1.5 my-2 rounded ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-1.5 text-[11px] font-semibold">CATEGORIES</p>
          <div className="flex flex-col gap-1 text-[10px] font-light text-gray-700 max-h-28 overflow-y-auto">
            {availableCategories.map((cat) => (
              <label className="flex gap-1.5 items-center cursor-pointer" key={cat}>
                <input
                  type="checkbox"
                  className="w-2.5 h-2.5"
                  value={cat}
                  checked={category.includes(cat)}
                  onChange={toggleCategory}
                />
                <span className="select-none">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* SubCategory Filter */}
        <div
          className={`border-2 border-gray-400 bg-white pl-2 py-1.5 my-2 rounded ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-1.5 text-[11px] font-semibold">TYPE</p>
          <div className="flex flex-col gap-1 text-[10px] font-light text-gray-700 max-h-28 overflow-y-auto">
            {availableSubCategories.map((subCat) => (
              <label className="flex gap-1.5 items-center cursor-pointer" key={subCat}>
                <input
                  type="checkbox"
                  className="w-2.5 h-2.5"
                  value={subCat}
                  checked={subCategory.includes(subCat)}
                  onChange={togglesubCategory}
                />
                <span className="select-none">{subCat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Brand Filter - Only show if brands exist */}
        {availableBrands.length > 0 && (
          <div
            className={`border-2 border-gray-400 bg-white pl-2 py-1.5 my-2 rounded ${
              showFilter ? "" : "hidden"
            } sm:block`}
          >
            <p className="mb-1.5 text-[11px] font-semibold">BRAND</p>
            <div className="flex flex-col gap-1 text-[10px] font-light text-gray-700 max-h-28 overflow-y-auto">
              {availableBrands.map((brand) => (
                <label className="flex gap-1.5 items-center cursor-pointer" key={brand}>
                  <input
                    type="checkbox"
                    className="w-2.5 h-2.5"
                    value={brand}
                    checked={selectedBrands.includes(brand)}
                    onChange={toggleBrand}
                  />
                  <span className="select-none">{brand}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Price Range Filter - Static from filterOptions */}
        <div
          className={`border-2 border-gray-400 bg-white pl-2 py-1.5 my-2 rounded ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-1.5 text-[11px] font-semibold">PRICE RANGE</p>
          <select 
            className="w-full text-[10px] border border-gray-300 px-1.5 py-1 rounded"
            onChange={handlePriceRangeChange}
            value={selectedPriceRange ? filterOptions.priceRanges.indexOf(selectedPriceRange) : ""}
          >
            <option value="">All Prices</option>
            {filterOptions.priceRanges.map((range, index) => (
              <option key={index} value={index}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Filter - Static from filterOptions */}
        <div
          className={`border-2 border-gray-400 bg-white pl-2 py-1.5 my-2 rounded ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-1.5 text-[11px] font-semibold">RATING</p>
          <select 
            className="w-full text-[10px] border border-gray-300 px-1.5 py-1 rounded"
            onChange={handleRatingChange}
            value={selectedRating || ""}
          >
            <option value="">All Ratings</option>
            {filterOptions.ratingStars.map((rating) => (
              <option key={rating.value} value={rating.value}>
                {rating.label}
              </option>
            ))}
          </select>
        </div>

        {/* Color Filter - Static from filterOptions */}
        <div
          className={`border-2 border-gray-400 bg-white pl-2 py-1.5 my-2 rounded ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-1.5 text-[11px] font-semibold">COLOR</p>
          <div className="flex flex-wrap gap-1">
            {filterOptions.colors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  if (selectedColors.includes(color)) {
                    setSelectedColors(prev => prev.filter(c => c !== color));
                  } else {
                    setSelectedColors(prev => [...prev, color]);
                  }
                }}
                className={`px-1.5 py-0.5 text-[9px] border rounded ${
                  selectedColors.includes(color) 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Size Filter - Static from filterOptions */}
        <div
          className={`border-2 border-gray-400 bg-white pl-2 py-1.5 my-2 rounded ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-1.5 text-[11px] font-semibold">SIZE</p>
          <div className="flex flex-wrap gap-1">
            {filterOptions.sizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  if (selectedSizes.includes(size)) {
                    setSelectedSizes(prev => prev.filter(s => s !== size));
                  } else {
                    setSelectedSizes(prev => [...prev, size]);
                  }
                }}
                className={`px-1.5 py-0.5 text-[9px] border rounded ${
                  selectedSizes.includes(size) 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Boolean Filters */}
        <div
          className={`border-2 border-gray-400 bg-white pl-2 py-1.5 my-2 rounded ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-1.5 text-[11px] font-semibold">SPECIAL FILTERS</p>
          <div className="flex flex-col gap-1 text-[10px] font-light text-gray-700">
            <label className="flex gap-1.5 items-center cursor-pointer">
              <input
                type="checkbox"
                className="w-2.5 h-2.5"
                checked={bestSellerOnly}
                onChange={(e) => setBestSellerOnly(e.target.checked)}
              />
              <span className="select-none">Best Sellers Only</span>
            </label>
            <label className="flex gap-1.5 items-center cursor-pointer">
              <input
                type="checkbox"
                className="w-2.5 h-2.5"
                checked={onSaleOnly}
                onChange={(e) => setOnSaleOnly(e.target.checked)}
              />
              <span className="select-none">On Sale Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Right Side - Products */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
          <div className="text-lg sm:text-2xl">
            <Title text1={"ALL"} text2={"COLLECTIONS"} />
          </div>
          {/* Product Sort */}
          <select
            className="border-2 border-gray-300 text-xs sm:text-sm px-2 py-1 w-full sm:w-auto"
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
          >
            {filterOptions.sortOptions.map((option, index) => (
              <option 
                key={index} 
                value={option.sortBy ? `${option.sortBy}-${option.order}` : 'relevant'}
              >
                Sort by: {option.label}
              </option>
            ))}
          </select>
        </div>
        {/* Map Products */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 gap-y-4 sm:gap-y-6">
          {isSearching && showSearch ? (
            <div className="col-span-full text-center py-10 sm:py-20">
              <p className="text-gray-500 text-sm sm:text-lg">Searching for "{search}"...</p>
            </div>
          ) : products.length > 0 ? (
            products.map((item) => {
              return (
                <ProductItem
                  key={item._id}
                  name={item.name}
                  id={item._id}
                  price={item.price}
                  image={Array.isArray(item.image) ? item.image : [item.image]}
                />
              );
            })
          ) : (
            <div className="col-span-full text-center py-10 sm:py-20">
              <p className="text-gray-500 text-sm sm:text-lg">No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;