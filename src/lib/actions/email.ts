'use server'

import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import {
  orderConfirmationTemplate,
  orderStatusUpdateTemplate,
  newOrderNotificationTemplate,
  welcomeEmailTemplate,
} from '@/lib/email/templates'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_EMAIL = 'VERTIKAL Originals <support@vertikaloriginals.com>'

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

export async function sendOrderConfirmation(
  customerEmail: string,
  customerName: string,
  orderId: string,
  total: string
) {
  if (!resend) {
    console.warn('Resend API key not configured, skipping order confirmation email')
    return
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Order #${orderId.toUpperCase()} Confirmed`,
      html: orderConfirmationTemplate(customerName, orderId, total),
    })
  } catch (error) {
    console.error('Failed to send order confirmation email:', error)
  }
}

export async function sendOrderStatusUpdate(
  customerEmail: string,
  customerName: string,
  orderId: string,
  status: string
) {
  console.log('sendOrderStatusUpdate called:', { customerEmail, customerName, orderId, status })
  
  if (!resend) {
    console.warn('Resend API key not configured, skipping order status update email')
    return
  }

  try {
    console.log('Sending email via Resend...')
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Update for Order #${orderId.toUpperCase()}`,
      html: orderStatusUpdateTemplate(customerName, orderId, status),
    })
    console.log('Email sent successfully:', result)
  } catch (error) {
    console.error('Failed to send order status update email:', error)
  }
}

export async function sendNewOrderNotification(
  orderId: string,
  customerName: string,
  customerEmail: string,
  total: string
) {
  if (!resend) {
    console.warn('Resend API key not configured, skipping new order notification email')
    return
  }

  try {
    const adminEmails = await getAdminEmails()
    
    if (adminEmails.length === 0) {
      console.warn('No admin emails found, skipping notification')
      return
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `New Order #${orderId.toUpperCase()}`,
      html: newOrderNotificationTemplate(orderId, customerName, customerEmail, total),
    })
  } catch (error) {
    console.error('Failed to send new order notification email:', error)
  }
}

export async function sendWelcomeEmail(customerEmail: string, customerName: string) {
  if (!resend) {
    console.warn('Resend API key not configured, skipping welcome email')
    return
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: 'WELCOME TO VERTIKAL ORIGINALS',
      html: welcomeEmailTemplate(customerName),
    })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}
