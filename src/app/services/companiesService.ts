import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Company as DbCompany, InsertCompany, UpdateCompany } from '../lib/database.types';
import type { Company } from '../data/types';

// Convert database company to app company format
export function dbToAppCompany(db: DbCompany): Company {
  return {
    id: db.id,
    nom: db.name,
    code: db.code,
    couleur: db.color,
    tauxDefaut: Number(db.default_rate),
    actif: db.active,
  };
}

// Convert app company to database format
export function appToDbCompany(app: Company, userId: string): InsertCompany {
  return {
    user_id: userId,
    name: app.nom,
    code: app.code,
    color: app.couleur,
    default_rate: app.tauxDefaut,
    active: app.actif,
  };
}

export const companiesService = {
  async getAll(): Promise<Company[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }

    return (data || []).map(dbToAppCompany);
  },

  async getById(id: string): Promise<Company | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching company:', error);
      return null;
    }

    return data ? dbToAppCompany(data) : null;
  },

  async create(company: Company, userId: string): Promise<Company> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const dbCompany = appToDbCompany(company, userId);

    const { data, error } = await supabase
      .from('companies')
      .insert(dbCompany)
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      throw error;
    }

    return dbToAppCompany(data);
  },

  async update(id: string, updates: Partial<Company>): Promise<Company> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const dbUpdates: UpdateCompany = {};
    
    if (updates.nom) dbUpdates.name = updates.nom;
    if (updates.code) dbUpdates.code = updates.code;
    if (updates.couleur) dbUpdates.color = updates.couleur;
    if (updates.tauxDefaut !== undefined) dbUpdates.default_rate = updates.tauxDefaut;
    if (updates.actif !== undefined) dbUpdates.active = updates.actif;

    const { data, error } = await supabase
      .from('companies')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating company:', error);
      throw error;
    }

    return dbToAppCompany(data);
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  },

  async bulkCreate(companies: Company[], userId: string): Promise<Company[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const dbCompanies = companies.map(c => appToDbCompany(c, userId));

    const { data, error } = await supabase
      .from('companies')
      .insert(dbCompanies)
      .select();

    if (error) {
      console.error('Error bulk creating companies:', error);
      throw error;
    }

    return (data || []).map(dbToAppCompany);
  },
};
