import type { RealtimeChannel } from "@supabase/supabase-js";
import type { QueryKey } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { Database } from "@/db/database.types";
import { supabaseClient } from "@/db/supabase.client";

type TableName = keyof Database["public"]["Tables"];

interface SubscriptionConfig {
	/** The Postgres table to subscribe to */
	table: TableName;
	/** Optional: Postgres change filter, e.g. "list_id=eq.some-uuid" */
	filter?: string;
	/** Which events to listen to. Defaults to all (*). */
	event?: "INSERT" | "UPDATE" | "DELETE" | "*";
}

interface UseRealtimeSubscriptionOptions {
	/**
	 * Unique channel name for this subscription.
	 * Should be stable across renders (e.g. include a list ID).
	 */
	channelName: string;
	/**
	 * One or more table subscriptions to set up on this channel.
	 */
	subscriptions: SubscriptionConfig[];
	/**
	 * TanStack Query keys to invalidate when a change is received.
	 * All keys are invalidated on every change event.
	 */
	queryKeys: QueryKey[];
	/**
	 * Whether the subscription should be active. Defaults to true.
	 * Useful for conditionally enabling (e.g. only when user is authenticated).
	 */
	enabled?: boolean;
	/**
	 * Debounce interval in ms to coalesce rapid-fire changes.
	 * Defaults to 300ms.
	 */
	debounceMs?: number;
}

/**
 * Hook that subscribes to Supabase Realtime Postgres Changes and
 * invalidates TanStack Query cache keys when changes are detected.
 *
 * This allows live updates across devices without polling:
 * when user A modifies a list, user B's UI is automatically refreshed.
 */
export function useRealtimeSubscription({
	channelName,
	subscriptions,
	queryKeys,
	enabled = true,
	debounceMs = 300,
}: UseRealtimeSubscriptionOptions) {
	const queryClient = useQueryClient();
	const channelRef = useRef<RealtimeChannel | null>(null);
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Store queryKeys and debounceMs in refs so that they don't trigger
	// re-subscription when the caller creates new array references.
	const queryKeysRef = useRef(queryKeys);
	queryKeysRef.current = queryKeys;

	const debounceRef = useRef(debounceMs);
	debounceRef.current = debounceMs;

	useEffect(() => {
		if (!enabled || subscriptions.length === 0) {
			return;
		}

		// Clean up any existing channel before creating a new one
		if (channelRef.current) {
			supabaseClient.removeChannel(channelRef.current);
			channelRef.current = null;
		}

		const invalidateAll = () => {
			// Debounce invalidations to avoid rapid-fire refetches
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
			debounceTimerRef.current = setTimeout(() => {
				console.log(
					"[Realtime] Invalidating queries",
					"| Channel:",
					channelName,
					"| Timestamp:",
					new Date().toISOString(),
				);
				for (const key of queryKeysRef.current) {
					queryClient.invalidateQueries({ queryKey: key });
				}
			}, debounceRef.current);
		};

		// Build the channel with all subscription configs
		let channel = supabaseClient.channel(channelName);

		for (const sub of subscriptions) {
			const pgChangeConfig: {
				event: "INSERT" | "UPDATE" | "DELETE" | "*";
				schema: "public";
				table: string;
				filter?: string;
			} = {
				event: sub.event ?? "*",
				schema: "public" as const,
				table: sub.table,
			};

			if (sub.filter) {
				pgChangeConfig.filter = sub.filter;
			}

			channel = channel.on("postgres_changes", pgChangeConfig, (payload) => {
				console.log(
					"[Realtime] Change received",
					"| Channel:",
					channelName,
					"| Table:",
					sub.table,
					"| Event:",
					payload.eventType,
					"| Timestamp:",
					new Date().toISOString(),
				);
				invalidateAll();
			});
		}

		channel.subscribe((status) => {
			console.log(
				"[Realtime] Subscription status",
				"| Channel:",
				channelName,
				"| Status:",
				status,
				"| Timestamp:",
				new Date().toISOString(),
			);
		});

		channelRef.current = channel;

		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
			if (channelRef.current) {
				console.log(
					"[Realtime] Unsubscribing",
					"| Channel:",
					channelName,
					"| Timestamp:",
					new Date().toISOString(),
				);
				supabaseClient.removeChannel(channelRef.current);
				channelRef.current = null;
			}
		};
	}, [channelName, enabled, subscriptions, queryClient]);
}
