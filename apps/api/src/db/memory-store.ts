interface Note {
	id: number;
	title: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
}

let nextId = 1;
const notes: Map<number, Note> = new Map();

export const memoryStore = {
	getAllNotes(): Note[] {
		return [...notes.values()].sort(
			(a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
		);
	},

	getNoteById(id: number): Note | undefined {
		return notes.get(id);
	},

	createNote(title: string, content: string): Note {
		const now = new Date();
		const note: Note = {
			id: nextId++,
			title,
			content,
			createdAt: now,
			updatedAt: now,
		};
		notes.set(note.id, note);
		return note;
	},

	updateNote(
		id: number,
		data: { title?: string; content?: string },
	): Note | undefined {
		const note = notes.get(id);
		if (!note) return undefined;
		if (data.title !== undefined) note.title = data.title;
		if (data.content !== undefined) note.content = data.content;
		note.updatedAt = new Date();
		return note;
	},

	deleteNote(id: number): Note | undefined {
		const note = notes.get(id);
		if (!note) return undefined;
		notes.delete(id);
		return note;
	},

	getNotesByIds(ids: number[]): Note[] {
		return ids.map((id) => notes.get(id)).filter((n): n is Note => !!n);
	},
};
