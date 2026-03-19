import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
	content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
	if (!content.trim()) {
		return <div className="markdown-empty">Nothing to preview</div>;
	}

	return (
		<div className="markdown-body">
			<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
		</div>
	);
}
