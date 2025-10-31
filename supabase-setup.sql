-- ============================================
-- SISTEMA DE QUOTES PARA PACIENTES
-- ============================================

-- 1. TABLA: Solicitudes de presupuesto (Quote Requests)
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_email TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  service_type TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: Ofertas de especialistas (Quotes)
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  specialist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  specialist_email TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  estimated_time TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ÍNDICES para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_quote_requests_patient ON public.quote_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_quotes_request ON public.quotes(request_id);
CREATE INDEX IF NOT EXISTS idx_quotes_specialist ON public.quotes(specialist_id);

-- 4. ROW LEVEL SECURITY
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS para quote_requests
DROP POLICY IF EXISTS "Users can view own quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Users can create quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Specialists can view all requests" ON public.quote_requests;

CREATE POLICY "Users can view own quote requests"
  ON public.quote_requests
  FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can create quote requests"
  ON public.quote_requests
  FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Specialists can view all requests"
  ON public.quote_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (raw_user_meta_data->>'role' = 'especialista' 
           OR raw_user_meta_data->>'role' = 'specialist'
           OR raw_user_meta_data->>'role' = 'admin')
    )
  );

-- 6. POLÍTICAS para quotes
DROP POLICY IF EXISTS "Specialists can create quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can view quotes for their requests" ON public.quotes;
DROP POLICY IF EXISTS "Specialists can view own quotes" ON public.quotes;

CREATE POLICY "Specialists can create quotes"
  ON public.quotes
  FOR INSERT
  WITH CHECK (
    auth.uid() = specialist_id AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (raw_user_meta_data->>'role' = 'especialista' 
           OR raw_user_meta_data->>'role' = 'specialist')
    )
  );

CREATE POLICY "Users can view quotes for their requests"
  ON public.quotes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quote_requests
      WHERE id = quotes.request_id
      AND patient_id = auth.uid()
    )
  );

CREATE POLICY "Specialists can view own quotes"
  ON public.quotes
  FOR SELECT
  USING (auth.uid() = specialist_id);

-- 7. FUNCIÓN para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. TRIGGERS para updated_at
DROP TRIGGER IF EXISTS update_quote_requests_updated_at ON public.quote_requests;
CREATE TRIGGER update_quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotes_updated_at ON public.quotes;
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ✅ VERIFICACIÓN
SELECT 'Tablas creadas correctamente' AS status;

