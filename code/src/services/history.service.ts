import { supabaseClient } from "../db/supabase.client";
import type { HistoryEntry } from "../types/domain.types";

export interface IHistoryService {
	/**
	 * Fetches completed shopping trips.
	 */
	getHistory(): Promise<HistoryEntry[]>;
}

export class HistoryService implements IHistoryService {
	async getHistory(): Promise<HistoryEntry[]> {
		// Ensure session is restored before query (RLS uses auth.uid())
		await supabaseClient.auth.getSession();

		const { data, error } = await supabaseClient
			.from("shopping_history")
			.select("*")
			.order("completed_at", { ascending: false });

		if (error) throw error;
		return data ?? [];
	}
}

export const historyService = new HistoryService();
