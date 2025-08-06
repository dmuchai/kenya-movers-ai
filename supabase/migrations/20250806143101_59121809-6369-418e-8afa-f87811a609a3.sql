-- Enable realtime for quotes and quote_responses tables
ALTER TABLE public.quotes REPLICA IDENTITY FULL;
ALTER TABLE public.quote_responses REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quote_responses;