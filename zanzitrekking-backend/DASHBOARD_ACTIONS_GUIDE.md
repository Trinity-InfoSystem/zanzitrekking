# Dashboard Actions Guide

This guide explains all actions available in the admin Payments dashboard, their purposes, and when to use them.

## Overview

The Payments dashboard provides several actions for managing orders and payments. Most payment confirmations happen **automatically via webhooks**, but manual actions are available for edge cases and order lifecycle management.

## Available Actions

### 1. View Details (Eye Icon) 👁️

**Purpose**: View complete order information

**What it does**:
- Opens a detailed modal showing:
  - Complete order information
  - Customer details
  - Trip details
  - Payment information
  - Order status
  - QR code (if payment is completed)

**When to use**:
- Reviewing order details
- Checking customer information
- Verifying trip bookings
- Viewing QR code for completed payments

**How to use**:
1. Click the eye icon (👁️) next to any order
2. Review the information in the modal
3. Click "Close" when done

---

### 2. Approve Order (Checkmark Icon) ✅

**Purpose**: Manually approve a pending order

**What it does**:
- Updates order status from `pending` → `confirmed`
- Does NOT update payment status
- Does NOT send emails

**When to use**:
- Order lifecycle management (after payment is confirmed)
- Moving orders through workflow stages
- Special approval scenarios

**Note**: 
- Payment confirmations are handled automatically by webhooks
- This is for order status management, not payment processing

**How to use**:
1. Find an order with status "pending"
2. Click the checkmark icon (✅)
3. Order status updates to "confirmed"

**Available for**: Orders with status `pending`

---

### 3. Mark Payment Complete (Credit Card Icon) 💳

**Purpose**: Manually mark payment as completed (Edge Cases Only)

**What it does**:
- Updates payment status to `completed`
- Updates order status to `confirmed` (if it was pending)
- Sends payment confirmation email to customer
- Generates QR code for the booking

**⚠️ Warning Modal**: 
- Shows a warning explaining this is for edge cases only
- Most payments are confirmed automatically via webhooks
- Only use for:
  - Error recovery (if webhook failed)
  - Testing purposes
  - Special circumstances

**When to use**:
- Webhook failed to process payment confirmation
- Testing payment confirmation flow
- Manual verification after payment issue
- Recovery from system errors

**When NOT to use**:
- Normal payment confirmations (handled by webhooks)
- Payments that haven't been completed on WeTravel
- Regular day-to-day operations

**How to use**:
1. Find an order with payment status "pending" or "processing"
2. Click the credit card icon (💳)
3. Review the warning modal
4. Click "Confirm Update" if this is truly an edge case
5. Payment status updates and email is sent

**Available for**: Orders with payment status `pending` or `processing`

---

### 4. Process Refund (Dollar Sign Icon) 💰

**Purpose**: Process a refund for a completed payment

**What it does**:
- Updates payment status to `refunded`
- Sends refund notification email to customer
- Email includes:
  - Refund amount
  - Refund timeline (5-10 business days)
  - Booking details
  - Contact information

**When to use**:
- Customer requests a refund
- Booking cancellation requiring refund
- Payment dispute resolution
- Administrative refunds

**Note**: 
- This is always a manual process (no warning modal)
- Refunds are not handled by webhooks
- Email is sent automatically when refund is processed

**How to use**:
1. Find an order with payment status "completed"
2. Click the dollar sign icon (💰)
3. Payment status updates to "refunded"
4. Customer receives refund email automatically

**Available for**: Orders with payment status `completed`

---

### 5. Cancel Order (Ban Icon) 🚫

**Purpose**: Cancel an order

**What it does**:
- Updates order status to `cancelled`
- Does NOT refund payment automatically
- Does NOT send automatic email (can be done separately)

**When to use**:
- Customer requests cancellation
- Booking cannot be fulfilled
- Administrative cancellation
- Duplicate order removal

**Note**: 
- Cancellation does NOT automatically refund payment
- Use "Process Refund" separately if refund is needed
- Consider order lifecycle before cancelling

**How to use**:
1. Find an order that is not already cancelled or completed
2. Click the ban icon (🚫)
3. Order status updates to "cancelled"

**Available for**: Orders that are NOT `cancelled` or `completed`

---

## Action Summary Table

| Action | Icon | Purpose | Automatic? | Email Sent? | When to Use |
|--------|------|---------|------------|-------------|-------------|
| View Details | 👁️ | View order info | N/A | No | Always available |
| Approve Order | ✅ | Confirm order | Manual | No | Order lifecycle |
| Mark Payment Complete | 💳 | Complete payment | Manual (Edge cases) | Yes | Webhook failed, testing |
| Process Refund | 💰 | Refund payment | Manual | Yes | Customer refund request |
| Cancel Order | 🚫 | Cancel booking | Manual | No | Order cancellation |

---

## Automatic vs Manual Updates

### Automatic (Webhooks) ✅

**Payment Status Updates**:
- `pending` → `completed` (when customer pays on WeTravel)
- Order status: `pending` → `confirmed`
- Email confirmation sent automatically
- QR code generated automatically

**No manual intervention needed** for normal payment flows.

### Manual (Edge Cases) ⚠️

**Payment Status Updates**:
- Only when webhook fails
- Testing scenarios
- Error recovery

**Order Status Updates**:
- Order lifecycle management (`confirmed` → `preparing` → `in-progress` → `completed`)
- These are always manual (not handled by webhooks)

**Refunds**:
- Always manual (not handled by webhooks)
- Email sent automatically when processed

---

## Best Practices

1. **Let webhooks handle payments**: Don't manually mark payments as complete unless webhook failed
2. **Use refund button for refunds**: Always use the refund action, not manual payment status update
3. **Check webhook logs first**: Before manually updating payment status, check if webhook is working
4. **Order lifecycle is manual**: Order status progression (preparing, in-progress, completed) requires manual updates
5. **View details before actions**: Always review order details before making changes

---

## Troubleshooting

### Payment Not Confirming Automatically

1. **Check webhook logs**: Look for webhook events in server logs
2. **Verify webhook endpoint**: Ensure `/api/webhooks/wetravel` is accessible
3. **Check webhook secret**: Verify `WETRAVEL_WEBHOOK_SECRET` is configured
4. **Test webhook**: Use test endpoint to verify webhook processing
5. **Manual update**: Only if webhook truly failed, use manual payment complete

### Refund Not Sending Email

1. **Check email queue**: Verify email queue is running
2. **Check customer email**: Ensure customer email is valid
3. **Review email logs**: Check for email sending errors
4. **Verify refund processed**: Confirm payment status is "refunded"

### Order Status Not Updating

1. **Order lifecycle is manual**: Order status updates (preparing, in-progress) are always manual
2. **Use approve order**: For pending → confirmed (if not done by webhook)
3. **Check order details**: Review order to understand current state

---

## Quick Reference

**For Normal Payments**: 
- ✅ Let webhooks handle it automatically
- ✅ Dashboard auto-refreshes every 30 seconds
- ✅ Customer receives email automatically

**For Edge Cases**:
- ⚠️ Use "Mark Payment Complete" with warning modal
- ⚠️ Only if webhook failed or for testing

**For Refunds**:
- 💰 Use "Process Refund" button
- 💰 Email sent automatically

**For Order Management**:
- ✅ Use "Approve Order" for order lifecycle
- ✅ Use "Cancel Order" for cancellations
- ✅ Use "View Details" to review information
