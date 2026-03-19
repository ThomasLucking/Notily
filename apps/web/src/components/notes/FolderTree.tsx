import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFolders, useNotes, useCreateFolder, useDeleteFolder, useDeleteNote } from "@/hooks/useNotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	ChevronRight,
	ChevronDown,
	Folder,
	FolderPlus,
	FileText,
	Trash2,
	Plus,
	X,
} from "lucide-react";
import type { Folder as FolderType, Note } from "@/lib/api";

interface FolderNodeProps {
	folder: FolderType;
	folders: FolderType[];
	notes: Note[];
	onDeleteFolder: (id: number) => void;
	onDeleteNote: (id: number) => void;
	onSelectNote: (id: number) => void;
	onCreateNote: (folderId: number) => void;
}

function FolderNode({ folder, folders, notes, onDeleteFolder, onDeleteNote, onSelectNote, onCreateNote }: FolderNodeProps) {
	const [isOpen, setIsOpen] = useState(true);
	const childFolders = folders.filter((f) => f.parentId === folder.id);
	const childNotes = notes.filter((n) => n.folderId === folder.id);

	return (
		<div>
			<div className="group flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer text-sm">
				<button type="button" onClick={() => setIsOpen(!isOpen)} className="shrink-0 p-0.5">
					{isOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
				</button>
				<Folder className="h-4 w-4 text-muted-foreground shrink-0" />
				<span className="flex-1 truncate font-medium">{folder.name}</span>
				<div className="hidden group-hover:flex items-center gap-0.5">
					<button
						type="button"
						onClick={(e) => { e.stopPropagation(); onCreateNote(folder.id); }}
						className="p-0.5 rounded hover:bg-secondary"
						title="New note in folder"
					>
						<Plus className="h-3.5 w-3.5 text-muted-foreground" />
					</button>
					<button
						type="button"
						onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
						className="p-0.5 rounded hover:bg-secondary"
						title="Delete folder"
					>
						<Trash2 className="h-3.5 w-3.5 text-destructive" />
					</button>
				</div>
			</div>
			{isOpen && (
				<div className="ml-4 border-l border-border pl-2">
					{childFolders.map((cf) => (
						<FolderNode
							key={cf.id}
							folder={cf}
							folders={folders}
							notes={notes}
							onDeleteFolder={onDeleteFolder}
							onDeleteNote={onDeleteNote}
							onSelectNote={onSelectNote}
							onCreateNote={onCreateNote}
						/>
					))}
					{childNotes.map((note) => (
						<div
							key={note.id}
							className="group flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer text-sm"
							onClick={() => onSelectNote(note.id)}
							onKeyDown={(e) => e.key === "Enter" && onSelectNote(note.id)}
							role="button"
							tabIndex={0}
						>
							<FileText className="h-4 w-4 text-muted-foreground shrink-0" />
							<span className="flex-1 truncate">{note.title || "Untitled"}</span>
							<button
								type="button"
								onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
								className="hidden group-hover:block p-0.5 rounded hover:bg-secondary"
								title="Delete note"
							>
								<Trash2 className="h-3.5 w-3.5 text-destructive" />
							</button>
						</div>
					))}
					{childFolders.length === 0 && childNotes.length === 0 && (
						<p className="text-xs text-muted-foreground px-2 py-1 italic">Empty</p>
					)}
				</div>
			)}
		</div>
	);
}

export function FolderTree({ onCreateNote }: { onCreateNote: (folderId: number | null) => void }) {
	const { data: folders = [] } = useFolders();
	const { data: notes = [] } = useNotes();
	const createFolder = useCreateFolder();
	const deleteFolder = useDeleteFolder();
	const deleteNote = useDeleteNote();
	const navigate = useNavigate();

	const [showNewFolder, setShowNewFolder] = useState(false);
	const [newFolderName, setNewFolderName] = useState("");

	const rootFolders = folders.filter((f) => f.parentId === null);
	const rootNotes = notes.filter((n) => n.folderId === null);

	const handleCreateFolder = () => {
		if (!newFolderName.trim()) return;
		createFolder.mutate({ name: newFolderName });
		setNewFolderName("");
		setShowNewFolder(false);
	};

	const handleDeleteFolder = (id: number) => {
		if (confirm("Delete this folder? Notes will be moved to root.")) {
			deleteFolder.mutate(id);
		}
	};

	const handleDeleteNote = (id: number) => {
		if (confirm("Delete this note?")) {
			deleteNote.mutate(id);
		}
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between px-4 py-3 border-b border-border">
				<h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Notes
				</h2>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={() => setShowNewFolder(true)}
						title="New folder"
					>
						<FolderPlus className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={() => onCreateNote(null)}
						title="New note"
					>
						<Plus className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{showNewFolder && (
				<div className="flex items-center gap-1 px-3 py-2 border-b border-border">
					<Input
						value={newFolderName}
						onChange={(e) => setNewFolderName(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
						placeholder="Folder name..."
						className="h-7 text-sm"
						autoFocus
					/>
					<Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleCreateFolder}>
						<Plus className="h-4 w-4" />
					</Button>
					<Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setShowNewFolder(false)}>
						<X className="h-4 w-4" />
					</Button>
				</div>
			)}

			<ScrollArea className="flex-1">
				<div className="p-2">
					{rootFolders.map((folder) => (
						<FolderNode
							key={folder.id}
							folder={folder}
							folders={folders}
							notes={notes}
							onDeleteFolder={handleDeleteFolder}
							onDeleteNote={handleDeleteNote}
							onSelectNote={(id) => navigate(`/notes/${id}`)}
							onCreateNote={onCreateNote}
						/>
					))}
					{rootNotes.map((note) => (
						<div
							key={note.id}
							className="group flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer text-sm"
							onClick={() => navigate(`/notes/${note.id}`)}
							onKeyDown={(e) => e.key === "Enter" && navigate(`/notes/${note.id}`)}
							role="button"
							tabIndex={0}
						>
							<FileText className="h-4 w-4 text-muted-foreground shrink-0" />
							<span className="flex-1 truncate">{note.title || "Untitled"}</span>
							<button
								type="button"
								onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
								className="hidden group-hover:block p-0.5 rounded hover:bg-secondary"
								title="Delete note"
							>
								<Trash2 className="h-3.5 w-3.5 text-destructive" />
							</button>
						</div>
					))}
					{rootFolders.length === 0 && rootNotes.length === 0 && (
						<div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
							<FileText className="h-8 w-8" />
							<p className="text-sm">No notes yet</p>
							<Button variant="secondary" size="sm" onClick={() => onCreateNote(null)}>
								Create your first note
							</Button>
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
