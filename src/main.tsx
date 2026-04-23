import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerPWA } from "./lib/registerPWA";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker (no-op inside iframe / preview)
registerPWA();
