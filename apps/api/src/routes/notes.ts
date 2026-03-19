import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { notes } from "../db/schema";

export const notesRoutes = new Elysia({ prefix: "/notes" })
	.get("/", async () => {
		const allNotes = await db
			.select()
			.from(notes)
			.orderBy(notes.updatedAt);
		return allNotes.reverse();
	})
	.get(
		"/:id",
		async ({ params, set }) => {
			const note = await db
				.select()
				.from(notes)
				.where(eq(notes.id, params.id));
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
			}),
		},
	)
	.put(
		"/:id",
		async ({ params, body, set }) => {
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
			}),
		},
	)
	.delete(
		"/:id",
		async ({ params, set }) => {
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
