# Vantege — Must Do List

## 🔴 Stripe Integration
- [x] Set up Stripe account + products for Pro ($20/mo), Pro Plus ($50/mo), Agency ($100/mo)
- [x] Build checkout flow (Get Pro page → Stripe Checkout → plan activation)
- [x] Webhook endpoint for `invoice.payment_succeeded` → update `profiles.plan` in Supabase
- [x] Webhook endpoint for `customer.subscription.deleted` → downgrade to free
- [x] Store `stripe_customer_id` and `stripe_subscription_id` on profiles table (columns already exist)

## 🔴 Register Stripe Webhook (TOMORROW — March 19)
- [ ] Go to Stripe → Developers → Webhooks → Add endpoint
- [ ] URL: `https://yourdomain.com/api/stripe/webhook` (use your actual Vercel domain)
- [ ] Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`, `customer.subscription.updated`
- [ ] Copy the `whsec_` signing secret from Stripe
- [ ] Replace `STRIPE_WEBHOOK_SECRET=whsec_PLACEHOLDER` in `.env.local` and Vercel with the real value
- [ ] Test a checkout flow end-to-end

## 🔴 Referral System (piggybacks on Stripe webhooks)
- [ ] `referrals` table in Supabase: referrer_id, referred_id, status (pending/paid), credited_at, period
- [ ] Generate unique referral code per user (show on Settings page)
- [ ] Referral link: signup page accepts `?ref=CODE` param, stores `referred_by` on profile
- [ ] On `invoice.payment_succeeded` webhook: check if new paying user has `referred_by` → credit referrer
- [ ] Bonus per paid referral: +20 Pro Audits, +10 Deep Scans, +10 Competitive Intel (added to current period)
- [ ] Bonuses stack unlimited, expire at end of billing period
- [ ] Only triggers on first successful payment (not renewals)
- [ ] Show referral stats on Settings page (total referrals, bonus credits earned)

## 🔴 Finish Starter Tier Removal
- [ ] Run ALTER TABLE in Supabase to update CHECK constraint (drop old, add new without 'starter')
- [ ] Verify no existing users have plan='starter' in DB

## 🟡 Post-Launch
- [ ] Update PRODUCT_ROADMAP_2026.md (outdated — still says SearchIQ, old pricing)
- [ ] Contact form on Help page needs a real backend (currently just sets state)
- [ ] Delete account on Settings page needs server-side admin call to actually remove the user
