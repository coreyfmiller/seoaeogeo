import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Map Stripe price IDs to our plan names
export const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_LAUNCH!]: 'launch',
  [process.env.STRIPE_PRICE_GROWTH!]: 'growth',
  [process.env.STRIPE_PRICE_AUTHORITY!]: 'authority',
}

// Map plan names to Stripe price IDs
export const PLAN_TO_PRICE: Record<string, string> = {
  launch: process.env.STRIPE_PRICE_LAUNCH!,
  growth: process.env.STRIPE_PRICE_GROWTH!,
  authority: process.env.STRIPE_PRICE_AUTHORITY!,
}
