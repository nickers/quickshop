import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types.ts';
import { cfg } from '../config.ts';

const supabaseUrl = cfg.SUPABASE_URL;
const supabaseAnonKey = cfg.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
