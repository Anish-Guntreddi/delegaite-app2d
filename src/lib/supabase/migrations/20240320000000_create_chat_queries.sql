-- Create chat_queries table
CREATE TABLE IF NOT EXISTS public.chat_queries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    query_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Set up RLS policies
ALTER TABLE public.chat_queries ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own queries
CREATE POLICY "Users can insert their own queries"
    ON public.chat_queries
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own queries
CREATE POLICY "Users can view their own queries"
    ON public.chat_queries
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id); 