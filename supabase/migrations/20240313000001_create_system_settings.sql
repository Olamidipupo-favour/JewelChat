-- Drop the table if it exists to ensure a clean slate
DROP TABLE IF EXISTS public.system_settings CASCADE;

-- Create system_settings table
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    maintenance_mode BOOLEAN DEFAULT false,
    email_notifications JSONB DEFAULT '{"enabled": true, "types": ["system", "billing", "security"]}'::jsonb,
    payment_gateway JSONB DEFAULT '{"provider": "razorpay", "test_mode": true, "currency": "USD"}'::jsonb,
    pricing JSONB DEFAULT '{
        "tokens_per_dollar": 100,
        "minimum_purchase": 10,
        "maximum_purchase": 1000,
        "free_tokens": 50,
        "token_costs": {
            "gpt-4": 10,
            "gpt-3.5-turbo": 5,
            "deepseek-chat": 8,
            "stable-diffusion-xl": 15
        }
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON public.system_settings;

-- Create the trigger
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO public.system_settings (
    id,
    maintenance_mode,
    email_notifications,
    payment_gateway,
    pricing
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    false,
    '{"enabled": true, "types": ["system", "billing", "security"]}'::jsonb,
    '{"provider": "razorpay", "test_mode": true, "currency": "USD"}'::jsonb,
    '{
        "tokens_per_dollar": 100,
        "minimum_purchase": 10,
        "maximum_purchase": 1000,
        "free_tokens": 50,
        "token_costs": {
            "gpt-4": 10,
            "gpt-3.5-turbo": 5,
            "deepseek-chat": 8,
            "stable-diffusion-xl": 15
        }
    }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    maintenance_mode = EXCLUDED.maintenance_mode,
    email_notifications = EXCLUDED.email_notifications,
    payment_gateway = EXCLUDED.payment_gateway,
    pricing = EXCLUDED.pricing,
    updated_at = TIMEZONE('utc'::text, NOW());

-- Add RLS policies
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can read system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Users can read system settings" ON public.system_settings;

-- Allow admins to read and update settings
CREATE POLICY "Admins can read system settings"
    ON public.system_settings
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update system settings"
    ON public.system_settings
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Allow all authenticated users to read settings
CREATE POLICY "Allow all authenticated users to read settings"
    ON public.system_settings
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow only service role to update settings
CREATE POLICY "Allow only service role to update settings"
    ON public.system_settings
    FOR UPDATE
    USING (auth.role() = 'service_role'); 