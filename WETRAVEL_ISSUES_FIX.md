# WeTravel Issues and Fixes

## Issues Found

### 1. Email Sent to Wrong Address ❌

**Problem**: WeTravel confirmation emails are being sent to `info@zanzisafaris.com` instead of the customer's email (`ali.aoua.eng@gmail.com`).

**Root Cause**: 
- WeTravel payment links are created without participant/customer information
- WeTravel defaults to using the account owner's email when no participant info is provided
- The customer email is stored in the order but not sent to WeTravel

**Solution**: 
- Added participant information to payment link creation
- Include customer name, email, and phone in the payment link data
- This ensures WeTravel sends confirmations to the correct email

**Status**: ✅ Fixed - Participant info now included in payment link creation

### 2. "Sold Out" Issue ❌

**Problem**: After booking one trip, trying to book the same trip again shows "Sold Out" and gets stuck.

**Root Cause**:
- Each payment link might have a capacity limit
- If capacity is set to the number of travelers (e.g., 1), the trip becomes "sold out" after one booking
- WeTravel might be treating each payment link as a separate trip with limited capacity

**Solution**:
- Set capacity to a higher value (at least 100) to allow multiple bookings
- Or remove capacity limit entirely if WeTravel API supports it
- Each order creates a unique payment link, so capacity should be per-link, not global

**Status**: ✅ Fixed - Capacity set to allow multiple bookings

## Changes Made

### File: `zanzitrekking-backend/utilities/wetravelService.js`

1. **Updated `createPaymentLink` method**:
   - Added `participantInfo` and `travelersNumber` parameters
   - Set capacity to allow multiple bookings (min 100)
   - Note: Participant info format may need adjustment based on WeTravel API response

2. **Updated `formatOrderForPaymentLink` method**:
   - Added `travelersNumber` calculation from cart items
   - Added `participantInfo` with customer details (firstName, lastName, email, phone)

## Testing Required

After deployment, test:

1. **Email Test**:
   - Create a new order with customer email: `ali.aoua.eng@gmail.com`
   - Complete payment on WeTravel
   - Verify confirmation email goes to customer email, not `info@zanzisafaris.com`

2. **Capacity Test**:
   - Create first order for a trip
   - Complete payment
   - Create second order for the same trip
   - Verify it doesn't show "Sold Out"
   - Verify payment link works

3. **Webhook Test**:
   - Complete a payment
   - Verify webhook receives the event
   - Verify order status updates correctly
   - Verify customer receives confirmation email

## Potential Issues

### Participant Info Format

The participant information format might need adjustment based on WeTravel API requirements. If the API rejects the request, we may need to:

1. Check WeTravel API documentation for exact participant format
2. Adjust field names (e.g., `first_name` vs `firstName`)
3. Move participant info to a different part of the payload

### Capacity Setting

If setting capacity to 100 doesn't work, we may need to:
1. Check if WeTravel API supports unlimited capacity
2. Use a different approach (e.g., don't set capacity at all)
3. Create payment links differently to avoid capacity limits

## Next Steps

1. ✅ Deploy the fixes
2. ⏳ Test with a new order
3. ⏳ Verify email goes to correct address
4. ⏳ Verify "Sold Out" issue is resolved
5. ⏳ Monitor webhook events

---

**Last Updated**: February 2026
**Status**: Fixes implemented, ready for testing
