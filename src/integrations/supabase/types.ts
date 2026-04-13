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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agua_registros: {
        Row: {
          created_at: string
          data: string
          id: string
          quantidade_ml: number
        }
        Insert: {
          created_at?: string
          data?: string
          id?: string
          quantidade_ml?: number
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          quantidade_ml?: number
        }
        Relationships: []
      }
      camila_devocional: {
        Row: {
          created_at: string | null
          data: string
          id: string
          leitura_feita: boolean | null
          oracao_gratidao: string | null
          oracao_intercessao: string | null
          oracao_pedidos: string | null
          reflexao: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data: string
          id?: string
          leitura_feita?: boolean | null
          oracao_gratidao?: string | null
          oracao_intercessao?: string | null
          oracao_pedidos?: string | null
          reflexao?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string
          id?: string
          leitura_feita?: boolean | null
          oracao_gratidao?: string | null
          oracao_intercessao?: string | null
          oracao_pedidos?: string | null
          reflexao?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      camila_mensagens: {
        Row: {
          created_at: string | null
          data: string
          horario_rotina: string
          id: string
          lida: boolean | null
          texto: string
        }
        Insert: {
          created_at?: string | null
          data: string
          horario_rotina?: string
          id?: string
          lida?: boolean | null
          texto: string
        }
        Update: {
          created_at?: string | null
          data?: string
          horario_rotina?: string
          id?: string
          lida?: boolean | null
          texto?: string
        }
        Relationships: []
      }
      camila_notas: {
        Row: {
          conteudo: string | null
          cor: string | null
          created_at: string | null
          id: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          conteudo?: string | null
          cor?: string | null
          created_at?: string | null
          id?: string
          titulo?: string
          updated_at?: string | null
        }
        Update: {
          conteudo?: string | null
          cor?: string | null
          created_at?: string | null
          id?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      camila_tarefas: {
        Row: {
          concluida: boolean | null
          created_at: string | null
          criado_por: string
          id: string
          para_quem: string
          titulo: string
        }
        Insert: {
          concluida?: boolean | null
          created_at?: string | null
          criado_por?: string
          id?: string
          para_quem?: string
          titulo: string
        }
        Update: {
          concluida?: boolean | null
          created_at?: string | null
          criado_por?: string
          id?: string
          para_quem?: string
          titulo?: string
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          created_at: string
          data: string
          dia_semana: number
          horario_real: string | null
          id: string
          item_id: string
          status: string
        }
        Insert: {
          created_at?: string
          data?: string
          dia_semana: number
          horario_real?: string | null
          id?: string
          item_id: string
          status?: string
        }
        Update: {
          created_at?: string
          data?: string
          dia_semana?: number
          horario_real?: string | null
          id?: string
          item_id?: string
          status?: string
        }
        Relationships: []
      }
      emerson_reflexao_publica: {
        Row: {
          data: string
          id: string
          reflexao: string | null
          updated_at: string | null
        }
        Insert: {
          data: string
          id?: string
          reflexao?: string | null
          updated_at?: string | null
        }
        Update: {
          data?: string
          id?: string
          reflexao?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      oracoes: {
        Row: {
          conteudo: string
          created_at: string
          data: string
          id: string
          tipo: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          data?: string
          id?: string
          tipo: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          data?: string
          id?: string
          tipo?: string
        }
        Relationships: []
      }
      perfil_metricas_historico: {
        Row: {
          categoria: string
          created_at: string
          data: string
          id: string
          label: string
          unidade: string
          valor: string
        }
        Insert: {
          categoria: string
          created_at?: string
          data?: string
          id?: string
          label: string
          unidade?: string
          valor: string
        }
        Update: {
          categoria?: string
          created_at?: string
          data?: string
          id?: string
          label?: string
          unidade?: string
          valor?: string
        }
        Relationships: []
      }
      sono_registros: {
        Row: {
          created_at: string
          data: string
          duracao_minutos: number
          hora_acordou: string
          hora_dormiu: string
          id: string
          suficiente: boolean
        }
        Insert: {
          created_at?: string
          data?: string
          duracao_minutos?: number
          hora_acordou: string
          hora_dormiu: string
          id?: string
          suficiente?: boolean
        }
        Update: {
          created_at?: string
          data?: string
          duracao_minutos?: number
          hora_acordou?: string
          hora_dormiu?: string
          id?: string
          suficiente?: boolean
        }
        Relationships: []
      }
      tipo_dia: {
        Row: {
          created_at: string
          data: string
          id: string
          tipo: string
        }
        Insert: {
          created_at?: string
          data?: string
          id?: string
          tipo?: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          tipo?: string
        }
        Relationships: []
      }
      treino_exercicios: {
        Row: {
          cargas: Json | null
          created_at: string
          exercicio_id: string
          id: string
          nome: string
          sessao_id: string
          sets_completos: number
          sets_planejados: number
        }
        Insert: {
          cargas?: Json | null
          created_at?: string
          exercicio_id: string
          id?: string
          nome: string
          sessao_id: string
          sets_completos?: number
          sets_planejados: number
        }
        Update: {
          cargas?: Json | null
          created_at?: string
          exercicio_id?: string
          id?: string
          nome?: string
          sessao_id?: string
          sets_completos?: number
          sets_planejados?: number
        }
        Relationships: [
          {
            foreignKeyName: "treino_exercicios_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "treino_sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      treino_fotos: {
        Row: {
          created_at: string
          foto_base64: string
          id: string
          sessao_id: string
        }
        Insert: {
          created_at?: string
          foto_base64: string
          id?: string
          sessao_id: string
        }
        Update: {
          created_at?: string
          foto_base64?: string
          id?: string
          sessao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treino_fotos_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "treino_sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      treino_sessoes: {
        Row: {
          created_at: string
          data: string
          dia_semana: number
          duracao_segundos: number
          foco: string
          id: string
          series_completas: number
          tipo: string
          total_series: number
        }
        Insert: {
          created_at?: string
          data?: string
          dia_semana: number
          duracao_segundos?: number
          foco: string
          id?: string
          series_completas?: number
          tipo: string
          total_series?: number
        }
        Update: {
          created_at?: string
          data?: string
          dia_semana?: number
          duracao_segundos?: number
          foco?: string
          id?: string
          series_completas?: number
          tipo?: string
          total_series?: number
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
} as const
