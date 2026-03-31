import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Settings, UpdateSettings } from '../lib/database.types';

export interface AppSettings {
  cabinetName: string;
  siret: string;
  orias: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  defaultCommissionType: 'precompte' | 'lineaire';
  fiscalYearStart: number;
  notificationsEnabled: boolean;
  renewalAlertDays: number;
  emailNotifications: boolean;
  currency: string;
  dateFormat: string;
  theme: string;
}

// Convert database settings to app settings format
export function dbToAppSettings(db: Settings): AppSettings {
  return {
    cabinetName: db.cabinet_name || '',
    siret: db.siret || '',
    orias: db.orias || '',
    address: db.address || '',
    city: db.city || '',
    postalCode: db.postal_code || '',
    phone: db.phone || '',
    email: db.email || '',
    defaultCommissionType: db.default_commission_type,
    fiscalYearStart: db.fiscal_year_start,
    notificationsEnabled: db.notifications_enabled,
    renewalAlertDays: db.renewal_alert_days,
    emailNotifications: db.email_notifications,
    currency: db.currency,
    dateFormat: db.date_format,
    theme: db.theme,
  };
}

// Default settings
export const defaultSettings: AppSettings = {
  cabinetName: '',
  siret: '',
  orias: '',
  address: '',
  city: '',
  postalCode: '',
  phone: '',
  email: '',
  defaultCommissionType: 'precompte',
  fiscalYearStart: 1,
  notificationsEnabled: true,
  renewalAlertDays: 30,
  emailNotifications: true,
  currency: 'EUR',
  dateFormat: 'DD/MM/YYYY',
  theme: 'light',
};

export const settingsService = {
  async get(): Promise<AppSettings> {
    if (!isSupabaseConfigured()) {
      return defaultSettings;
    }

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return defaults
        return defaultSettings;
      }
      console.error('Error fetching settings:', error);
      throw error;
    }

    return data ? dbToAppSettings(data) : defaultSettings;
  },

  async update(updates: Partial<AppSettings>): Promise<AppSettings> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No user logged in');
    }

    const dbUpdates: UpdateSettings = {};
    
    if (updates.cabinetName !== undefined) dbUpdates.cabinet_name = updates.cabinetName;
    if (updates.siret !== undefined) dbUpdates.siret = updates.siret;
    if (updates.orias !== undefined) dbUpdates.orias = updates.orias;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.postalCode !== undefined) dbUpdates.postal_code = updates.postalCode;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.defaultCommissionType !== undefined) dbUpdates.default_commission_type = updates.defaultCommissionType;
    if (updates.fiscalYearStart !== undefined) dbUpdates.fiscal_year_start = updates.fiscalYearStart;
    if (updates.notificationsEnabled !== undefined) dbUpdates.notifications_enabled = updates.notificationsEnabled;
    if (updates.renewalAlertDays !== undefined) dbUpdates.renewal_alert_days = updates.renewalAlertDays;
    if (updates.emailNotifications !== undefined) dbUpdates.email_notifications = updates.emailNotifications;
    if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
    if (updates.dateFormat !== undefined) dbUpdates.date_format = updates.dateFormat;
    if (updates.theme !== undefined) dbUpdates.theme = updates.theme;

    const { data, error } = await supabase
      .from('settings')
      .update(dbUpdates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      throw error;
    }

    return dbToAppSettings(data);
  },
};
