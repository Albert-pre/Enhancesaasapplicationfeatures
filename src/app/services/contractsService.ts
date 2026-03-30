import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Contract, InsertContract, UpdateContract } from '../lib/database.types';
import type { Contract as AppContract } from '../data/types';

// Convert database contract to app contract format
export function dbToAppContract(db: Contract): AppContract {
  // Calculate commissions based on the contract data
  const primeAnnuelle = db.monthly_premium * 12;
  const tauxCommission = db.first_year_rate || 0;
  const tauxRecurrent = db.recurring_rate || 0;
  
  // Commission N (first year)
  const commissionN = primeAnnuelle * (tauxCommission / 100);
  
  // For precompte, split between principal and secondary
  // For lineaire, spread over 12 months
  const commissionPrincipale = db.commission_type === 'precompte' 
    ? commissionN * 0.6  // 60% at subscription
    : 0;
  const commissionSecondaire = db.commission_type === 'precompte'
    ? commissionN * 0.4  // 40% at effect date
    : 0;
  
  // Commission N+1
  const commissionN1 = primeAnnuelle * (tauxRecurrent / 100);

  return {
    id: db.id,
    nom: db.client_name,
    prenom: db.client_first_name || '',
    dateNaissance: db.client_birth_date || undefined,
    compagnie: db.company_name || '',
    categorie: mapCategoryToFrench(db.product_name?.split(' - ')[0] || 'sante'),
    produit: db.product_name || '',
    formule: '',
    typeCommission: db.commission_type === 'precompte' ? 'Précompte' : 'Linéaire',
    tauxCommission,
    tauxBase: tauxCommission * 0.6,
    tauxSecondaire: tauxCommission * 0.4,
    dateSouscription: db.subscription_date,
    dateEffet: db.effect_date || db.subscription_date,
    tauxN1: tauxRecurrent,
    primeBrute: db.monthly_premium,
    commissionPrincipale,
    commissionSecondaire,
    commissionN,
    commissionN1,
    statut: mapStatusToFrench(db.status),
    notes: db.notes || undefined,
  };
}

// Convert app contract to database format
export function appToDbContract(app: AppContract, userId: string): InsertContract {
  return {
    user_id: userId,
    client_name: app.nom,
    client_first_name: app.prenom,
    client_birth_date: app.dateNaissance || null,
    company_name: app.compagnie,
    product_name: app.produit,
    subscription_date: app.dateSouscription,
    effect_date: app.dateEffet,
    monthly_premium: app.primeBrute,
    annual_premium: app.primeBrute * 12,
    commission_type: app.typeCommission === 'Précompte' ? 'precompte' : 'lineaire',
    first_year_rate: app.tauxCommission,
    recurring_rate: app.tauxN1,
    status: mapStatusToDb(app.statut),
    notes: app.notes || null,
    source: 'manual',
  };
}

function mapStatusToFrench(status: string): 'Actif' | 'Résilié' | 'En attente' | 'Suspendu' {
  switch (status) {
    case 'actif': return 'Actif';
    case 'resilie': return 'Résilié';
    case 'en_attente': return 'En attente';
    case 'suspendu': return 'Suspendu';
    default: return 'Actif';
  }
}

function mapStatusToDb(status: string): 'actif' | 'resilie' | 'en_attente' | 'suspendu' {
  switch (status) {
    case 'Actif': return 'actif';
    case 'Résilié': return 'resilie';
    case 'En attente': return 'en_attente';
    case 'Suspendu': return 'suspendu';
    default: return 'actif';
  }
}

function mapCategoryToFrench(category: string): string {
  switch (category.toLowerCase()) {
    case 'sante': return 'Santé';
    case 'prevoyance': return 'Prévoyance';
    case 'obseques': return 'Obsèques';
    case 'animaux': return 'Animaux';
    default: return category;
  }
}

export const contractsService = {
  async getAll(): Promise<AppContract[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }

    return (data || []).map(dbToAppContract);
  },

  async getById(id: string): Promise<AppContract | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching contract:', error);
      return null;
    }

    return data ? dbToAppContract(data) : null;
  },

  async create(contract: AppContract, userId: string): Promise<AppContract> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const dbContract = appToDbContract(contract, userId);

    const { data, error } = await supabase
      .from('contracts')
      .insert(dbContract)
      .select()
      .single();

    if (error) {
      console.error('Error creating contract:', error);
      throw error;
    }

    return dbToAppContract(data);
  },

  async update(id: string, updates: Partial<AppContract>): Promise<AppContract> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const dbUpdates: UpdateContract = {};
    
    if (updates.nom) dbUpdates.client_name = updates.nom;
    if (updates.prenom) dbUpdates.client_first_name = updates.prenom;
    if (updates.dateNaissance) dbUpdates.client_birth_date = updates.dateNaissance;
    if (updates.compagnie) dbUpdates.company_name = updates.compagnie;
    if (updates.produit) dbUpdates.product_name = updates.produit;
    if (updates.dateSouscription) dbUpdates.subscription_date = updates.dateSouscription;
    if (updates.dateEffet) dbUpdates.effect_date = updates.dateEffet;
    if (updates.primeBrute) {
      dbUpdates.monthly_premium = updates.primeBrute;
      dbUpdates.annual_premium = updates.primeBrute * 12;
    }
    if (updates.typeCommission) {
      dbUpdates.commission_type = updates.typeCommission === 'Précompte' ? 'precompte' : 'lineaire';
    }
    if (updates.tauxCommission !== undefined) dbUpdates.first_year_rate = updates.tauxCommission;
    if (updates.tauxN1 !== undefined) dbUpdates.recurring_rate = updates.tauxN1;
    if (updates.statut) dbUpdates.status = mapStatusToDb(updates.statut);
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;

    const { data, error } = await supabase
      .from('contracts')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contract:', error);
      throw error;
    }

    return dbToAppContract(data);
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  },

  async bulkCreate(contracts: AppContract[], userId: string): Promise<AppContract[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const dbContracts = contracts.map(c => appToDbContract(c, userId));

    const { data, error } = await supabase
      .from('contracts')
      .insert(dbContracts)
      .select();

    if (error) {
      console.error('Error bulk creating contracts:', error);
      throw error;
    }

    return (data || []).map(dbToAppContract);
  },
};
