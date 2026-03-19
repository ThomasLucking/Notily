import { Elysia, t } from "elysia";
import { memoryStore } from "../db/memory-store";

export const foldersRoutes = new Elysia({ prefix: "/folders" })
	.get("/", () => {
		return memoryStore.getAllFolders();
	})
	.post(
		"/",
		({ body, set }) => {
			const folder = memoryStore.createFolder(body.name, body.parentId ?? null);
			set.status = 201;
			return folder;
		},
		{
			body: t.Object({
				name: t.String({ minLength: 1 }),
				parentId: t.Optional(t.Nullable(t.Number())),
			}),
		},
	)
	.put(
		"/:id",
		({ params, body, set }) => {
			const folder = memoryStore.updateFolder(params.id, body);
			if (!folder) {
				set.status = 404;
				return { error: "Folder not found" };
			}
			return folder;
		},
		{
			params: t.Object({ id: t.Numeric() }),
			body: t.Object({
				name: t.Optional(t.String()),
				parentId: t.Optional(t.Nullable(t.Number())),
			}),
		},
	)
	.delete(
		"/:id",
		({ params, set }) => {
			const folder = memoryStore.deleteFolder(params.id);
			if (!folder) {
				set.status = 404;
				return { error: "Folder not found" };
			}
			return { success: true };
		},
		{
			params: t.Object({ id: t.Numeric() }),
		},
	);
