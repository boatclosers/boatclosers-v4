import { supabase } from '@/lib/supabase'
export async function signUp(email: string, password: string, fullName: string, role: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role }
    }
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function createDeal(userId: string, role: string, vessel: any, parties: any) {
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
}

export async function saveDeal(dealId: string, updates: {
  vessel?: any
  parties?: any
  negotiate?: any
  dd_data?: any
  docs_data?: any
  status?: string
  paid?: boolean
}) {
  const { data, error } = await supabase
    .from('deals')
    .update(updates)
    .eq('id', dealId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function loadDeal(userId: string) {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('initiator_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return data
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}
