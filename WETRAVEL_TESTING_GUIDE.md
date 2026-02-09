# WeTravel Testing Guide

## Current Status ✅

- ✅ Email working - Confirmations sent to customer email
- ✅ Payment links created successfully
- ✅ Webhook endpoint ready
- ✅ Order creation working

## Testing Options

### Option 1: Test with Demo/Sandbox API (Recommended for Testing)

WeTravel has a demo API that you can use for testing without affecting real payments.

**To enable demo mode:**

1. Update `.env` file:
   ```env
   WETRAVEL_USE_DEMO=true
   WETRAVEL_API_KEY=your_demo_api_key_here
   ```

2. Restart the Node.js application

3. Create test orders - they will use the demo WeTravel environment

**Note**: You'll need a demo API key from WeTravel. Check if your current key works with demo API or request a demo key from WeTravel support.

### Option 2: Test with Real Payments (Small Amounts)

Test with real payments using small amounts:

1. Create a test trip with a very low price (e.g., $1.00)
2. Create an order for this test trip
3. Complete payment on WeTravel
4. Verify webhook receives the event
5. Verify order status updates
6. Verify confirmation email sent

### Option 3: Test Webhook Manually

You can test the webhook endpoint directly without completing a payment:

```bash
# Test webhook with sample payload
curl -X POST https://api.zanzisafaris.com/api/webhooks/wetravel \
  -H "Content-Type: application/json" \
  -H "x-wetravel-signature: test_signature" \
  -d '{
    "event": "payment.completed",
    "trip_uuid": "9888814430",
    "trip_id": "ZT-20260209-0005",
    "status": "paid",
    "transaction_id": "test_txn_123",
    "paid_at": "2026-02-09T21:00:00Z"
  }'
```

## Step-by-Step Testing Process

### 1. Test Order Creation

```bash
# Create a test order via API
curl -X POST https://api.zanzisafaris.com/api/orders/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customerId": "YOUR_CUSTOMER_ID",
    "cartItems": [...],
    "personalInfo": {
      "firstName": "Test",
      "lastName": "User",
      "email": "test@example.com",
      "phone": "+1234567890"
    },
    "billingAddress": {...},
    "serviceFee": 0
  }'
```

**Verify:**
- ✅ Order created in database
- ✅ Payment link generated
- ✅ `weTravelTripUuid` stored in order

### 2. Test Payment Link

1. Open the payment link from the order
2. Verify it shows correct trip details
3. Verify amount matches order total
4. Verify customer email is pre-filled (if supported)

### 3. Test Payment Completion

**Option A: Complete Real Payment**
1. Complete payment on WeTravel
2. Check server logs for webhook event
3. Verify order status updated to "confirmed"
4. Verify payment status updated to "completed"
5. Verify confirmation email sent

**Option B: Simulate Webhook (Manual Test)**
Use the curl command above to simulate a payment completion webhook.

### 4. Test Webhook Processing

After payment completes (or webhook is sent):

**Check Logs:**
```bash
# Look for webhook logs
grep "Webhook" /path/to/logs/app.log
```

**Expected Log Output:**
```
[Webhook] 📥 Received WeTravel webhook event
[Webhook] Processing event: payment.completed
[Webhook] ✅ Found order: ZT-20260209-0005
[Webhook] ✅ Updated order - Payment status: completed
[Webhook] ✅ Payment confirmation email queued
```

**Verify Database:**
- Order `payment.status` = "completed"
- Order `orderStatus` = "confirmed"
- Order `payment.paymentDate` is set
- Order `confirmedAt` is set

### 5. Test Email Delivery

1. Check email queue logs
2. Verify email sent to customer email (not info@zanzisafaris.com)
3. Verify email contains correct order details
4. Verify QR code attached (if applicable)

## Test Checklist

### Order Creation
- [ ] Order created successfully
- [ ] Payment link generated
- [ ] WeTravel trip UUID stored
- [ ] Order total matches frontend total (including service fee = 0)

### Payment Link
- [ ] Link accessible
- [ ] Shows correct trip details
- [ ] Shows correct amount
- [ ] Customer can access and pay

### Payment Completion
- [ ] Payment completed on WeTravel
- [ ] Webhook received by server
- [ ] Order status updated to "confirmed"
- [ ] Payment status updated to "completed"
- [ ] Cart items status updated to "confirmed"

### Email Notifications
- [ ] Confirmation email sent to customer email
- [ ] Email contains correct order details
- [ ] Email contains QR code (if applicable)
- [ ] Email sent from correct sender

### Webhook Reliability
- [ ] Webhook signature verified (if configured)
- [ ] Duplicate processing prevented
- [ ] Error handling works correctly
- [ ] Logs show all events

## Testing with ngrok (Local Testing)

If you want to test webhooks locally:

1. **Install ngrok**: `npm install -g ngrok`
2. **Start local server**: `npm start`
3. **Expose with ngrok**: `ngrok http 5000`
4. **Update WeTravel webhook URL**: Use ngrok URL in WeTravel dashboard
5. **Test**: Complete payment and watch webhook events

## Common Test Scenarios

### Scenario 1: Single Trip Booking
- Create order for 1 trip
- Complete payment
- Verify all statuses update
- Verify email sent

### Scenario 2: Multiple Trips Booking
- Create order for multiple trips
- Complete payment
- Verify all trips confirmed
- Verify email contains all trips

### Scenario 3: Payment Failure
- Start payment
- Cancel or fail payment
- Verify order stays "pending"
- Verify no confirmation email sent

### Scenario 4: Duplicate Webhook
- Complete payment
- Manually trigger webhook again
- Verify duplicate processing prevented
- Verify order not updated twice

## Monitoring During Tests

### Watch Server Logs
```bash
# Real-time log monitoring
tail -f /path/to/logs/app.log | grep -E "Webhook|WeTravel|Order"
```

### Check Database
```javascript
// MongoDB query to check order status
db.orders.findOne({ orderNumber: "ZT-20260209-0005" })
```

### Check Email Queue
```bash
# Check email queue status
# (depends on your email queue implementation)
```

## Troubleshooting Test Issues

### Webhook Not Received
1. Check webhook URL is correct in WeTravel dashboard
2. Verify server is accessible from internet
3. Check firewall/security settings
4. Verify webhook secret matches (if configured)

### Order Not Updating
1. Check webhook logs for errors
2. Verify order exists in database
3. Check if webhook payload matches expected format
4. Verify order identifier (UUID, order number) matches

### Email Not Sending
1. Check email queue is running
2. Verify customer email is valid
3. Check email service configuration
4. Review email queue logs

## Next Steps After Testing

Once testing is complete:

1. ✅ Verify all test scenarios pass
2. ✅ Document any issues found
3. ✅ Fix any remaining issues
4. ✅ Deploy to production
5. ✅ Monitor first real payments
6. ✅ Set up alerts for webhook failures

---

**Last Updated**: February 2026
**Status**: Ready for testing
