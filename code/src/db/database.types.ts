export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: "14.1";
	};
	public: {
		Tables: {
			list_items: {
				Row: {
					created_at: string | null;
					id: string;
					is_bought: boolean | null;
					list_id: string;
					name: string;
					note: string | null;
					quantity: string | null;
					sort_order: number | null;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
					is_bought?: boolean | null;
					list_id: string;
					name: string;
					note?: string | null;
					quantity?: string | null;
					sort_order?: number | null;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string | null;
					id?: string;
					is_bought?: boolean | null;
					list_id?: string;
					name?: string;
					note?: string | null;
					quantity?: string | null;
					sort_order?: number | null;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "list_items_list_id_fkey";
						columns: ["list_id"];
						isOneToOne: false;
						referencedRelation: "lists";
						referencedColumns: ["id"];
					},
				];
			};
			list_members: {
				Row: {
					created_at: string | null;
					list_id: string;
					user_id: string;
				};
				Insert: {
					created_at?: string | null;
					list_id: string;
					user_id: string;
				};
				Update: {
					created_at?: string | null;
					list_id?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "list_members_list_id_fkey";
						columns: ["list_id"];
						isOneToOne: false;
						referencedRelation: "lists";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "list_members_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					},
				];
			};
			lists: {
				Row: {
					created_at: string | null;
					created_by: string;
					id: string;
					name: string;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string | null;
					created_by: string;
					id?: string;
					name: string;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string | null;
					created_by?: string;
					id?: string;
					name?: string;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			profiles: {
				Row: {
					email: string | null;
					full_name: string | null;
					id: string;
					updated_at: string | null;
				};
				Insert: {
					email?: string | null;
					full_name?: string | null;
					id: string;
					updated_at?: string | null;
				};
				Update: {
					email?: string | null;
					full_name?: string | null;
					id?: string;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			set_items: {
				Row: {
					created_at: string | null;
					id: string;
					name: string;
					note: string | null;
					quantity: string | null;
					set_id: string;
					sort_order: number | null;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
					name: string;
					note?: string | null;
					quantity?: string | null;
					set_id: string;
					sort_order?: number | null;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string | null;
					id?: string;
					name?: string;
					note?: string | null;
					quantity?: string | null;
					set_id?: string;
					sort_order?: number | null;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "set_items_set_id_fkey";
						columns: ["set_id"];
						isOneToOne: false;
						referencedRelation: "sets";
						referencedColumns: ["id"];
					},
				];
			};
			set_members: {
				Row: {
					created_at: string | null;
					set_id: string;
					user_id: string;
				};
				Insert: {
					created_at?: string | null;
					set_id: string;
					user_id: string;
				};
				Update: {
					created_at?: string | null;
					set_id?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "set_members_set_id_fkey";
						columns: ["set_id"];
						isOneToOne: false;
						referencedRelation: "sets";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "set_members_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					},
				];
			};
			sets: {
				Row: {
					created_at: string | null;
					created_by: string;
					description: string | null;
					id: string;
					name: string;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string | null;
					created_by: string;
					description?: string | null;
					id?: string;
					name: string;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string | null;
					created_by?: string;
					description?: string | null;
					id?: string;
					name?: string;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			shopping_history: {
				Row: {
					completed_at: string | null;
					id: string;
					items_snapshot: Json;
					list_name: string;
					user_id: string;
				};
				Insert: {
					completed_at?: string | null;
					id?: string;
					items_snapshot: Json;
					list_name: string;
					user_id: string;
				};
				Update: {
					completed_at?: string | null;
					id?: string;
					items_snapshot?: Json;
					list_name?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "shopping_history_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			archive_list_items: { Args: { p_list_id: string }; Returns: undefined };
			invite_member_to_list: {
				Args: { p_list_id: string; p_user_id: string };
				Returns: undefined;
			};
			invite_member_to_set: {
				Args: { p_set_id: string; p_user_id: string };
				Returns: undefined;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
	keyof Database,
	"public"
>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {},
	},
} as const;
