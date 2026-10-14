import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
// Supabase persists and refreshes its own session; passwords are never stored.
export const supabase = url && key ? createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
}) : null

export async function signIn(email, password) {
  if (!supabase) throw new Error('auth_not_configured')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  if (!data?.session || !data?.user) throw new Error('session_missing')
  return data
}

export async function ensureProfile(user) {
  const { data, error } = await supabase.from('profiles').select('id, name, avatar_seed, created_at, role').eq('id', user.id).maybeSingle()
  if (error) throw error
  if (data) return data
  const name = String(user.user_metadata?.name || '').trim()
  if (!name || name.length > 60) throw new Error('profile_name_missing')
  const { error: insertError } = await supabase.from('profiles').insert({ id: user.id, name })
  // Another tab/request may have completed the same insert.
  if (insertError && insertError.code !== '23505') throw insertError
  const { data: profile, error: fetchError } = await supabase.from('profiles').select('id, name, avatar_seed, created_at, role').eq('id', user.id).single()
  if (fetchError) throw fetchError
  return profile
}

export async function updateProfile(userId, values) {
  const name = String(values.name || '').trim()
  if (!name || name.length > 60) throw new Error('profile_name_invalid')
  if (!Number.isInteger(values.avatar_seed) || values.avatar_seed < 0 || values.avatar_seed > 2147483647) throw new Error('avatar_seed_invalid')
  const { data, error } = await supabase.from('profiles')
    .update({ name, avatar_seed: values.avatar_seed }).eq('id', userId)
    .select('id, name, avatar_seed, created_at, role').single()
  if (error) throw error
  return data
}

export function authErrorMessage(error) {
  if (error?.code === 'invalid_credentials') return '이메일 또는 비밀번호를 확인해 주세요.'
  if (error?.code === 'email_not_confirmed') return '이메일 인증을 마친 뒤 로그인해 주세요.'
  if (error?.code === 'user_already_exists') return '가입 요청을 확인할 수 없습니다. 로그인 또는 이메일 인증을 확인해 주세요.'
  if (error?.code === 'weak_password') return '비밀번호가 서버 보안 규칙에 맞지 않습니다. 더 강한 비밀번호를 사용해 주세요.'
  if (error?.status === 429) return '요청이 많습니다. 잠시 후 다시 시도해 주세요.'
  return '요청을 처리하지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.'
}
