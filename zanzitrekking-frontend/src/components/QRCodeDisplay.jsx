import { QRCodeSVG } from "qrcode.react";
import { Download, Printer } from "lucide-react";
import { useRef } from "react";

/**
 * QR Code Display Component for Clients
 * Displays a QR code for the given order number with download/print options
 * Only shows for completed payments
 */
const QRCodeDisplay = ({ orderNumber, className = "" }) => {
  const qrRef = useRef(null);

  if (!orderNumber) {
    return null;
  }

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `booking-qrcode-${orderNumber}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Booking QR Code - ${orderNumber}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 20px;
            }
            .booking-code {
              margin-top: 20px;
              font-size: 18px;
              font-weight: bold;
            }
            .instructions {
              margin-top: 10px;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${qrRef.current.innerHTML}
            <div class="booking-code">Booking Code: ${orderNumber}</div>
            <div class="instructions">Present this QR code at check-in</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        ref={qrRef}
        className="rounded-xl border-2 border-primary/20 bg-white p-6 shadow-lg"
      >
        <QRCodeSVG
          value={orderNumber}
          size={250}
          level="H"
          includeMargin={true}
          fgColor="#000000"
          bgColor="#FFFFFF"
        />
      </div>
      <p className="mt-4 text-center text-lg font-semibold text-primary">
        Booking Code: {orderNumber}
      </p>
      <p className="mt-2 text-center text-sm text-text-light">
        Present this QR code at check-in for quick access to your booking details
      </p>
      
      {/* Action Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-all hover:bg-primary/90"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg border-2 border-primary bg-white px-4 py-2 text-primary transition-all hover:bg-primary/10"
        >
          <Printer className="h-4 w-4" />
          <span>Print</span>
        </button>
      </div>
      
      <p className="mt-4 text-center text-xs text-text-light">
        💡 Tip: Save this QR code to your phone or print it for easy check-in
      </p>
    </div>
  );
};

export default QRCodeDisplay;
