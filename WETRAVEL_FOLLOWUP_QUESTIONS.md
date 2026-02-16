# Follow-up Questions for WeTravel API Team

## Implementation Status

We have implemented the recommended fix:
1. ✅ Create Draft Trip & Package
2. ✅ Set Package Payment Plan
3. ✅ GET draft trip to capture `trip_option_uuid`
4. ✅ Update `trip_options[0]` with payment plan schema

## Questions for Clarification

### 1. Payment Schedule Structure

You mentioned `payment_schedule: [...]` but didn't specify the exact structure. We've implemented it as:

```json
{
  "payment_schedule": [
    {
      "amount_in_cents": 3000,
      "days_before_departure": 0
    },
    {
      "amount_in_cents": 12000,
      "days_before_departure": 7
    }
  ]
}
```

**Questions:**
- Is this the correct structure for `payment_schedule`?
- Should it be `amount_in_cents` or `price` or another field name?
- Are there any other required fields in the payment_schedule items?

### 2. Complete trip_options Payment Plan Structure

Could you provide a complete example of the `trip_options[0][payment_plan]` structure? For example:

```json
{
  "trip_options": [
    {
      "uuid": "trip_option_uuid",
      "payment_plan": {
        "enabled": true,
        "deposit_amount_in_cents": 50000,
        "currency": "USD",
        "payment_schedule": [
          // What is the exact structure here?
        ]
      }
    }
  ]
}
```

### 3. Endpoint for Updating trip_options

**Question:** What is the correct endpoint to update `trip_options`?
- Is it `PATCH /v2/draft_trips/{trip_uuid}` with `trip_options` in the data?
- Or is there a dedicated endpoint like `PATCH /v2/draft_trips/{trip_uuid}/trip_options/{trip_option_uuid}`?

### 4. Field Name Confirmation

**Questions:**
- ✅ `enabled: true` (not `enable_auto_payment`) - confirmed?
- ✅ `deposit_amount_in_cents` (not `deposit`) - confirmed?
- ✅ `currency` field required? - confirmed?
- ✅ `payment_schedule` array (not `installments`) - confirmed?
- Are there any other required fields in `payment_plan`?

### 5. Partial Payment Settings

**Question:** How do we specify `allow_partial_payment` in `trip_options[0][payment_plan]`?
- Is it a field like `allow_partial_payment: true`?
- Or is it implied by having `payment_schedule` with multiple items?

## Current Implementation

We're currently using:

```javascript
{
  trip_options: [
    {
      uuid: tripOptionUuid,
      payment_plan: {
        enabled: true,
        deposit_amount_in_cents: depositAmountCents,
        currency: currency,
        payment_schedule: [
          {
            amount_in_cents: depositAmountCents,
            days_before_departure: 0
          },
          {
            amount_in_cents: remainingAmountCents,
            days_before_departure: daysBeforeDeparture
          }
        ]
      }
    }
  ]
}
```

**Is this structure correct?**

## Thank You

We appreciate your guidance and look forward to your response!
