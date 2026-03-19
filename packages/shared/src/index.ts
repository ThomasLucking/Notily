// Note types — the single source of truth

export interface Note {
	id: number;
	title: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateNoteInput {
	title: string;
	content: string;
}

export interface UpdateNoteInput {
	title?: string;
	content?: string;
}

// Chat types
export interface ChatMessage {
	role: "user" | "assistant";
	content: string;
}

export interface ChatRequest {
	message: string;
	noteIds?: number[];
}

export interface ChatResponse {
	reply: string;
}

// AI Analysis types
export interface AnalysisRequest {
	noteId: number;
	type: "suggestions" | "improvements" | "summary";
}

export interface AnalysisResponse {
	analysis: string;
}
