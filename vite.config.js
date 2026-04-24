import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/notes-exchange-platform/",
  plugins: [react()],
  server: {
    port: 5173
  }
});
