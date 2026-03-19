import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Map Stripe price IDs to our plan names
export const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_PRO!]: 'pro',
  [process.env.STRIPE_PRICE_PRO_PLUS!]: 'pro_plus',
  [process.env.STRIPE_PRICE_AGENCY!]: 'agency',
}

// Map plan names to Stripe price IDs
export const PLAN_TO_PRICE: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_PRO!,
  pro_plus: process.env.STRIPE_PRICE_PRO_PLUS!,
  agency: process.env.STRIPE_PRICE_AGENCY!,
}
