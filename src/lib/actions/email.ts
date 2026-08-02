'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAdminEmails() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('role', 'admin')

  if (error || !data) {
    console.error('Error fetching admin emails:', error)
    return []
  }

  return data.map((profile) => profile.email).filter(Boolean)
}
