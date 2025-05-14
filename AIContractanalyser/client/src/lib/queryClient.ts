@@ .. @@
 export async function apiRequest(
   method: string,
   url: string,
   data?: unknown | undefined,
 ): Promise<Response> {
+  // Add base URL for production
+  const baseUrl = import.meta.env.PROD 
+    ? import.meta.env.VITE_API_URL || ''
+    : '';
+  
+  const fullUrl = `${baseUrl}${url}`;
+
   const res = await fetch(url, {
     method,
     headers: data ? { "Content-Type": "application/json" } : {},
     body: data ? JSON.stringify(data) : undefined,
     credentials: "include",
   });
 
   await throwIfResNotOk(res);
   return res;
 }