import { useNotes, useDeleteNote } from "../../hooks/useNotes";
import { Plus, Trash2, FileText } from "lucide-react";

interface NotesListProps {
	selectedId: number | null;
	onSelect: (id: number) => void;
	onNew: () => void;
}

export function NotesList({ selectedId, onSelect, onNew }: NotesListProps) {
	const { data: notes, isLoading } = useNotes();
	const deleteNote = useDeleteNote();

	if (isLoading) {
		return <div className="notes-list-loading">Loading notes...</div>;
	}

	return (
		<div className="notes-list">
			<div className="notes-list-header">
				<h2>Notes</h2>
				<button type="button" className="btn-icon" onClick={onNew} title="New note">
					<Plus size={20} />
				</button>
			</div>
			<div className="notes-list-items">
				{(!notes || notes.length === 0) && (
					<div className="notes-empty">
						<FileText size={32} />
						<p>No notes yet</p>
						<button type="button" className="btn-primary" onClick={onNew}>
							Create your first note
						</button>
					</div>
				)}
				{notes?.map((note) => (
					<div
						key={note.id}
						className={`note-item ${selectedId === note.id ? "active" : ""}`}
						onClick={() => onSelect(note.id)}
						onKeyDown={(e) => e.key === "Enter" && onSelect(note.id)}
						role="button"
						tabIndex={0}
					>
						<div className="note-item-content">
							<h3>{note.title || "Untitled"}</h3>
							<p>{note.content.slice(0, 80) || "Empty note"}...</p>
							<span className="note-date">
								{new Date(note.updatedAt).toLocaleDateString()}
							</span>
						</div>
						<button
							type="button"
							className="btn-icon btn-danger"
							onClick={(e) => {
								e.stopPropagation();
								if (confirm("Delete this note?")) {
									deleteNote.mutate(note.id);
								}
							}}
							title="Delete note"
						>
							<Trash2 size={16} />
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
