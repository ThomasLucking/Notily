import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { chatApi } from "../../lib/api";
import { MarkdownPreview } from "./MarkdownPreview";
import { X, Lightbulb, Wand2, FileText, Loader2 } from "lucide-react";

interface NoteAnalysisProps {
	noteId: number;
	onClose: () => void;
}

type AnalysisType = "suggestions" | "improvements" | "summary";

export function NoteAnalysis({ noteId, onClose }: NoteAnalysisProps) {
	const [activeType, setActiveType] = useState<AnalysisType>("suggestions");

	const analysis = useMutation({
		mutationFn: (type: AnalysisType) => chatApi.analyze(noteId, type),
	});

	const handleAnalyze = (type: AnalysisType) => {
		setActiveType(type);
		analysis.mutate(type);
	};

	return (
		<div className="note-analysis">
			<div className="analysis-header">
				<h3>AI Analysis</h3>
				<button type="button" className="btn-icon" onClick={onClose}>
					<X size={18} />
				</button>
			</div>
			<div className="analysis-types">
				<button
					type="button"
					className={activeType === "suggestions" ? "active" : ""}
					onClick={() => handleAnalyze("suggestions")}
				>
					<Lightbulb size={16} />
					Suggestions
				</button>
				<button
					type="button"
					className={activeType === "improvements" ? "active" : ""}
					onClick={() => handleAnalyze("improvements")}
				>
					<Wand2 size={16} />
					Improvements
				</button>
				<button
					type="button"
					className={activeType === "summary" ? "active" : ""}
					onClick={() => handleAnalyze("summary")}
				>
					<FileText size={16} />
					Summary
				</button>
			</div>
			<div className="analysis-content">
				{analysis.isPending && (
					<div className="analysis-loading">
						<Loader2 size={24} className="spin" />
						<p>Analyzing your note...</p>
					</div>
				)}
				{analysis.isError && (
					<div className="analysis-error">
						<p>Failed to analyze. Check your API key configuration.</p>
					</div>
				)}
				{analysis.data && !analysis.isPending && (
					<MarkdownPreview content={analysis.data.analysis} />
				)}
				{!analysis.data && !analysis.isPending && !analysis.isError && (
					<p className="analysis-hint">
						Click a button above to analyze this note with AI.
					</p>
				)}
			</div>
		</div>
	);
}
