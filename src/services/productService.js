import api from "./axiosInstance";

export const getProductsOnSaleOverview = () =>{
    return api.get("/products/sale/saleoverview");
}

export const getBestSellingProductsOverview = () =>{
    return api.get("/products/bestseller/bestselleroverview");
}

export const getProducts = (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.subCategory) queryParams.append('subCategory', filters.subCategory);
    if (filters.brand) queryParams.append('brand', filters.brand);
    if (filters.color) queryParams.append('color', filters.color);
    if (filters.size) queryParams.append('size', filters.size);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
    if (filters.minRating) queryParams.append('minRating', filters.minRating);
    if (filters.bestSeller !== undefined) queryParams.append('bestSeller', filters.bestSeller);
    if (filters.onSale !== undefined) queryParams.append('onSale', filters.onSale);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.order) queryParams.append('order', filters.order);
    
    const queryString = queryParams.toString();
    return api.get(`/products${queryString ? `?${queryString}` : ''}`);
}

export const searchProducts = (searchTerm) => {
    return api.get(`/products/search?query=${encodeURIComponent(searchTerm)}`);
}

export const filterOptions = {
    priceRanges: [
        { label: 'Under ₹500', min: 0, max: 500 },
        { label: '₹500 - ₹1000', min: 500, max: 1000 },
        { label: '₹1000 - ₹2500', min: 1000, max: 2500 },
        { label: '₹2500 - ₹5000', min: 2500, max: 5000 },
        { label: '₹5000 - ₹10000', min: 5000, max: 10000 },
        { label: 'Above ₹10000', min: 10000, max: null }
    ],
    
    ratingStars: [
        { label: '5 Stars', value: 5 },
        { label: '4 Stars & Above', value: 4 },
        { label: '3 Stars & Above', value: 3 },
        { label: '2 Stars & Above', value: 2 },
        { label: '1 Star & Above', value: 1 }
    ],
    
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '32GB', '64GB', '128GB', '256GB', '512GB'],
    
    colors: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Gray'],
    
    booleanFilters: [
        { label: 'Best Sellers', key: 'bestSeller' },
        { label: 'On Sale', key: 'onSale' }
    ],
    
    sortOptions: [
        { label: 'Relevant', sortBy: null, order: null },
        { label: 'Price: Low to High', sortBy: 'price', order: 'asc' },
        { label: 'Price: High to Low', sortBy: 'price', order: 'desc' },
        { label: 'Rating: High to Low', sortBy: 'ratings', order: 'desc' },
        { label: 'Newest First', sortBy: 'createdAt', order: 'desc' }
    ]
};