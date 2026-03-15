import api from "./axiosInstance";

export const registerUser = async (userData) => {
    const { data } = await api.post("/user/register", userData);
    return data;
};

export const loginUser = async (userData) => {
    const { data } = await api.post("/user/login", userData);
    return data;
};

export const logoutUser = async () => {
    try {
        const { data } = await api.post("/user/logout");
        return data;
    } finally {
        localStorage.removeItem("access-token");
        localStorage.removeItem("refresh-token");
    }
};

export const deleteUserAccount = async () => {
    try {
        const { data } = await api.delete("/user/delete");
        return data;
    } finally {
        localStorage.removeItem("access-token");
        localStorage.removeItem("refresh-token");
    }
};

export const getUserId = async() =>{
    try{
        const response = await api.get("/user/profile");
        return response.data._id;
    }catch(error){
        console.error("Error fetching user ID:", error);
    }
}

export const refreshToken = async (refreshToken) =>{
    try{
        const response = await api.post("/user/refresh-token", { refreshToken });
        return response.data.token;
    }catch(error){
        console.error("Error refreshing token:", error);
    }
}

