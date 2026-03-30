-- CommissPro Database Schema
-- Tables for managing insurance commissions

-- 1. Profils utilisateurs (extension de auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cabinet_name TEXT,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Compagnies d'assurance
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  default_rate DECIMAL(5,2) DEFAULT 0,
  logo_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Produits / Regles de commission
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sante', 'prevoyance', 'obseques', 'animaux', 'autre')),
  type TEXT, -- 'Individuel', 'Collectif', etc.
  
  -- Taux de commission ECA
  first_year_rate DECIMAL(5,2) DEFAULT 0,     -- Taux 1ere annee
  base_rate DECIMAL(5,2) DEFAULT 0,           -- Taux de base
  follow_up_rate DECIMAL(5,2) DEFAULT 0,      -- Taux suivi
  quality_rate DECIMAL(5,2) DEFAULT 0,        -- Taux qualite
  n_plus_1_rate DECIMAL(5,2) DEFAULT 0,       -- Taux N+1
  
  -- Mode de versement
  payment_mode TEXT DEFAULT 'precompte' CHECK (payment_mode IN ('precompte', 'lineaire')),
  
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Contrats
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Infos client
  client_name TEXT NOT NULL,
  client_first_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  client_city TEXT,
  client_postal_code TEXT,
  client_birth_date DATE,
  
  -- Infos contrat
  contract_number TEXT,
  status TEXT DEFAULT 'actif' CHECK (status IN ('actif', 'resilie', 'en_attente', 'suspendu')),
  subscription_date DATE NOT NULL,
  effect_date DATE,
  end_date DATE,
  
  -- Financier
  monthly_premium DECIMAL(10,2) NOT NULL,
  annual_premium DECIMAL(10,2) GENERATED ALWAYS AS (monthly_premium * 12) STORED,
  payment_frequency TEXT DEFAULT 'mensuel' CHECK (payment_frequency IN ('mensuel', 'trimestriel', 'semestriel', 'annuel')),
  
  -- Commission
  commission_type TEXT DEFAULT 'precompte' CHECK (commission_type IN ('precompte', 'lineaire')),
  first_year_rate DECIMAL(5,2),
  recurring_rate DECIMAL(5,2),
  
  -- Compagnie/Produit names (denormalized for display when refs deleted)
  company_name TEXT,
  product_name TEXT,
  
  -- Metadata
  notes TEXT,
  tags TEXT[], -- Array of tags for filtering
  source TEXT, -- 'import', 'manual', 'api'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Parametres du cabinet
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Infos cabinet
  cabinet_name TEXT,
  siret TEXT,
  orias TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  
  -- Preferences commission
  default_commission_type TEXT DEFAULT 'precompte' CHECK (default_commission_type IN ('precompte', 'lineaire')),
  fiscal_year_start INTEGER DEFAULT 1 CHECK (fiscal_year_start >= 1 AND fiscal_year_start <= 12),
  
  -- Notifications
  notifications_enabled BOOLEAN DEFAULT true,
  renewal_alert_days INTEGER DEFAULT 30,
  email_notifications BOOLEAN DEFAULT true,
  
  -- Display preferences
  currency TEXT DEFAULT 'EUR',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  theme TEXT DEFAULT 'light',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Historique des commissions calculees (cache/audit)
CREATE TABLE IF NOT EXISTS commission_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  
  month DATE NOT NULL, -- Premier jour du mois
  year INTEGER NOT NULL,
  
  -- Montants calcules
  gross_commission DECIMAL(10,2) DEFAULT 0,
  net_commission DECIMAL(10,2) DEFAULT 0,
  
  -- Details
  commission_type TEXT,
  rate_applied DECIMAL(5,2),
  premium_base DECIMAL(10,2),
  
  -- Metadata
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(contract_id, month)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_subscription_date ON contracts(subscription_date);
CREATE INDEX IF NOT EXISTS idx_contracts_company_id ON contracts(company_id);
CREATE INDEX IF NOT EXISTS idx_contracts_product_id ON contracts(product_id);

CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

CREATE INDEX IF NOT EXISTS idx_commission_history_user_id ON commission_history(user_id);
CREATE INDEX IF NOT EXISTS idx_commission_history_contract_id ON commission_history(contract_id);
CREATE INDEX IF NOT EXISTS idx_commission_history_month ON commission_history(month);
