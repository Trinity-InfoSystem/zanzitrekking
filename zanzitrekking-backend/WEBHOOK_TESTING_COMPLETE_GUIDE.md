# Complete Webhook Testing Guide

This guide provides comprehensive instructions for testing the WeTravel webhook integration to ensure payment confirmations work correctly.

## Overview

The webhook system automatically:
1. Receives payment confirmation events from WeTravel/Svix
2. Updates payment status: `pending` → `completed`
3. Updates order status: `pending` → `confirmed`
4. Sends confirmation email to customer
5. Generates QR code for booking

## Prerequisites

Before testing, ensure:
- ✅ Backend is deployed and running
- ✅ Webhook endpoint is accessible: `https://api.zanzisafaris.com/api/webhooks/wetravel`
- ✅ `WETRAVEL_WEBHOOK_SECRET` is configured in `.env`
- ✅ Email queue is running
- ✅ Database connection is working
- ✅ At least one order exists with a WeTravel payment link

---

## Method 1: Test Endpoint (Recommended for Testing)

### Step 1: Create a Test Order

1. Go through the normal checkout flow
2. Create an order (don't complete payment on WeTravel)
3. Note the `orderNumber` (e.g., `ZT-20260210-0021`)

**Important**: The order must have:
- `payment.weTravelPaymentLink` (payment link exists)
- `payment.weTravelTripUuid` (trip UUID stored)
- Payment status: `pending` or `processing`

### Step 2: Get Order Information

You can find the order in:
- Admin dashboard → Payments
- Customer dashboard → My Bookings
- Database: `orders` collection

**Required information**:
- `orderNumber` (e.g., `ZT-20260210-0021`)
- OR `weTravelTripUuid` (from order's payment object)

### Step 3: Simulate Webhook Event

Use the test endpoint to simulate a payment completion:

#### Using cURL

```bash
curl -X POST https://api.zanzisafaris.com/api/webhooks/wetravel/test/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "ZT-20260210-0021",
    "status": "paid"
  }'
```

#### Using Postman

1. **Method**: POST
2. **URL**: `https://api.zanzisafaris.com/api/webhooks/wetravel/test/webhook`
3. **Headers**: 
   - `Content-Type: application/json`
4. **Body** (JSON):
```json
{
  "orderNumber": "ZT-20260210-0021",
  "status": "paid"
}
```

#### Using `tripUuid` (Alternative)

If you have the trip UUID instead:

```bash
curl -X POST https://api.zanzisafaris.com/api/webhooks/wetravel/test/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "tripUuid": "8613494794",
    "status": "paid"
  }'
```

### Step 4: Verify Results

After calling the test endpoint, check:

#### ✅ Order Status Updated

**Check in Admin Dashboard**:
1. Go to Payments dashboard
2. Find the order by order number
3. Verify:
   - Payment status: `completed` ✅
   - Order status: `confirmed` ✅

**Check in Database**:
```javascript
// MongoDB query
db.orders.findOne({ orderNumber: "ZT-20260210-0021" })

// Should show:
// payment.status: "completed"
// orderStatus: "confirmed"
// payment.paymentDate: [date]
```

#### ✅ Email Sent

**Check Customer Email**:
- Customer should receive payment confirmation email
- Email includes:
  - Booking details
  - QR code (embedded and attached)
  - Trip information
  - Contact information

**Check Email Queue Logs**:
- Look for email queue processing logs
- Verify email was queued and sent

**Check Email Tracking**:
```javascript
// MongoDB query
db.orders.findOne({ orderNumber: "ZT-20260210-0021" })

// Should show:
// emailNotifications.paymentConfirmation: true
```

#### ✅ Dashboard Updated

**Admin Dashboard**:
- Order should appear with "completed" payment status
- Order should appear with "confirmed" order status
- Dashboard auto-refreshes every 30 seconds

**Customer Dashboard**:
- Customer should see confirmed booking
- QR code should be visible (if viewing order details)

---

## Method 2: Real Webhook Test (Production Testing)

### Step 1: Configure Webhook in Svix/WeTravel

1. Log into Svix dashboard
2. Navigate to your webhook endpoint
3. Verify endpoint URL: `https://api.zanzisafaris.com/api/webhooks/wetravel`
4. Verify webhook secret is configured

### Step 2: Create a Real Order

1. Go through checkout flow
2. Create order with WeTravel payment link
3. Note the order number

### Step 3: Complete Payment on WeTravel

1. Click the WeTravel payment link
2. Complete the payment on WeTravel
3. Wait for webhook to be triggered (usually within seconds)

### Step 4: Monitor Webhook Delivery

**In Svix Dashboard**:
1. Go to your webhook endpoint
2. Check "Message Attempts" section
3. Look for recent webhook events
4. Verify delivery status (should be "Succeeded")

**In Server Logs**:
Look for webhook processing logs:
```
[Webhook] 📥 Received WeTravel webhook event
[Webhook] ✅ Webhook signature verified successfully
[Webhook] ✅ Found order: ZT-20260210-0021
[Webhook] ✅ Updated order ZT-20260210-0021
[Email] ✅ Payment confirmation email queued
```

### Step 5: Verify Results

Same as Method 1, Step 4:
- ✅ Order status updated
- ✅ Email sent
- ✅ Dashboard updated

---

## Method 3: Health Check

Test if the webhook endpoint is accessible:

```bash
curl https://api.zanzisafaris.com/api/webhooks/wetravel/health
```

**Expected Response**:
```json
{
  "message": "WeTravel webhook endpoint is active",
  "timestamp": "2026-02-10T20:37:30.299Z"
}
```

---

## Testing Different Payment Statuses

You can test different payment statuses using the test endpoint:

### Test Successful Payment

```bash
curl -X POST https://api.zanzisafaris.com/api/webhooks/wetravel/test/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "ZT-20260210-0021",
    "status": "paid"
  }'
```

**Result**: Payment → `completed`, Order → `confirmed`, Email sent

### Test Failed Payment

```bash
curl -X POST https://api.zanzisafaris.com/api/webhooks/wetravel/test/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "ZT-20260210-0021",
    "status": "failed"
  }'
```

**Result**: Payment → `failed`, Order stays `pending`, No email

### Test Refund (Manual Only)

Refunds are not handled by webhooks. Use the dashboard "Process Refund" button instead.

---

## Expected Test Endpoint Response

### Success Response

```json
{
  "success": true,
  "message": "Webhook simulation completed",
  "webhookPayload": {
    "event": "payment.completed",
    "trip_uuid": "8613494794",
    "trip_id": "ZT-20260210-0021",
    "status": "paid",
    "transaction_id": "test_txn_1770755850299",
    "paid_at": "2026-02-10T20:37:30.299Z"
  },
  "webhookResponse": {
    "status": 200,
    "data": {
      "message": "Webhook processed successfully",
      "orderNumber": "ZT-20260210-0021",
      "paymentStatus": "completed",
      "orderStatus": "confirmed"
    }
  },
  "orderBefore": {
    "paymentStatus": "pending",
    "orderStatus": "pending"
  },
  "note": "Check the order in database to verify status was updated"
}
```

### Error Responses

**Order Not Found (404)**:
```json
{
  "success": false,
  "error": "Order not found",
  "orderNumber": "ZT-20260210-0021",
  "tripUuid": null
}
```

**Missing Parameters (400)**:
```json
{
  "success": false,
  "error": "orderNumber or tripUuid is required"
}
```

---

## Verification Checklist

After testing, verify:

- [ ] **Webhook Endpoint Accessible**
  - Health check returns success
  - Endpoint is reachable from internet

- [ ] **Order Status Updated**
  - Payment status: `pending` → `completed`
  - Order status: `pending` → `confirmed`
  - Payment date is set

- [ ] **Email Sent**
  - Customer received confirmation email
  - Email includes QR code
  - Email includes booking details

- [ ] **Dashboard Updated**
  - Admin dashboard shows updated status
  - Customer dashboard shows confirmed booking
  - Auto-refresh working (updates every 30 seconds)

- [ ] **QR Code Generated**
  - QR code visible in order details
  - QR code can be scanned
  - QR code contains order number

- [ ] **No Duplicate Processing**
  - Calling webhook twice doesn't cause issues
  - Order status doesn't change if already completed

---

## Troubleshooting

### Webhook Not Receiving Events

**Check**:
1. Webhook endpoint URL is correct in Svix/WeTravel
2. Endpoint is publicly accessible (not behind firewall)
3. SSL certificate is valid
4. Server is running

**Test**:
```bash
curl https://api.zanzisafaris.com/api/webhooks/wetravel/health
```

### Order Not Found

**Check**:
1. Order exists in database
2. Order has `weTravelTripUuid` set
3. Order number matches exactly (case-sensitive)
4. Order has payment link (not cancelled before payment link creation)

**Verify**:
```javascript
// MongoDB query
db.orders.findOne({ 
  orderNumber: "ZT-20260210-0021",
  "payment.weTravelPaymentLink": { $exists: true }
})
```

### Email Not Sending

**Check**:
1. Email queue is running
2. Email configuration in `.env` is correct
3. Customer email address is valid
4. Email logs for errors

**Test Email Separately**:
```bash
curl -X POST https://api.zanzisafaris.com/api/webhooks/wetravel/test/email/payment-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID_HERE",
    "email": "customer@example.com"
  }'
```

### Status Not Updating

**Check**:
1. Webhook is processing (check logs)
2. Order exists and has correct identifiers
3. Database connection is working
4. No errors in webhook processing

**Review Logs**:
Look for:
- `[Webhook] 📥 Received WeTravel webhook event`
- `[Webhook] ✅ Found order`
- `[Webhook] ✅ Updated order`
- `[Email] ✅ Payment confirmation email queued`

### Signature Verification Failing

**Check**:
1. `WETRAVEL_WEBHOOK_SECRET` is set correctly
2. Secret matches Svix dashboard
3. Raw body is being used for signature verification
4. Signature format is correct (Svix uses `svix-signature` header)

**Note**: In development, signature verification may be skipped if secret is not configured.

---

## Testing Workflow Summary

### Quick Test (5 minutes)

1. Create order through checkout
2. Get order number
3. Call test endpoint:
   ```bash
   curl -X POST https://api.zanzisafaris.com/api/webhooks/wetravel/test/webhook \
     -H "Content-Type: application/json" \
     -d '{"orderNumber": "YOUR_ORDER_NUMBER", "status": "paid"}'
   ```
4. Check dashboard - order should be confirmed
5. Check customer email - confirmation should be received

### Full Test (15 minutes)

1. Create order through checkout
2. Complete actual payment on WeTravel
3. Monitor Svix dashboard for webhook delivery
4. Check server logs for webhook processing
5. Verify order status updated in dashboard
6. Verify email received by customer
7. Verify QR code generated
8. Test duplicate prevention (call webhook twice)

---

## Production Checklist

Before going live, ensure:

- [ ] Webhook endpoint is publicly accessible
- [ ] `WETRAVEL_WEBHOOK_SECRET` is configured
- [ ] Webhook signature verification is enabled
- [ ] Email queue is running
- [ ] Dashboard auto-refresh is working
- [ ] Test endpoint works correctly
- [ ] Real webhook test completed successfully
- [ ] Email notifications are being sent
- [ ] Order status updates are working
- [ ] QR codes are being generated

---

## Support

If webhook testing fails:

1. Check server logs for detailed error messages
2. Verify webhook endpoint accessibility
3. Test with test endpoint first
4. Check database for order existence
5. Verify email configuration
6. Review webhook signature verification

For issues, check:
- Server logs: `[Webhook]` and `[Email]` prefixes
- Svix dashboard: Message attempts and delivery status
- Database: Order status and email notification flags
