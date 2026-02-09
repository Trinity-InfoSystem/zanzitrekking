# Client QR Code Usage Guide

## How Clients Can Use QR Codes at Check-In

### ✅ QR Code is Now Available for Clients!

Clients can now view, download, and print their booking QR codes directly from their order pages. This makes check-in quick and easy!

## Where Clients Can Find Their QR Code

### 1. **Order Detail Page** (`/order/:orderId`)
- Navigate to any completed order
- QR code appears prominently at the top when payment is completed
- Includes download and print buttons

### 2. **Order Confirmation Page** (`/order-confirmation`)
- Shown after order creation
- QR code appears when payment is completed
- Includes download and print buttons

### 3. **Dashboard Order Details** (if applicable)
- Clients can view orders in their dashboard
- QR code available for completed payments

## Features for Clients

### 📱 **Mobile-Friendly**
- QR code is optimized for mobile devices
- Can be saved to phone's photo gallery
- Easy to display at check-in

### 💾 **Download Option**
- Click "Download" button to save QR code as PNG image
- File name: `booking-qrcode-{ORDER_NUMBER}.png`
- Can be saved to phone, computer, or cloud storage

### 🖨️ **Print Option**
- Click "Print" button to print QR code
- Opens print dialog with formatted layout
- Includes booking code and instructions
- Perfect for printing and bringing to check-in

### 📋 **What's Included**
- Large, scannable QR code (250x250 pixels)
- Booking code (order number) displayed below
- Instructions for use at check-in
- High error correction level for reliability

## How It Works at Check-In

1. **Client arrives at check-in location**
2. **Staff scans the QR code** using a QR code scanner
3. **Booking details are instantly retrieved** from the order number
4. **Check-in is completed quickly** without manual entry

## When QR Code is Available

✅ **QR code is shown when:**
- Payment status is `"completed"`
- Order has been confirmed
- Payment has been processed

❌ **QR code is NOT shown when:**
- Payment is still pending
- Payment has failed
- Order has been cancelled

## Benefits for Clients

1. **Fast Check-In** - No need to search for booking confirmation emails
2. **Offline Access** - QR code can be saved/printed for offline use
3. **Mobile Convenience** - Easy to access on smartphone
4. **Professional** - Clean, branded QR code presentation
5. **Reliable** - High error correction ensures scanning works even if slightly damaged

## Technical Details

- **QR Code Library**: `qrcode.react`
- **Format**: SVG (scalable vector graphics)
- **Error Correction**: Level H (High - ~30% error correction)
- **Content**: Order number (e.g., `ZT-20260209-0005`)
- **Size**: 250x250 pixels (optimized for scanning)

## Client Instructions

### For Mobile Users:
1. Complete payment for your booking
2. Navigate to your order details page
3. Find the QR code section
4. Click "Download" to save to your phone
5. Keep it in your photo gallery for easy access at check-in

### For Desktop Users:
1. Complete payment for your booking
2. Navigate to your order details page
3. Find the QR code section
4. Click "Print" to print the QR code
5. Bring the printed QR code to check-in

### Alternative:
- Take a screenshot of the QR code on your phone
- Save it to your photo gallery
- Show it at check-in

## Admin Dashboard

Admins can also view QR codes in the dashboard:
- Go to **Payments** section
- Click "View" (eye icon) on any completed order
- QR code is displayed in the order details modal

## Summary

✅ QR codes are now available for **both clients and admins**  
✅ Clients can **download or print** QR codes  
✅ QR codes are **mobile-friendly** and easy to use  
✅ Only shown for **completed payments**  
✅ Makes check-in **fast and efficient**

The QR code feature is fully functional and ready for use!
