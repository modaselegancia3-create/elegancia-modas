import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !key) {
  console.error('Faltam VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env')
}

export const supabase = createClient(url ?? 'http://localhost', key ?? 'sem-chave')
