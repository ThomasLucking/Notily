import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import { FolderTree } from "@/components/notes/FolderTree";
import { NoteEditorPage } from "@/pages/NoteEditorPage";
import { ChatPage } from "@/pages/ChatPage";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCreateNote } from "@/hooks/useNotes";
import { MessageSquare, Sun, Moon, PanelLeftClose, PanelLeft } from "lucide-react";
import { useState } from "react";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: { staleTime: 1000 * 30, retry: 1 },
	},
});

function HomePage() {
	return (
		<div className="flex items-center justify-center h-full text-muted-foreground">
			<div className="text-center">
				<h2 className="text-xl font-semibold text-foreground mb-2">Welcome to Notily</h2>
				<p className="text-sm">Select a note from the sidebar or create a new one.</p>
			</div>
		</div>
	);
}

function AppLayout() {
	const { theme, toggleTheme } = useTheme();
	const navigate = useNavigate();
	const location = useLocation();
	const createNote = useCreateNote();
	const [sidebarOpen, setSidebarOpen] = useState(true);

	const isChat = location.pathname === "/chat";

	const handleCreateNote = async (folderId: number | null) => {
		const note = await createNote.mutateAsync({
			title: "Untitled",
			content: "",
			folderId,
		});
		navigate(`/notes/${note.id}`);
	};

	return (
		<div className="flex h-screen overflow-hidden bg-background">
			{/* Sidebar */}
			{sidebarOpen && (
				<aside className="w-64 shrink-0 border-r border-border bg-sidebar flex flex-col">
					{/* Logo */}
					<div className="flex items-center gap-2 px-4 py-3 border-b border-border">
						<div className="h-7 w-7 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
							N
						</div>
						<span className="font-bold text-sm">Notily</span>
					</div>

					{/* Folder Tree */}
					<div className="flex-1 overflow-hidden">
						<FolderTree onCreateNote={handleCreateNote} />
					</div>

					{/* Sidebar Footer */}
					<div className="border-t border-border p-2 flex items-center gap-1">
						<Button
							variant={isChat ? "secondary" : "ghost"}
							size="sm"
							className="flex-1 justify-start gap-2"
							onClick={() => navigate("/chat")}
						>
							<MessageSquare className="h-4 w-4" />
							AI Chat
						</Button>
						<Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
							{theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
						</Button>
					</div>
				</aside>
			)}

			{/* Main */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Top bar with sidebar toggle */}
				<div className="flex items-center px-2 py-1.5 border-b border-border bg-card">
					<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
						{sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
					</Button>
				</div>

				<main className="flex-1 overflow-hidden">
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/notes/:id" element={<NoteEditorPage />} />
						<Route path="/chat" element={<ChatPage />} />
					</Routes>
				</main>
			</div>
		</div>
	);
}

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<BrowserRouter>
					<AppLayout />
				</BrowserRouter>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
