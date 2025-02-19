// dependencies
import { BrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";
import Modal from "react-modal";

// components
import App from "./App.tsx";

// styles
import "./index.css";

Modal.setAppElement("#root");

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
