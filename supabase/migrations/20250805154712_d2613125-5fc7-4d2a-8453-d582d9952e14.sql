-- Create movers table for moving companies
CREATE TABLE public.movers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  license_number TEXT,
  service_areas TEXT[] DEFAULT '{}',
  description TEXT,
  hourly_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on movers table
ALTER TABLE public.movers ENABLE ROW LEVEL SECURITY;

-- Create policies for movers table
CREATE POLICY "Movers can view their own profile" 
ON public.movers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Movers can insert their own profile" 
ON public.movers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Movers can update their own profile" 
ON public.movers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create quote_responses table for mover responses to quotes
CREATE TABLE public.quote_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL,
  mover_id UUID NOT NULL,
  quoted_price NUMERIC NOT NULL,
  estimated_duration TEXT,
  response_message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(quote_id, mover_id)
);

-- Enable RLS on quote_responses table
ALTER TABLE public.quote_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for quote_responses table
CREATE POLICY "Movers can view their own responses" 
ON public.quote_responses 
FOR SELECT 
USING (mover_id IN (SELECT id FROM public.movers WHERE user_id = auth.uid()));

CREATE POLICY "Movers can insert their own responses" 
ON public.quote_responses 
FOR INSERT 
WITH CHECK (mover_id IN (SELECT id FROM public.movers WHERE user_id = auth.uid()));

CREATE POLICY "Movers can update their own responses" 
ON public.quote_responses 
FOR UPDATE 
USING (mover_id IN (SELECT id FROM public.movers WHERE user_id = auth.uid()));

-- Create policies for quotes table to allow movers to view all quotes
CREATE POLICY "Movers can view all quotes" 
ON public.quotes 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.movers WHERE user_id = auth.uid()));

-- Add trigger for movers updated_at
CREATE TRIGGER update_movers_updated_at
BEFORE UPDATE ON public.movers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for quote_responses updated_at
CREATE TRIGGER update_quote_responses_updated_at
BEFORE UPDATE ON public.quote_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();