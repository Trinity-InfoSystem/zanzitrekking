# WeTravel Webhook Implementation Guide

## Overview

This document describes the WeTravel webhook integration for automated payment confirmation and booking updates.

## Features

- ✅ **Automatic Payment Confirmation**: Receives webhook events when payments are completed
- ✅ **Order Status Updates**: Automatically updates order and booking status
- ✅ **Email Notifications**: Sends confirmation emails to customers
- ✅ **Signature Verification**: Validates webhook authenticity (when configured)
- ✅ **Duplicate Prevention**: Prevents processing the same payment twice
- ✅ **Flexible Payload Handling**: Supports multiple webhook payload formats

## Webhook Endpoint

**URL**: `POST /api/webhooks/wetravel`

**Health Check**: `GET /api/webhooks/wetravel/health`

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env` file:

```env
# WeTravel API Configuration
WETRAVEL_API_KEY=your_refresh_token_here
WETRAVEL_WEBHOOK_SECRET=your_webhook_secret_here  # Optional but recommended

# Use demo API (set to "true" for testing, "false" or omit for production)
WETRAVEL_USE_DEMO=false

# Backend URL (for webhook registration)
BACKEND_URL=https://api.zanzisafaris.com
```

### 2. Configure Webhook in WeTravel Dashboard

1. Log in to your WeTravel account
2. Navigate to **Profile** → **Partner API Integration**
3. Find the **Webhooks** section
4. Add a new webhook endpoint:
   - **URL**: `https://api.zanzisafaris.com/api/webhooks/wetravel`
   - **Events**: Select payment-related events (e.g., `payment.completed`, `transaction.completed`)
   - **Secret**: Generate and save a webhook secret (add to `WETRAVEL_WEBHOOK_SECRET`)

### 3. Verify Webhook Endpoint

Test the health check endpoint:

```bash
curl https://api.zanzisafaris.com/api/webhooks/wetravel/health
```

Expected response:
```json
{
  "message": "WeTravel webhook endpoint is active",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## How It Works

### Webhook Flow

```
Payment Completed on WeTravel
    ↓
WeTravel sends webhook to /api/webhooks/wetravel
    ↓
Webhook Controller:
  1. Verifies signature (if configured)
  2. Extracts order identifiers
  3. Finds order in database
  4. Updates payment status
  5. Confirms booking
  6. Sends confirmation email
    ↓
Order Status: pending → confirmed
Payment Status: pending → completed
```

### Order Identification

The webhook handler looks for orders using these identifiers (in order of priority):

1. **WeTravel Trip UUID** (`payment.weTravelTripUuid`)
2. **Order Number** (`orderNumber` - matches `trip_id` from WeTravel)
3. **Transaction ID** (`payment.transactionId`)

### Supported Webhook Payload Formats

The handler supports multiple payload formats:

**Format 1: Direct fields**
```json
{
  "event": "payment.completed",
  "trip_uuid": "abc123",
  "trip_id": "ZT-20240115-0001",
  "status": "paid",
  "transaction_id": "txn_123"
}
```

**Format 2: Nested data**
```json
{
  "event": "payment.completed",
  "data": {
    "trip": {
      "uuid": "abc123",
      "trip_id": "ZT-20240115-0001"
    },
    "status": "paid",
    "transaction": {
      "id": "txn_123"
    }
  }
}
```

### Payment Status Mapping

| WeTravel Status | Internal Status |
|----------------|-----------------|
| `paid`, `completed`, `success`, `succeeded` | `completed` |
| `pending` | `pending` |
| `processing` | `processing` |
| `failed`, `cancelled` | `failed` |
| `refunded`, `refund` | `refunded` |

## Testing

### Manual Webhook Test

You can test the webhook endpoint using curl:

```bash
curl -X POST https://api.zanzisafaris.com/api/webhooks/wetravel \
  -H "Content-Type: application/json" \
  -H "x-wetravel-signature: your_signature_here" \
  -d '{
    "event": "payment.completed",
    "trip_uuid": "test-uuid-123",
    "trip_id": "ZT-20240115-0001",
    "status": "paid",
    "transaction_id": "txn_test_123",
    "paid_at": "2024-01-15T10:30:00Z"
  }'
```

### Using ngrok for Local Testing

1. Install ngrok: `npm install -g ngrok`
2. Start your local server: `npm start`
3. Expose local server: `ngrok http 5000`
4. Use the ngrok URL in WeTravel webhook configuration: `https://your-ngrok-url.ngrok.io/api/webhooks/wetravel`

## Monitoring

### Logs

The webhook handler logs all events:

- `[Webhook] 📥 Received WeTravel webhook event` - Webhook received
- `[Webhook] ✅ Found order` - Order found successfully
- `[Webhook] ✅ Updated order` - Order updated successfully
- `[Webhook] ❌ Error` - Error occurred

### Common Issues

**Issue**: Order not found
- **Solution**: Verify that the order has `weTravelTripUuid` set when payment link is created
- Check logs for the identifiers being searched

**Issue**: Invalid signature
- **Solution**: Ensure `WETRAVEL_WEBHOOK_SECRET` matches the secret in WeTravel dashboard
- Check signature format (may need to adjust algorithm)

**Issue**: Duplicate processing
- **Solution**: Already handled - webhook checks if order is already completed

## API Response Format

### Success Response

```json
{
  "message": "Webhook processed successfully",
  "orderNumber": "ZT-20240115-0001",
  "paymentStatus": "completed",
  "orderStatus": "confirmed"
}
```

### Error Responses

**Order Not Found (404)**
```json
{
  "error": "Order not found",
  "identifiers": {
    "tripUuid": "abc123",
    "orderNumber": null,
    "transactionId": null
  }
}
```

**Invalid Signature (401)**
```json
{
  "error": "Invalid webhook signature"
}
```

## Security Considerations

1. **Signature Verification**: Always configure `WETRAVEL_WEBHOOK_SECRET` in production
2. **HTTPS Only**: Webhook endpoint should only be accessible via HTTPS
3. **Rate Limiting**: Consider adding rate limiting to prevent abuse
4. **Idempotency**: Webhook handler prevents duplicate processing

## Troubleshooting

### Check Webhook Logs

```bash
# View recent webhook logs
tail -f logs/webhook.log

# Or check application logs
grep "Webhook" logs/app.log
```

### Verify Order Status

```bash
# Check order via API
curl https://api.zanzisafaris.com/api/orders/{orderId} \
  -H "Authorization: Bearer {token}"
```

### Test Webhook Manually

Use the health check endpoint to verify the webhook route is accessible:

```bash
curl https://api.zanzisafaris.com/api/webhooks/wetravel/health
```

## Next Steps

1. ✅ Webhook endpoint created
2. ✅ Webhook handler implemented
3. ✅ Order update logic added
4. ✅ Email notifications configured
5. ⏳ Configure webhook in WeTravel dashboard
6. ⏳ Test with real payment events
7. ⏳ Monitor logs for any issues

## Support

For issues or questions:
- Check application logs for detailed error messages
- Verify webhook configuration in WeTravel dashboard
- Ensure environment variables are set correctly
- Test webhook endpoint accessibility

---

**Last Updated**: January 2024
**Version**: 1.0
