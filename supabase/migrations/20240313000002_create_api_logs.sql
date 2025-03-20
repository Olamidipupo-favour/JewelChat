-- Create API logs table
CREATE TABLE IF NOT EXISTS api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    endpoint TEXT NOT NULL,
    model TEXT NOT NULL,
    tokens_used INTEGER NOT NULL,
    status TEXT NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own logs
CREATE POLICY "Users can read their own logs"
    ON api_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Allow service role to insert logs
CREATE POLICY "Service role can insert logs"
    ON api_logs FOR INSERT
    WITH CHECK (true);

-- Create function to log API usage
CREATE OR REPLACE FUNCTION log_api_usage(
    p_user_id UUID,
    p_endpoint TEXT,
    p_model TEXT,
    p_tokens_used INTEGER,
    p_status TEXT,
    p_error_message TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO api_logs (
        user_id,
        endpoint,
        model,
        tokens_used,
        status,
        error_message
    ) VALUES (
        p_user_id,
        p_endpoint,
        p_model,
        p_tokens_used,
        p_status,
        p_error_message
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 