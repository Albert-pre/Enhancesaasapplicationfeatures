-- CommissPro Database Triggers
-- Auto-create profile and settings on user signup

-- ===================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ===================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, cabinet_name, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'cabinet_name', 'Mon Cabinet'),
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create default settings
  INSERT INTO public.settings (user_id, cabinet_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'cabinet_name', 'Mon Cabinet')
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ===================
-- AUTO-UPDATE TIMESTAMPS
-- ===================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ===================
-- DENORMALIZE COMPANY/PRODUCT NAMES ON CONTRACT
-- ===================
CREATE OR REPLACE FUNCTION public.denormalize_contract_names()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Get company name
  IF NEW.company_id IS NOT NULL THEN
    SELECT name INTO NEW.company_name FROM companies WHERE id = NEW.company_id;
  END IF;
  
  -- Get product name
  IF NEW.product_id IS NOT NULL THEN
    SELECT name INTO NEW.product_name FROM products WHERE id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS denormalize_contract_names_trigger ON contracts;
CREATE TRIGGER denormalize_contract_names_trigger
  BEFORE INSERT OR UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.denormalize_contract_names();
