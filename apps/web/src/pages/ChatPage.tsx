import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { MarkdownPreview } from "@/components/notes/MarkdownPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trash2, Loader2, Bot, User } from "lucide-react";

export function ChatPage() {
	const { messages, isLoading, sendMessage, clearMessages } = useChat();
	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;
		sendMessage(input);
		setInput("");
	};

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
				<div className="flex items-center gap-2">
					<Bot className="h-5 w-5 text-muted-foreground" />
					<h2 className="font-semibold">AI Chat</h2>
				</div>
				{messages.length > 0 && (
					<Button variant="ghost" size="sm" onClick={clearMessages}>
						<Trash2 className="h-4 w-4" /> Clear
					</Button>
				)}
			</div>

			{/* Messages */}
			<ScrollArea className="flex-1">
				<div className="max-w-3xl mx-auto px-6 py-6">
					{messages.length === 0 && (
						<div className="flex flex-col items-center text-center gap-4 py-16">
							<div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
								<Bot className="h-8 w-8 text-muted-foreground" />
							</div>
							<div>
								<h3 className="text-lg font-semibold mb-1">Chat with your notes</h3>
								<p className="text-muted-foreground text-sm max-w-md">
									Ask questions, get insights, and explore connections across all your notes.
								</p>
							</div>
							<div className="flex flex-col gap-2 w-full max-w-sm mt-4">
								{[
									"Summarize all my notes",
									"What themes do my notes have in common?",
									"What topics should I explore further?",
								].map((suggestion) => (
									<Button
										key={suggestion}
										variant="outline"
										className="justify-start text-left h-auto py-3 px-4"
										onClick={() => sendMessage(suggestion)}
									>
										{suggestion}
									</Button>
								))}
							</div>
						</div>
					)}

					{messages.map((msg, i) => (
						<div key={`msg-${i}-${msg.role}`} className="flex gap-3 mb-6">
							<div
								className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
									msg.role === "user"
										? "bg-primary text-primary-foreground"
										: "bg-secondary text-muted-foreground"
								}`}
							>
								{msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
							</div>
							<div className="flex-1 min-w-0 pt-1">
								{msg.role === "assistant" ? (
									<MarkdownPreview content={msg.content || "..."} />
								) : (
									<p className="text-sm">{msg.content}</p>
								)}
							</div>
						</div>
					))}

					{isLoading && messages[messages.length - 1]?.content === "" && (
						<div className="flex items-center gap-2 text-muted-foreground text-sm ml-11">
							<Loader2 className="h-4 w-4 animate-spin" />
							Thinking...
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>
			</ScrollArea>

			{/* Input */}
			<div className="border-t border-border bg-card px-6 py-4">
				<form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Ask about your notes..."
						disabled={isLoading}
						className="flex-1"
					/>
					<Button type="submit" disabled={isLoading || !input.trim()}>
						<Send className="h-4 w-4" />
					</Button>
				</form>
			</div>
		</div>
	);
}
