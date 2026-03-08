import api from "./axiosInstance";

export const getProductsOnSaleOverview = () =>{
    const response = api.get("/product/sale/saleoverview");
    return response;
}

export const getBestSellingProductsOverview = () =>{
    const response = api.get("/product/bestseller/bestselleroverview");
    return response;
}