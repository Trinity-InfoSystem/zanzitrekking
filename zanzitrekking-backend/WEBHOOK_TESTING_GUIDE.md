# Webhook Testing Guide

This guide explains how to test the payment confirmation webhook flow **without making a real payment**.

## Overview

The webhook system automatically:
1. Receives payment confirmation events from WeTravel/Svix
2. Updates order status to `confirmed`
3. Updates payment status to `completed`
4. Sends confirmation email to customer

## Test Endpoint

**URL**: `POST /api/webhooks/wetravel/test/webhook`

This endpoint simulates a webhook event without requiring a real payment.

## How to Test

### Step 1: Create a Test Order

First, create an order through the normal checkout flow. This will:
- Create an order in the database
- Generate a WeTravel payment link
- Store the order with `weTravelTripUuid` and `orderNumber`

**Note**: You don't need to complete the actual payment on WeTravel.

### Step 2: Get Order Information

You need either:
- The `orderNumber` (e.g., `ZT-20240115-0001`)
- OR the `weTravelTripUuid` from the order

You can find this in:
- Admin dashboard → Orders
- Customer dashboard → My Bookings
- Database: `orders` collection

### Step 3: Simulate Webhook Event

Use the test endpoint to simulate a payment completion:

#### Using cURL

```bash
curl -X POST https://api.zanzisafaris.com/api/webhooks/wetravel/test/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "ZT-20240115-0001",
    "status": "paid"
  }'
```

Or using `tripUuid`:

```bash
curl -X POST https://api.zanzisafaris.com/api/webhooks/wetravel/test/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "tripUuid": "abc123-def456-ghi789",
    "status": "paid"
  }'
```

#### Using Postman

1. Create a new POST request
2. URL: `https://api.zanzisafaris.com/api/webhooks/wetravel/test/webhook`
3. Headers: `Content-Type: application/json`
4. Body (JSON):
```json
{
  "orderNumber": "ZT-20240115-0001",
  "status": "paid"
}
```

### Step 4: Verify Results

After calling the test endpoint, check:

1. **Order Status Updated**:
   - Order status should be `confirmed`
   - Payment status should be `completed`
   - Check in admin dashboard or database

2. **Email Sent**:
   - Check customer's email inbox
   - Should receive payment confirmation email
   - Check email queue logs if email doesn't arrive

3. **Dashboard Updated**:
   - Admin dashboard should show updated order status
   - Customer dashboard should show confirmed booking

## Test Endpoint Response

### Success Response

```json
{
  "success": true,
  "message": "Webhook simulation completed",
  "webhookPayload": {
    "event": "payment.completed",
    "trip_uuid": "abc123-def456-ghi789",
    "trip_id": "ZT-20240115-0001",
    "status": "paid",
    "transaction_id": "test_txn_1234567890",
    "paid_at": "2024-01-15T10:30:00.000Z"
  },
  "webhookResponse": {
    "status": 200,
    "data": {
      "message": "Webhook processed successfully",
      "orderNumber": "ZT-20240115-0001",
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
  "orderNumber": "ZT-20240115-0001",
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

## Testing Different Payment Statuses

You can test different payment statuses by changing the `status` field:

```json
{
  "orderNumber": "ZT-20240115-0001",
  "status": "paid"        // Maps to "completed"
}
```

```json
{
  "orderNumber": "ZT-20240115-0001",
  "status": "failed"     // Maps to "failed"
}
```

```json
{
  "orderNumber": "ZT-20240115-0001",
  "status": "refunded"   // Maps to "refunded"
}
```

## Testing Email Sending

To test email sending separately:

**URL**: `POST /api/webhooks/wetravel/test/email/payment-confirmation`

```bash
curl -X POST https://api.zanzisafaris.com/api/webhooks/wetravel/test/email/payment-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID_HERE",
    "email": "customer@example.com"
  }'
```

## Troubleshooting

### Order Not Found
- Verify the order exists in the database
- Check that `orderNumber` or `tripUuid` is correct
- Ensure the order has a `weTravelTripUuid` set

### Email Not Sending
- Check email queue is running
- Verify email configuration in `.env`
- Check email logs for errors
- Verify customer email address is valid

### Status Not Updating
- Check webhook controller logs
- Verify order exists and has correct identifiers
- Check database connection
- Review webhook processing logs

## Production vs Testing

⚠️ **Important**: The test endpoint is for development/testing only. In production:
- Real webhooks come from WeTravel/Svix
- Webhook signatures are verified
- Test endpoints should be disabled or protected

## Next Steps

After testing:
1. Verify order status updates correctly
2. Confirm email is sent to customer
3. Check dashboard reflects changes
4. Test with different payment statuses
5. Verify duplicate prevention (calling webhook twice shouldn't cause issues)
