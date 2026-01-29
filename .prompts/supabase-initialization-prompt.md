# Supabase Initialization in react

This document provides a reproducible guide to create the necessary file structure for integrating Supabase with your Astro project.

## Prerequisites

- Your project should use TypeScript 5, React 19, and Tailwind 4.
- Install the `@supabase/supabase-js` package (if not installed already).
- Ensure that a file `code/src/db/database.types.ts` exists and contains the correct type definitions for your database.

IMPORTANT: Check prerequisites before perfoming actions below. If they're not met, stop and ask a user for the fix.

## File Structure and Setup

### 1. Supabase Client Initialization and injection into react context

Create the file `code/src/db/supabase.client.ts` with the following content:

```ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types.ts';
import { cfg } from '../config.ts';

const supabaseUrl = cfg.SUPABASE_URL;
const supabaseAnonKey = cfg.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

This file initializes the Supabase client using the configuration variables `SUPABASE_URL` and `SUPABASE_KEY`.
Create correct "config.ts" file (empty values, i will provide them later).


### 2. Context Setup

Don't inject this client directly into Reat yet. Later we will create business logic class that will be used in react components.