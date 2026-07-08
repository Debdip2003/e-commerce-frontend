import api from "./axiosInstance";

export const registerUser = async (userData) => {
    const { data } = await api.post("/user/register", userData);
    return data;
};

export const verifyRegisterOtp = async (payload) => {
    const { data } = await api.post("/user/register/verify-otp", payload);
    return data;
};

export const resendRegisterOtp = async (payload) => {
    const { data } = await api.post("/user/register/resend-otp", payload);
    return data;
};

export const verifyLoginOtp = async (payload) => {
    const { data } = await api.post("/user/login/verify-otp", payload);
    return data;
};

export const resendLoginOtp = async (payload) => {
    const { data } = await api.post("/user/login/resend-otp", payload);
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

export const getUserProfile = async() =>{
    try{
        const response = await api.get("/user/profile");
        return response.data._id;
    }catch(error){
        console.error("Error fetching user profile:", error);
        throw error;
    }
}

export const getUserById = async(userId) =>{
    try{
        const response = await api.get(`/user/${userId}`);
        return response.data;
    }catch(error){
        console.error("Error fetching user by ID:", error);
        throw error;
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

export const updateUserProfile = async(updateData) =>{
    try{
        const response = await api.put("/user/update-profile", updateData);
        return response.data;
    }catch(error){
        console.error("Error updating user profile:", error);
        throw error;
    }
}

