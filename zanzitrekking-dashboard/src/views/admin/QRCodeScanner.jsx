"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  FaQrcode,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaDollarSign,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSearch,
} from "react-icons/fa";
import HeaderText from "./HeaderText";
import api from "../../api/api";

const QRCodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedOrder, setScannedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState("");
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            html5QrCodeRef.current.clear();
          })
          .catch((err) => {
            console.error("Error stopping scanner:", err);
          });
      }
    };
  }, []);

  const fetchOrderByNumber = async (orderNumber) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/orders/number/${orderNumber}`, {
        withCredentials: true,
      });
      setScannedOrder(data.order);
      setError(null);
    } catch (err) {
      console.error("Error fetching order:", err);
      
      // Handle 401 authentication errors
      if (err.response?.status === 401) {
        setError(
          "Authentication required. Please log in again and try again."
        );
      } else {
        setError(
          err.response?.data?.error ||
            `Order "${orderNumber}" not found. Please check the QR code and try again.`
        );
      }
      setScannedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const startScanning = async () => {
    setError(null); // Clear any previous errors
    
    try {
      // Check if we're on HTTPS (required for camera access)
      if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
        setError(
          "Camera requires HTTPS connection. Please use HTTPS or try manual entry."
        );
        return;
      }

      // First, set scanning to true so the DOM element is rendered
      setScanning(true);
      
      // Wait for the DOM element to be available
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Check if element exists
      const readerElement = document.getElementById("reader");
      if (!readerElement) {
        setScanning(false);
        setError("Scanner element not found. Please refresh the page and try again.");
        return;
      }

      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;

      // Try to get available cameras first
      let cameraId = null;
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          // Prefer back camera, fallback to first available
          const backCamera = devices.find(
            (device) => device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear") ||
            device.label.toLowerCase().includes("environment")
          );
          cameraId = backCamera ? backCamera.id : devices[0].id;
        }
      } catch (err) {
        console.log("Could not enumerate cameras, using default:", err);
      }

      // Start scanner with camera ID or facing mode
      const config = cameraId
        ? { deviceId: { exact: cameraId } }
        : { facingMode: "environment" }; // Fallback to facing mode

      await html5QrCode.start(
        config,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Success callback
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Error callback - ignore, scanner will keep trying
          // Only log if it's not a common scanning error
          if (!errorMessage.includes("NotFoundException")) {
            console.debug("Scanning error (normal):", errorMessage);
          }
        }
      );

      setError(null);
    } catch (err) {
      console.error("Error starting scanner:", err);
      
      // Provide more specific error messages
      let errorMessage = "Failed to start camera. ";
      
      if (err.name === "NotAllowedError" || err.message?.includes("permission")) {
        errorMessage += "Please allow camera access in your browser settings and try again.";
      } else if (err.name === "NotFoundError" || err.message?.includes("camera")) {
        errorMessage += "No camera found. Please use manual entry or connect a camera.";
      } else if (err.message?.includes("HTTPS")) {
        errorMessage += "Camera requires HTTPS connection. Please use HTTPS.";
      } else {
        errorMessage += `Error: ${err.message || "Unknown error"}. Try manual entry as an alternative.`;
      }
      
      setError(errorMessage);
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        setScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleScanSuccess = (orderNumber) => {
    stopScanning();
    fetchOrderByNumber(orderNumber);
  };

  const handleManualSearch = () => {
    if (manualInput.trim()) {
      setError(null); // Clear any previous errors
      fetchOrderByNumber(manualInput.trim());
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      confirmed: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      <div className="max-w-6xl mx-auto">
        <HeaderText title="QR Code Check-In Scanner" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="rounded-2xl bg-white p-6 shadow-nature-medium ring-1 ring-primary-100">
            <h2 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
              <FaQrcode className="text-secondary" />
              Scan QR Code
            </h2>

            {/* Manual Input */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or enter order number manually (e.g., ZT-20260209-0005)"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleManualSearch();
                  }}
                  className="flex-1 rounded-xl border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark outline-none placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                />
                <button
                  onClick={handleManualSearch}
                  disabled={loading || !manualInput.trim()}
                  className="rounded-xl bg-secondary px-6 py-2.5 text-white font-semibold transition-all hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FaSearch />
                  Search
                </button>
              </div>
            </div>

            {/* Scanner */}
            <div className="mb-4">
              {!scanning ? (
                <div className="space-y-3">
                  <button
                    onClick={startScanning}
                    className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-4 text-white font-semibold transition-all hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaQrcode />
                    Start Camera Scanner
                  </button>
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
                    <p className="font-semibold mb-1">📷 Camera Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>HTTPS connection required (secure site)</li>
                      <li>Camera permissions must be granted</li>
                      <li>Works best on mobile devices or tablets</li>
                      <li>Use manual entry if camera is unavailable</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    id="reader"
                    className="rounded-xl border-2 border-primary-200 overflow-hidden"
                    style={{ minHeight: "300px" }}
                  ></div>
                  <button
                    onClick={stopScanning}
                    className="w-full rounded-xl bg-red-500 px-6 py-3 text-white font-semibold transition-all hover:bg-red-600 flex items-center justify-center gap-2"
                  >
                    <FaTimesCircle />
                    Stop Scanner
                  </button>
                </div>
              )}
            </div>

            {loading && (
              <div className="text-center py-4">
                <FaSpinner className="animate-spin text-secondary mx-auto text-2xl" />
                <p className="text-text mt-2">Loading order details...</p>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
                <p className="text-red-800 font-semibold flex items-center gap-2 mb-2">
                  <FaTimesCircle />
                  {error}
                </p>
                <p className="text-sm text-red-700 mt-2">
                  💡 <strong>Tip:</strong> You can always use the manual entry above to search by order number.
                </p>
              </div>
            )}
          </div>

          {/* Order Details Section */}
          <div className="rounded-2xl bg-white p-6 shadow-nature-medium ring-1 ring-primary-100">
            <h2 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
              <FaUser className="text-secondary" />
              Order Details
            </h2>

            {scannedOrder ? (
              <div className="space-y-4">
                {/* Order Header */}
                <div className="rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-2 border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-primary-800">
                      Order #{scannedOrder.orderNumber}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                        scannedOrder.orderStatus
                      )}`}
                    >
                      {scannedOrder.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-light">Payment Status:</span>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                        scannedOrder.payment?.status
                      )}`}
                    >
                      {scannedOrder.payment?.status || "pending"}
                    </span>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="rounded-xl bg-primary-50/50 p-4 ring-1 ring-primary-100">
                  <h4 className="font-semibold text-primary-800 mb-3 flex items-center gap-2">
                    <FaUser className="text-secondary" />
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-primary-600 w-4" />
                      <span className="text-text-dark">
                        {scannedOrder.personalInfo?.firstName}{" "}
                        {scannedOrder.personalInfo?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-primary-600 w-4" />
                      <span className="text-text-dark">
                        {scannedOrder.personalInfo?.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-primary-600 w-4" />
                      <span className="text-text-dark">
                        {scannedOrder.personalInfo?.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="rounded-xl bg-primary-50/50 p-4 ring-1 ring-primary-100">
                  <h4 className="font-semibold text-primary-800 mb-3">Trip Details</h4>
                  <div className="space-y-3">
                    {scannedOrder.cartItems?.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-primary-200 bg-white p-3"
                      >
                        <p className="font-semibold text-primary-800">
                          {item.mainTitle}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-text">
                          <div>
                            <FaCalendar className="inline mr-1" />
                            {formatDate(item.startingDate)}
                          </div>
                          <div>
                            Travelers: {item.travelersNumber}
                          </div>
                          <div>
                            Status:{" "}
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(
                                item.itemStatus
                              )}`}
                            >
                              {item.itemStatus}
                            </span>
                          </div>
                          <div className="text-right font-semibold text-primary-800">
                            {formatCurrency(item.itemTotal)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="rounded-xl bg-primary-50/50 p-4 ring-1 ring-primary-100">
                  <h4 className="font-semibold text-primary-800 mb-3 flex items-center gap-2">
                    <FaDollarSign className="text-secondary" />
                    Payment Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-light">Subtotal:</span>
                      <span className="font-semibold text-text-dark">
                        {formatCurrency(scannedOrder.subtotal)}
                      </span>
                    </div>
                    {scannedOrder.serviceFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-text-light">Service Fee:</span>
                        <span className="font-semibold text-text-dark">
                          {formatCurrency(scannedOrder.serviceFee)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-primary-200 pt-2">
                      <span className="font-bold text-primary-800">Total:</span>
                      <span className="font-bold text-secondary text-lg">
                        {formatCurrency(scannedOrder.totalAmount)}
                      </span>
                    </div>
                    {scannedOrder.payment?.paymentDate && (
                      <div className="flex justify-between mt-2 pt-2 border-t border-primary-200">
                        <span className="text-text-light">Payment Date:</span>
                        <span className="text-text-dark">
                          {formatDate(scannedOrder.payment.paymentDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Check-in Status */}
                <div className="rounded-xl bg-green-50 border-2 border-green-200 p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <FaCheckCircle className="text-green-600" />
                    <span className="font-semibold">
                      QR Code Verified - Ready for Check-In
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-text-light">
                <FaQrcode className="text-6xl mx-auto mb-4 text-primary-200" />
                <p className="text-lg">Scan a QR code or enter order number</p>
                <p className="text-sm mt-2">
                  Order details will appear here after scanning
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
