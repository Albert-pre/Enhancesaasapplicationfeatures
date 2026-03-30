export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          cabinet_name: string | null;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          cabinet_name?: string | null;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cabinet_name?: string | null;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          code: string;
          color: string;
          default_rate: number;
          logo_url: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          code: string;
          color?: string;
          default_rate?: number;
          logo_url?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          code?: string;
          color?: string;
          default_rate?: number;
          logo_url?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          company_id: string | null;
          name: string;
          category: 'sante' | 'prevoyance' | 'obseques' | 'animaux' | 'autre';
          type: string | null;
          first_year_rate: number;
          base_rate: number;
          follow_up_rate: number;
          quality_rate: number;
          n_plus_1_rate: number;
          payment_mode: 'precompte' | 'lineaire';
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id?: string | null;
          name: string;
          category: 'sante' | 'prevoyance' | 'obseques' | 'animaux' | 'autre';
          type?: string | null;
          first_year_rate?: number;
          base_rate?: number;
          follow_up_rate?: number;
          quality_rate?: number;
          n_plus_1_rate?: number;
          payment_mode?: 'precompte' | 'lineaire';
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string | null;
          name?: string;
          category?: 'sante' | 'prevoyance' | 'obseques' | 'animaux' | 'autre';
          type?: string | null;
          first_year_rate?: number;
          base_rate?: number;
          follow_up_rate?: number;
          quality_rate?: number;
          n_plus_1_rate?: number;
          payment_mode?: 'precompte' | 'lineaire';
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          user_id: string;
          company_id: string | null;
          product_id: string | null;
          client_name: string;
          client_first_name: string | null;
          client_email: string | null;
          client_phone: string | null;
          client_address: string | null;
          client_city: string | null;
          client_postal_code: string | null;
          client_birth_date: string | null;
          contract_number: string | null;
          status: 'actif' | 'resilie' | 'en_attente' | 'suspendu';
          subscription_date: string;
          effect_date: string | null;
          end_date: string | null;
          monthly_premium: number;
          annual_premium: number | null;
          payment_frequency: 'mensuel' | 'trimestriel' | 'semestriel' | 'annuel';
          commission_type: 'precompte' | 'lineaire';
          first_year_rate: number | null;
          recurring_rate: number | null;
          company_name: string | null;
          product_name: string | null;
          notes: string | null;
          tags: string[] | null;
          source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id?: string | null;
          product_id?: string | null;
          client_name: string;
          client_first_name?: string | null;
          client_email?: string | null;
          client_phone?: string | null;
          client_address?: string | null;
          client_city?: string | null;
          client_postal_code?: string | null;
          client_birth_date?: string | null;
          contract_number?: string | null;
          status?: 'actif' | 'resilie' | 'en_attente' | 'suspendu';
          subscription_date: string;
          effect_date?: string | null;
          end_date?: string | null;
          monthly_premium: number;
          annual_premium?: number | null;
          payment_frequency?: 'mensuel' | 'trimestriel' | 'semestriel' | 'annuel';
          commission_type?: 'precompte' | 'lineaire';
          first_year_rate?: number | null;
          recurring_rate?: number | null;
          company_name?: string | null;
          product_name?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string | null;
          product_id?: string | null;
          client_name?: string;
          client_first_name?: string | null;
          client_email?: string | null;
          client_phone?: string | null;
          client_address?: string | null;
          client_city?: string | null;
          client_postal_code?: string | null;
          client_birth_date?: string | null;
          contract_number?: string | null;
          status?: 'actif' | 'resilie' | 'en_attente' | 'suspendu';
          subscription_date?: string;
          effect_date?: string | null;
          end_date?: string | null;
          monthly_premium?: number;
          annual_premium?: number | null;
          payment_frequency?: 'mensuel' | 'trimestriel' | 'semestriel' | 'annuel';
          commission_type?: 'precompte' | 'lineaire';
          first_year_rate?: number | null;
          recurring_rate?: number | null;
          company_name?: string | null;
          product_name?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          user_id: string;
          cabinet_name: string | null;
          siret: string | null;
          orias: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          phone: string | null;
          email: string | null;
          default_commission_type: 'precompte' | 'lineaire';
          fiscal_year_start: number;
          notifications_enabled: boolean;
          renewal_alert_days: number;
          email_notifications: boolean;
          currency: string;
          date_format: string;
          theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cabinet_name?: string | null;
          siret?: string | null;
          orias?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          phone?: string | null;
          email?: string | null;
          default_commission_type?: 'precompte' | 'lineaire';
          fiscal_year_start?: number;
          notifications_enabled?: boolean;
          renewal_alert_days?: number;
          email_notifications?: boolean;
          currency?: string;
          date_format?: string;
          theme?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cabinet_name?: string | null;
          siret?: string | null;
          orias?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          phone?: string | null;
          email?: string | null;
          default_commission_type?: 'precompte' | 'lineaire';
          fiscal_year_start?: number;
          notifications_enabled?: boolean;
          renewal_alert_days?: number;
          email_notifications?: boolean;
          currency?: string;
          date_format?: string;
          theme?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      commission_history: {
        Row: {
          id: string;
          user_id: string;
          contract_id: string | null;
          month: string;
          year: number;
          gross_commission: number;
          net_commission: number;
          commission_type: string | null;
          rate_applied: number | null;
          premium_base: number | null;
          calculated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          contract_id?: string | null;
          month: string;
          year: number;
          gross_commission?: number;
          net_commission?: number;
          commission_type?: string | null;
          rate_applied?: number | null;
          premium_base?: number | null;
          calculated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          contract_id?: string | null;
          month?: string;
          year?: number;
          gross_commission?: number;
          net_commission?: number;
          commission_type?: string | null;
          rate_applied?: number | null;
          premium_base?: number | null;
          calculated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

// Convenience types for using in components
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Company = Database['public']['Tables']['companies']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Contract = Database['public']['Tables']['contracts']['Row'];
export type Settings = Database['public']['Tables']['settings']['Row'];
export type CommissionHistory = Database['public']['Tables']['commission_history']['Row'];

export type InsertProfile = Database['public']['Tables']['profiles']['Insert'];
export type InsertCompany = Database['public']['Tables']['companies']['Insert'];
export type InsertProduct = Database['public']['Tables']['products']['Insert'];
export type InsertContract = Database['public']['Tables']['contracts']['Insert'];
export type InsertSettings = Database['public']['Tables']['settings']['Insert'];

export type UpdateProfile = Database['public']['Tables']['profiles']['Update'];
export type UpdateCompany = Database['public']['Tables']['companies']['Update'];
export type UpdateProduct = Database['public']['Tables']['products']['Update'];
export type UpdateContract = Database['public']['Tables']['contracts']['Update'];
export type UpdateSettings = Database['public']['Tables']['settings']['Update'];
