// dependencies
import { BrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";
import Modal from "react-modal";
import './i18n';
import "react-datepicker/dist/react-datepicker.css";

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
