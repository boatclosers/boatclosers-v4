import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xoihnmkgncuocikmgs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvaWhubWtnbmN1b2N4aWtudmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTAwNzgsImV4cCI6MjA5NjUyNjA3OH0.NQBD6pAMHkz-PMtd7sKzOeiWUDfL4MnNJU6AThQAL64'
)

export async function signUp(email: string, password: string, fullName: string, role: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } }
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch { return null }
}

export async function createDeal(userId: string, role: string, vessel: any, parties: any) {
  try {
    const { data, error } = await supabase
      .from('deals')
      .insert({
        initiator_id: userId,
        initiator_role: role,
        vessel,
        parties,
        negotiate: {},
        dd_data: {},
        docs_data: {},
        status: 'active',
        paid: false
      })
      .select()
      .single()
    if (error) throw error
    return data
  } catch { return { id: 'local-' + Date.now() } }
}

export async function saveDeal(dealId: string, updates: any) {
  if (dealId.startsWith('local-')) return
  try {
    await supabase.from('deals').update(updates).eq('id', dealId)
  } catch {}
}

export async function loadDeal(userId: string) {
  try {
    const { data } = await supabase
      .from('deals')
      .select('*')
      .eq('initiator_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    return data
  } catch { return null }
}
