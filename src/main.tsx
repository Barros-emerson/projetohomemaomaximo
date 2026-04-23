import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerPWA } from "./lib/registerPWA";
import { addOneShotAlert, listOneShotAlerts } from "./hooks/useItemAlerts";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker (no-op inside iframe / preview)
registerPWA();

// Auto-seed: alerta único de hoje 14:44 — Lanche da tarde
// (criado uma única vez; flag impede duplicar)
const SEED_KEY = "seed-lanche-1444-v1";
if (!localStorage.getItem(SEED_KEY)) {
  const today = new Date();
  const fireAt = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    14,
    44,
    0
  );
  // Só agenda se ainda não passou (com 1 min de tolerância)
  if (fireAt.getTime() > Date.now() - 60_000) {
    // Evita duplicar se já existir um igual
    const exists = listOneShotAlerts().some(
      (a) => a.label === "Lanche da tarde" && a.fireAt.startsWith(fireAt.toISOString().slice(0, 10))
    );
    if (!exists) {
      // Format local YYYY-MM-DDTHH:mm sem timezone shift
      const pad = (n: number) => n.toString().padStart(2, "0");
      const local = `${fireAt.getFullYear()}-${pad(fireAt.getMonth() + 1)}-${pad(
        fireAt.getDate()
      )}T${pad(fireAt.getHours())}:${pad(fireAt.getMinutes())}`;
      addOneShotAlert({
        label: "Lanche da tarde",
        detail: "Hora do lanche! 🥪",
        fireAt: local,
      });
    }
  }
  localStorage.setItem(SEED_KEY, "1");
}
