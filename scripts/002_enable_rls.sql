-- CommissPro Row Level Security Policies
-- Ensures each user can only access their own data

-- ===================
-- PROFILES TABLE
-- ===================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- ===================
-- COMPANIES TABLE
-- ===================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies_select_own" ON companies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "companies_insert_own" ON companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "companies_update_own" ON companies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "companies_delete_own" ON companies
  FOR DELETE USING (auth.uid() = user_id);

-- ===================
-- PRODUCTS TABLE
-- ===================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_own" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "products_insert_own" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "products_update_own" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "products_delete_own" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- ===================
-- CONTRACTS TABLE
-- ===================
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contracts_select_own" ON contracts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "contracts_insert_own" ON contracts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "contracts_update_own" ON contracts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "contracts_delete_own" ON contracts
  FOR DELETE USING (auth.uid() = user_id);

-- ===================
-- SETTINGS TABLE
-- ===================
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_select_own" ON settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "settings_insert_own" ON settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "settings_update_own" ON settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "settings_delete_own" ON settings
  FOR DELETE USING (auth.uid() = user_id);

-- ===================
-- COMMISSION_HISTORY TABLE
-- ===================
ALTER TABLE commission_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "commission_history_select_own" ON commission_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "commission_history_insert_own" ON commission_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "commission_history_update_own" ON commission_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "commission_history_delete_own" ON commission_history
  FOR DELETE USING (auth.uid() = user_id);
