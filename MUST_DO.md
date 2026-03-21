# SitePulse — Must Do List

## ✅ Stripe Integration (DONE)
- [x] Set up Stripe account + products for Pro ($20), Pro Plus ($50), Agency ($100)
- [x] Build checkout flow (Get Pro page → Stripe Checkout → plan activation)
- [x] Webhook endpoint for `checkout.session.completed` → add credits + update plan
- [x] Webhook endpoint for `customer.subscription.deleted` → downgrade to free
- [x] Store `stripe_customer_id` on profiles table

## ✅ Register Stripe Webhook (DONE — March 19)
- [x] Stripe → Developers → Webhooks → Add endpoint
- [x] URL: production Vercel domain + `/api/stripe/webhook`
- [x] Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`, `customer.subscription.updated`
- [x] Webhook secret set in `.env.local` and Vercel

## 🔴 Test End-to-End Purchase
- [ ] Make a real $20 Pro purchase on production
- [ ] Verify webhook fires and credits are added to profile
- [ ] Verify referral bonus triggers if referred user
- [ ] Confirm plan label updates in sidebar and settings

## ✅ Referral System (DONE — March 19)
- [x] `referrals` table in Supabase with referrer_id, referred_id, status, credited_at
- [x] Unique referral code per user (auto-generated on signup)
- [x] Referral link: signup page accepts `?ref=CODE`, stores `referred_by` on profile
- [x] On `checkout.session.completed` webhook: credit referrer with +20/+10/+10
- [x] Only triggers on first successful payment (pending → credited)
- [x] Refer & Earn popup in sidebar with copy link
- [x] Referral section on Settings page with copy link
- [x] Domain hardcoded to `https://sitepulse.ai`

## ✅ Starter Tier Removal (DONE — March 19)
- [x] Run ALTER TABLE to update CHECK constraint (see SQL below)
- [x] Verify no existing users have plan='starter'

## ✅ Contact Form (DONE — March 19)
- [x] API route `/api/contact` sends email via Resend
- [x] Help page form wired to API

## ✅ Delete Account (DONE — March 19)
- [x] API route `/api/account/delete` with server-side Supabase admin call
- [x] Settings page wired to API

## ✅ Promo Code System (DONE — March 20)
- [x] `promo_codes` + `promo_redemptions` tables (SQL migration ready)
- [x] `/api/promo/generate` — admin-only, batch code generation
- [x] `/api/promo/redeem` — validates code, checks expiry/max uses/already redeemed, adds credits
- [x] User "Redeem Promo Code" card on Settings page
- [x] Admin "Generate Promo Codes" card on Settings page (admin-only)
- [ ] Run `supabase/promo-codes.sql` in Supabase SQL Editor

## 🟡 Post-Launch
- [ ] Update PRODUCT_ROADMAP_2026.md (outdated — still says SearchIQ, old pricing)
