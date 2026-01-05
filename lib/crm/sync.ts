/**
 * CRM Sync Utility
 * 
 * This module handles syncing user data to your CRM system.
 * Currently supports webhook-based sync (you can extend for specific CRMs).
 */

interface CRMContact {
  email: string
  full_name?: string
  company_name?: string
  phone?: string
  technical_contact_email?: string
  monthly_revenue_goal?: number
  store_url?: string
  connected_at?: string
}

interface CRMWebhookPayload {
  event: 'user.created' | 'store.connected' | 'onboarding.completed'
  contact: CRMContact
  metadata?: Record<string, any>
}

/**
 * Sync user data to CRM via webhook
 * 
 * Set CRM_WEBHOOK_URL in environment variables to enable.
 * The webhook will receive POST requests with the contact data.
 */
export async function syncToCRM(
  event: CRMWebhookPayload['event'],
  contact: CRMContact,
  metadata?: Record<string, any>
): Promise<void> {
  const webhookUrl = process.env.CRM_WEBHOOK_URL

  if (!webhookUrl) {
    console.log('[CRM] Webhook URL not configured, skipping sync')
    return
  }

  const payload: CRMWebhookPayload = {
    event,
    contact,
    metadata,
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.CRM_WEBHOOK_SECRET
          ? `Bearer ${process.env.CRM_WEBHOOK_SECRET}`
          : '',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('[CRM] Webhook failed:', response.status, await response.text())
      return
    }

    console.log('[CRM] Successfully synced contact:', contact.email)
  } catch (error) {
    console.error('[CRM] Webhook error:', error)
    // Don't throw - CRM sync failures shouldn't break the app
  }
}

/**
 * Format contact data for CRM export
 */
export function formatContactForCRM(
  profile: {
    email: string
    full_name?: string | null
    company_name?: string | null
    phone?: string | null
    technical_contact_email?: string | null
    monthly_revenue_goal?: number | null
  },
  store?: {
    shop?: string | null
    connected_at?: string | null
  }
): CRMContact {
  return {
    email: profile.email,
    full_name: profile.full_name || undefined,
    company_name: profile.company_name || undefined,
    phone: profile.phone || undefined,
    technical_contact_email: profile.technical_contact_email || undefined,
    monthly_revenue_goal: profile.monthly_revenue_goal || undefined,
    store_url: store?.shop || undefined,
    connected_at: store?.connected_at || undefined,
  }
}

