interface Note {
	id: number;
	title: string;
	content: string;
	folderId: number | null;
	createdAt: Date;
	updatedAt: Date;
}

interface Folder {
	id: number;
	name: string;
	parentId: number | null;
	createdAt: Date;
}

let nextNoteId = 1;
let nextFolderId = 1;
const notes: Map<number, Note> = new Map();
const folders: Map<number, Folder> = new Map();

export const memoryStore = {
	// Notes
	getAllNotes(): Note[] {
		return [...notes.values()].sort(
			(a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
		);
	},

	getNoteById(id: number): Note | undefined {
		return notes.get(id);
	},

	getNotesByFolder(folderId: number | null): Note[] {
		return [...notes.values()]
			.filter((n) => n.folderId === folderId)
			.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
	},

	createNote(title: string, content: string, folderId: number | null = null): Note {
		const now = new Date();
		const note: Note = {
			id: nextNoteId++,
			title,
			content,
			folderId,
			createdAt: now,
			updatedAt: now,
		};
		notes.set(note.id, note);
		return note;
	},

	updateNote(
		id: number,
		data: { title?: string; content?: string; folderId?: number | null },
	): Note | undefined {
		const note = notes.get(id);
		if (!note) return undefined;
		if (data.title !== undefined) note.title = data.title;
		if (data.content !== undefined) note.content = data.content;
		if (data.folderId !== undefined) note.folderId = data.folderId;
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

	// Folders
	getAllFolders(): Folder[] {
		return [...folders.values()].sort(
			(a, b) => a.name.localeCompare(b.name),
		);
	},

	getFolderById(id: number): Folder | undefined {
		return folders.get(id);
	},

	createFolder(name: string, parentId: number | null = null): Folder {
		const folder: Folder = {
			id: nextFolderId++,
			name,
			parentId,
			createdAt: new Date(),
		};
		folders.set(folder.id, folder);
		return folder;
	},

	updateFolder(id: number, data: { name?: string; parentId?: number | null }): Folder | undefined {
		const folder = folders.get(id);
		if (!folder) return undefined;
		if (data.name !== undefined) folder.name = data.name;
		if (data.parentId !== undefined) folder.parentId = data.parentId;
		return folder;
	},

	deleteFolder(id: number): Folder | undefined {
		const folder = folders.get(id);
		if (!folder) return undefined;
		// Move notes in this folder to root
		for (const note of notes.values()) {
			if (note.folderId === id) note.folderId = null;
		}
		// Move child folders to root
		for (const f of folders.values()) {
			if (f.parentId === id) f.parentId = null;
		}
		folders.delete(id);
		return folder;
	},
};
