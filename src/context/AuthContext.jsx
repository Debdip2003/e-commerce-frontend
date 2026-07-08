import { createContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import api from "../services/axiosInstance";

export const AuthContext = createContext();

export const AuthContextProvider = (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(
        Boolean(localStorage.getItem("access-token"))
    );

    const setAuthToken = (accessToken, refreshToken = "") => {
        if (accessToken) {
        localStorage.setItem("access-token", accessToken);
        if (refreshToken) localStorage.setItem("refresh-token", refreshToken);
        setIsAuthenticated(true);
        } else {
        localStorage.removeItem("access-token");
        localStorage.removeItem("refresh-token");
        setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const restoreSession = async () => {
        const accessToken = localStorage.getItem("access-token");
        const refreshToken = localStorage.getItem("refresh-token");

        if (accessToken || !refreshToken) return;

        try {
            const response = await api.post("/user/refresh-token", { refreshToken });
            const newAccessToken = response?.data?.accessToken || response?.data?.token;

            if (!newAccessToken) {
            throw new Error("No access token returned from refresh endpoint");
            }

            if (!cancelled) {
            setAuthToken(newAccessToken, refreshToken);
            }
        } catch (error) {
            if (!cancelled) {
            setAuthToken(null);
            }
        }
    };

        restoreSession();

        return () => {
        cancelled = true;
        };
    }, []);

    //to sync all the opened windows/tabs when user logs in or logs out
    useEffect(() => {
        const syncAuth = () => setIsAuthenticated(Boolean(localStorage.getItem("access-token")));
        window.addEventListener("storage", syncAuth);
        return () => window.removeEventListener("storage", syncAuth);
    }, []);

    //memoize the context value to prevent unnecessary re-renders
    const value = useMemo(
        () => ({
        isAuthenticated,
        setAuthToken,
        }),
        [isAuthenticated]
    );

    return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
    };

    AuthContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
    };

export default AuthContextProvider;
