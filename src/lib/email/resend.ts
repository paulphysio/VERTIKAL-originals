import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_EMAIL = 'VERTIKAL Originals <noreply@vertikaloriginals.com>'

export { resend }
