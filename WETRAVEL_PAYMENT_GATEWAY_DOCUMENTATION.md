# WeTravel Payment Gateway Integration Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture & Flow](#architecture--flow)
3. [Configuration & Setup](#configuration--setup)
4. [Payment Link Creation Process](#payment-link-creation-process)
5. [Payment Deadline Logic](#payment-deadline-logic)
6. [Order Integration](#order-integration)
7. [Frontend Integration](#frontend-integration)
8. [Error Handling & Recovery](#error-handling--recovery)
9. [Important Considerations](#important-considerations)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)

---

## Overview

WeTravel is the payment gateway used for processing all trip bookings in the Zanzi Trekking and Safaris platform. It handles payment collection through secure payment links that customers access after placing an order.

### Key Features
- **Secure Payment Links**: Each order gets a unique WeTravel payment link
- **Automatic Link Generation**: Payment links are created automatically when orders are placed
- **Payment Deadline Management**: Dynamic payment deadlines based on trip type and departure date
- **Token-Based Authentication**: Uses OAuth2-style access tokens for API authentication
- **Graceful Error Handling**: Order creation continues even if payment link generation fails

---

## Architecture & Flow

### High-Level Flow

```
Customer Places Order
    ↓
Order Created in Database
    ↓
WeTravel Payment Link Generated
    ↓
Payment Link Stored in Order
    ↓
Customer Redirected to WeTravel
    ↓
Customer Completes Payment on WeTravel
    ↓
(Manual verification required - no webhooks currently)
```

### Component Structure

1. **Backend Service**: `utilities/wetravelService.js`
   - Handles all WeTravel API interactions
   - Manages authentication tokens
   - Formats order data for WeTravel API

2. **Order Controller**: `controllers/home/orderController.js`
   - Creates orders and triggers payment link generation
   - Handles order creation flow

3. **Order Model**: `models/order.js`
   - Stores payment information including WeTravel links
   - Fields: `weTravelPaymentLink`, `weTravelTripUuid`, `weTravelTripUrl`

4. **Frontend**: `pages/Checkout.jsx`
   - Redirects customers to WeTravel payment page
   - Validates payment links before redirect

---

## Configuration & Setup

### Environment Variables

**Required:**
```env
WETRAVEL_API_KEY=your_api_key_here
```

**API Endpoints:**
- **Auth URL**: `https://api.demo.wetravel.to/v2/auth/tokens/access`
- **API URL**: `https://api.demo.wetravel.to/v2`
- **Payment Links Endpoint**: `POST /payment_links`

### API Key Setup

1. Obtain your WeTravel API key from your WeTravel account
2. Add it to your `.env` file as `WETRAVEL_API_KEY`
3. **IMPORTANT**: Never commit API keys to version control
4. Use different keys for development and production environments

### Access Token Management

- Access tokens are obtained automatically when needed
- Tokens are cached in memory (not persisted)
- Token refresh happens automatically on 401/403 errors
- Token is obtained via POST request with Bearer authentication

---

## Payment Link Creation Process

### Step-by-Step Process

1. **Order Creation**
   ```javascript
   // Order is created with payment method "wetravel"
   order.payment.method = "wetravel"
   order.payment.status = "pending"
   ```

2. **Order Data Formatting**
   ```javascript
   // Order data is formatted for WeTravel API
   const orderData = weTravelService.formatOrderForPaymentLink(order);
   // Returns: { tripTitle, tripId, startDate, endDate, totalAmount, currency, daysBeforeDeparture }
   ```

3. **Access Token Check**
   ```javascript
   // If no token exists, obtain one
   if (!this.accessToken) {
     await this.getAccessToken();
   }
   ```

4. **Payment Link Request**
   ```javascript
   // POST to /payment_links with formatted data
   const response = await axios.post(`${apiUrl}/payment_links`, paymentLinkData, {
     headers: { Authorization: `Bearer ${accessToken}` },
     params: { publish_immediately: "true" }
   });
   ```

5. **Link Storage**
   ```javascript
   // Store payment link in order
   order.payment.weTravelPaymentLink = response.data.data.trip.url;
   order.payment.weTravelTripUuid = response.data.data.trip.uuid;
   order.payment.weTravelTripUrl = response.data.data.trip.url;
   ```

### Payment Link Data Structure

```javascript
{
  data: {
    trip: {
      participant_fees: "all",
      title: "Sanitized Trip Title",
      trip_id: "Order Number",
      start_date: "YYYY-MM-DD",
      end_date: "YYYY-MM-DD",
      currency: "USD"
    },
    pricing: {
      payment_plan: {
        allow_auto_payment: false,
        allow_partial_payment: false,
        deposit: 0,
        installments: [{
          price: totalAmount,
          days_before_departure: calculatedDays
        }]
      },
      price: totalAmount,
      days_before_departure: calculatedDays
    }
  }
}
```

---

## Payment Deadline Logic

### Business Rules

The system calculates payment deadlines based on trip type and days until departure:

1. **Midrange/Luxury Safaris** (4+ days before trip):
   - **Payment Deadline**: 4 days before departure
   - Example: Trip on Feb 10 → Payment must be completed by Feb 6

2. **All Other Trips** (including Budget Safaris):
   - **Payment Deadline**: 1 day before departure
   - Example: Trip on Feb 10 → Payment must be completed by Feb 9

3. **Trips Tomorrow or Today**:
   - **Payment Deadline**: 0 days (immediate payment allowed)
   - Allows last-minute bookings

### Calculation Logic

```javascript
// Days until trip
const daysDiff = Math.ceil((tripStart - now) / (1000 * 60 * 60 * 24));

if (daysDiff <= 0) {
  daysBeforeDeparture = 0; // Trip is today or past
} else if (daysDiff === 1) {
  daysBeforeDeparture = 0; // Trip is tomorrow
} else if (isMidrangeLuxurySafari && daysDiff >= 4) {
  daysBeforeDeparture = 4; // Midrange/Luxury Safari: 4 days before
} else {
  daysBeforeDeparture = Math.min(daysDiff - 1, 365); // Others: 1 day before
}
```

### Important Notes

- **Payment deadline is enforced by WeTravel**, not by our system
- Once the deadline passes, customers cannot pay through the link
- Admin must manually update order status after payment verification
- No automatic webhook integration exists currently

---

## Order Integration

### Order Model Fields

```javascript
payment: {
  method: "wetravel",           // Payment method identifier
  status: "pending",            // Payment status
  weTravelPaymentLink: String,  // Full payment URL
  weTravelTripUuid: String,     // WeTravel trip UUID
  weTravelTripUrl: String       // Same as payment link (redundant)
}
```

### Order Creation Flow

1. **Order is created** with `payment.status = "pending"`
2. **Payment link generation is attempted** (non-blocking)
3. **If successful**: Link is stored, customer is redirected
4. **If failed**: Order still created, admin can generate link later

### Missing Payment Links

A utility script exists to generate missing payment links:
- **File**: `utilities/generateMissingPaymentLinks.js`
- **Purpose**: Find orders without payment links and generate them
- **Usage**: Can be run manually or via cron job
- **Filters**: Only processes orders with `payment.status = "processing"`

---

## Frontend Integration

### Checkout Flow

1. **Order Creation**
   ```javascript
   const result = await dispatch(createOrder(orderData));
   ```

2. **Payment Link Check**
   ```javascript
   const paymentLink = currentOrder?.payment?.weTravelPaymentLink;
   ```

3. **Safe Redirect**
   ```javascript
   if (paymentLink) {
     const allowedDomains = [
       "wetravel.net", "wetravel.com", "wetravel.io",
       "www.wetravel.net", "www.wetravel.com"
     ];
     safeRedirect(paymentLink, allowedDomains);
   }
   ```

### URL Validation

- **Security**: Only allows redirects to approved WeTravel domains
- **Validation**: Checks URL format and domain whitelist
- **Fallback**: If invalid, redirects to order confirmation page

### Order Confirmation Page

- Shows payment link if available
- Displays order details
- Allows manual payment link access
- Shows payment pending status

---

## Error Handling & Recovery

### Common Error Scenarios

1. **API Key Missing**
   - **Error**: `WeTravel API key is not configured`
   - **Impact**: Payment link not generated, order still created
   - **Solution**: Add `WETRAVEL_API_KEY` to environment variables

2. **Token Expired (401/403)**
   - **Error**: Unauthorized response from WeTravel API
   - **Recovery**: Automatic token refresh and retry (once)
   - **Impact**: If retry fails, payment link not generated

3. **Past Trip Date**
   - **Error**: `Trip start date is in the past`
   - **Impact**: Payment link cannot be created
   - **Solution**: Ensure trip dates are in the future

4. **Network Errors**
   - **Error**: Connection timeout or network failure
   - **Impact**: Payment link generation fails
   - **Recovery**: Order still created, link can be generated later

### Error Recovery Strategies

1. **Automatic Retry**: Token expiration triggers automatic retry
2. **Manual Generation**: Admin can use `generateMissingPaymentLinks.js`
3. **Order Continuity**: Order creation never fails due to payment link issues
4. **Logging**: All errors are logged with detailed information

---

## Payment Confirmation Email

### When Payment is Accepted

When an order's payment status is updated to "completed", the customer automatically receives a **payment confirmation email** with:

#### 📧 Email Contents

1. **QR Code**
   - **Embedded in email**: QR code displayed in the email body
   - **Attached as PNG**: `booking-qrcode-{ORDER_NUMBER}.png` file attached to email
   - **Contains**: Order number encoded in the QR code
   - **Purpose**: Quick check-in at trip location
   - **Size**: 300x300 pixels, high error correction level

2. **Booking Details Section**
   - Booking Number (Order Number)
   - Payment Date and Time
   - Total Amount Paid

3. **Trip Details Section**
   - For each trip in the order:
     - Trip Title
     - Start Date
     - Duration (days)
     - Number of Travelers
     - Amount per trip

4. **Contact Information**
   - Company Email
   - Company Phone Number
   - Company Address (if available)

5. **Next Steps Information**
   - Itinerary details will be sent separately
   - Team will contact within 24-48 hours
   - Travel documents reminder
   - Booking code for check-in

### Email Trigger

The confirmation email is sent when:
- Admin updates order `payment.status` to `"completed"` via the API endpoint
- The `updatePaymentStatus` endpoint is called with status "completed"
- Email is queued automatically (non-blocking)

### Email Generation Process

```javascript
// In orderController.js - updatePaymentStatus method
if (normalizedStatus === "completed") {
  const emailData = await generatePaymentConfirmationEmail(order);
  emailQueue.add({
    subject: `Payment Confirmed - Booking #${order.orderNumber}`,
    content: emailData.html,
    recipients: [customerEmail],
    attachment: emailData.attachment, // QR code PNG file
  });
}
```

### QR Code Generation

- **Library**: Uses `qrcode` npm package
- **Format**: PNG image, 300x300 pixels
- **Error Correction**: High level (H) for reliability
- **Content**: Order number (e.g., "ORD-2024-001234")
- **Colors**: Black on white
- **Attachment**: Embedded in email body AND attached as separate file

### Email Template Location

- **File**: `zanzitrekking-backend/utilities/orderEmailTemplates.js`
- **Function**: `generatePaymentConfirmationEmail(order)`
- **Returns**: `{ html: string, attachment: { filename, content, cid } | null }`

### Important Notes

- **Email is sent automatically** when payment status changes to "completed"
- **QR code generation may fail** silently (email still sent without QR code)
- **Email queue** processes emails asynchronously
- **Customer email** is taken from `order.personalInfo.email` or `order.customerId.email`
- **Email includes all trip information** from the order's cartItems

---

## Important Considerations

### ⚠️ Critical Points

1. **No Webhook Integration** ⚠️
   - Payment status is NOT automatically updated
   - Admin must manually verify payments in WeTravel dashboard
   - Order status must be updated manually after payment confirmation
   - **Email is only sent when admin manually updates payment status to "completed"**
   
   **💡 Solution**: See `WETRAVEL_PAYMENT_AUTOMATION_SOLUTION.md` for state-of-the-art approaches to automate payment status updates, including:
   - Webhook integration (if available)
   - Scheduled polling with smart scheduling
   - Return URL callbacks
   - Hybrid approach combining all methods

2. **Payment Verification**
   - Check WeTravel dashboard for payment status
   - Update order `payment.status` to "completed" after verification
   - Update `payment.paymentDate` when payment is confirmed

3. **API Environment**
   - Currently using **demo environment**: `api.demo.wetravel.to`
   - **Production**: Change to `api.wetravel.to` when ready
   - Update `authUrl` and `apiUrl` in `wetravelService.js`

4. **Date Validation**
   - WeTravel rejects payment links for past dates
   - System validates dates before creating links
   - Ensure trip dates are always in the future

5. **Title Sanitization**
   - Trip titles are sanitized (special chars removed, max 100 chars)
   - Prevents API errors from invalid characters
   - Fallback: "Safari Trip" if title is empty

6. **Payment Link Expiration**
   - Links expire based on `days_before_departure` setting
   - After expiration, customers cannot pay
   - Admin must create new links or update order status manually

7. **Multiple Trips in Order**
   - Single payment link is created for entire order
   - Title format: "X Safari Trips - ORDER_NUMBER"
   - All trips share the same payment deadline

8. **Currency**
   - Currently hardcoded to "USD"
   - To change: Update `currency` in `formatOrderForPaymentLink()`

9. **Partial Payments**
   - Currently disabled: `allow_partial_payment: false`
   - Full payment required upfront
   - To enable: Modify payment link data structure

10. **Access Token Lifecycle**
    - Tokens are stored in memory (not persisted)
    - Tokens may expire between requests
    - System automatically refreshes on 401/403 errors
    - No token expiration tracking currently

---

## Troubleshooting

### Payment Link Not Generated

**Symptoms:**
- Order created but no payment link
- Customer sees "payment pending" message

**Diagnosis:**
1. Check server logs for WeTravel API errors
2. Verify `WETRAVEL_API_KEY` is set correctly
3. Check if trip dates are in the past
4. Verify API endpoint accessibility

**Solutions:**
1. Run `generateMissingPaymentLinks.js` script
2. Manually create payment link via WeTravel dashboard
3. Check API key validity
4. Verify network connectivity to WeTravel API

### Invalid Payment Link

**Symptoms:**
- Payment link exists but redirect fails
- Customer cannot access payment page

**Diagnosis:**
1. Check if link is from allowed domain
2. Verify link format is correct
3. Check if link has expired

**Solutions:**
1. Regenerate payment link
2. Verify domain whitelist in `urlValidation.js`
3. Check WeTravel dashboard for link status

### Token Authentication Failures

**Symptoms:**
- 401/403 errors in logs
- Payment link generation fails repeatedly

**Diagnosis:**
1. Verify API key is correct
2. Check if API key has expired
3. Verify API endpoint URLs

**Solutions:**
1. Regenerate API key in WeTravel dashboard
2. Update `WETRAVEL_API_KEY` environment variable
3. Verify API endpoint URLs match your WeTravel account

### Payment Deadline Issues

**Symptoms:**
- Customers cannot pay even before deadline
- Payment links expire too early

**Diagnosis:**
1. Check `daysBeforeDeparture` calculation
2. Verify trip category detection
3. Check date calculation logic

**Solutions:**
1. Review payment deadline calculation in `formatOrderForPaymentLink()`
2. Verify trip category is correctly identified
3. Check timezone handling in date calculations

---

## Best Practices

### Development

1. **Environment Separation**
   - Use demo API for development
   - Use production API only in production
   - Never mix API keys between environments

2. **Error Logging**
   - Always log WeTravel API errors with full details
   - Include order number in error messages
   - Log both request and response data

3. **Testing**
   - Test with various trip dates (past, today, future)
   - Test with different trip categories
   - Test error scenarios (missing API key, network failures)

4. **Code Organization**
   - Keep WeTravel logic in `wetravelService.js`
   - Don't mix payment logic with order creation
   - Use clear function names and comments

### Production

1. **Monitoring**
   - Monitor payment link generation success rate
   - Track failed payment link generations
   - Alert on repeated failures

2. **Backup Plans**
   - Keep `generateMissingPaymentLinks.js` script ready
   - Document manual payment link creation process
   - Have WeTravel dashboard access for manual verification

3. **Security**
   - Never expose API keys in frontend code
   - Use environment variables for all secrets
   - Validate all redirect URLs before redirecting

4. **Payment Verification**
   - Establish regular process for checking WeTravel payments
   - Update order statuses promptly after payment confirmation
   - Keep audit trail of payment verifications

### Maintenance

1. **Regular Checks**
   - Review orders without payment links weekly
   - Check for expired payment links
   - Verify payment status updates

2. **Documentation Updates**
   - Keep this documentation updated with any changes
   - Document any custom business rules
   - Note any WeTravel API changes

3. **API Updates**
   - Monitor WeTravel API changelog
   - Test API changes in development first
   - Update integration when WeTravel releases new features

---

## API Reference

### WeTravel Service Methods

#### `getAccessToken()`
- **Purpose**: Obtains OAuth2 access token from WeTravel
- **Returns**: Access token string
- **Throws**: Error if API key is invalid

#### `createPaymentLink(orderData)`
- **Purpose**: Creates a payment link for an order
- **Parameters**: 
  - `orderData`: Object with tripTitle, tripId, startDate, endDate, totalAmount, currency, daysBeforeDeparture
- **Returns**: Payment link data object
- **Throws**: Error if link creation fails

#### `formatOrderForPaymentLink(order)`
- **Purpose**: Formats MongoDB order document for WeTravel API
- **Parameters**: Order document
- **Returns**: Formatted order data object
- **Includes**: Payment deadline calculation based on business rules

#### `sanitizeTitle(title)`
- **Purpose**: Cleans trip title for WeTravel API compatibility
- **Parameters**: Original title string
- **Returns**: Sanitized title (max 100 chars, special chars removed)

---

## Future Improvements

### Recommended Enhancements

1. **Webhook Integration**
   - Implement WeTravel webhook endpoint
   - Automatically update order status on payment
   - Reduce manual verification workload

2. **Payment Status Sync**
   - Periodic job to check payment status in WeTravel
   - Auto-update orders with completed payments
   - Reduce manual work

3. **Multiple Currency Support**
   - Allow currency selection per order
   - Support USD, EUR, GBP, etc.
   - Dynamic currency conversion

4. **Payment Plans**
   - Support deposit + installments
   - Allow partial payments
   - Flexible payment schedules

5. **Token Persistence**
   - Store tokens in database/cache
   - Implement token refresh before expiration
   - Reduce API calls

6. **Better Error Recovery**
   - Queue failed payment link generations
   - Automatic retry with exponential backoff
   - Admin notification on failures

---

## Support & Resources

### WeTravel Documentation
- Official API Documentation: Check WeTravel developer portal
- Support: Contact WeTravel support for API issues

### Internal Resources
- Service File: `zanzitrekking-backend/utilities/wetravelService.js`
- Order Controller: `zanzitrekking-backend/controllers/home/orderController.js`
- Order Model: `zanzitrekking-backend/models/order.js`
- Missing Links Generator: `zanzitrekking-backend/utilities/generateMissingPaymentLinks.js`

### Contact
For questions or issues with WeTravel integration, contact the development team.

---

## Payment Confirmation Email Flow

### Complete Flow Diagram

```
Customer Completes Payment on WeTravel
    ↓
Admin Verifies Payment in WeTravel Dashboard
    ↓
Admin Updates Order Status via API
    POST /api/orders/:orderId/payment-status
    { status: "completed" }
    ↓
Backend Updates Order Payment Status
    order.payment.status = "completed"
    order.payment.paymentDate = new Date()
    ↓
Email Generation Triggered
    generatePaymentConfirmationEmail(order)
    ↓
QR Code Generated
    generateQRCodeBuffer(order.orderNumber)
    ↓
Email Template Rendered
    HTML with trip details, QR code, contact info
    ↓
Email Queued
    emailQueue.add({ subject, content, recipients, attachment })
    ↓
Email Sent to Customer
    Customer receives email with:
    - QR code (embedded + attached)
    - All trip information
    - Booking details
    - Contact information
    - Next steps
```

### Manual Payment Status Update

Since there's no webhook integration, the admin must:

1. **Check WeTravel Dashboard** for payment confirmation
2. **Update Order Status** via admin dashboard or API:
   ```javascript
   // API endpoint
   PUT /api/orders/:orderId/payment-status
   {
     status: "completed",
     paymentDate: "2024-02-15T10:30:00Z" // optional
   }
   ```
3. **Email is automatically sent** when status is updated to "completed"

### Email Delivery

- **Queue System**: Uses email queue for reliable delivery
- **Async Processing**: Email sending doesn't block API response
- **Error Handling**: Email failures are logged but don't affect order update
- **Retry Logic**: Email queue has built-in retry mechanisms

---

**Last Updated**: [Current Date]
**Version**: 1.1
**Maintained By**: Development Team
