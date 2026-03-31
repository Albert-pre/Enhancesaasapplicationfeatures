import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Product as DbProduct, InsertProduct, UpdateProduct } from '../lib/database.types';
import type { CommissionRule } from '../data/types';

// Convert database product to app commission rule format
export function dbToAppProduct(db: DbProduct): CommissionRule {
  return {
    id: db.id,
    compagnie: '', // Will be filled from company relation
    categorie: mapCategoryToFrench(db.category),
    produit: db.name,
    typeCommission: db.payment_mode === 'precompte' ? 'Précompte' : 'Linéaire',
    tauxTotal: Number(db.first_year_rate),
    tauxBase: Number(db.base_rate),
    tauxSecondaire: Number(db.follow_up_rate),
    tauxQualite: Number(db.quality_rate),
    tauxN1: Number(db.n_plus_1_rate),
  };
}

// Convert app commission rule to database format
export function appToDbProduct(app: CommissionRule, userId: string, companyId?: string): InsertProduct {
  return {
    user_id: userId,
    company_id: companyId || null,
    name: app.produit,
    category: mapCategoryToDb(app.categorie),
    payment_mode: app.typeCommission === 'Précompte' ? 'precompte' : 'lineaire',
    first_year_rate: app.tauxTotal,
    base_rate: app.tauxBase,
    follow_up_rate: app.tauxSecondaire,
    quality_rate: app.tauxQualite,
    n_plus_1_rate: app.tauxN1,
    active: true,
  };
}

function mapCategoryToFrench(category: string): string {
  switch (category) {
    case 'sante': return 'Santé';
    case 'prevoyance': return 'Prévoyance';
    case 'obseques': return 'Obsèques';
    case 'animaux': return 'Animaux';
    case 'autre': return 'Autre';
    default: return category;
  }
}

function mapCategoryToDb(category: string): 'sante' | 'prevoyance' | 'obseques' | 'animaux' | 'autre' {
  const cat = category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  switch (cat) {
    case 'sante': return 'sante';
    case 'prevoyance': return 'prevoyance';
    case 'obseques': return 'obseques';
    case 'animaux': return 'animaux';
    default: return 'autre';
  }
}

export const productsService = {
  async getAll(): Promise<CommissionRule[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        companies (
          name
        )
      `)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return (data || []).map(d => {
      const product = dbToAppProduct(d);
      // @ts-expect-error - companies relation
      product.compagnie = d.companies?.name || '';
      return product;
    });
  },

  async getById(id: string): Promise<CommissionRule | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        companies (
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    if (!data) return null;

    const product = dbToAppProduct(data);
    // @ts-expect-error - companies relation
    product.compagnie = data.companies?.name || '';
    return product;
  },

  async create(product: CommissionRule, userId: string, companyId?: string): Promise<CommissionRule> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const dbProduct = appToDbProduct(product, userId, companyId);

    const { data, error } = await supabase
      .from('products')
      .insert(dbProduct)
      .select(`
        *,
        companies (
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    const result = dbToAppProduct(data);
    // @ts-expect-error - companies relation
    result.compagnie = data.companies?.name || '';
    return result;
  },

  async update(id: string, updates: Partial<CommissionRule>): Promise<CommissionRule> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const dbUpdates: UpdateProduct = {};
    
    if (updates.produit) dbUpdates.name = updates.produit;
    if (updates.categorie) dbUpdates.category = mapCategoryToDb(updates.categorie);
    if (updates.typeCommission) {
      dbUpdates.payment_mode = updates.typeCommission === 'Précompte' ? 'precompte' : 'lineaire';
    }
    if (updates.tauxTotal !== undefined) dbUpdates.first_year_rate = updates.tauxTotal;
    if (updates.tauxBase !== undefined) dbUpdates.base_rate = updates.tauxBase;
    if (updates.tauxSecondaire !== undefined) dbUpdates.follow_up_rate = updates.tauxSecondaire;
    if (updates.tauxQualite !== undefined) dbUpdates.quality_rate = updates.tauxQualite;
    if (updates.tauxN1 !== undefined) dbUpdates.n_plus_1_rate = updates.tauxN1;

    const { data, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select(`
        *,
        companies (
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    const result = dbToAppProduct(data);
    // @ts-expect-error - companies relation
    result.compagnie = data.companies?.name || '';
    return result;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  async bulkCreate(products: CommissionRule[], userId: string, companyIdMap: Record<string, string>): Promise<CommissionRule[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const dbProducts = products.map(p => {
      const companyId = companyIdMap[p.compagnie];
      return appToDbProduct(p, userId, companyId);
    });

    const { data, error } = await supabase
      .from('products')
      .insert(dbProducts)
      .select(`
        *,
        companies (
          name
        )
      `);

    if (error) {
      console.error('Error bulk creating products:', error);
      throw error;
    }

    return (data || []).map(d => {
      const product = dbToAppProduct(d);
      // @ts-expect-error - companies relation
      product.compagnie = d.companies?.name || '';
      return product;
    });
  },
};
