import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (error) {
  console.error("Error crítico:", error);
  document.getElementById("root")!.innerHTML =
    "<div style='padding:20px;font-family:monospace;color:red;'><h1>Error al cargar App:</h1><pre>" +
    String(error) +
    "</pre></div>";
}
