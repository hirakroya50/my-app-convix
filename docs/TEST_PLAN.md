# Production Test Plan

This checklist is for validating the coffee ordering app before production deploy.

## 1. Environments

- Local dev: `NEXT_PUBLIC_APP_URL=http://localhost:3001`
- Staging: separate Convex deployment and Stripe test keys
- Production: separate Convex deployment and Stripe live keys

Always keep environments isolated (keys, webhook endpoints, Convex deployments).

## 2. Pre-Deploy Smoke Tests

Run these on every commit:

```bash
npm run lint
npm run test:e2e
```

Run locally with headed browser during debugging:

```bash
npm run test:e2e:headed
```

## 3. Critical End-to-End Flows

### Chat and ordering

- User opens chat and sees menu
- User asks to place an order
- Pending order is created in Convex
- Stripe payment URL is generated and shown

### Payment success

- Stripe checkout completes successfully
- User is redirected to `/payment/success?orderId=...`
- Order status changes from `pending` to `paid`
- Menu item quantity is decremented correctly
- Confirmation message appears in chat history

### Payment cancellation

- Cancel from Stripe checkout
- User returns to app with cancel state
- Order remains `pending`
- No stock decrement occurs

## 4. Stripe Webhook Validation

Use Stripe CLI in local/staging:

```bash
stripe login
stripe listen --forward-to localhost:3001/api/webhook/stripe
```

Copy `whsec_...` into `STRIPE_WEBHOOK_SECRET` and restart app.

Verify in Stripe dashboard:

- Endpoint responds with 2xx
- `checkout.session.completed` deliveries are successful
- No repeated failures in webhook logs

## 5. Data Integrity Checks

After each paid order, validate:

- Exactly one order exists for the purchase
- Order `status` is `paid`
- Each ordered menu item stock reduced by ordered quantity
- Stock never becomes negative
- One confirmation message is added to chat

## 6. Idempotency and Race Conditions

Test both paths around the same order:

- Success page processing
- Webhook processing

Expected:

- No double stock decrement
- No duplicate paid transitions
- No duplicate confirmation side effects

## 7. Production Readiness Gate

Go live only when all are true:

- All E2E smoke tests pass
- Manual critical flows pass in staging
- Webhook delivery success rate is stable
- No pending successful payments in staging test runs
- Error logs reviewed for payment/order flows
