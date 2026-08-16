export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      doctors: {
        Row: {
          avatar_color: string
          bio: string | null
          created_at: string
          hospital: string
          id: string
          license_number: string
          location: string | null
          name: string
          rating: number
          specialization: string
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          years_experience: number
        }
        Insert: {
          avatar_color?: string
          bio?: string | null
          created_at?: string
          hospital: string
          id?: string
          license_number: string
          location?: string | null
          name: string
          rating?: number
          specialization: string
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          years_experience?: number
        }
        Update: {
          avatar_color?: string
          bio?: string | null
          created_at?: string
          hospital?: string
          id?: string
          license_number?: string
          location?: string | null
          name?: string
          rating?: number
          specialization?: string
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          years_experience?: number
        }
        Relationships: []
      }
      emergency_profiles: {
        Row: {
          allergies: string[]
          blood_group: string | null
          created_at: string
          critical_conditions: string[]
          current_medications: string[]
          emergency_contact: string | null
          family_member_id: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string[]
          blood_group?: string | null
          created_at?: string
          critical_conditions?: string[]
          current_medications?: string[]
          emergency_contact?: string | null
          family_member_id: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string[]
          blood_group?: string | null
          created_at?: string
          critical_conditions?: string[]
          current_medications?: string[]
          emergency_contact?: string | null
          family_member_id?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_profiles_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: true
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          age: number | null
          allergies: string[]
          avatar_color: string
          blood_group: string | null
          created_at: string
          emergency_contact: string | null
          id: string
          name: string
          relation: Database["public"]["Enums"]["relation_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          allergies?: string[]
          avatar_color?: string
          blood_group?: string | null
          created_at?: string
          emergency_contact?: string | null
          id?: string
          name: string
          relation?: Database["public"]["Enums"]["relation_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          allergies?: string[]
          avatar_color?: string
          blood_group?: string | null
          created_at?: string
          emergency_contact?: string | null
          id?: string
          name?: string
          relation?: Database["public"]["Enums"]["relation_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          ai_summary: Json | null
          category: Database["public"]["Enums"]["record_category"]
          category_confidence: number
          created_at: string
          doctor_name: string | null
          extracted_text: string | null
          family_member_id: string | null
          file_path: string | null
          file_size_kb: number | null
          file_type: string | null
          hospital_name: string | null
          id: string
          notes: string | null
          record_date: string
          record_type: Database["public"]["Enums"]["record_type"]
          tags: string[]
          thumbnail_color: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_summary?: Json | null
          category?: Database["public"]["Enums"]["record_category"]
          category_confidence?: number
          created_at?: string
          doctor_name?: string | null
          extracted_text?: string | null
          family_member_id?: string | null
          file_path?: string | null
          file_size_kb?: number | null
          file_type?: string | null
          hospital_name?: string | null
          id?: string
          notes?: string | null
          record_date?: string
          record_type?: Database["public"]["Enums"]["record_type"]
          tags?: string[]
          thumbnail_color?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_summary?: Json | null
          category?: Database["public"]["Enums"]["record_category"]
          category_confidence?: number
          created_at?: string
          doctor_name?: string | null
          extracted_text?: string | null
          family_member_id?: string | null
          file_path?: string | null
          file_size_kb?: number | null
          file_type?: string | null
          hospital_name?: string | null
          id?: string
          notes?: string | null
          record_date?: string
          record_type?: Database["public"]["Enums"]["record_type"]
          tags?: string[]
          thumbnail_color?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          days_completed: number
          dosage: string
          duration_days: number
          id: string
          instructions: string | null
          name: string
          prescription_id: string
          reminder_enabled: boolean
          timing: string[]
          updated_at: string
          user_id: string
          with_food: boolean
        }
        Insert: {
          created_at?: string
          days_completed?: number
          dosage?: string
          duration_days?: number
          id?: string
          instructions?: string | null
          name: string
          prescription_id: string
          reminder_enabled?: boolean
          timing?: string[]
          updated_at?: string
          user_id: string
          with_food?: boolean
        }
        Update: {
          created_at?: string
          days_completed?: number
          dosage?: string
          duration_days?: number
          id?: string
          instructions?: string | null
          name?: string
          prescription_id?: string
          reminder_enabled?: boolean
          timing?: string[]
          updated_at?: string
          user_id?: string
          with_food?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "medications_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          created_at: string
          diagnosis: string
          doctor_id: string | null
          doctor_name: string
          duration_days: number
          end_date: string | null
          family_member_id: string | null
          id: string
          is_active: boolean
          notes: string | null
          prescribed_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          diagnosis: string
          doctor_id?: string | null
          doctor_name: string
          duration_days?: number
          end_date?: string | null
          family_member_id?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          prescribed_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          diagnosis?: string
          doctor_id?: string | null
          doctor_name?: string
          duration_days?: number
          end_date?: string | null
          family_member_id?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          prescribed_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      notification_type: "reminder" | "prescription" | "checkup" | "security"
      record_category:
        | "cardiology"
        | "radiology"
        | "pathology"
        | "endocrinology"
        | "pulmonology"
        | "orthopedics"
        | "dermatology"
        | "pediatrics"
        | "general"
        | "uncategorized"
      record_type:
        | "prescription"
        | "lab-report"
        | "scan"
        | "discharge"
        | "diagnosis"
        | "note"
        | "other"
      relation_type:
        | "self"
        | "spouse"
        | "parent"
        | "child"
        | "sibling"
        | "other"
      verification_status: "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      notification_type: ["reminder", "prescription", "checkup", "security"],
      record_category: [
        "cardiology",
        "radiology",
        "pathology",
        "endocrinology",
        "pulmonology",
        "orthopedics",
        "dermatology",
        "pediatrics",
        "general",
        "uncategorized",
      ],
      record_type: [
        "prescription",
        "lab-report",
        "scan",
        "discharge",
        "diagnosis",
        "note",
        "other",
      ],
      relation_type: ["self", "spouse", "parent", "child", "sibling", "other"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
