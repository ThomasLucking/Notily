import { Elysia, t } from "elysia";
import Anthropic from "@anthropic-ai/sdk";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "../db/client";
import { notes } from "../db/schema";
import { memoryStore } from "../db/memory-store";
import { buildAnalysisPrompt, buildChatSystemPrompt } from "../ai/prompt";

const useDb = !!process.env.DATABASE_URL;

const getClient = () => {
	const apiKey = process.env.ANTHROPIC_API_KEY;
	if (!apiKey) {
		throw new Error("ANTHROPIC_API_KEY environment variable is required");
	}
	return new Anthropic({ apiKey });
};

async function fetchNotes(noteIds?: number[]) {
	if (!useDb) {
		return noteIds && noteIds.length > 0
			? memoryStore.getNotesByIds(noteIds)
			: memoryStore.getAllNotes();
	}
	const db = await getDb();
	if (noteIds && noteIds.length > 0) {
		return db.select().from(notes).where(inArray(notes.id, noteIds));
	}
	return db.select().from(notes);
}

async function fetchNoteById(id: number) {
	if (!useDb) return memoryStore.getNoteById(id) ?? null;
	const db = await getDb();
	const [note] = await db.select().from(notes).where(eq(notes.id, id));
	return note ?? null;
}

export const chatRoutes = new Elysia({ prefix: "/chat" })
	.post(
		"/",
		async ({ body }) => {
			const anthropic = getClient();
			const contextNotes = await fetchNotes(body.noteIds);
			const systemPrompt = buildChatSystemPrompt(contextNotes);

			const response = await anthropic.messages.create({
				model: "claude-sonnet-4-6-20250514",
				max_tokens: 2048,
				system: systemPrompt,
				messages: [{ role: "user", content: body.message }],
			});

			const reply =
				response.content[0].type === "text" ? response.content[0].text : "";

			return { reply };
		},
		{
			body: t.Object({
				message: t.String({ minLength: 1 }),
				noteIds: t.Optional(t.Array(t.Number())),
			}),
		},
	)
	.post(
		"/stream",
		async function* ({ body }) {
			const anthropic = getClient();
			const contextNotes = await fetchNotes(body.noteIds);
			const systemPrompt = buildChatSystemPrompt(contextNotes);

			const stream = anthropic.messages.stream({
				model: "claude-sonnet-4-6-20250514",
				max_tokens: 2048,
				system: systemPrompt,
				messages: [{ role: "user", content: body.message }],
			});

			for await (const event of stream) {
				if (
					event.type === "content_block_delta" &&
					event.delta.type === "text_delta"
				) {
					yield event.delta.text;
				}
			}
		},
		{
			body: t.Object({
				message: t.String({ minLength: 1 }),
				noteIds: t.Optional(t.Array(t.Number())),
			}),
		},
	)
	.post(
		"/analyze",
		async ({ body, set }) => {
			const anthropic = getClient();
			const note = await fetchNoteById(body.noteId);

			if (!note) {
				set.status = 404;
				return { error: "Note not found" };
			}

			const prompt = buildAnalysisPrompt(note, body.type);

			const response = await anthropic.messages.create({
				model: "claude-sonnet-4-6-20250514",
				max_tokens: 2048,
				messages: [{ role: "user", content: prompt }],
			});

			const analysis =
				response.content[0].type === "text" ? response.content[0].text : "";

			return { analysis };
		},
		{
			body: t.Object({
				noteId: t.Number(),
				type: t.Union([
					t.Literal("suggestions"),
					t.Literal("improvements"),
					t.Literal("summary"),
				]),
			}),
		},
	);
