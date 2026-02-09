# Payment Status Update Guide

## ⚠️ Important: Status Updates Do NOT Charge Money

**Marking an order as "confirmed" or updating payment status to "completed" is ONLY a status update in the database. It does NOT:**
- Charge any money
- Process any payments
- Create any transactions
- Interact with payment gateways

**It simply:**
- Updates the order status in the database
- Triggers email notifications (if payment is completed)
- Updates the dashboard display

## Testing with Pending Orders

To test the webhook and email functionality with a fresh order:

1. **Find a pending order** from your dashboard (one that shows "pending" status)
2. **Use the webhook simulation endpoint** to test:
   ```bash
   curl -X POST https://api.zanzisafaris.com/api/webhooks/wetravel/test/webhook \
     -H "Content-Type: application/json" \
     -d '{
       "orderNumber": "ZT-20260209-0007",
       "status": "paid"
     }'
   ```
   Replace `ZT-20260209-0007` with an actual pending order number.

3. **Or manually trigger email** for a completed order:
   ```bash
   curl -X POST https://api.zanzisafaris.com/api/webhooks/wetravel/test/email/payment-confirmation \
     -H "Content-Type: application/json" \
     -d '{
       "orderNumber": "ZT-20260209-0005"
     }'
   ```

## QR Code Display in Dashboard

### For Clients/Admins

When viewing order details in the **Payments** section of the dashboard:

1. **Click the "View" button** (eye icon) on any order
2. **If payment status is "completed"**, you will see:
   - A **QR Code** section displaying the booking QR code
   - The booking code (order number) below the QR code
   - Instructions to present the QR code at check-in

### QR Code Features

- **Only shows for completed payments** - QR code is only displayed when `payment.status === "completed"`
- **Contains order number** - The QR code encodes the order number (e.g., `ZT-20260209-0005`)
- **High error correction** - Uses level "H" for maximum reliability
- **Printable/Scannable** - Can be printed or displayed on mobile devices for check-in

### Location

- **Dashboard Path**: `/admin/dashboard/payments` (or wherever Payments component is routed)
- **Component**: `zanzitrekking-dashboard/src/components/QRCodeDisplay.jsx`
- **Integration**: `zanzitrekking-dashboard/src/views/admin/Payments.jsx`

## How Payment Status Updates Work

### Manual Status Update (Admin Dashboard)

1. Admin views order in Payments section
2. Admin clicks "Confirm" button (checkmark icon)
3. System calls `updatePaymentStatus` API endpoint
4. Backend updates `order.payment.status = "completed"`
5. If status is "completed", email is automatically queued
6. **No money is charged** - this is just a database update

### Webhook Update (Automatic)

1. Customer completes payment on WeTravel
2. WeTravel sends webhook to `/api/webhooks/wetravel`
3. Backend processes webhook and updates order status
4. If payment is completed, email is automatically queued
5. **Money was already charged by WeTravel** - webhook just notifies us

## Email Notifications

### When Email is Sent

- Payment status changes to "completed" (via webhook or manual update)
- Email includes:
  - Booking details
  - QR code (embedded and attached)
  - Trip information
  - Contact information

### Email Tracking

- `order.emailNotifications.paymentConfirmation` is set to `true` when email is sent
- Check this field in the database to verify email was sent

## Testing Checklist

- [ ] Test with a pending order (not already completed)
- [ ] Verify email is sent when payment status changes to "completed"
- [ ] Check that QR code appears in dashboard for completed payments
- [ ] Verify QR code can be scanned and contains order number
- [ ] Confirm that status updates don't charge money (they're just database updates)

## Summary

✅ **Status updates are safe** - They only update the database, no money is charged  
✅ **QR codes are available** - Displayed in dashboard for completed payments  
✅ **Emails are automatic** - Sent when payment status changes to "completed"  
✅ **Test with pending orders** - Use webhook simulation or manual email trigger
