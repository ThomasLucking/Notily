import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { notes } from "../db/schema";
import { memoryStore } from "../db/memory-store";

const useDb = !!process.env.DATABASE_URL;

export const notesRoutes = new Elysia({ prefix: "/notes" })
	.get("/", async () => {
		if (!useDb) return memoryStore.getAllNotes();
		const db = await getDb();
		const allNotes = await db.select().from(notes).orderBy(notes.updatedAt);
		return allNotes.reverse();
	})
	.get(
		"/:id",
		async ({ params, set }) => {
			if (!useDb) {
				const note = memoryStore.getNoteById(params.id);
				if (!note) {
					set.status = 404;
					return { error: "Note not found" };
				}
				return note;
			}
			const db = await getDb();
			const note = await db.select().from(notes).where(eq(notes.id, params.id));
			if (note.length === 0) {
				set.status = 404;
				return { error: "Note not found" };
			}
			return note[0];
		},
		{
			params: t.Object({ id: t.Numeric() }),
		},
	)
	.post(
		"/",
		async ({ body, set }) => {
			if (!useDb) {
				const note = memoryStore.createNote(body.title, body.content, body.folderId ?? null);
				set.status = 201;
				return note;
			}
			const db = await getDb();
			const [newNote] = await db
				.insert(notes)
				.values({ title: body.title, content: body.content })
				.returning();
			set.status = 201;
			return newNote;
		},
		{
			body: t.Object({
				title: t.String({ minLength: 1 }),
				content: t.String(),
				folderId: t.Optional(t.Nullable(t.Number())),
			}),
		},
	)
	.put(
		"/:id",
		async ({ params, body, set }) => {
			if (!useDb) {
				const note = memoryStore.updateNote(params.id, { title: body.title, content: body.content, folderId: body.folderId });
				if (!note) {
					set.status = 404;
					return { error: "Note not found" };
				}
				return note;
			}
			const db = await getDb();
			const [updated] = await db
				.update(notes)
				.set({ title: body.title, content: body.content })
				.where(eq(notes.id, params.id))
				.returning();
			if (!updated) {
				set.status = 404;
				return { error: "Note not found" };
			}
			return updated;
		},
		{
			params: t.Object({ id: t.Numeric() }),
			body: t.Object({
				title: t.Optional(t.String()),
				content: t.Optional(t.String()),
				folderId: t.Optional(t.Nullable(t.Number())),
			}),
		},
	)
	.delete(
		"/:id",
		async ({ params, set }) => {
			if (!useDb) {
				const note = memoryStore.deleteNote(params.id);
				if (!note) {
					set.status = 404;
					return { error: "Note not found" };
				}
				return { success: true };
			}
			const db = await getDb();
			const [deleted] = await db
				.delete(notes)
				.where(eq(notes.id, params.id))
				.returning();
			if (!deleted) {
				set.status = 404;
				return { error: "Note not found" };
			}
			return { success: true };
		},
		{
			params: t.Object({ id: t.Numeric() }),
		},
	);
