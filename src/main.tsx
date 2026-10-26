import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// A note for whoever opens the console. Decode the second line for a flag.
console.log(
  "%cYou opened the console. Good instinct.",
  "font: 700 16px Archivo, sans-serif; color: #FFB238; background: #0C1B2B; padding: 8px 12px;",
);
console.log("%c" + "ZmxhZ3tjMG5zMGwzX3doMXNwM3JzfQ==", "font-family: monospace; color: #8a96a3;");
console.log("Hiring? dhairya.shukla2005@gmail.com");

createRoot(document.getElementById("root")!).render(<App />);
