@@ .. @@
 import { Pool, neonConfig } from '@neondatabase/serverless';
 import { drizzle } from 'drizzle-orm/neon-serverless';
 import ws from "ws";
-import * as schema from "@shared/schema";
+import * as schema from "../shared/schema";
 
 neonConfig.webSocketConstructor = ws;