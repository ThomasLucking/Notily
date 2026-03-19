import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notesApi, foldersApi } from "@/lib/api";

export function useNotes() {
	return useQuery({
		queryKey: ["notes"],
		queryFn: notesApi.getAll,
	});
}

export function useNote(id: number | null) {
	return useQuery({
		queryKey: ["notes", id],
		queryFn: () => notesApi.getById(id!),
		enabled: id !== null,
	});
}

export function useCreateNote() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: notesApi.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notes"] });
		},
	});
}

export function useUpdateNote() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...data }: { id: number; title?: string; content?: string; folderId?: number | null }) =>
			notesApi.update(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["notes"] });
			queryClient.invalidateQueries({ queryKey: ["notes", variables.id] });
		},
	});
}

export function useDeleteNote() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: notesApi.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notes"] });
		},
	});
}

// Folders
export function useFolders() {
	return useQuery({
		queryKey: ["folders"],
		queryFn: foldersApi.getAll,
	});
}

export function useCreateFolder() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: foldersApi.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["folders"] });
		},
	});
}

export function useDeleteFolder() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: foldersApi.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["folders"] });
			queryClient.invalidateQueries({ queryKey: ["notes"] });
		},
	});
}
