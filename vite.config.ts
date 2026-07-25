import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server/index"; // usa el alias

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 9000,
  fs: {
  allow: ["./", "./client", "./shared"], // <-- added "./" for root
  deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
},

  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@server": path.resolve(__dirname, "./server"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(server) {
      const app = createServer();
      server.middlewares.use(app);
    },
  };
}

