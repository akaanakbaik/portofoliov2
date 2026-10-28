import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

let initialSettings;
try { const payload=document.getElementById('portfolio-data')?.textContent;if(payload)initialSettings=JSON.parse(payload); } catch {}
createRoot(document.getElementById("root")!).render(<App initialSettings={initialSettings} />);
