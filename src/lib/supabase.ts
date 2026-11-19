import { createClient } from '@supabase/supabase-js'

// Aceita a URL mesmo se vier com /rest/v1/ ou barra no final
const urlBruta = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '').trim()
const url = urlBruta.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')
const key = ((import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '').trim()

if (!url || !key) {
  console.error('Faltam VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente')
}

export const supabase = createClient(url || 'http://localhost', key || 'sem-chave')
