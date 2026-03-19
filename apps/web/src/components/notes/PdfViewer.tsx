import { useState, useCallback } from "react";
import { FileUp, X, FileText } from "lucide-react";

interface PdfViewerProps {
	onExtractText?: (text: string) => void;
}

export function PdfViewer({ onExtractText }: PdfViewerProps) {
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string>("");
	const [isDragging, setIsDragging] = useState(false);

	const handleFile = useCallback(
		(file: File) => {
			if (file.type !== "application/pdf") {
				alert("Please select a PDF file");
				return;
			}
			setFileName(file.name);
			const url = URL.createObjectURL(file);
			setPdfUrl(url);

			// Extract text from PDF using FileReader
			if (onExtractText) {
				const reader = new FileReader();
				reader.onload = () => {
					// Basic text extraction hint — for full extraction, a library like pdf.js would be used
					onExtractText(
						`[PDF: ${file.name}]\n\nThis PDF has been attached. You can reference it in your notes.`,
					);
				};
				reader.readAsArrayBuffer(file);
			}
		},
		[onExtractText],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			const file = e.dataTransfer.files[0];
			if (file) handleFile(file);
		},
		[handleFile],
	);

	const handleClose = () => {
		if (pdfUrl) URL.revokeObjectURL(pdfUrl);
		setPdfUrl(null);
		setFileName("");
	};

	if (pdfUrl) {
		return (
			<div className="pdf-viewer">
				<div className="pdf-header">
					<FileText size={16} />
					<span>{fileName}</span>
					<button type="button" className="btn-icon" onClick={handleClose}>
						<X size={16} />
					</button>
				</div>
				<iframe src={pdfUrl} className="pdf-frame" title={fileName} />
			</div>
		);
	}

	return (
		<div
			className={`pdf-dropzone ${isDragging ? "dragging" : ""}`}
			onDragOver={(e) => {
				e.preventDefault();
				setIsDragging(true);
			}}
			onDragLeave={() => setIsDragging(false)}
			onDrop={handleDrop}
		>
			<FileUp size={32} />
			<p>Drop a PDF here or click to upload</p>
			<input
				type="file"
				accept=".pdf"
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) handleFile(file);
				}}
				className="pdf-input"
			/>
		</div>
	);
}
