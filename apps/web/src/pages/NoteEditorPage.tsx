import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNote, useUpdateNote } from "@/hooks/useNotes";
import { MarkdownPreview } from "@/components/notes/MarkdownPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Eye, Edit, Columns2, Sparkles, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { chatApi } from "@/lib/api";

export function NoteEditorPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const noteId = id ? Number.parseInt(id) : null;
	const { data: note, isLoading } = useNote(noteId);
	const updateNote = useUpdateNote();

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [mode, setMode] = useState<"edit" | "preview" | "split">("split");
	const [hasChanges, setHasChanges] = useState(false);
	const [showAnalysis, setShowAnalysis] = useState(false);

	useEffect(() => {
		if (note) {
			setTitle(note.title);
			setContent(note.content);
			setHasChanges(false);
		}
	}, [note]);

	const handleSave = useCallback(async () => {
		if (!noteId || !title.trim()) return;
		await updateNote.mutateAsync({ id: noteId, title, content });
		setHasChanges(false);
	}, [noteId, title, content, updateNote]);

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

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!note) {
		return (
			<div className="flex flex-col items-center justify-center h-full gap-4">
				<p className="text-muted-foreground">Note not found</p>
				<Button variant="outline" onClick={() => navigate("/")}>
					<ArrowLeft className="h-4 w-4" /> Back
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full">
			{/* Toolbar */}
			<div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card">
				<Button variant="ghost" size="icon" onClick={() => navigate("/")}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<Input
					value={title}
					onChange={(e) => { setTitle(e.target.value); setHasChanges(true); }}
					placeholder="Note title..."
					className="flex-1 border-none shadow-none text-lg font-semibold focus-visible:ring-0 h-auto py-1"
				/>
				<Separator orientation="vertical" className="h-6" />
				<div className="flex items-center bg-secondary rounded-md">
					<Button
						variant={mode === "edit" ? "default" : "ghost"}
						size="sm"
						className="h-7 px-2"
						onClick={() => setMode("edit")}
					>
						<Edit className="h-3.5 w-3.5" />
					</Button>
					<Button
						variant={mode === "split" ? "default" : "ghost"}
						size="sm"
						className="h-7 px-2"
						onClick={() => setMode("split")}
					>
						<Columns2 className="h-3.5 w-3.5" />
					</Button>
					<Button
						variant={mode === "preview" ? "default" : "ghost"}
						size="sm"
						className="h-7 px-2"
						onClick={() => setMode("preview")}
					>
						<Eye className="h-3.5 w-3.5" />
					</Button>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setShowAnalysis(!showAnalysis)}
					className={showAnalysis ? "text-primary" : ""}
					title="AI Analysis"
				>
					<Sparkles className="h-4 w-4" />
				</Button>
				<Button
					size="sm"
					onClick={handleSave}
					disabled={updateNote.isPending || !hasChanges}
				>
					<Save className="h-3.5 w-3.5" />
					{updateNote.isPending ? "Saving..." : hasChanges ? "Save" : "Saved"}
				</Button>
			</div>

			{/* Editor */}
			<div className="flex flex-1 overflow-hidden">
				<div className={`flex flex-1 overflow-hidden ${showAnalysis ? "w-2/3" : "w-full"}`}>
					{(mode === "edit" || mode === "split") && (
						<textarea
							value={content}
							onChange={(e) => { setContent(e.target.value); setHasChanges(true); }}
							placeholder="Write your note in markdown..."
							className={`resize-none bg-background p-6 font-mono text-sm leading-relaxed outline-none overflow-y-auto ${
								mode === "split" ? "w-1/2 border-r border-border" : "w-full"
							}`}
						/>
					)}
					{(mode === "preview" || mode === "split") && (
						<div className={`overflow-y-auto p-6 ${mode === "split" ? "w-1/2" : "w-full"}`}>
							<MarkdownPreview content={content} />
						</div>
					)}
				</div>

				{showAnalysis && (
					<AnalysisPanel noteId={noteId!} onClose={() => setShowAnalysis(false)} />
				)}
			</div>
		</div>
	);
}

function AnalysisPanel({ noteId, onClose }: { noteId: number; onClose: () => void }) {
	const [activeType, setActiveType] = useState<"suggestions" | "improvements" | "summary">("suggestions");

	const analysis = useMutation({
		mutationFn: (type: "suggestions" | "improvements" | "summary") => chatApi.analyze(noteId, type),
	});

	const handleAnalyze = (type: "suggestions" | "improvements" | "summary") => {
		setActiveType(type);
		analysis.mutate(type);
	};

	return (
		<div className="w-1/3 border-l border-border bg-card flex flex-col">
			<div className="flex items-center justify-between px-4 py-3 border-b border-border">
				<h3 className="text-sm font-semibold">AI Analysis</h3>
				<Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
					<ArrowLeft className="h-3.5 w-3.5" />
				</Button>
			</div>
			<div className="flex gap-1 p-2 border-b border-border">
				{(["suggestions", "improvements", "summary"] as const).map((type) => (
					<Button
						key={type}
						variant={activeType === type ? "default" : "outline"}
						size="sm"
						className="text-xs capitalize"
						onClick={() => handleAnalyze(type)}
					>
						{type}
					</Button>
				))}
			</div>
			<div className="flex-1 overflow-y-auto p-4">
				{analysis.isPending && (
					<div className="flex items-center gap-2 text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						Analyzing...
					</div>
				)}
				{analysis.isError && (
					<p className="text-destructive text-sm">Failed to analyze. Check your API key.</p>
				)}
				{analysis.data && !analysis.isPending && (
					<MarkdownPreview content={analysis.data.analysis} />
				)}
				{!analysis.data && !analysis.isPending && !analysis.isError && (
					<p className="text-muted-foreground text-sm italic">
						Click a button above to analyze this note with AI.
					</p>
				)}
			</div>
		</div>
	);
}
