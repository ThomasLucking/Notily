interface NoteContext {
	id: number;
	title: string;
	content: string;
}

export function buildChatSystemPrompt(notes: NoteContext[]): string {
	const notesContext =
		notes.length > 0
			? notes
					.map(
						(n) =>
							`--- Note: "${n.title}" (ID: ${n.id}) ---\n${n.content}\n`,
					)
					.join("\n")
			: "The user has no notes yet.";

	return `You are Notily, an intelligent notes assistant. You help users understand, analyze, and improve their notes.

You have access to the user's notes below. Use them to answer questions, find connections, and provide insights.

## User's Notes:
${notesContext}

## Guidelines:
- Reference specific notes by title when relevant
- Be concise and helpful
- If asked about something not in the notes, say so clearly
- Support markdown in your responses
- When suggesting improvements, be specific and actionable`;
}

export function buildAnalysisPrompt(
	note: NoteContext,
	type: "suggestions" | "improvements" | "summary",
): string {
	const typeInstructions = {
		suggestions:
			"Suggest related topics, follow-up questions, and connections the user might want to explore. Return 3-5 actionable suggestions.",
		improvements:
			"Review this note for clarity, structure, completeness, and writing quality. Suggest specific improvements with examples.",
		summary:
			"Provide a concise summary of this note, highlighting the key points and main takeaways.",
	};

	return `You are Notily, an intelligent notes assistant.

Analyze the following note and ${typeInstructions[type]}

## Note: "${note.title}"
${note.content}

Respond in markdown format.`;
}
