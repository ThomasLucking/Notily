import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { notesRoutes } from "./routes/notes";
import { chatRoutes } from "./routes/chat";

const app = new Elysia()
	.use(cors())
	.get("/ping", () => "pong")
	.use(notesRoutes)
	.use(chatRoutes)
	.listen(3000);

console.log(`API running at ${app.server?.url}`);
