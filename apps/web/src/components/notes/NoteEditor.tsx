import { useState, useEffect, useCallback } from "react";
import { useNote, useCreateNote, useUpdateNote } from "../../hooks/useNotes";
import { MarkdownPreview } from "./MarkdownPreview";
import { NoteAnalysis } from "./NoteAnalysis";
import { Save, Eye, Edit, Sparkles } from "lucide-react";

interface NoteEditorProps {
	noteId: number | null;
	onSaved: (id: number) => void;
}

export function NoteEditor({ noteId, onSaved }: NoteEditorProps) {
	const { data: note } = useNote(noteId);
	const createNote = useCreateNote();
	const updateNote = useUpdateNote();

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [mode, setMode] = useState<"edit" | "preview" | "split">("split");
	const [showAnalysis, setShowAnalysis] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	useEffect(() => {
		if (note) {
			setTitle(note.title);
			setContent(note.content);
			setHasUnsavedChanges(false);
		} else if (noteId === null) {
			setTitle("");
			setContent("");
			setHasUnsavedChanges(false);
		}
	}, [note, noteId]);

	const handleSave = useCallback(async () => {
		if (!title.trim()) return;

		if (noteId) {
			await updateNote.mutateAsync({ id: noteId, title, content });
		} else {
			const newNote = await createNote.mutateAsync({ title, content });
			onSaved(newNote.id);
		}
		setHasUnsavedChanges(false);
	}, [noteId, title, content, updateNote, createNote, onSaved]);

	// Keyboard shortcut: Ctrl/Cmd+S to save
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "s") {
				e.preventDefault();
				handleSave();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [handleSave]);

	const isSaving = createNote.isPending || updateNote.isPending;

	return (
		<div className="note-editor">
			<div className="editor-toolbar">
				<input
					type="text"
					className="editor-title"
					placeholder="Note title..."
					value={title}
					onChange={(e) => {
						setTitle(e.target.value);
						setHasUnsavedChanges(true);
					}}
				/>
				<div className="editor-actions">
					<div className="mode-toggle">
						<button
							type="button"
							className={mode === "edit" ? "active" : ""}
							onClick={() => setMode("edit")}
							title="Edit mode"
						>
							<Edit size={16} />
						</button>
						<button
							type="button"
							className={mode === "split" ? "active" : ""}
							onClick={() => setMode("split")}
							title="Split mode"
						>
							<Edit size={16} />
							<Eye size={16} />
						</button>
						<button
							type="button"
							className={mode === "preview" ? "active" : ""}
							onClick={() => setMode("preview")}
							title="Preview mode"
						>
							<Eye size={16} />
						</button>
					</div>
					{noteId && (
						<button
							type="button"
							className="btn-icon"
							onClick={() => setShowAnalysis(!showAnalysis)}
							title="AI Analysis"
						>
							<Sparkles size={18} />
						</button>
					)}
					<button
						type="button"
						className="btn-primary"
						onClick={handleSave}
						disabled={isSaving || !title.trim()}
					>
						<Save size={16} />
						{isSaving ? "Saving..." : hasUnsavedChanges ? "Save*" : "Save"}
					</button>
				</div>
			</div>

			<div className={`editor-content mode-${mode}`}>
				{(mode === "edit" || mode === "split") && (
					<textarea
						className="editor-textarea"
						placeholder="Write your note in markdown..."
						value={content}
						onChange={(e) => {
							setContent(e.target.value);
							setHasUnsavedChanges(true);
						}}
					/>
				)}
				{(mode === "preview" || mode === "split") && (
					<div className="editor-preview">
						<MarkdownPreview content={content} />
					</div>
				)}
			</div>

			{showAnalysis && noteId && (
				<NoteAnalysis noteId={noteId} onClose={() => setShowAnalysis(false)} />
			)}
		</div>
	);
}
