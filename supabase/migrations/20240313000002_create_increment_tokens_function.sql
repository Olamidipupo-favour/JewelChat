-- Create the increment_tokens function
CREATE OR REPLACE FUNCTION increment_tokens(user_id UUID, amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET tokens = tokens + amount
  WHERE id = user_id;
END;
$$; 