# State-of-the-Art Payment Status Automation Solution

## Problem Statement

Currently, the WeTravel payment integration requires:
- ❌ Manual payment verification by admin
- ❌ Manual order status updates
- ❌ No automatic email notifications
- ❌ No real-time payment status tracking

## State-of-the-Art Solutions

### Solution 1: Webhook Integration (Recommended - Best Practice)

**Status**: Check if WeTravel API supports webhooks

#### Implementation Approach

1. **Create Webhook Endpoint**
   ```javascript
   // routes/home/webhookRoutes.js
   router.post('/webhooks/wetravel', wetravelWebhookController.handlePaymentWebhook);
   ```

2. **Webhook Handler**
   ```javascript
   // controllers/home/wetravelWebhookController.js
   class WeTravelWebhookController {
     handlePaymentWebhook = async (req, res) => {
       // Verify webhook signature (security)
       const signature = req.headers['x-wetravel-signature'];
       if (!this.verifySignature(req.body, signature)) {
         return res.status(401).json({ error: 'Invalid signature' });
       }

       const { event, data } = req.body;
       
       // Handle different event types
       switch (event) {
         case 'payment.completed':
           await this.handlePaymentCompleted(data);
           break;
         case 'payment.failed':
           await this.handlePaymentFailed(data);
           break;
         case 'payment.refunded':
           await this.handlePaymentRefunded(data);
           break;
       }

       res.status(200).json({ received: true });
     };

     async handlePaymentCompleted(data) {
       // Find order by WeTravel trip UUID
       const order = await Order.findOne({
         'payment.weTravelTripUuid': data.trip_uuid
       });

       if (!order) {
         console.error('Order not found for WeTravel trip:', data.trip_uuid);
         return;
       }

       // Update order status
       order.payment.status = 'completed';
       order.payment.paymentDate = new Date(data.paid_at);
       order.payment.transactionId = data.transaction_id;
       await order.save();

       // Send confirmation email automatically
       await this.sendPaymentConfirmationEmail(order);
     }
   }
   ```

3. **Security Measures**
   - Verify webhook signature
   - Use HTTPS only
   - Validate webhook payload
   - Idempotency checks (prevent duplicate processing)

#### Advantages
- ✅ Real-time updates
- ✅ No polling overhead
- ✅ Industry standard approach
- ✅ Automatic processing

#### Requirements
- WeTravel must support webhooks
- Public webhook URL (or use webhook proxy service)
- SSL certificate for HTTPS

---

### Solution 2: API Polling with Smart Scheduling (Fallback)

**Status**: Works if webhooks aren't available

#### Implementation Approach

1. **Create Payment Status Checker Service**
   ```javascript
   // utilities/wetravelPaymentStatusChecker.js
   class WeTravelPaymentStatusChecker {
     async checkPaymentStatus(order) {
       if (!order.payment.weTravelTripUuid) {
         return null;
       }

       try {
         // Get access token
         if (!this.accessToken) {
           await this.getAccessToken();
         }

         // Query WeTravel API for payment status
         const response = await axios.get(
           `${this.apiUrl}/trips/${order.payment.weTravelTripUuid}/payments`,
           {
             headers: {
               Authorization: `Bearer ${this.accessToken}`,
             },
           }
         );

         return this.parsePaymentStatus(response.data);
       } catch (error) {
         console.error('Error checking payment status:', error);
         return null;
       }
     }

     parsePaymentStatus(data) {
       // Parse WeTravel response and return standardized status
       if (data.payment_status === 'paid') {
         return { status: 'completed', paidAt: data.paid_at };
       } else if (data.payment_status === 'failed') {
         return { status: 'failed', failedAt: data.failed_at };
       }
       return { status: 'pending' };
     }
   }
   ```

2. **Scheduled Job with Smart Polling**
   ```javascript
   // utilities/cronJobs.js or workers/paymentStatusChecker.js
   const checkPendingPayments = async () => {
     // Only check orders with pending payment status
     const pendingOrders = await Order.find({
       'payment.status': 'pending',
       'payment.weTravelTripUuid': { $exists: true, $ne: null },
       createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
     });

     for (const order of pendingOrders) {
       try {
         const status = await paymentStatusChecker.checkPaymentStatus(order);
         
         if (status && status.status !== order.payment.status) {
           // Status changed - update order
           order.payment.status = status.status;
           if (status.paidAt) {
             order.payment.paymentDate = new Date(status.paidAt);
           }
           await order.save();

           // Send email if payment completed
           if (status.status === 'completed') {
             await sendPaymentConfirmationEmail(order);
           }
         }
       } catch (error) {
         console.error(`Error checking order ${order.orderNumber}:`, error);
       }
     }
   };

   // Run every 15 minutes
   cron.schedule('*/15 * * * *', checkPendingPayments);
   ```

3. **Smart Polling Strategy**
   - **Recent orders** (last 24 hours): Check every 15 minutes
   - **Older orders** (1-7 days): Check every hour
   - **Very old orders** (7+ days): Check daily
   - **Stop polling** after 30 days or if payment deadline passed

#### Advantages
- ✅ Works without webhook support
- ✅ Can be implemented immediately
- ✅ Flexible scheduling
- ✅ Handles edge cases

#### Disadvantages
- ❌ Not real-time (15 min delay minimum)
- ❌ API rate limits may apply
- ❌ Server resource usage

---

### Solution 3: Return URL Callback (User-Triggered)

**Status**: Immediate solution, good UX

#### Implementation Approach

1. **Add Return URL to Payment Link**
   ```javascript
   // In wetravelService.js - createPaymentLink()
   const paymentLinkData = {
     data: {
       trip: { /* ... */ },
       pricing: { /* ... */ },
       return_url: `${process.env.FRONTEND_URL}/payment-callback?orderId=${orderId}`,
       // or
       webhook_url: `${process.env.BACKEND_URL}/api/webhooks/wetravel`,
     }
   };
   ```

2. **Create Payment Callback Page**
   ```javascript
   // frontend/src/pages/PaymentCallback.jsx
   const PaymentCallback = () => {
     const { orderId } = useSearchParams();
     const [status, setStatus] = useState('checking');

     useEffect(() => {
       // Check payment status when user returns
       checkPaymentStatus(orderId);
     }, [orderId]);

     const checkPaymentStatus = async (orderId) => {
       try {
         const response = await api.get(`/orders/${orderId}/payment-status`);
         
         if (response.data.payment.status === 'completed') {
           setStatus('success');
           // Show success message, redirect to order confirmation
         } else {
           setStatus('pending');
         }
       } catch (error) {
         setStatus('error');
       }
     };

     // Render appropriate UI based on status
   };
   ```

3. **Backend Status Check Endpoint**
   ```javascript
   // controllers/home/orderController.js
   checkPaymentStatus = async (req, res) => {
     const { orderId } = req.params;
     const order = await Order.findById(orderId);

     if (!order.payment.weTravelTripUuid) {
       return res.json({ payment: { status: 'pending' } });
     }

     // Check with WeTravel API
     const status = await weTravelService.checkPaymentStatus(
       order.payment.weTravelTripUuid
     );

     // Update order if status changed
     if (status && status.status !== order.payment.status) {
       order.payment.status = status.status;
       if (status.paidAt) {
         order.payment.paymentDate = new Date(status.paidAt);
       }
       await order.save();

       // Send email if completed
       if (status.status === 'completed') {
         await sendPaymentConfirmationEmail(order);
       }
     }

     res.json({ payment: order.payment });
   };
   ```

#### Advantages
- ✅ Immediate status check when user returns
- ✅ Good user experience
- ✅ No polling overhead
- ✅ Works with any payment gateway

#### Disadvantages
- ❌ Only works if user returns to site
- ❌ Requires user action
- ❌ May miss payments if user doesn't return

---

### Solution 4: Hybrid Approach (Recommended - Most Robust)

**Status**: Best of all worlds

#### Implementation Strategy

Combine multiple methods for maximum reliability:

1. **Primary**: Webhook integration (if available)
2. **Secondary**: Return URL callback (user-triggered)
3. **Tertiary**: Scheduled polling (backup)

```javascript
// utilities/paymentStatusManager.js
class PaymentStatusManager {
  constructor() {
    this.webhookEnabled = process.env.WETRAVEL_WEBHOOK_ENABLED === 'true';
    this.pollingEnabled = process.env.WETRAVEL_POLLING_ENABLED === 'true';
  }

  async updatePaymentStatus(order, source = 'unknown') {
    // Prevent duplicate processing
    if (order.payment.status === 'completed') {
      return; // Already processed
    }

    // Check with WeTravel API
    const status = await this.checkWithWeTravel(order);

    if (status && status.status !== order.payment.status) {
      // Update order
      order.payment.status = status.status;
      order.payment.paymentDate = status.paidAt ? new Date(status.paidAt) : null;
      order.payment.lastCheckedAt = new Date();
      order.payment.statusSource = source; // 'webhook', 'callback', 'polling'
      await order.save();

      // Send email if completed
      if (status.status === 'completed') {
        await this.sendPaymentConfirmationEmail(order);
      }

      console.log(`Payment status updated for order ${order.orderNumber} via ${source}`);
    }
  }

  async checkWithWeTravel(order) {
    // Implementation from Solution 2
  }
}
```

#### Flow Diagram

```
Payment Completed on WeTravel
    ↓
┌─────────────────────────────────────┐
│  Method 1: Webhook (if available)   │ → ✅ Immediate update
└─────────────────────────────────────┘
    ↓ (if webhook fails or not available)
┌─────────────────────────────────────┐
│  Method 2: User Returns to Site     │ → ✅ User-triggered check
└─────────────────────────────────────┘
    ↓ (if user doesn't return)
┌─────────────────────────────────────┐
│  Method 3: Scheduled Polling         │ → ✅ Backup check (15 min delay)
└─────────────────────────────────────┘
```

---

## Recommended Implementation Plan

### Phase 1: Immediate (Week 1)
1. ✅ Implement **Return URL Callback** (Solution 3)
   - Fast to implement
   - Immediate user benefit
   - No external dependencies

### Phase 2: Short-term (Week 2-3)
2. ✅ Implement **Scheduled Polling** (Solution 2)
   - Catches payments even if user doesn't return
   - Works as backup
   - Handles edge cases

### Phase 3: Long-term (Month 1-2)
3. ✅ Investigate and implement **Webhooks** (Solution 1)
   - Check WeTravel API documentation
   - Contact WeTravel support
   - Implement if available

### Phase 4: Optimization (Ongoing)
4. ✅ Implement **Hybrid Approach** (Solution 4)
   - Combine all methods
   - Add monitoring and alerts
   - Optimize polling frequency

---

## Implementation Details

### Step 1: Add Payment Status Check Method to WeTravelService

```javascript
// utilities/wetravelService.js
async checkPaymentStatus(tripUuid) {
  try {
    if (!this.accessToken) {
      await this.getAccessToken();
    }

    const response = await axios.get(
      `${this.apiUrl}/payment_links/${tripUuid}/status`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    // Parse response based on WeTravel API structure
    const paymentData = response.data.data;
    
    return {
      status: this.mapWeTravelStatus(paymentData.status),
      paidAt: paymentData.paid_at,
      amount: paymentData.amount,
      currency: paymentData.currency,
    };
  } catch (error) {
    console.error('Error checking payment status:', error);
    return null;
  }
}

mapWeTravelStatus(wetravelStatus) {
  const statusMap = {
    'paid': 'completed',
    'pending': 'pending',
    'failed': 'failed',
    'refunded': 'refunded',
  };
  return statusMap[wetravelStatus] || 'pending';
}
```

### Step 2: Create Payment Status Checker Cron Job

```javascript
// utilities/cronJobs.js or workers/paymentStatusChecker.js
const cron = require('node-cron');
const Order = require('../models/order');
const weTravelService = require('./wetravelService');
const { generatePaymentConfirmationEmail } = require('./orderEmailTemplates');
const emailQueue = require('../workers/emailQueue');

const checkPendingPayments = async () => {
  console.log('[Payment Status Checker] Starting payment status check...');

  const pendingOrders = await Order.find({
    'payment.status': { $in: ['pending', 'processing'] },
    'payment.weTravelTripUuid': { $exists: true, $ne: null },
    'payment.method': 'wetravel',
    createdAt: { 
      $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    },
  }).populate('customerId', 'email name');

  let updated = 0;
  let emailsSent = 0;
  let errors = 0;

  for (const order of pendingOrders) {
    try {
      const status = await weTravelService.checkPaymentStatus(
        order.payment.weTravelTripUuid
      );

      if (!status) {
        continue; // Skip if check failed
      }

      // Only update if status changed
      if (status.status !== order.payment.status) {
        const oldStatus = order.payment.status;
        order.payment.status = status.status;
        
        if (status.paidAt) {
          order.payment.paymentDate = new Date(status.paidAt);
        }
        
        order.payment.lastCheckedAt = new Date();
        order.payment.statusSource = 'polling';
        await order.save();

        updated++;
        console.log(
          `[Payment Status Checker] Order ${order.orderNumber}: ${oldStatus} → ${status.status}`
        );

        // Send confirmation email if payment completed
        if (status.status === 'completed') {
          try {
            const customerEmail = 
              order.personalInfo?.email || order.customerId?.email;
            
            if (customerEmail) {
              const emailData = await generatePaymentConfirmationEmail(order);
              emailQueue.add({
                subject: `Payment Confirmed - Booking #${order.orderNumber}`,
                content: emailData.html,
                recipients: [customerEmail],
                attachment: emailData.attachment,
              });
              emailsSent++;
            }
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
          }
        }
      }
    } catch (error) {
      errors++;
      console.error(
        `[Payment Status Checker] Error checking order ${order.orderNumber}:`,
        error
      );
    }
  }

  console.log(
    `[Payment Status Checker] Complete. Updated: ${updated}, Emails: ${emailsSent}, Errors: ${errors}`
  );
};

// Schedule: Every 15 minutes
if (process.env.ENABLE_PAYMENT_STATUS_CHECKER === 'true') {
  cron.schedule('*/15 * * * *', checkPendingPayments);
  console.log('[Payment Status Checker] Scheduled to run every 15 minutes');
}

module.exports = { checkPendingPayments };
```

### Step 3: Add Return URL to Payment Links

```javascript
// utilities/wetravelService.js - update createPaymentLink()
async createPaymentLink(orderData, returnUrl = null) {
  // ... existing code ...

  // Add return URL if provided
  if (returnUrl) {
    paymentLinkData.data.return_url = returnUrl;
  }

  // ... rest of the code ...
}

// In orderController.js - update payment link creation
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const returnUrl = `${frontendUrl}/payment-callback?orderId=${order._id}`;

const weTravelResponse = await weTravelService.createPaymentLink(
  orderData,
  returnUrl
);
```

### Step 4: Create Payment Callback Endpoint

```javascript
// controllers/home/orderController.js
checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('customerId', 'email name');

    if (!order) {
      return responseReturn(res, 404, { message: 'Order not found' });
    }

    if (!order.payment.weTravelTripUuid) {
      return responseReturn(res, 200, {
        payment: order.payment,
        message: 'No WeTravel payment link found',
      });
    }

    // Check payment status with WeTravel
    const status = await weTravelService.checkPaymentStatus(
      order.payment.weTravelTripUuid
    );

    if (status && status.status !== order.payment.status) {
      // Status changed - update order
      const oldStatus = order.payment.status;
      order.payment.status = status.status;
      
      if (status.paidAt) {
        order.payment.paymentDate = new Date(status.paidAt);
      }
      
      order.payment.lastCheckedAt = new Date();
      order.payment.statusSource = 'callback';
      await order.save();

      // Send confirmation email if payment completed
      if (status.status === 'completed') {
        try {
          const customerEmail = 
            order.personalInfo?.email || order.customerId?.email;
          
          if (customerEmail) {
            const emailData = await generatePaymentConfirmationEmail(order);
            emailQueue.add({
              subject: `Payment Confirmed - Booking #${order.orderNumber}`,
              content: emailData.html,
              recipients: [customerEmail],
              attachment: emailData.attachment,
            });
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
        }
      }

      return responseReturn(res, 200, {
        payment: order.payment,
        statusChanged: true,
        oldStatus,
        newStatus: status.status,
        message: 'Payment status updated',
      });
    }

    return responseReturn(res, 200, {
      payment: order.payment,
      statusChanged: false,
      message: 'Payment status unchanged',
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return responseReturn(res, 500, {
      message: 'Error checking payment status',
      error: error.message,
    });
  }
};
```

### Step 5: Create Frontend Payment Callback Page

```javascript
// frontend/src/pages/PaymentCallback.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/api';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const [status, setStatus] = useState('checking');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      toast.error('Invalid order ID');
      return;
    }

    checkPaymentStatus();
  }, [orderId]);

  const checkPaymentStatus = async () => {
    try {
      setStatus('checking');
      const { data } = await api.get(`/orders/${orderId}/payment-status`);

      setOrder(data.order || data);
      
      if (data.statusChanged && data.newStatus === 'completed') {
        setStatus('success');
        toast.success('Payment confirmed! You will receive a confirmation email shortly.');
        
        // Redirect to order confirmation after 3 seconds
        setTimeout(() => {
          navigate('/order-confirmation', {
            state: {
              orderId: data.order?._id || orderId,
              orderNumber: data.order?.orderNumber,
              paymentCompleted: true,
            },
          });
        }, 3000);
      } else if (data.payment?.status === 'completed') {
        setStatus('success');
        navigate('/order-confirmation', {
          state: {
            orderId: data.order?._id || orderId,
            orderNumber: data.order?.orderNumber,
            paymentCompleted: true,
          },
        });
      } else if (data.payment?.status === 'failed') {
        setStatus('failed');
        toast.error('Payment failed. Please try again.');
      } else {
        setStatus('pending');
      }
    } catch (error) {
      setStatus('error');
      toast.error('Error checking payment status');
      console.error('Payment status check error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      <Header />
      <main className="flex-grow py-12">
        <div className="mx-auto max-w-2xl px-4">
          {status === 'checking' && (
            <div className="rounded-xl bg-white p-8 text-center shadow-lg">
              <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-700"></div>
              <h2 className="text-xl font-bold text-gray-900">
                Verifying Payment Status...
              </h2>
              <p className="mt-2 text-gray-600">
                Please wait while we confirm your payment.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="rounded-xl bg-green-50 border-2 border-green-200 p-8 text-center shadow-lg">
              <div className="mb-4 inline-block rounded-full bg-green-500 p-3">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-900">
                Payment Confirmed!
              </h2>
              <p className="mt-2 text-green-700">
                Your payment has been successfully processed.
              </p>
              <p className="mt-4 text-sm text-green-600">
                Redirecting to your order confirmation...
              </p>
            </div>
          )}

          {status === 'pending' && (
            <div className="rounded-xl bg-yellow-50 border-2 border-yellow-200 p-8 text-center shadow-lg">
              <div className="mb-4 inline-block rounded-full bg-yellow-500 p-3">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-yellow-900">
                Payment Processing
              </h2>
              <p className="mt-2 text-yellow-700">
                Your payment is being processed. This may take a few minutes.
              </p>
              <button
                onClick={checkPaymentStatus}
                className="mt-4 rounded-lg bg-yellow-600 px-6 py-2 text-white font-semibold hover:bg-yellow-700"
              >
                Check Again
              </button>
            </div>
          )}

          {status === 'failed' && (
            <div className="rounded-xl bg-red-50 border-2 border-red-200 p-8 text-center shadow-lg">
              <div className="mb-4 inline-block rounded-full bg-red-500 p-3">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-900">
                Payment Failed
              </h2>
              <p className="mt-2 text-red-700">
                Your payment could not be processed. Please try again.
              </p>
              {order?.payment?.weTravelPaymentLink && (
                <a
                  href={order.payment.weTravelPaymentLink}
                  className="mt-4 inline-block rounded-lg bg-red-600 px-6 py-2 text-white font-semibold hover:bg-red-700"
                >
                  Retry Payment
                </a>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-xl bg-gray-50 border-2 border-gray-200 p-8 text-center shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900">
                Error
              </h2>
              <p className="mt-2 text-gray-700">
                Unable to verify payment status. Please contact support.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentCallback;
```

---

## Database Schema Updates

### Add Fields to Order Model

```javascript
// models/order.js - Update payment schema
payment: {
  // ... existing fields ...
  
  // New fields for automation
  lastCheckedAt: {
    type: Date,
  },
  statusSource: {
    type: String,
    enum: ['manual', 'webhook', 'callback', 'polling'],
    default: 'manual',
  },
  checkAttempts: {
    type: Number,
    default: 0,
  },
  lastCheckError: {
    type: String,
  },
}
```

---

## Environment Variables

```env
# Payment Status Automation
ENABLE_PAYMENT_STATUS_CHECKER=true
WETRAVEL_POLLING_INTERVAL=15  # minutes
WETRAVEL_WEBHOOK_ENABLED=false  # Set to true when webhooks are implemented
WETRAVEL_WEBHOOK_SECRET=your_webhook_secret_here

# Frontend URL for return callbacks
FRONTEND_URL=https://yourdomain.com
```

---

## Monitoring & Alerts

### Add Monitoring Dashboard

```javascript
// Track payment status check metrics
const paymentStatusMetrics = {
  totalChecks: 0,
  statusUpdates: 0,
  emailsSent: 0,
  errors: 0,
  lastCheckTime: null,
};

// Log metrics after each check
console.log('[Payment Status Metrics]', {
  totalChecks: paymentStatusMetrics.totalChecks,
  statusUpdates: paymentStatusMetrics.statusUpdates,
  successRate: (paymentStatusMetrics.statusUpdates / paymentStatusMetrics.totalChecks * 100).toFixed(2) + '%',
  emailsSent: paymentStatusMetrics.emailsSent,
  errors: paymentStatusMetrics.errors,
});
```

### Alert on Issues

- Alert if error rate > 10%
- Alert if no status updates in 24 hours (for recent orders)
- Alert if email sending fails repeatedly

---

## Testing Strategy

### 1. Test Return URL Callback
- Complete payment on WeTravel
- Return to callback URL
- Verify status update and email

### 2. Test Scheduled Polling
- Create test order with pending payment
- Wait for polling interval
- Verify status check and update

### 3. Test Webhook (if implemented)
- Use webhook testing tool (e.g., ngrok for local testing)
- Send test webhook payload
- Verify order update

### 4. Test Edge Cases
- Payment completed but order not found
- Duplicate webhook/callback calls
- Network failures during status check
- Invalid WeTravel responses

---

## Rollout Plan

### Week 1: Return URL Callback
- ✅ Implement callback endpoint
- ✅ Create frontend callback page
- ✅ Add return URL to payment links
- ✅ Test with real payments

### Week 2: Scheduled Polling
- ✅ Implement payment status checker
- ✅ Add cron job
- ✅ Test polling logic
- ✅ Monitor performance

### Week 3: Webhook Investigation
- ✅ Contact WeTravel support
- ✅ Review API documentation
- ✅ Test webhook endpoint (if available)
- ✅ Implement webhook handler

### Week 4: Hybrid Implementation
- ✅ Combine all methods
- ✅ Add monitoring
- ✅ Optimize polling frequency
- ✅ Full production rollout

---

## Success Metrics

### Key Performance Indicators

1. **Automation Rate**: % of payments automatically detected
   - Target: >95%

2. **Detection Time**: Average time from payment to status update
   - Target: <5 minutes (with webhooks) or <15 minutes (with polling)

3. **Email Delivery**: % of confirmation emails sent successfully
   - Target: >99%

4. **Error Rate**: % of status checks that fail
   - Target: <1%

---

## Cost-Benefit Analysis

### Current State (Manual)
- ⏱️ **Time**: 5-10 minutes per order (admin verification + update)
- 💰 **Cost**: Manual labor, delayed customer notifications
- ❌ **Issues**: Human error, delays, missed payments

### Automated State
- ⚡ **Time**: <1 minute (automatic)
- 💰 **Cost**: Minimal server resources
- ✅ **Benefits**: 
  - Instant customer notifications
  - No manual work
  - Better customer experience
  - Reduced errors

---

## Conclusion

The **Hybrid Approach (Solution 4)** is the state-of-the-art solution:

1. **Immediate**: Return URL callback for instant updates
2. **Reliable**: Scheduled polling as backup
3. **Future-proof**: Webhook integration when available
4. **Robust**: Multiple methods ensure no payments are missed

**Recommended Implementation Order:**
1. Start with Return URL Callback (quick win)
2. Add Scheduled Polling (reliability)
3. Investigate Webhooks (optimization)
4. Combine all methods (best practice)

This approach ensures maximum reliability and customer satisfaction while minimizing manual work and errors.

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Status**: Implementation Guide
