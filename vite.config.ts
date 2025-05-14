@@ .. @@
 import path from "path";
 import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
 
+const __dirname = path.dirname(new URL(import.meta.url).pathname);
+
 export default defineConfig({
   plugins: [
     react(),
@@ .. @@
   ],
   resolve: {
     alias: {
-      "@": path.resolve(__dirname, "./client/src"),
-      "@shared": path.resolve(__dirname, "./shared"),
-      "@assets": path.resolve(__dirname, "./attached_assets"),
+      "@": path.resolve(__dirname, "client/src"),
+      "@shared": path.resolve(__dirname, "shared"),
+      "@assets": path.resolve(__dirname, "attached_assets"),
     },
   },
-  root: path.resolve(__dirname, "./client"),
+  root: path.resolve(__dirname, "client"),
   build: {
-    outDir: path.resolve(__dirname, "./dist/public"),
+    outDir: path.resolve(__dirname, "dist/public"),
     emptyOutDir: true,
   },
 });