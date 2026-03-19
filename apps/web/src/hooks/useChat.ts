import { useState, useCallback } from "react";
import { chatApi } from "../lib/api";

interface ChatMessage {
	role: "user" | "assistant";
	content: string;
}

export function useChat() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const sendMessage = useCallback(
		async (message: string, noteIds?: number[]) => {
			setMessages((prev) => [...prev, { role: "user", content: message }]);
			setIsLoading(true);

			try {
				let assistantMessage = "";
				setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

				for await (const chunk of chatApi.stream(message, noteIds)) {
					assistantMessage += chunk;
					setMessages((prev) => {
						const updated = [...prev];
						updated[updated.length - 1] = {
							role: "assistant",
							content: assistantMessage,
						};
						return updated;
					});
				}
			} catch {
				// Fallback to non-streaming
				try {
					const { reply } = await chatApi.send(message, noteIds);
					setMessages((prev) => {
						const updated = [...prev];
						updated[updated.length - 1] = { role: "assistant", content: reply };
						return updated;
					});
				} catch {
					setMessages((prev) => {
						const updated = [...prev];
						updated[updated.length - 1] = {
							role: "assistant",
							content: "Sorry, I could not process your request. Please check that the API key is configured.",
						};
						return updated;
					});
				}
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	const clearMessages = useCallback(() => setMessages([]), []);

	return { messages, isLoading, sendMessage, clearMessages };
}
