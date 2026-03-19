import { useState, useRef, useEffect } from "react";
import { useChat } from "../../hooks/useChat";
import { MarkdownPreview } from "../notes/MarkdownPreview";
import { Send, Trash2, Loader2, Bot, User } from "lucide-react";

interface ChatPanelProps {
	selectedNoteIds?: number[];
}

export function ChatPanel({ selectedNoteIds }: ChatPanelProps) {
	const { messages, isLoading, sendMessage, clearMessages } = useChat();
	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;
		sendMessage(input, selectedNoteIds);
		setInput("");
	};

	return (
		<div className="chat-panel">
			<div className="chat-header">
				<h2>
					<Bot size={20} />
					AI Chat
				</h2>
				{messages.length > 0 && (
					<button type="button" className="btn-icon" onClick={clearMessages} title="Clear chat">
						<Trash2 size={16} />
					</button>
				)}
			</div>

			<div className="chat-messages">
				{messages.length === 0 && (
					<div className="chat-empty">
						<Bot size={40} />
						<h3>Chat with your notes</h3>
						<p>Ask questions, get insights, and explore connections in your notes.</p>
						<div className="chat-suggestions">
							<button type="button" onClick={() => sendMessage("Summarize all my notes", selectedNoteIds)}>
								Summarize my notes
							</button>
							<button type="button" onClick={() => sendMessage("What themes do my notes have in common?", selectedNoteIds)}>
								Find common themes
							</button>
							<button type="button" onClick={() => sendMessage("What topics should I explore further?", selectedNoteIds)}>
								Suggest new topics
							</button>
						</div>
					</div>
				)}

				{messages.map((msg, i) => (
					<div key={`msg-${i}-${msg.role}`} className={`chat-message ${msg.role}`}>
						<div className="message-avatar">
							{msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
						</div>
						<div className="message-content">
							{msg.role === "assistant" ? (
								<MarkdownPreview content={msg.content || "..."} />
							) : (
								<p>{msg.content}</p>
							)}
						</div>
					</div>
				))}

				{isLoading && messages[messages.length - 1]?.content === "" && (
					<div className="chat-loading">
						<Loader2 size={20} className="spin" />
						<span>Thinking...</span>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			<form className="chat-input" onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Ask about your notes..."
					value={input}
					onChange={(e) => setInput(e.target.value)}
					disabled={isLoading}
				/>
				<button type="submit" className="btn-primary" disabled={isLoading || !input.trim()}>
					<Send size={16} />
				</button>
			</form>
		</div>
	);
}
