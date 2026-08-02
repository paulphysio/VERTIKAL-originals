import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export const FROM_EMAIL = 'VERTIKAL Originals <noreply@vertikaloriginals.com>'

export { resend }
