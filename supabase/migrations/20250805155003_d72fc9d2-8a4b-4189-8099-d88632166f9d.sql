-- Add foreign key constraint for quote_responses to quotes
ALTER TABLE public.quote_responses 
ADD CONSTRAINT fk_quote_responses_quote_id 
FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;

-- Add foreign key constraint for quote_responses to movers
ALTER TABLE public.quote_responses 
ADD CONSTRAINT fk_quote_responses_mover_id 
FOREIGN KEY (mover_id) REFERENCES public.movers(id) ON DELETE CASCADE;