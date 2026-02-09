# Admin QR Code Scanner Guide

## How Admins Can Scan QR Codes at Check-In

### ✅ QR Code Scanner is Now Available!

Admins can now scan customer QR codes at check-in to instantly retrieve and display all order information.

## Accessing the QR Scanner

1. **Navigate to Dashboard**
   - Log in to the admin dashboard
   - Look for **"QR Code Scanner"** in the sidebar navigation (QR code icon)
   - Or go directly to: `/admin/dashboard/qr-scanner`

## How to Use the Scanner

### Method 1: Camera Scanner (Recommended)

1. **Click "Start Camera Scanner"**
   - The scanner will request camera permissions
   - Allow camera access when prompted
   - The camera will activate and start scanning

2. **Point Camera at QR Code**
   - Hold the customer's QR code (on phone or printed) in front of the camera
   - Keep the QR code within the scanning box
   - Ensure good lighting for best results

3. **Automatic Detection**
   - When a QR code is detected, scanning stops automatically
   - Order details are fetched and displayed instantly
   - No need to click anything - it's automatic!

4. **Stop Scanner**
   - Click "Stop Scanner" when done
   - Camera will turn off

### Method 2: Manual Entry

1. **Enter Order Number**
   - Type the order number in the search box (e.g., `ZT-20260209-0005`)
   - Click "Search" button or press Enter
   - Order details will be displayed

## What Information is Displayed

When a QR code is scanned or order number is entered, the following information is shown:

### 📋 Order Summary
- **Order Number** - The booking reference
- **Order Status** - Current status (pending, confirmed, completed, etc.)
- **Payment Status** - Payment completion status

### 👤 Customer Information
- **Full Name** - Customer's first and last name
- **Email Address** - Customer's contact email
- **Phone Number** - Customer's contact phone

### 🗺️ Trip Details
For each trip in the order:
- **Trip Title** - Name of the trip/package
- **Starting Date** - When the trip begins
- **Number of Travelers** - How many people
- **Trip Status** - Current status of the trip
- **Amount** - Price for this trip

### 💰 Payment Information
- **Subtotal** - Base amount before fees
- **Service Fee** - Any additional fees
- **Total Amount** - Final amount paid
- **Payment Date** - When payment was completed

### ✅ Check-In Status
- **Verification Message** - Confirms QR code was successfully verified
- **Ready for Check-In** - Indicates customer is ready to be checked in

## Use Cases

### At Check-In Location

1. **Customer arrives** with QR code (on phone or printed)
2. **Admin opens QR Scanner** in dashboard
3. **Admin scans QR code** using camera
4. **Order details appear instantly** - all customer and trip information
5. **Admin verifies** customer identity and booking details
6. **Check-in completed** - customer is ready!

### Benefits

✅ **Fast Check-In** - No need to search for orders manually  
✅ **Accurate** - Direct lookup by order number eliminates errors  
✅ **Complete Information** - All booking details in one place  
✅ **Mobile-Friendly** - Works on tablets and phones for on-the-go check-in  
✅ **Offline Capable** - Manual entry works even without camera  

## Technical Details

### Backend Endpoint
- **URL**: `GET /api/orders/number/:orderNumber`
- **Example**: `GET /api/orders/number/ZT-20260209-0005`
- **Response**: Full order details with populated customer and trip information

### Frontend Scanner
- **Library**: `html5-qrcode` - Modern browser-based QR code scanner
- **Camera**: Uses device's back camera (or front camera if back not available)
- **Format**: Supports all standard QR code formats

### Security
- **Authentication Required** - Only logged-in admins can access
- **Order Lookup** - Validates order exists before displaying
- **Error Handling** - Shows clear error messages if order not found

## Troubleshooting

### Camera Not Working
- **Check Permissions** - Ensure browser has camera access
- **Use HTTPS** - Camera requires secure connection
- **Try Manual Entry** - Use the search box as alternative

### QR Code Not Scanning
- **Check Lighting** - Ensure good lighting conditions
- **Hold Steady** - Keep QR code still and in focus
- **Try Manual Entry** - Enter order number directly

### Order Not Found
- **Verify Order Number** - Check that the QR code contains correct order number
- **Check Database** - Ensure order exists in system
- **Try Different Format** - Some QR codes may have extra characters

## Best Practices

1. **Test Before Event** - Test scanner before actual check-in day
2. **Have Backup** - Keep manual entry option ready
3. **Good Lighting** - Ensure check-in area has adequate lighting
4. **Stable Connection** - Ensure internet connection is stable
5. **Mobile Device** - Use tablet or phone for easier scanning

## Summary

✅ **QR Scanner Available** - Access via sidebar navigation  
✅ **Two Methods** - Camera scanning or manual entry  
✅ **Complete Information** - All order details displayed instantly  
✅ **Fast & Efficient** - Quick check-in process  
✅ **Mobile-Friendly** - Works on any device with camera  

The QR code scanner is fully functional and ready for check-in operations!
