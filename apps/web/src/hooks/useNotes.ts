import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notesApi } from "../lib/api";

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
		mutationFn: ({ id, ...data }: { id: number; title?: string; content?: string }) =>
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
