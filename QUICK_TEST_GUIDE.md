# Quick Testing Guide - WeTravel Payment Flow

## ✅ Current Status
- Email working correctly ✅
- Payment links created ✅
- Webhook endpoint ready ✅

## Quick Test Methods

### Method 1: Test with Small Real Payment (Recommended)

1. **Create a test trip** in your dashboard with a very low price (e.g., $1.00 or $5.00)

2. **Create an order** through your frontend for this test trip

3. **Complete payment** on WeTravel (use a test card if available)

4. **Verify**:
   - ✅ Webhook received (check logs)
   - ✅ Order status updated to "confirmed"
   - ✅ Payment status updated to "completed"
   - ✅ Email sent to customer email

### Method 2: Simulate Webhook (No Payment Needed)

Test the webhook processing without completing a real payment:

```bash
# Use an existing order (like ZT-20260209-0005)
curl -X POST https://api.zanzisafaris.com/api/webhooks/wetravel/test/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "ZT-20260209-0005",
    "status": "paid"
  }'
```

This will:
- Find the order
- Simulate a payment completion webhook
- Update order status
- Send confirmation email

### Method 3: Test Order Creation

Test payment link generation:

```bash
curl -X POST https://api.zanzisafaris.com/api/webhooks/wetravel/test/order \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "YOUR_CUSTOMER_ID",
    "tripId": "YOUR_TRIP_ID",
    "amount": 1.0
  }'
```

## Testing Checklist

### Before Testing
- [ ] Backend deployed with latest code
- [ ] WeTravel API key configured correctly
- [ ] Webhook endpoint accessible
- [ ] Email service configured

### During Testing
- [ ] Create test order
- [ ] Verify payment link generated
- [ ] Complete payment (or simulate webhook)
- [ ] Check server logs for webhook event
- [ ] Verify order status updated
- [ ] Verify email sent to correct address

### After Testing
- [ ] Review all logs
- [ ] Verify database records
- [ ] Check email delivery
- [ ] Document any issues

## Monitor Logs

Watch for these log messages:

```
✅ [Webhook] 📥 Received WeTravel webhook event
✅ [Webhook] ✅ Found order: ZT-20260209-XXXX
✅ [Webhook] ✅ Updated order - Payment status: completed
✅ [Webhook] ✅ Payment confirmation email queued
```

## Test with Existing Order

You can test with your existing order `ZT-20260209-0005`:

1. **Simulate webhook**:
   ```bash
   curl -X POST https://api.zanzisafaris.com/api/webhooks/wetravel/test/webhook \
     -H "Content-Type: application/json" \
     -d '{
       "tripUuid": "9888814430",
       "status": "paid"
     }'
   ```

2. **Check order status** in dashboard - should be "confirmed"

3. **Check email** - should receive confirmation at `ali.aoua.eng@gmail.com`

---

**Ready to test!** 🚀
