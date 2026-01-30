import { createClient } from "@supabase/supabase-js";
import { cfg } from "../config.ts";
import type { Database } from "./database.types.ts";

const supabaseUrl = cfg.SUPABASE_URL;
const supabaseAnonKey = cfg.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(
	supabaseUrl,
	supabaseAnonKey,
);
