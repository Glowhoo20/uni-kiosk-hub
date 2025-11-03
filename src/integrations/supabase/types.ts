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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          class_level: number
          course_code: string
          course_name: string
          created_at: string
          day_of_week: string
          end_time: string
          id: string
          instructor: string
          room: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          class_level: number
          course_code: string
          course_name: string
          created_at?: string
          day_of_week: string
          end_time: string
          id?: string
          instructor: string
          room?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          class_level?: number
          course_code?: string
          course_name?: string
          created_at?: string
          day_of_week?: string
          end_time?: string
          id?: string
          instructor?: string
          room?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      faculty_members: {
        Row: {
          category: string | null
          contact_info: string | null
          created_at: string
          department: string
          display_order: number | null
          education: string | null
          education_display_order: number | null
          email: string | null
          email_display_order: number | null
          id: string
          image_url: string | null
          linkedin: string | null
          linkedin_display_order: number | null
          name: string
          office: string | null
          office_display_order: number | null
          phone: string | null
          phone_display_order: number | null
          specialization: string | null
          specialization_display_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          contact_info?: string | null
          created_at?: string
          department: string
          display_order?: number | null
          education?: string | null
          education_display_order?: number | null
          email?: string | null
          email_display_order?: number | null
          id?: string
          image_url?: string | null
          linkedin?: string | null
          linkedin_display_order?: number | null
          name: string
          office?: string | null
          office_display_order?: number | null
          phone?: string | null
          phone_display_order?: number | null
          specialization?: string | null
          specialization_display_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          contact_info?: string | null
          created_at?: string
          department?: string
          display_order?: number | null
          education?: string | null
          education_display_order?: number | null
          email?: string | null
          email_display_order?: number | null
          id?: string
          image_url?: string | null
          linkedin?: string | null
          linkedin_display_order?: number | null
          name?: string
          office?: string | null
          office_display_order?: number | null
          phone?: string | null
          phone_display_order?: number | null
          specialization?: string | null
          specialization_display_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      frames: {
        Row: {
          created_at: string
          created_by: string
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      markers: {
        Row: {
          color: string | null
          created_at: string
          created_by: string
          description: string | null
          floor_info: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          size: number | null
          type: string
          updated_at: string
          x_position: number
          y_position: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          floor_info?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          size?: number | null
          type: string
          updated_at?: string
          x_position: number
          y_position: number
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          floor_info?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          size?: number | null
          type?: string
          updated_at?: string
          x_position?: number
          y_position?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_photos: {
        Row: {
          created_at: string
          frame_id: string | null
          frame_name: string
          id: string
          image_data: string
          is_public: boolean
          share_expires_at: string | null
          shared_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          frame_id?: string | null
          frame_name: string
          id?: string
          image_data: string
          is_public?: boolean
          share_expires_at?: string | null
          shared_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          frame_id?: string | null
          frame_name?: string
          id?: string
          image_data?: string
          is_public?: boolean
          share_expires_at?: string | null
          shared_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_photos_frame_id_fkey"
            columns: ["frame_id"]
            isOneToOne: false
            referencedRelation: "frames"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          created_at: string
          id: string
          responses: Json
          submitted_at: string
          survey_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          responses: Json
          submitted_at?: string
          survey_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          responses?: Json
          submitted_at?: string
          survey_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      surveys: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          questions: Json
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          questions: Json
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          questions?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_faculty_members: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          contact_info: string
          created_at: string
          department: string
          display_order: number
          education: string
          id: string
          image_url: string
          name: string
          office: string
          specialization: string
          title: string
          updated_at: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const