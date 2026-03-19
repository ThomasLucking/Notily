import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotesList } from "./components/notes/NotesList";
import { NoteEditor } from "./components/notes/NoteEditor";
import { ChatPanel } from "./components/chat/ChatPanel";
import { PdfViewer } from "./components/notes/PdfViewer";
import { MessageSquare, FileText, PanelLeftClose, PanelLeft } from "lucide-react";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: { staleTime: 1000 * 30, retry: 1 },
	},
});

function AppLayout() {
	const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
	const [showChat, setShowChat] = useState(false);
	const [showPdf, setShowPdf] = useState(false);
	const [showSidebar, setShowSidebar] = useState(true);

	const handleNewNote = () => setSelectedNoteId(null);
	const handleSelectNote = (id: number) => setSelectedNoteId(id);
	const handleNoteSaved = (id: number) => setSelectedNoteId(id);

	return (
		<div className="app">
			<header className="app-header">
				<div className="header-left">
					<button
						type="button"
						className="btn-icon"
						onClick={() => setShowSidebar(!showSidebar)}
					>
						{showSidebar ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
					</button>
					<h1>
						<span className="logo">N</span>
						Notily
					</h1>
				</div>
				<div className="header-right">
					<button
						type="button"
						className={`btn-icon ${showPdf ? "active" : ""}`}
						onClick={() => setShowPdf(!showPdf)}
						title="PDF Viewer"
					>
						<FileText size={20} />
					</button>
					<button
						type="button"
						className={`btn-icon ${showChat ? "active" : ""}`}
						onClick={() => setShowChat(!showChat)}
						title="AI Chat"
					>
						<MessageSquare size={20} />
					</button>
				</div>
			</header>

			<div className="app-body">
				{showSidebar && (
					<aside className="sidebar">
						<NotesList
							selectedId={selectedNoteId}
							onSelect={handleSelectNote}
							onNew={handleNewNote}
						/>
					</aside>
				)}

				<main className="main-content">
					<NoteEditor noteId={selectedNoteId} onSaved={handleNoteSaved} />
					{showPdf && (
						<div className="pdf-panel">
							<PdfViewer />
						</div>
					)}
				</main>

				{showChat && (
					<aside className="chat-sidebar">
						<ChatPanel
							selectedNoteIds={selectedNoteId ? [selectedNoteId] : undefined}
						/>
					</aside>
				)}
			</div>
		</div>
	);
}

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AppLayout />
		</QueryClientProvider>
	);
}
