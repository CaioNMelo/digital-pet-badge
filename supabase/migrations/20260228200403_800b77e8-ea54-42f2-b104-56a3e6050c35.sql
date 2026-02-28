-- Table to store approved purchases from Lowify
CREATE TABLE public.approved_purchases (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved',
    lowify_transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on email for fast lookups
CREATE UNIQUE INDEX idx_approved_purchases_email ON public.approved_purchases (email);

-- Enable RLS
ALTER TABLE public.approved_purchases ENABLE ROW LEVEL SECURITY;

-- Allow anyone to check if their email exists (read-only)
CREATE POLICY "Anyone can check purchase status"
ON public.approved_purchases
FOR SELECT
USING (true);