// dependencies
import { BrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";

// components
import App from "./App.tsx";

// styles
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
