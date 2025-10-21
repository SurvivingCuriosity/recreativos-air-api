import { DEVELOPMENT, SERVER } from "@/config";
import { connectDB, disconnectDB } from "@/config/db";
import { app } from "@/index";

(async () => {
  await connectDB();

  const server = app.listen(SERVER.PORT, () => {
    console.log("Dev mode: ", DEVELOPMENT);
    console.log(`🚀 API en http://${SERVER.HOSTNAME}:${SERVER.PORT}`);
  });

  const shutdown = async () => {
    console.log("\n⏳ Cerrando conexiones…");
    await disconnectDB();
    server.close(() => {
      console.log("✅ Bye!");
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})();
