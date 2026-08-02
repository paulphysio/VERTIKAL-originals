import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_EMAIL = 'VERTIKAL Originals <noreply@vertikaloriginals.com>'

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

export { resend }
