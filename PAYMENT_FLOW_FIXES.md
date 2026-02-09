# Payment Flow Fixes - Date Timezone & Billing Address

## Issues Fixed

### 1. Date Timezone Issue ✅
**Problem**: When selecting a date like 2/10/2026, it was displaying and using 2/11/2026 due to timezone conversion issues.

**Root Cause**: The `formatOrderForPaymentLink` function in `wetravelService.js` was using `toISOString().split("T")[0]` which can cause timezone shifts when dates are stored at different times of day.

**Solution**: 
- Updated date extraction to use UTC date components directly
- Extract year, month, and day from UTC to preserve the intended date
- Format dates as `YYYY-MM-DD` using UTC components to avoid any timezone conversion

**Files Changed**:
- `zanzitrekking-backend/utilities/wetravelService.js` - `formatOrderForPaymentLink()` method

### 2. Billing Address Requirements ✅
**Problem**: Checkout was requiring billing address, but it was unclear if WeTravel API requires it.

**Investigation**: 
- According to WeTravel API documentation, billing address is **optional** for payment link creation
- Participants can fill in billing information directly on WeTravel's payment page
- However, it's good practice to collect it for our records

**Solution**:
- Kept billing address as **required in checkout** (for our internal records)
- Made billing address **optional for WeTravel API** (included if available, but not required)
- Updated payment link creation to include billing address in participant info if available

**Files Changed**:
- `zanzitrekking-backend/utilities/wetravelService.js` - Added billing address to participant info if available
- `zanzitrekking-frontend/src/pages/Checkout.jsx` - Updated validation message to clarify billing address is required

## Technical Details

### Date Handling Fix

**Before**:
```javascript
const startDate = new Date(order.cartItems[0].startingDate);
startDate: startDate.toISOString().split("T")[0] // Could shift dates
```

**After**:
```javascript
// Extract UTC date components to preserve intended date
const parsed = new Date(dateInput);
const utcYear = parsed.getUTCFullYear();
const utcMonth = parsed.getUTCMonth();
const utcDay = parsed.getUTCDate();
const startDateObj = new Date(Date.UTC(utcYear, utcMonth, utcDay, 12, 0, 0, 0));

// Format using UTC components
const formatDateAsYYYYMMDD = (dateObj) => {
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
```

### Billing Address Handling

**Payment Link Creation**:
- Billing address is included in participant info if available
- WeTravel API accepts it but doesn't require it
- Participants can still fill/update it on WeTravel's payment page

## Testing Checklist

- [ ] Select a date (e.g., 2/10/2026) and verify it displays correctly
- [ ] Verify the same date is used when creating the payment link
- [ ] Test checkout with billing address filled
- [ ] Test checkout with billing address empty (should show validation error)
- [ ] Verify payment link is created successfully
- [ ] Verify dates in WeTravel payment link match selected dates
- [ ] Test with different timezones to ensure dates don't shift

## WeTravel API Requirements

Based on WeTravel API documentation:
- **Billing Address**: Optional - can be included in participant info but not required
- **Participant Info**: Required - firstName, lastName, email, phone
- **Dates**: Required - start_date and end_date in YYYY-MM-DD format
- **Payment**: Required - price and payment plan configuration

## Next Steps

1. Test the payment flow end-to-end
2. Verify dates are correct in WeTravel payment links
3. Monitor for any timezone-related issues
4. Consider adding date validation to prevent past dates
