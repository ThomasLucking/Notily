import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
	content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
	if (!content.trim()) {
		return <p className="text-muted-foreground italic p-4">Nothing to preview</p>;
	}

	return (
		<div className="markdown-body">
			<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
		</div>
	);
}
