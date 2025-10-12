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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      active_effects: {
        Row: {
          duration_seconds: number
          effect: string
          expires_at: string | null
          id: number
          item_key: string
          started_at: string
          user_id: string
        }
        Insert: {
          duration_seconds?: number
          effect?: string
          expires_at?: string | null
          id?: number
          item_key: string
          started_at?: string
          user_id: string
        }
        Update: {
          duration_seconds?: number
          effect?: string
          expires_at?: string | null
          id?: number
          item_key?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      attempts: {
        Row: {
          correct: boolean | null
          creds_earned: number | null
          heat: number | null
          id: number
          q_id: number | null
          qid: string | null
          ts: string | null
          uid: string | null
          xp_earned: number | null
        }
        Insert: {
          correct?: boolean | null
          creds_earned?: number | null
          heat?: number | null
          id?: number
          q_id?: number | null
          qid?: string | null
          ts?: string | null
          uid?: string | null
          xp_earned?: number | null
        }
        Update: {
          correct?: boolean | null
          creds_earned?: number | null
          heat?: number | null
          id?: number
          q_id?: number | null
          qid?: string | null
          ts?: string | null
          uid?: string | null
          xp_earned?: number | null
        }
        Relationships: []
      }
      event_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          event_actor: string | null
          event_ts: string
          uid: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          event_actor?: string | null
          event_ts: string
          uid: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          event_actor?: string | null
          event_ts?: string
          uid?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          actor: string | null
          amount: number | null
          details_json: Json | null
          icon: string | null
          id: number
          payload_json: Json | null
          tag: string | null
          target: string | null
          ts: string | null
          type: string
          xp: number | null
        }
        Insert: {
          actor?: string | null
          amount?: number | null
          details_json?: Json | null
          icon?: string | null
          id?: number
          payload_json?: Json | null
          tag?: string | null
          target?: string | null
          ts?: string | null
          type: string
          xp?: number | null
        }
        Update: {
          actor?: string | null
          amount?: number | null
          details_json?: Json | null
          icon?: string | null
          id?: number
          payload_json?: Json | null
          tag?: string | null
          target?: string | null
          ts?: string | null
          type?: string
          xp?: number | null
        }
        Relationships: []
      }
      hack_attempts: {
        Row: {
          attacker: string
          attacker_hack_skill: number
          coins_awarded: number
          created_at: string
          defender: string
          defender_coins_lost: number
          defender_security_level: number
          id: number
          outcome: ("win" | "lose" | "fail" | null)
          win_prob: number
          xp_awarded: number
        }
        Insert: {
          attacker: string
          attacker_hack_skill?: number
          coins_awarded?: number
          created_at?: string
          defender: string
          defender_coins_lost?: number
          defender_security_level?: number
          id?: number
          outcome: ("win" | "lose" | "fail" | null)
          win_prob?: number
          xp_awarded?: number
        }
        Update: {
          attacker?: string
          attacker_hack_skill?: number
          coins_awarded?: number
          created_at?: string
          defender?: string
          defender_coins_lost?: number
          defender_security_level?: number
          id?: number
          outcome?: ("win" | "lose" | "fail" | null)
          win_prob?: number
          xp_awarded?: number
        }
        Relationships: []
      }
      hacks: {
        Row: {
          attack_prob: number | null
          attacker: string | null
          attacker_creds_after: number | null
          attacker_rank: number | null
          blocked: boolean | null
          cap_left: number | null
          defender: string | null
          defender_creds_after: number | null
          defender_rank: number | null
          id: number
          reason: string | null
          repeat_penalty: number | null
          result_json: Json | null
          roll: number | null
          steal: number | null
          success: boolean | null
          trace_cost: number | null
          ts: string | null
        }
        Insert: {
          attack_prob?: number | null
          attacker?: string | null
          attacker_creds_after?: number | null
          attacker_rank?: number | null
          blocked?: boolean | null
          cap_left?: number | null
          defender?: string | null
          defender_creds_after?: number | null
          defender_rank?: number | null
          id?: number
          reason?: string | null
          repeat_penalty?: number | null
          result_json?: Json | null
          roll?: number | null
          steal?: number | null
          success?: boolean | null
          trace_cost?: number | null
          ts?: string | null
        }
        Update: {
          attack_prob?: number | null
          attacker?: string | null
          attacker_creds_after?: number | null
          attacker_rank?: number | null
          blocked?: boolean | null
          cap_left?: number | null
          defender?: string | null
          defender_creds_after?: number | null
          defender_rank?: number | null
          id?: number
          reason?: string | null
          repeat_penalty?: number | null
          result_json?: Json | null
          roll?: number | null
          steal?: number | null
          success?: boolean | null
          trace_cost?: number | null
          ts?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          acquired_at: string | null
          expires_at: string | null
          id: string
          item_id: string
          kind: string
          mult: number | null
          name: string
          power: number | null
          state: string
          uid: string
        }
        Insert: {
          acquired_at?: string | null
          expires_at?: string | null
          id?: string
          item_id: string
          kind: string
          mult?: number | null
          name: string
          power?: number | null
          state?: string
          uid: string
        }
        Update: {
          acquired_at?: string | null
          expires_at?: string | null
          id?: string
          item_id?: string
          kind?: string
          mult?: number | null
          name?: string
          power?: number | null
          state?: string
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          active: boolean | null
          description: string | null
          effect_hours: number | null
          id: string
          kind: string
          mult: number | null
          name: string
          power: number | null
          price: number
          stock: number | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          effect_hours?: number | null
          id: string
          kind: string
          mult?: number | null
          name: string
          power?: number | null
          price: number
          stock?: number | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          effect_hours?: number | null
          id?: string
          kind?: string
          mult?: number | null
          name?: string
          power?: number | null
          price?: number
          stock?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          is_suspended: boolean | null
          last_login_at: string | null
          role: string | null
          uid: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          is_suspended?: boolean | null
          last_login_at?: string | null
          role?: string | null
          uid: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          is_suspended?: boolean | null
          last_login_at?: string | null
          role?: string | null
          uid?: string
          username?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          active: boolean
          answer: number
          batch: string | null
          creds: number | null
          id: number
          options: string[]
          prompt: string
          topic: string | null
          xp: number | null
        }
        Insert: {
          active?: boolean
          answer?: number
          batch?: string | null
          creds?: number | null
          id?: number
          options: string[]
          prompt: string
          topic?: string | null
          xp?: number | null
        }
        Update: {
          active?: boolean
          answer?: number
          batch?: string | null
          creds?: number | null
          id?: number
          options?: string[]
          prompt?: string
          topic?: string | null
          xp?: number | null
        }
        Relationships: []
      }
      questions_import: {
        Row: {
          a: string | null
          active: boolean | null
          answer: number
          b: string | null
          batch: string | null
          c: string | null
          created_at: string | null
          creds: number | null
          d: string | null
          prompt: string
          topic: string | null
          xp: number | null
        }
        Insert: {
          a?: string | null
          active?: boolean | null
          answer: number
          b?: string | null
          batch?: string | null
          c?: string | null
          created_at?: string | null
          creds?: number | null
          d?: string | null
          prompt: string
          topic?: string | null
          xp?: number | null
        }
        Update: {
          a?: string | null
          active?: boolean | null
          answer?: number
          b?: string | null
          batch?: string | null
          c?: string | null
          created_at?: string | null
          creds?: number | null
          d?: string | null
          prompt?: string
          topic?: string | null
          xp?: number | null
        }
        Relationships: []
      }
      questions_import2: {
        Row: {
          active: boolean | null
          answer: number
          batch: string | null
          created_at: string | null
          creds: number | null
          options_raw: string
          prompt: string
          xp: number | null
        }
        Insert: {
          active?: boolean | null
          answer: number
          batch?: string | null
          created_at?: string | null
          creds?: number | null
          options_raw: string
          prompt: string
          xp?: number | null
        }
        Update: {
          active?: boolean | null
          answer?: number
          batch?: string | null
          created_at?: string | null
          creds?: number | null
          options_raw?: string
          prompt?: string
          xp?: number | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          data: Json
          id: number
        }
        Insert: {
          data: Json
          id?: number
        }
        Update: {
          data?: Json
          id?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          batch: string | null
          bounty_pot: number | null
          creds: number | null
          hack_level: number | null
          last_online_at: string | null
          last_session_at: string | null
          rank: number | null
          sec_level: number | null
          session_ends_at: string | null
          session_used_on: string | null
          soft_shield_until: string | null
          streak: number | null
          uid: string
          xp: number | null
        }
        Insert: {
          batch?: string | null
          bounty_pot?: number | null
          creds?: number | null
          hack_level?: number | null
          last_online_at?: string | null
          last_session_at?: string | null
          rank?: number | null
          sec_level?: number | null
          session_ends_at?: string | null
          session_used_on?: string | null
          soft_shield_until?: string | null
          streak?: number | null
          uid: string
          xp?: number | null
        }
        Update: {
          batch?: string | null
          bounty_pot?: number | null
          creds?: number | null
          hack_level?: number | null
          last_online_at?: string | null
          last_session_at?: string | null
          rank?: number | null
          sec_level?: number | null
          session_ends_at?: string | null
          session_used_on?: string | null
          soft_shield_until?: string | null
          streak?: number | null
          uid?: string
          xp?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      v_news_with_reactions: {
        Row: {
          actor: string | null
          actor_avatar_url: string | null
          actor_name: string | null
          amount: number | null
          created_at: string | null
          event_id: string | null
          icon: string | null
          payload: Json | null
          reacts: Json | null
          target: string | null
          target_avatar_url: string | null
          target_name: string | null
          ts: string | null
          type: string | null
          xp: number | null
        }
        Relationships: []
      }
      v_profiles_with_email: {
        Row: {
          batch: string | null
          created_at: string | null
          email: string | null
          uid: string | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _active_booster: {
        Args: { uid_in: string }
        Returns: {
          mult: number
          until: string
        }[]
      }
      _daily_stolen: {
        Args: { attacker: string }
        Returns: number
      }
      _ensure_user_row: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      _event_icon: {
        Args: { t: string }
        Returns: string
      }
      _log_hack_result: {
        Args: {
          p_attacker: string
          p_defender: string
          p_ok: boolean
          p_steal: number
          p_success: boolean
          p_win_prob: number
          p_xp: number
        }
        Returns: undefined
      }
      _ramp_multiplier: {
        Args: { started_at: string }
        Returns: number
      }
      _rank_for_xp: {
        Args: { x: number }
        Returns: number
      }
      _same_batch: {
        Args: { u1: string; u2: string }
        Returns: boolean
      }
      _shield_status: {
        Args: { for_uid: string }
        Returns: boolean
      }
      _upgrade_cost: {
        Args: { lvl: number; stat: string }
        Returns: number
      }
      fix_options: {
        Args: { options_raw: string }
        Returns: string[]
      }
      make_unique_username: {
        Args: { base: string }
        Returns: string
      }
      rpc_activate_item_and_log: {
        Args: { _duration?: number; _item_key: string }
        Returns: undefined
      }
      rpc_active_effects_for_me: {
        Args: Record<PropertyKey, never>
        Returns: {
          duration_seconds: number
          effect: string
          expires_at: string
          id: number
          item_key: string
          item_name: string
          kind: string
          mult: number
          power: number
          remaining_seconds: number
          started_at: string
        }[]
      }
      rpc_feed_latest: {
        Args: { limit_n?: number }
        Returns: {
          actor: string
          actor_avatar_url: string
          actor_name: string
          amount: number
          coins_awarded: number
          defender_coins_lost: number
          icon: string
          id: string
          kind: string
          outcome: string
          payload: Json
          reacts: Json
          target: string
          target_avatar_url: string
          target_name: string
          ts: string
          type: string
          win_prob: number
          xp: number
          xp_awarded: number
        }[]
      }
      rpc_hack_attempt: {
        Args: { _def: string }
        Returns: {
          coins_awarded: number
          defender_coins_lost: number
          outcome: string
          win_prob: number
          xp_awarded: number
        }[]
      }
      rpc_hack_attempt_core: {
        Args: { target_uid: string }
        Returns: Json
      }
      rpc_hack_attempt_emulate: {
        Args: { p_attacker: string; p_defender: string }
        Returns: {
          coins_awarded: number
          defender_coins_lost: number
          outcome: string
          win_prob: number
          xp_awarded: number
        }[]
      }
      rpc_hack_attempt_preview: {
        Args: { _def: string }
        Returns: {
          coins_awarded: number
          defender_coins_lost: number
          outcome: string
          win_prob: number
          xp_awarded: number
        }[]
      }
      rpc_hack_feed: {
        Args: { limit_n?: number }
        Returns: {
          attacker: string
          attacker_avatar_url: string
          attacker_name: string
          coins_awarded: number
          defender: string
          defender_avatar_url: string
          defender_coins_lost: number
          defender_name: string
          id: string
          outcome: string
          ts: string
          win_prob: number
          xp_awarded: number
        }[]
      }
      rpc_hack_targets: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      rpc_inventory_activate: {
        Args: { p_inventory_id: string }
        Returns: Json
      }
      rpc_inventory_list: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      rpc_leaderboard: {
        Args: { _batch: string; _limit?: number; _scope: string }
        Returns: {
          avatar_url: string
          batch: string
          level: number
          rank: number
          user_id: string
          username: string
          xp_total: number
        }[]
      }
      rpc_leaderboard_json: {
        Args: { limit_n?: number; p_batch?: string }
        Returns: Json
      }
      rpc_leaderboard_top: {
        Args: { limit_n?: number; p_batch?: string }
        Returns: {
          creds: number
          last_online_mins: number
          rank: number
          uid: string
          username: string
          xp: number
        }[]
      }
      rpc_news_latest_v2: {
        Args: { limit_n: number }
        Returns: {
          actor: string
          actor_avatar_url: string
          actor_name: string
          amount: number
          created_at: string
          event_id: string
          icon: string
          payload: Json
          reacts: Json
          target: string
          target_avatar_url: string
          target_name: string
          type: string
          xp: number
        }[]
      }
      rpc_questions_next: {
        Args: { limit_n?: number; p_batch?: string }
        Returns: {
          answer: number
          creds: number
          id: number
          options: string[]
          prompt: string
          xp: number
        }[]
      }
      rpc_react: {
        Args: { p_emoji: string; p_event_ts: string }
        Returns: Json
      }
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      rpc_session_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      rpc_set_batch: {
        Args: { p_batch: string }
        Returns: undefined
      }
      rpc_shop_buy: {
        Args: { item_id: string }
        Returns: Json
      }
      rpc_shop_list: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      rpc_task_submit: {
        Args: { payload: Json }
        Returns: Json
      }
      rpc_task_submit_frontend: {
        Args: { p_answer: number; p_question_id: number }
        Returns: Json
      }
      rpc_touch_online: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      rpc_upgrade_stat: {
        Args: { p_stat: string }
        Returns: Json
      }
    }
    Enums: {
      hack_outcome: "win" | "lose" | "fail"
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
      hack_outcome: ["win", "lose", "fail"],
    },
  },
} as const


