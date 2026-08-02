import { resend, FROM_EMAIL, getAdminEmails } from './resend'
import {
  orderConfirmationTemplate,
  orderStatusUpdateTemplate,
  newOrderNotificationTemplate,
  welcomeEmailTemplate,
} from './templates'

export async function sendOrderConfirmation(
  customerEmail: string,
  customerName: string,
  orderId: string,
  total: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `ORDER CONFIRMED - #${orderId.toUpperCase()}`,
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
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `ORDER UPDATE - #${orderId.toUpperCase()}`,
      html: orderStatusUpdateTemplate(customerName, orderId, status),
    })
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
  try {
    const adminEmails = await getAdminEmails()
    
    if (adminEmails.length === 0) {
      console.warn('No admin emails found, skipping notification')
      return
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `NEW ORDER - #${orderId.toUpperCase()}`,
      html: newOrderNotificationTemplate(orderId, customerName, customerEmail, total),
    })
  } catch (error) {
    console.error('Failed to send new order notification email:', error)
  }
}

export async function sendWelcomeEmail(customerEmail: string, customerName: string) {
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
