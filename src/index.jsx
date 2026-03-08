import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import ShopContextProvider from "./context/ShopContext";
import App from "./App";
import "./index.css";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
  <ShopContextProvider>
    <App />
    </ShopContextProvider>
  </BrowserRouter>
);

reportWebVitals();
