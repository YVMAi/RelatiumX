
-- Function to upsert read receipts
CREATE OR REPLACE FUNCTION public.upsert_read_receipt(
  p_message_id UUID,
  p_user_id UUID,
  p_read_at TIMESTAMP WITH TIME ZONE DEFAULT now()
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.message_read_receipts (message_id, user_id, read_at)
  VALUES (p_message_id, p_user_id, p_read_at)
  ON CONFLICT (message_id, user_id) 
  DO UPDATE SET read_at = p_read_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
