/**
 * Playwright globalTeardown: clean E2E test data from the database after all tests.
 * Logs in as E2E_USER1 and calls RPC e2e_cleanup_test_lists() to delete lists
 * named "E2E Test %" and "E2E RWD %". Requires migration 20260201120000_e2e_cleanup_function.sql.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const email = process.env.E2E_USER1_EMAIL;
const password = process.env.E2E_USER1_PASSWORD;

async function globalTeardown() {
	if (!supabaseUrl || !supabaseAnonKey) {
		console.warn("[e2e teardown] VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY not set; skipping DB cleanup.");
		return;
	}
	if (!email || !password) {
		console.warn("[e2e teardown] E2E_USER1_EMAIL or E2E_USER1_PASSWORD not set; skipping DB cleanup.");
		return;
	}

	const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

	const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
	if (signInError) {
		console.warn("[e2e teardown] Sign-in failed:", signInError.message, "; skipping DB cleanup.");
		return;
	}

	const { data: deletedCount, error: rpcError } = await supabase.rpc("e2e_cleanup_test_lists");
	if (rpcError) {
		console.warn("[e2e teardown] e2e_cleanup_test_lists RPC failed:", rpcError.message);
		return;
	}

	if (typeof deletedCount === "number" && deletedCount > 0) {
		console.log(`[e2e teardown] Cleaned ${deletedCount} E2E test list(s) from database.`);
	}
}

export default globalTeardown;
