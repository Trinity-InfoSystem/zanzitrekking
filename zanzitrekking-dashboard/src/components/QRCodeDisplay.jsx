import { QRCodeSVG } from "qrcode.react";

/**
 * QR Code Display Component
 * Displays a QR code for the given order number
 * Only shows for completed payments
 */
const QRCodeDisplay = ({ orderNumber, className = "" }) => {
  if (!orderNumber) {
    return null;
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="rounded-xl border-2 border-primary-200 bg-white p-4 shadow-sm">
        <QRCodeSVG
          value={orderNumber}
          size={200}
          level="H"
          includeMargin={true}
          fgColor="#000000"
          bgColor="#FFFFFF"
        />
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-primary-800">
        Booking Code: {orderNumber}
      </p>
      <p className="mt-1 text-center text-xs text-text">
        Present this QR code at check-in for quick access to your booking details
      </p>
    </div>
  );
};

export default QRCodeDisplay;
