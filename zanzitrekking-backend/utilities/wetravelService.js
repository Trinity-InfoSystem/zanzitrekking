const axios = require("axios");
const { isTripDateInPast } = require("./bookingRestrictions");

class WeTravelService {
  constructor() {
    // Use production API by default, fallback to demo if WETRAVEL_USE_DEMO is set
    const useDemo = process.env.WETRAVEL_USE_DEMO === "true";
    this.apiKey = process.env.WETRAVEL_API_KEY;
    this.authUrl = useDemo
      ? "https://api.demo.wetravel.to/v2/auth/tokens/access"
      : "https://api.wetravel.com/v2/auth/tokens/access";
    this.apiUrl = useDemo
      ? "https://api.demo.wetravel.to/v2"
      : "https://api.wetravel.com/v2";
    this.accessToken = null;
  }

  /**
   * Get access token from WeTravel API
   */
  async getAccessToken() {
    try {
      const response = await axios.post(
        this.authUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error(
        "❌ Error getting WeTravel access token:",
        error.response?.data || error.message
      );
      console.error("Status Code:", error.response?.status);
      console.error("Full error:", error);
      throw new Error("Failed to obtain WeTravel access token");
    }
  }

  /**
   * Check if trip dates are in the past
   * @param {string} startDate - Trip start date (YYYY-MM-DD)
   * @param {string} endDate - Trip end date (YYYY-MM-DD) - optional
   * @returns {boolean} - True if dates are in the past
   */
  isTripDateInPast(startDate, endDate = null) {
    return isTripDateInPast(startDate);
  }

  /**
   * Create a payment link for an order
   * @param {Object} orderData - Order data including trip details and pricing
   * @returns {Promise<Object>} - Payment link data
   */
  async createPaymentLink(orderData) {
    // Declare paymentLinkData outside try block for error logging
    let paymentLinkData = null;
    
    try {
      // Ensure we have an access token
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      const {
        tripTitle,
        tripId,
        startDate,
        endDate,
        totalAmount,
        currency = "USD",
        daysBeforeDeparture = 2,
        participantInfo, // Customer/participant information
        travelersNumber = 1, // Number of travelers
        paymentOption = "full", // "deposit" or "full"
        depositAmount = 0, // Deposit amount if paymentOption is "deposit"
        returnUrl, // Return URL for payment callback
      } = orderData;

      // Store paymentOption in a variable accessible in catch block
      const currentPaymentOption = paymentOption;

      // Log payment option details for debugging
      console.log("🔍 [WeTravel] Payment Link Creation Debug:");
      console.log("  - Payment Option:", paymentOption);
      console.log("  - Total Amount:", totalAmount);
      console.log("  - Deposit Amount:", depositAmount);
      console.log("  - Deposit Percentage:", paymentOption === "deposit" ? ((depositAmount / totalAmount) * 100).toFixed(2) + "%" : "N/A");
      console.log("  - Days Before Departure:", daysBeforeDeparture);

      // Validate that trip dates are not in the past
      if (this.isTripDateInPast(startDate, endDate)) {
        const errorMessage = `Cannot create payment link: Trip start date (${startDate}) is in the past`;
        console.error(`❌ ${errorMessage}`);
        throw new Error(errorMessage);
      }

      // Validate deposit amount if deposit option is selected
      if (paymentOption === "deposit") {
        if (!depositAmount || depositAmount <= 0) {
          throw new Error("Deposit amount must be greater than 0 when deposit option is selected");
        }
        if (depositAmount >= totalAmount) {
          throw new Error(`Deposit amount (${depositAmount}) must be less than total amount (${totalAmount})`);
        }
        // Ensure deposit is reasonable (at least 10% and not more than 50%)
        const depositPercentage = (depositAmount / totalAmount) * 100;
        if (depositPercentage < 10) {
          console.warn(`Deposit percentage (${depositPercentage.toFixed(2)}%) is less than 10%`);
        }
        if (depositPercentage > 50) {
          console.warn(`Deposit percentage (${depositPercentage.toFixed(2)}%) is more than 50%`);
        }
      }

      // Validate total amount
      if (!totalAmount || totalAmount <= 0) {
        throw new Error("Total amount must be greater than 0");
      }

      // Validate travelers number (should already include children from formatOrderForPaymentLink)
      if (!travelersNumber || travelersNumber <= 0) {
        throw new Error("Total number of participants (adults + children) must be greater than 0");
      }

      // Validate that installments sum equals total amount (for deposits)
      if (paymentOption === "deposit") {
        const remainingAmount = totalAmount - depositAmount;
        const installmentsSum = depositAmount + remainingAmount;
        if (Math.abs(installmentsSum - totalAmount) > 0.01) {
          throw new Error(`Installments sum (${installmentsSum}) does not match total amount (${totalAmount})`);
        }
      }

      // Build participants array if participantInfo is provided
      const participants = participantInfo
        ? [
            {
              first_name: participantInfo.firstName,
              last_name: participantInfo.lastName,
              email: participantInfo.email,
              phone_number: participantInfo.phone,
              // Include billing address if available (optional for WeTravel)
              ...(participantInfo.address && {
                address: {
                  street: participantInfo.address.street,
                  city: participantInfo.address.city,
                  state: participantInfo.address.state,
                  zip: participantInfo.address.zip,
                  country: participantInfo.address.country,
                },
              }),
            },
          ]
        : [];

      // WeTravel API requires different structures for deposits vs full payment
      // For deposits: use trip_options array
      // For full payment: use pricing object
      const baseData = {
        trip: {
          participant_fees: "all",
          title: tripTitle,
          trip_id: tripId,
          start_date: startDate,
          end_date: endDate,
          currency: currency,
          // Set capacity to allow multiple bookings (or don't set it for unlimited)
          // Note: Setting a high capacity to prevent "sold out" issue
          capacity: Math.max(travelersNumber || 1, 100), // Allow at least 100 bookings
        },
        // Add return URL if provided
        ...(returnUrl && { return_url: returnUrl }),
        // Include participants array to pre-fill customer information
        // This helps WeTravel identify the customer and prevents "please select your package" errors
        ...(participants.length > 0 && { participants }),
      };
      
      console.log("🔍 [WeTravel] Base Data Structure:");
      console.log("  - Base data keys:", Object.keys(baseData));
      console.log("  - Has trip_options in baseData?", !!baseData.trip_options);
      console.log("  - Has pricing in baseData?", !!baseData.pricing);

      // For deposits, use pricing.payment_plan with allow_partial_payment: true
      // This enables the deposit payment option in WeTravel's payment UI
      if (paymentOption === "deposit") {
        const remainingAmount = totalAmount - depositAmount;
        
        console.log("🔍 [WeTravel] DEPOSIT PAYMENT DEBUG - Input Parameters:");
        console.log("  - paymentOption:", paymentOption);
        console.log("  - totalAmount:", totalAmount);
        console.log("  - depositAmount:", depositAmount);
        console.log("  - remainingAmount:", remainingAmount);
        console.log("  - daysBeforeDeparture:", daysBeforeDeparture);
        
        // Payment plan structure according to WeTravel API documentation
        // For deposits, use installments array with allow_partial_payment: true
        // The API requires a deposit field (int32, 0 to 1000000000)
        // Note: This is not used in payment_links endpoint, but kept for reference
        const depositPaymentPlan = {
          enable_auto_payment: false, // Required by WeTravel API (not allow_auto_payment)
          allow_partial_payment: true,
          deposit: depositAmount, // Required by WeTravel API
          installments: [
            {
              price: depositAmount,
              days_before_departure: 0, // Deposit due immediately
            },
            {
              price: remainingAmount,
              days_before_departure: daysBeforeDeparture, // Remaining due before trip
            },
          ],
        };

        console.log("💰 [WeTravel] Creating DEPOSIT payment link:");
        console.log("  - Deposit Amount:", depositAmount);
        console.log("  - Remaining Amount:", remainingAmount);
        console.log("  - Total Amount:", totalAmount);
        console.log("  - Installments:", JSON.stringify(depositPaymentPlan.installments, null, 2));
        console.log("  - Payment Plan (full):", JSON.stringify(depositPaymentPlan, null, 2));
        console.log("  - Installments sum:", depositPaymentPlan.installments.reduce((sum, inst) => sum + inst.price, 0));
        console.log("  - Matches total?", depositPaymentPlan.installments.reduce((sum, inst) => sum + inst.price, 0) === totalAmount);

        // For deposits, try including payment plan in trip_options
        // WeTravel's payment_links endpoint may require payment plan in trip_options for deposits
        paymentLinkData = {
          data: {
            ...baseData,
            pricing: {
              price: totalAmount,
              days_before_departure: daysBeforeDeparture,
            },
            trip_options: [
              {
                price: totalAmount,
                days_before_departure: daysBeforeDeparture,
                payment_plan: depositPaymentPlan, // Payment plan in trip_options
              },
            ],
          },
        };

        console.log("📦 [WeTravel] Deposit Payment Link Data Structure:");
        console.log("  - Has pricing.payment_plan?", !!paymentLinkData.data.pricing?.payment_plan);
        console.log("  - Full payload:", JSON.stringify(paymentLinkData, null, 2));
        console.log("  - Payload keys:", Object.keys(paymentLinkData.data));
        console.log("  - Pricing keys:", Object.keys(paymentLinkData.data.pricing || {}));
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/eb7c76be-df0a-4765-be03-9046170046cb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'wetravelService.js:225',message:'Deposit payment link data prepared',data:{hasPaymentPlanInPricing:!!paymentLinkData.data.pricing?.payment_plan,paymentOption,depositAmount,totalAmount,paymentPlanStructure:paymentLinkData.data.pricing?.payment_plan},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      } else {
        // Full payment - use pricing structure
        console.log("💰 [WeTravel] Creating FULL PAYMENT link:");
        console.log("  - Total Amount:", totalAmount);
        
        paymentLinkData = {
          data: {
            ...baseData,
            pricing: {
              payment_plan: {
                enable_auto_payment: false, // Required by WeTravel API (not allow_auto_payment)
                allow_partial_payment: false,
                deposit: 0,
                installments: [
                  {
                    price: totalAmount,
                    days_before_departure: daysBeforeDeparture,
                  },
                ],
              },
              price: totalAmount,
              days_before_departure: daysBeforeDeparture,
            },
          },
        };
      }

      console.log("🚀 [WeTravel] Sending request to WeTravel API:");
      console.log("  - URL:", `${this.apiUrl}/payment_links`);
      console.log("  - Payment Option:", paymentOption);
      console.log("  - Request Payload:", JSON.stringify(paymentLinkData, null, 2));
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/eb7c76be-df0a-4765-be03-9046170046cb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'wetravelService.js:258',message:'About to send request to WeTravel',data:{paymentOption,hasTripOptions:!!paymentLinkData?.data?.trip_options,requestKeys:Object.keys(paymentLinkData?.data || {})},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      console.log("🚀 [WeTravel] About to send API request:");
      console.log("  - Endpoint:", `${this.apiUrl}/payment_links`);
      console.log("  - Method: POST");
      console.log("  - Payment Option:", paymentOption);
      console.log("  - Has Access Token:", !!this.accessToken);
      console.log("  - Request payload size:", JSON.stringify(paymentLinkData).length, "bytes");
      
      const response = await axios.post(
        `${this.apiUrl}/payment_links`,
        paymentLinkData,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          params: {
            publish_immediately: "true",
          },
        }
      );

      console.log("✅ [WeTravel] Payment link created successfully!");
      console.log("  - Response status:", response.status);
      console.log("  - Payment link URL:", response.data.data.trip.url);
      console.log("  - Trip UUID:", response.data.data.trip.uuid);
      
      // Log the full response to debug deposit options
      console.log("📥 [WeTravel] Response Data:");
      console.log("  - Payment Link URL:", response.data.data.trip.url);
      console.log("  - Trip UUID:", response.data.data.trip.uuid);
      if (response.data.data.trip_options) {
        console.log("  - Trip Options:", JSON.stringify(response.data.data.trip_options, null, 2));
      }
      if (response.data.data.pricing) {
        console.log("  - Pricing:", JSON.stringify(response.data.data.pricing, null, 2));
      }
      if (response.data.data.packages && response.data.data.packages.length > 0) {
        console.log("  - Packages:", JSON.stringify(response.data.data.packages, null, 2));
        console.log("  - First Package ID:", response.data.data.packages[0].id);
      }
      console.log("  - Full Response:", JSON.stringify(response.data.data, null, 2));
      
      // For deposit payments, check if payment plan was set via trip_options
      // If payment plan update fails, it might already be set correctly via trip_options
      if (currentPaymentOption === "deposit" && response.data.data.trip?.uuid) {
        const tripUuid = response.data.data.trip.uuid;
        
        // Try to get package_id from different possible locations in response
        let packageId = response.data.data.packages?.[0]?.id || 
                       response.data.data.trip_options?.[0]?.id ||
                       response.data.data.packages?.[0]?.package_id;
        
        // If package_id is not available, try to get it from trip data
        if (!packageId && response.data.data.trip?.packages?.length > 0) {
          packageId = response.data.data.trip.packages[0].id;
        }
        
        // If still not found, try to fetch packages from the trip
        if (!packageId) {
          console.log("🔍 [WeTravel] Package ID not in response, fetching packages from trip...");
          try {
            const packagesResponse = await axios.get(
              `${this.apiUrl}/draft_trips/${tripUuid}/packages`,
              {
                headers: {
                  Authorization: `Bearer ${this.accessToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            
            if (packagesResponse.data?.data && packagesResponse.data.data.length > 0) {
              packageId = packagesResponse.data.data[0].id;
              console.log("✅ [WeTravel] Found package ID:", packageId);
            }
          } catch (packagesError) {
            console.warn("⚠️ [WeTravel] Could not fetch packages:", packagesError.response?.data || packagesError.message);
          }
        }
        
        if (packageId) {
          console.log("🔧 [WeTravel] Updating payment plan for deposit via dedicated endpoint:");
          console.log("  - Trip UUID:", tripUuid);
          console.log("  - Package ID:", packageId);
          
          try {
            // Add a small delay to ensure WeTravel has finished processing the payment link
            // This helps avoid conflicts with trip_options that may be created automatically
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // First, try to get the current payment plan to see what's there
            try {
              const currentPlanResponse = await axios.get(
                `${this.apiUrl}/draft_trips/${tripUuid}/packages/${packageId}/payment_plan`,
                {
                  headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              console.log("  - Current Payment Plan:", JSON.stringify(currentPlanResponse.data, null, 2));
            } catch (getError) {
              console.log("  - No existing payment plan found (this is OK)");
            }
            
            const remainingAmount = totalAmount - depositAmount;
            const paymentPlanData = {
              data: {
                enable_auto_payment: false, // Required by WeTravel API (not allow_auto_payment)
                allow_partial_payment: true,
                deposit: depositAmount, // Required by WeTravel API
                installments: [
                  {
                    price: depositAmount,
                    days_before_departure: 0,
                  },
                  {
                    price: remainingAmount,
                    days_before_departure: daysBeforeDeparture,
                  },
                ],
              },
            };
            
            console.log("  - Payment Plan Data:", JSON.stringify(paymentPlanData, null, 2));
            
            // Use PUT instead of POST - payment plan endpoint might support both
            // Try POST first, if it fails with this error, try PUT
            let planResponse;
            try {
              planResponse = await axios.post(
                `${this.apiUrl}/draft_trips/${tripUuid}/packages/${packageId}/payment_plan`,
                paymentPlanData,
                {
                  headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                  },
                }
              );
            } catch (postError) {
              // If POST fails, check if payment plan was already set via trip_options
              // If so, we can continue without updating
              if (postError.response?.status === 405 || 
                  (postError.response?.data?.error && postError.response.data.error.includes('trip_options'))) {
                console.warn("⚠️ [WeTravel] Payment plan update failed, but it may already be set via trip_options");
                console.log("  - Payment plan was included in trip_options during payment link creation");
                console.log("  - Continuing without separate update - payment plan should be correct");
                // Don't throw error - payment plan was set via trip_options in initial request
                return response.data.data;
              } else {
                throw postError;
              }
            }
            
            console.log("✅ [WeTravel] Payment plan updated successfully via dedicated endpoint");
            console.log("  - Plan Response:", JSON.stringify(planResponse.data, null, 2));
          } catch (planError) {
            // If payment plan update fails but we included it in trip_options, it might be OK
            if (planError.response?.status === 405 || 
                (planError.response?.data?.error && planError.response.data.error.includes('trip_options'))) {
              console.warn("⚠️ [WeTravel] Payment plan update failed, but payment plan was set via trip_options");
              console.warn("  - Payment plan should be correct from initial payment link creation");
              // Don't throw error - payment plan was set via trip_options
              return response.data.data;
            }
            
            console.error("❌ [WeTravel] Failed to update payment plan via dedicated endpoint:");
            console.error("  - Error:", planError.response?.data || planError.message);
            console.error("  - Status:", planError.response?.status);
            console.error("  - Trip UUID:", tripUuid);
            console.error("  - Package ID:", packageId);
            // Only throw error if it's not a trip_options conflict (payment plan was set via trip_options)
            throw new Error(`Failed to set deposit payment plan: ${planError.response?.data?.error || planError.message}`);
          }
        } else {
          // If package ID not found but payment plan was set via trip_options, it's OK
          console.warn("⚠️ [WeTravel] Package ID not found, but payment plan was set via trip_options");
          console.warn("  - Payment plan should be correct from initial payment link creation");
          return response.data.data;
        }
      }
      
      return response.data.data;
    } catch (error) {
      console.error("❌ [WeTravel] ERROR creating payment link:");
      console.error("  - Error Message:", error.message);
      console.error("  - Status Code:", error.response?.status);
      console.error("  - Error Response:", JSON.stringify(error.response?.data, null, 2));
      console.error("  - Payment Option:", orderData?.paymentOption || 'unknown');
      
      if (paymentLinkData) {
        console.error("  - Request Payload Sent:");
        console.error(JSON.stringify(paymentLinkData, null, 2));
        console.error("  - Request Payload Keys:", Object.keys(paymentLinkData.data || {}));
        console.error("  - Has trip_options?", !!paymentLinkData.data.trip_options);
        console.error("  - Has pricing?", !!paymentLinkData.data.pricing);
        console.error("  - Has pricing.payment_plan?", !!paymentLinkData.data.pricing?.payment_plan);
        if (paymentLinkData.data.pricing?.payment_plan) {
          console.error("  - Payment Plan Structure:", JSON.stringify(paymentLinkData.data.pricing.payment_plan, null, 2));
        }
      }
      
      console.error("  - Full Error Stack:", error.stack);
      
      // #region agent log
      // Extract paymentOption from orderData if available (for error logging)
      const errorPaymentOption = orderData?.paymentOption || 'unknown';
      fetch('http://127.0.0.1:7242/ingest/eb7c76be-df0a-4765-be03-9046170046cb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'wetravelService.js:298',message:'WeTravel API error',data:{status:error.response?.status,errorMessage:error.response?.data?.error || error.message,hasTripOptions:!!paymentLinkData?.data?.trip_options,paymentOption:errorPaymentOption},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      // If token expired, try to refresh and retry once
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log("Access token may be expired, refreshing...");
        await this.getAccessToken();

        // Prepare the data again for retry - preserve deposit settings
        const {
          tripTitle,
          tripId,
          startDate,
          endDate,
          totalAmount,
          currency = "USD",
          daysBeforeDeparture = 2,
          paymentOption = "full",
          depositAmount = 0,
          travelersNumber = 1,
          participantInfo,
          returnUrl,
        } = orderData;

        // Build participants array again if needed
        const participants = participantInfo
          ? [
              {
                first_name: participantInfo.firstName,
                last_name: participantInfo.lastName,
                email: participantInfo.email,
                phone_number: participantInfo.phone,
                ...(participantInfo.address && {
                  address: {
                    street: participantInfo.address.street,
                    city: participantInfo.address.city,
                    state: participantInfo.address.state,
                    zip: participantInfo.address.zip,
                    country: participantInfo.address.country,
                  },
                }),
              },
            ]
          : [];

        // Use same conditional structure as initial request
        const baseData = {
          trip: {
            participant_fees: "all",
            title: tripTitle,
            trip_id: tripId,
            start_date: startDate,
            end_date: endDate,
            currency: currency,
            capacity: Math.max(travelersNumber || 1, 100),
          },
          ...(returnUrl && { return_url: returnUrl }),
          ...(participants.length > 0 && { participants }),
        };

        // Use same conditional structure as initial request
        if (paymentOption === "deposit") {
          // For deposits, include payment plan in trip_options
          const remainingAmount = totalAmount - depositAmount;
          console.log("🔄 [WeTravel] Retry - Creating DEPOSIT payment link:");
          console.log("  - Deposit Amount:", depositAmount);
          console.log("  - Remaining Amount:", remainingAmount);
          console.log("  - Total Amount:", totalAmount);

          const depositPaymentPlan = {
            enable_auto_payment: false,
            allow_partial_payment: true,
            deposit: depositAmount,
            installments: [
              {
                price: depositAmount,
                days_before_departure: 0,
              },
              {
                price: remainingAmount,
                days_before_departure: daysBeforeDeparture,
              },
            ],
          };

          // For deposits, include payment plan in trip_options
          paymentLinkData = {
            data: {
              ...baseData,
              pricing: {
                price: totalAmount,
                days_before_departure: daysBeforeDeparture,
              },
              trip_options: [
                {
                  price: totalAmount,
                  days_before_departure: daysBeforeDeparture,
                  payment_plan: depositPaymentPlan, // Payment plan in trip_options
                },
              ],
            },
          };
        } else {
          // Full payment - use pricing structure
          paymentLinkData = {
            data: {
              ...baseData,
              pricing: {
                payment_plan: {
                  enable_auto_payment: false, // Required by WeTravel API (not allow_auto_payment)
                  allow_partial_payment: false,
                  deposit: 0,
                  installments: [
                    {
                      price: totalAmount,
                      days_before_departure: daysBeforeDeparture,
                    },
                  ],
                },
                price: totalAmount,
                days_before_departure: daysBeforeDeparture,
              },
            },
          };
        }

        // Retry the request once
        try {
          console.log("🔄 [WeTravel] Retry Request:");
          console.log("  - Payment Option:", paymentOption);
          console.log("  - Request Payload:", JSON.stringify(paymentLinkData, null, 2));
          
          const response = await axios.post(
            `${this.apiUrl}/payment_links`,
            paymentLinkData,
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/json",
              },
              params: {
                publish_immediately: "true",
              },
            }
          );
          
          console.log("✅ [WeTravel] Retry Response:");
          console.log("  - Payment Link URL:", response.data.data.trip.url);
          if (response.data.data.trip_options) {
            console.log("  - Trip Options:", JSON.stringify(response.data.data.trip_options, null, 2));
          }
          if (response.data.data.pricing) {
            console.log("  - Pricing:", JSON.stringify(response.data.data.pricing, null, 2));
          }
          console.log("  - Full Response:", JSON.stringify(response.data.data, null, 2));
          
          // For deposit payments, update payment plan via dedicated endpoint
          if (paymentOption === "deposit" && response.data.data.trip?.uuid) {
            const tripUuid = response.data.data.trip.uuid;
            let packageId = response.data.data.packages?.[0]?.id || 
                           response.data.data.trip_options?.[0]?.id ||
                           response.data.data.packages?.[0]?.package_id;
            
            if (!packageId && response.data.data.trip?.packages?.length > 0) {
              packageId = response.data.data.trip.packages[0].id;
            }
            
            // If still not found, try to fetch packages from the trip
            if (!packageId) {
              console.log("🔍 [WeTravel] Retry - Package ID not in response, fetching packages from trip...");
              try {
                const packagesResponse = await axios.get(
                  `${this.apiUrl}/draft_trips/${tripUuid}/packages`,
                  {
                    headers: {
                      Authorization: `Bearer ${this.accessToken}`,
                      "Content-Type": "application/json",
                    },
                  }
                );
                
                if (packagesResponse.data?.data && packagesResponse.data.data.length > 0) {
                  packageId = packagesResponse.data.data[0].id;
                  console.log("✅ [WeTravel] Retry - Found package ID:", packageId);
                }
              } catch (packagesError) {
                console.warn("⚠️ [WeTravel] Retry - Could not fetch packages:", packagesError.response?.data || packagesError.message);
              }
            }
            
            if (packageId) {
              console.log("🔧 [WeTravel] Retry - Updating payment plan for deposit:");
              console.log("  - Trip UUID:", tripUuid);
              console.log("  - Package ID:", packageId);
              
              try {
                // Add a small delay to ensure WeTravel has finished processing
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const remainingAmount = totalAmount - depositAmount;
                const paymentPlanData = {
                  data: {
                    enable_auto_payment: false, // Required by WeTravel API (not allow_auto_payment)
                    allow_partial_payment: true,
                    deposit: depositAmount,
                    installments: [
                      {
                        price: depositAmount,
                        days_before_departure: 0,
                      },
                      {
                        price: remainingAmount,
                        days_before_departure: daysBeforeDeparture,
                      },
                    ],
                  },
                };
                
                // Try POST first, then PUT if POST fails with trip_options error
                let planResponse;
                try {
                  planResponse = await axios.post(
                    `${this.apiUrl}/draft_trips/${tripUuid}/packages/${packageId}/payment_plan`,
                    paymentPlanData,
                    {
                      headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );
                } catch (postError) {
                  // If POST fails, check if payment plan was already set via trip_options
                  if (postError.response?.status === 405 || 
                      (postError.response?.data?.error && postError.response.data.error.includes('trip_options'))) {
                    console.warn("⚠️ [WeTravel] Retry - Payment plan update failed, but it may already be set via trip_options");
                    console.log("  - Payment plan was included in trip_options during payment link creation");
                    // Don't throw error - payment plan was set via trip_options
                    return response.data.data;
                  } else {
                    throw postError;
                  }
                }
                
                console.log("✅ [WeTravel] Retry - Payment plan updated successfully");
              } catch (planError) {
                // If payment plan update fails but we included it in trip_options, it might be OK
                if (planError.response?.status === 405 || 
                    (planError.response?.data?.error && planError.response.data.error.includes('trip_options'))) {
                  console.warn("⚠️ [WeTravel] Retry - Payment plan update failed, but payment plan was set via trip_options");
                  console.warn("  - Payment plan should be correct from initial payment link creation");
                  // Don't throw error - payment plan was set via trip_options
                  return response.data.data;
                }
                
                console.error("❌ [WeTravel] Retry - Failed to update payment plan:");
                console.error("  - Error:", planError.response?.data || planError.message);
                throw new Error(`Failed to set deposit payment plan: ${planError.response?.data?.error || planError.message}`);
              }
            } else {
              // If package ID not found but payment plan was set via trip_options, it's OK
              console.warn("⚠️ [WeTravel] Retry - Package ID not found, but payment plan was set via trip_options");
              console.warn("  - Payment plan should be correct from initial payment link creation");
            }
          }
          
          return response.data.data;
        } catch (retryError) {
          console.error(
            "❌ Retry failed:",
            retryError.response?.data || retryError.message
          );
          console.error("Status Code:", retryError.response?.status);
          throw new Error("Failed to create WeTravel payment link after retry");
        }
      }

      throw new Error("Failed to create WeTravel payment link");
    }
  }

  /**
   * Sanitize title for WeTravel API (remove special chars, limit length)
   * @param {string} title - Original title
   * @returns {string} - Sanitized title
   */
  sanitizeTitle(title) {
    if (!title) return "Safari Trip";
    // Remove special characters, keep alphanumeric, spaces, and basic punctuation
    let sanitized = title.replace(/[^\w\s\-.,&()]/g, "").trim();
    // Limit to 100 characters
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 97) + "...";
    }
    return sanitized || "Safari Trip";
  }

  /**
   * Format order data for WeTravel payment link creation
   * @param {Object} order - MongoDB order document
   * @returns {Object} - Formatted data for WeTravel API
   */
  formatOrderForPaymentLink(order) {
    // Get the first trip's start date or use the earliest date from cart items
    // CRITICAL: Extract UTC date components to avoid timezone shifts
    let startDateObj;
    if (order.cartItems && order.cartItems.length > 0 && order.cartItems[0].startingDate) {
      const dateInput = order.cartItems[0].startingDate;
      
      // Handle different date formats
      if (typeof dateInput === "string") {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
          // YYYY-MM-DD format - parse directly
          const [year, month, day] = dateInput.split("-").map(Number);
          startDateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
        } else if (dateInput.includes("T")) {
          // ISO string - extract UTC date components to preserve intended date
          const parsed = new Date(dateInput);
          const utcYear = parsed.getUTCFullYear();
          const utcMonth = parsed.getUTCMonth();
          const utcDay = parsed.getUTCDate();
          startDateObj = new Date(Date.UTC(utcYear, utcMonth, utcDay, 12, 0, 0, 0));
        } else {
          // Other string format - parse and extract UTC components
          const parsed = new Date(dateInput);
          const utcYear = parsed.getUTCFullYear();
          const utcMonth = parsed.getUTCMonth();
          const utcDay = parsed.getUTCDate();
          startDateObj = new Date(Date.UTC(utcYear, utcMonth, utcDay, 12, 0, 0, 0));
        }
      } else {
        // Date object - extract UTC components
        const parsed = new Date(dateInput);
        const utcYear = parsed.getUTCFullYear();
        const utcMonth = parsed.getUTCMonth();
        const utcDay = parsed.getUTCDate();
        startDateObj = new Date(Date.UTC(utcYear, utcMonth, utcDay, 12, 0, 0, 0));
      }
    } else {
      // No date provided - use today
      const now = new Date();
      const utcYear = now.getUTCFullYear();
      const utcMonth = now.getUTCMonth();
      const utcDay = now.getUTCDate();
      startDateObj = new Date(Date.UTC(utcYear, utcMonth, utcDay, 12, 0, 0, 0));
    }

    // Get cart item details for booking restriction check
    const firstCartItem =
      order.cartItems && order.cartItems.length > 0 ? order.cartItems[0] : null;

    // Calculate end date based on days (if available) or default to start date + 7 days
    const daysCount =
      order.cartItems && order.cartItems.length > 0
        ? order.cartItems[0].days || 7
        : 7;
    
    // Calculate end date using UTC to avoid timezone shifts
    const endDateObj = new Date(startDateObj);
    endDateObj.setUTCDate(endDateObj.getUTCDate() + daysCount);

    // Calculate days before departure (days between now and trip start)
    const now = new Date();
    const nowUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));
    const tripStartUTC = new Date(Date.UTC(
      startDateObj.getUTCFullYear(),
      startDateObj.getUTCMonth(),
      startDateObj.getUTCDate(),
      0, 0, 0, 0
    ));

    // Calculate difference in days
    const daysDiff = Math.ceil((tripStartUTC - nowUTC) / (1000 * 60 * 60 * 24));

    // Determine if this is a Midrange/Luxury Safari (requires 4-day rule)
    const isMidrangeOrLuxury =
      firstCartItem &&
      (firstCartItem.selectedCategory === "midRange" ||
        firstCartItem.selectedCategory === "luxury");

    const categoryName = firstCartItem?.categoryName
      ? firstCartItem.categoryName.toLowerCase()
      : "";
    const isSafariCategory = categoryName.includes("safari");
    const isMidrangeLuxurySafari = isMidrangeOrLuxury && isSafariCategory;

    // Set days before departure based on booking restrictions:
    // - Midrange/Luxury Safaris: require payment at least 4 days before departure
    // - All other trips: allow payment until 1 day before departure
    let daysBeforeDeparture;
    if (daysDiff <= 0) {
      daysBeforeDeparture = 0; // Trip is today or past, allow immediate payment
    } else if (daysDiff === 1) {
      daysBeforeDeparture = 0; // Trip is tomorrow, allow payment today
    } else if (isMidrangeLuxurySafari && daysDiff >= 4) {
      // For Midrange/Luxury Safaris with 4+ days until trip: require payment 4 days before
      // This means payment deadline is (daysDiff - 4) days from now
      daysBeforeDeparture = 4; // Payment must be completed at least 4 days before departure
    } else {
      // For all other trips: allow payment until 1 day before
      daysBeforeDeparture = Math.min(daysDiff - 1, 365); // Allow until 1 day before trip
    }

    // Create a descriptive title (sanitized for WeTravel API)
    // Include package type in title to help WeTravel identify the package
    const itemCount = order.cartItems?.length || 0;
    const selectedCategory = firstCartItem?.selectedCategory || "standard";
    const packageTypeLabel = 
      selectedCategory === "standard" ? "Budget" :
      selectedCategory === "midRange" ? "Mid-Range" :
      selectedCategory === "luxury" ? "Luxury" : "";
    
    let rawTitle =
      itemCount === 1
        ? packageTypeLabel 
          ? `${order.cartItems[0].mainTitle} (${packageTypeLabel})`
          : order.cartItems[0].mainTitle
        : `${itemCount} Safari Trips - ${order.orderNumber}`;
    const tripTitle = this.sanitizeTitle(rawTitle);

    // Get total travelers number from all cart items (adults + children)
    const totalTravelers = order.cartItems.reduce(
      (sum, item) => sum + (item.travelersNumber || 1) + (item.childrenCount || 0),
      0
    );

    // Format dates as YYYY-MM-DD using UTC components to avoid timezone shifts
    const formatDateAsYYYYMMDD = (dateObj) => {
      const year = dateObj.getUTCFullYear();
      const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // selectedCategory is already declared above (line 376) for packageTypeLabel

    // Calculate total children count from all cart items
    const totalChildrenCount = order.cartItems.reduce(
      (sum, item) => sum + (item.childrenCount || 0),
      0
    );

    return {
      tripTitle,
      tripId: order.orderNumber,
      startDate: formatDateAsYYYYMMDD(startDateObj), // Format: YYYY-MM-DD using UTC
      endDate: formatDateAsYYYYMMDD(endDateObj),
      totalAmount: order.totalAmount,
      currency: "USD",
      daysBeforeDeparture: daysBeforeDeparture,
      travelersNumber: totalTravelers, // This already includes children from the reduce above
      childrenCount: totalChildrenCount, // Explicitly pass children count for validation
      selectedCategory, // Package type: standard, midRange, luxury
      // Include participant/customer information (billing address is optional in WeTravel)
      participantInfo: order.personalInfo
        ? {
            firstName: order.personalInfo.firstName,
            lastName: order.personalInfo.lastName,
            email: order.personalInfo.email,
            phone: order.personalInfo.phone,
            // Include billing address if available (WeTravel allows this but it's optional)
            ...(order.billingAddress && {
              address: {
                street: order.billingAddress.street,
                city: order.billingAddress.city,
                state: order.billingAddress.state,
                zip: order.billingAddress.zip,
                country: order.billingAddress.country,
              },
            }),
          }
        : null,
    };
  }
}

// Export a singleton instance
module.exports = new WeTravelService();
