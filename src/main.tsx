import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatPage from "./ChatPage.tsx";

export enum Topic {
  sandwich = "sandwich",
  calculus = "calculus",
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/sandwich" element={<ChatPage topic={Topic.sandwich} />} />
        <Route path="/calculus" element={<ChatPage topic={Topic.calculus} />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
