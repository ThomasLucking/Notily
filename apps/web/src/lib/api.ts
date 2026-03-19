const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		headers: { "Content-Type": "application/json" },
		...options,
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({ error: res.statusText }));
		throw new Error(error.error || "Request failed");
	}
	return res.json();
}

// Types
export interface Note {
	id: number;
	title: string;
	content: string;
	folderId: number | null;
	createdAt: string;
	updatedAt: string;
}

export interface Folder {
	id: number;
	name: string;
	parentId: number | null;
	createdAt: string;
}

// Notes API
export const notesApi = {
	getAll: () => request<Note[]>("/notes"),
	getById: (id: number) => request<Note>(`/notes/${id}`),
	create: (data: { title: string; content: string; folderId?: number | null }) =>
		request<Note>("/notes", { method: "POST", body: JSON.stringify(data) }),
	update: (id: number, data: { title?: string; content?: string; folderId?: number | null }) =>
		request<Note>(`/notes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
	delete: (id: number) =>
		request<{ success: boolean }>(`/notes/${id}`, { method: "DELETE" }),
};

// Folders API
export const foldersApi = {
	getAll: () => request<Folder[]>("/folders"),
	create: (data: { name: string; parentId?: number | null }) =>
		request<Folder>("/folders", { method: "POST", body: JSON.stringify(data) }),
	update: (id: number, data: { name?: string; parentId?: number | null }) =>
		request<Folder>(`/folders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
	delete: (id: number) =>
		request<{ success: boolean }>(`/folders/${id}`, { method: "DELETE" }),
};

// Chat API
export const chatApi = {
	send: (message: string, noteIds?: number[]) =>
		request<{ reply: string }>("/chat", {
			method: "POST",
			body: JSON.stringify({ message, noteIds }),
		}),
	analyze: (noteId: number, type: "suggestions" | "improvements" | "summary") =>
		request<{ analysis: string }>("/chat/analyze", {
			method: "POST",
			body: JSON.stringify({ noteId, type }),
		}),
	stream: async function* (message: string, noteIds?: number[]) {
		const res = await fetch(`${API_BASE}/chat/stream`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ message, noteIds }),
		});
		if (!res.ok) throw new Error("Stream request failed");
		const reader = res.body?.getReader();
		if (!reader) throw new Error("No response body");
		const decoder = new TextDecoder();
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			yield decoder.decode(value, { stream: true });
		}
	},
};
