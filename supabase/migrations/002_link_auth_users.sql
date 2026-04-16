UPDATE public.users u
SET auth_id = au.id
FROM auth.users au
WHERE u.email = au.email
AND u.auth_id IS NULL;

CREATE OR REPLACE FUNCTION public.link_auth_user_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET auth_id = NEW.id
  WHERE email = NEW.email
  AND auth_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_auth_user_to_profile();
