export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_approvals: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          comments: string | null
          contract_id: string | null
          created_at: string | null
          id: string
          status: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          contract_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          contract_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_approvals_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_folders: {
        Row: {
          contract_id: string
          folder_id: string
        }
        Insert: {
          contract_id: string
          folder_id: string
        }
        Update: {
          contract_id?: string
          folder_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_folders_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_folders_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          category: Database["public"]["Enums"]["template_category"] | null
          content: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          fields: Json | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["template_category"] | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fields?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["template_category"] | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fields?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_versions: {
        Row: {
          changes_summary: string | null
          content: string | null
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          version_number: number
        }
        Insert: {
          changes_summary?: string | null
          content?: string | null
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          version_number: number
        }
        Update: {
          changes_summary?: string | null
          content?: string | null
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_versions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          assigned_to: string | null
          auto_renewal: boolean | null
          contract_number: string | null
          counterparty: string | null
          counterparty_email: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          end_date: string | null
          extracted_content: string | null
          file_url: string | null
          id: string
          metadata: Json | null
          original_file_name: string | null
          original_file_size: number | null
          processing_status: string | null
          renewal_period_months: number | null
          signed_file_url: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["contract_status"] | null
          tags: string[] | null
          template_id: string | null
          title: string
          updated_at: string | null
          value: number | null
        }
        Insert: {
          assigned_to?: string | null
          auto_renewal?: boolean | null
          contract_number?: string | null
          counterparty?: string | null
          counterparty_email?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          extracted_content?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          original_file_name?: string | null
          original_file_size?: number | null
          processing_status?: string | null
          renewal_period_months?: number | null
          signed_file_url?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          tags?: string[] | null
          template_id?: string | null
          title: string
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          assigned_to?: string | null
          auto_renewal?: boolean | null
          contract_number?: string | null
          counterparty?: string | null
          counterparty_email?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          extracted_content?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          original_file_name?: string | null
          original_file_size?: number | null
          processing_status?: string | null
          renewal_period_months?: number | null
          signed_file_url?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          tags?: string[] | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_uploads: {
        Row: {
          contract_id: string | null
          created_at: string | null
          document_bucketid: string | null
          extracted_content: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          processing_status: string | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          contract_id?: string | null
          created_at?: string | null
          document_bucketid?: string | null
          extracted_content?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          processing_status?: string | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          contract_id?: string | null
          created_at?: string | null
          document_bucketid?: string | null
          extracted_content?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          processing_status?: string | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_uploads_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_uploads_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          related_contract_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          related_contract_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          related_contract_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_contract_id_fkey"
            columns: ["related_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          contract_id: string | null
          error_message: string | null
          executed_at: string | null
          id: string
          result: Json | null
          status: string | null
          workflow_id: string | null
        }
        Insert: {
          contract_id?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          result?: Json | null
          status?: string | null
          workflow_id?: string | null
        }
        Update: {
          contract_id?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          result?: Json | null
          status?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          actions: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          execution_count: number | null
          id: string
          last_executed: string | null
          name: string
          status: Database["public"]["Enums"]["workflow_status"] | null
          trigger_conditions: Json | null
          updated_at: string | null
        }
        Insert: {
          actions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          last_executed?: string | null
          name: string
          status?: Database["public"]["Enums"]["workflow_status"] | null
          trigger_conditions?: Json | null
          updated_at?: string | null
        }
        Update: {
          actions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          last_executed?: string | null
          name?: string
          status?: Database["public"]["Enums"]["workflow_status"] | null
          trigger_conditions?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      audit_action:
        | "created"
        | "updated"
        | "deleted"
        | "approved"
        | "signed"
        | "exported"
      contract_status:
        | "draft"
        | "review"
        | "approved"
        | "signed"
        | "executed"
        | "expired"
        | "terminated"
      notification_type:
        | "contract_expiry"
        | "approval_required"
        | "workflow_update"
        | "system"
      template_category:
        | "nda"
        | "employment"
        | "service"
        | "purchase"
        | "partnership"
        | "other"
      user_role: "admin" | "legal" | "viewer"
      workflow_status: "active" | "paused" | "completed" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      audit_action: [
        "created",
        "updated",
        "deleted",
        "approved",
        "signed",
        "exported",
      ],
      contract_status: [
        "draft",
        "review",
        "approved",
        "signed",
        "executed",
        "expired",
        "terminated",
      ],
      notification_type: [
        "contract_expiry",
        "approval_required",
        "workflow_update",
        "system",
      ],
      template_category: [
        "nda",
        "employment",
        "service",
        "purchase",
        "partnership",
        "other",
      ],
      user_role: ["admin", "legal", "viewer"],
      workflow_status: ["active", "paused", "completed", "failed"],
    },
  },
} as const
