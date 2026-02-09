# Order Review Checklist

## Current Order Flow Analysis

### ✅ What's Working

1. **Order Creation**: Orders are being created successfully
2. **WeTravel Payment Links**: Payment links are being generated
3. **API Connection**: WeTravel API is connected and working
4. **Webhook Endpoint**: Ready to receive payment confirmations

### ⚠️ Issues Found

#### 1. **Billing Address - REQUIRED**

**Status**: ✅ Required and validated

**Current Implementation**:
- Billing address is **required** in both frontend and backend
- Validated in `orderController.js` (line 29-30)
- All fields are required: `street`, `city`, `state`, `zip`, `country`

**Recommendation**: 
- ✅ Keep it required (good for payment processing and records)
- This is standard practice for payment processing

#### 2. **Service Fee - NOT STORED IN DATABASE**

**Status**: ⚠️ **ISSUE FOUND**

**Current Implementation**:
- Service fee is hardcoded as **$25** in frontend:
  - `Checkout.jsx` line 112: `const serviceFee = 25;`
  - `Cart.jsx` line 30: `const serviceFee = 25;`
- Service fee is **added to total** in frontend (line 440)
- Service fee is **NOT sent to backend** in order creation
- Service fee is **NOT stored in order model**

**Problem**:
- Frontend shows: `$2,989.00 + $25.00 = $3,014.00`
- Backend receives: `$2,989.00` (service fee missing)
- WeTravel payment link created for: `$2,989.00` (service fee missing)
- **Mismatch between frontend total and WeTravel payment amount**

**Impact**:
- Customer sees $3,014.00 but only pays $2,989.00
- Service fee is not collected
- Order records don't include service fee

## Required Fixes

### Fix 1: Add Service Fee to Order Model

**File**: `zanzitrekking-backend/models/order.js`

Add service fee field:
```javascript
// Order-level Pricing Information
orderDiscount: {
  type: Number,
  default: 0,
},
serviceFee: {
  type: Number,
  default: 0,
},
subtotal: {
  type: Number,
  required: true,
},
totalAmount: {
  type: Number,
  required: true,
},
```

### Fix 2: Update Order Controller to Accept Service Fee

**File**: `zanzitrekking-backend/controllers/home/orderController.js`

In `createOrder` method, accept and store service fee:
```javascript
const { customerId, cartItems, personalInfo, billingAddress, paymentInfo, serviceFee } = req.body;

// ... existing code ...

// Calculate totals including service fee
order.calculateOrderTotals();
order.serviceFee = serviceFee || 0;
order.totalAmount = order.subtotal + order.serviceFee - order.orderDiscount;
```

### Fix 3: Update Order Calculation Method

**File**: `zanzitrekking-backend/models/order.js`

Update `calculateOrderTotals` method:
```javascript
orderSchema.methods.calculateOrderTotals = function () {
  let subtotal = 0;
  let totalDiscount = 0;

  this.cartItems.forEach((item) => {
    subtotal += item.itemSubtotal;
    totalDiscount += item.discount || 0;
  });

  this.subtotal = subtotal;
  // totalAmount should include serviceFee
  this.totalAmount = subtotal + (this.serviceFee || 0) - this.orderDiscount;

  return this;
};
```

### Fix 4: Send Service Fee from Frontend

**File**: `zanzitrekking-frontend/src/pages/Checkout.jsx`

In `handlePlaceOrder`, include service fee in order data:
```javascript
const orderData = {
  customerId: userInfo.id,
  cartItems: cartItems,
  personalInfo: formData.personalInfo,
  billingAddress: formData.billingAddress,
  paymentInfo: {
    method: "wetravel",
    status: "pending",
  },
  serviceFee: serviceFee, // Add this
};
```

### Fix 5: Update WeTravel Payment Link to Include Service Fee

**File**: `zanzitrekking-backend/controllers/home/orderController.js`

When creating WeTravel payment link, include service fee:
```javascript
const orderData = weTravelService.formatOrderForPaymentLink(order);
// orderData.totalAmount should already include serviceFee if we fix the calculation
```

## Testing Checklist

After implementing fixes:

- [ ] Create a test order
- [ ] Verify service fee is stored in database
- [ ] Verify WeTravel payment link amount matches frontend total
- [ ] Verify order confirmation shows correct total (including service fee)
- [ ] Test webhook payment confirmation
- [ ] Verify order status updates correctly

## Next Steps

1. **Immediate**: Fix service fee storage and calculation
2. **Verify**: Test order creation with service fee
3. **Monitor**: Check webhook receives correct payment amounts
4. **Document**: Update API documentation with service fee field

---

**Priority**: HIGH - Service fee mismatch needs to be fixed before production use
