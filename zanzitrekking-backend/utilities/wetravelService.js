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

      // For deposits, use Trips Builder API instead of payment_links endpoint
      // payment_links endpoint auto-creates trip_options without payment_plan, causing validation errors
      // Trips Builder API allows us to properly set payment plan before creating payment link
      if (paymentOption === "deposit") {
        const remainingAmount = totalAmount - depositAmount;
        
        console.log("🔍 [WeTravel] DEPOSIT PAYMENT - Using Trips Builder API:");
        console.log("  - paymentOption:", paymentOption);
        console.log("  - totalAmount:", totalAmount);
        console.log("  - depositAmount:", depositAmount);
        console.log("  - remainingAmount:", remainingAmount);
        console.log("  - daysBeforeDeparture:", daysBeforeDeparture);
        
        // Use Trips Builder API for deposits to properly set payment plan
        return await this.createDepositPaymentLinkViaTripsBuilder({
          ...orderData,
          remainingAmount,
        });
      } else {
        // Full payment - use pricing structure
        console.log("💰 [WeTravel] Creating FULL PAYMENT link:");
        console.log("  - Total Amount:", totalAmount);
        
        paymentLinkData = {
          data: {
            ...baseData,
            pricing: {
              payment_plan: {
                allow_auto_payment: false, // payment_links endpoint uses allow_auto_payment (not enable_auto_payment)
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
      
      // For deposit payments, we MUST update the payment plan via dedicated endpoint
      // trip_options payment plan might not work correctly - we need to set it on the package
      if (currentPaymentOption === "deposit" && response.data.data.trip?.uuid) {
        const tripUuid = response.data.data.trip.uuid;
        
        // Check if payment plan was set in trip_options from response
        const tripOptionsPaymentPlan = response.data.data.trip_options?.[0]?.payment_plan;
        console.log("🔍 [WeTravel] Checking payment plan in response:");
        console.log("  - Has trip_options?", !!response.data.data.trip_options);
        console.log("  - Has trip_options[0].payment_plan?", !!tripOptionsPaymentPlan);
        if (tripOptionsPaymentPlan) {
          console.log("  - Trip Options Payment Plan:", JSON.stringify(tripOptionsPaymentPlan, null, 2));
        }
        
        // Try to get package_id from different possible locations in response
        // WeTravel payment_links creates packages automatically, so we need to find the package ID
        let packageId = response.data.data.packages?.[0]?.id || 
                       response.data.data.trip_options?.[0]?.id ||
                       response.data.data.packages?.[0]?.package_id ||
                       response.data.data.trip_options?.[0]?.package_id;
        
        // If package_id is not available, try to get it from trip data
        if (!packageId && response.data.data.trip?.packages?.length > 0) {
          packageId = response.data.data.trip.packages[0].id;
        }
        
        // If still not found, wait a bit and try to fetch packages from the trip
        // Packages might not be immediately available after payment link creation
        if (!packageId) {
          console.log("🔍 [WeTravel] Package ID not in response, waiting and fetching packages from trip...");
          // Wait for packages to be created
          await new Promise(resolve => setTimeout(resolve, 3000));
          
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
            
            console.log("  - Packages response:", JSON.stringify(packagesResponse.data, null, 2));
            
            if (packagesResponse.data?.data && packagesResponse.data.data.length > 0) {
              packageId = packagesResponse.data.data[0].id;
              console.log("✅ [WeTravel] Found package ID:", packageId);
            } else {
              // Try to get package from trip_options if packages array is empty
              if (response.data.data.trip_options && response.data.data.trip_options.length > 0) {
                packageId = response.data.data.trip_options[0].id;
                console.log("✅ [WeTravel] Using package ID from trip_options:", packageId);
              }
            }
          } catch (packagesError) {
            console.warn("⚠️ [WeTravel] Could not fetch packages:", packagesError.response?.data || packagesError.message);
            // Last resort: try to use trip_options ID
            if (response.data.data.trip_options && response.data.data.trip_options.length > 0) {
              packageId = response.data.data.trip_options[0].id;
              console.log("⚠️ [WeTravel] Using trip_options[0].id as package ID (fallback):", packageId);
            }
          }
        }
        
        if (packageId) {
          console.log("🔧 [WeTravel] Updating payment plan for deposit via dedicated endpoint:");
          console.log("  - Trip UUID:", tripUuid);
          console.log("  - Package ID:", packageId);
          
          try {
            // Add a delay to ensure WeTravel has finished processing the payment link and created packages
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds for packages to be ready
            
            // First, try to get the current payment plan to see what's there
            // If we get 404, the package might not be ready yet, so we'll try to create the payment plan anyway
            let currentPlan = null;
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
              currentPlan = currentPlanResponse.data?.data;
              console.log("  - Current Payment Plan:", JSON.stringify(currentPlan, null, 2));
              
              // Check if payment plan already has deposit configured
              if (currentPlan?.deposit && currentPlan?.allow_partial_payment) {
                console.log("✅ [WeTravel] Payment plan already has deposit configured!");
                return response.data.data;
              }
            } catch (getError) {
              if (getError.response?.status === 404) {
                console.log("  - Payment plan endpoint returned 404 - package might not be ready yet");
                console.log("  - Will try to create payment plan anyway");
              } else {
                console.log("  - Error getting current payment plan:", getError.message);
                console.log("  - Will try to create payment plan anyway");
              }
            }
            
            const remainingAmount = totalAmount - depositAmount;
            const paymentPlanData = {
              data: {
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
              },
            };
            
            console.log("  - Payment Plan Data:", JSON.stringify(paymentPlanData, null, 2));
            
            // Try to update payment plan - this is REQUIRED for deposits to work
            // According to WeTravel API docs, the structure should match the example
            let planResponse;
            let paymentPlanSet = false;
            
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
              
              console.log("✅ [WeTravel] Payment plan updated successfully via dedicated endpoint");
              console.log("  - Plan Response:", JSON.stringify(planResponse.data, null, 2));
              paymentPlanSet = true;
            } catch (updateError) {
              // If we get trip_options error, check if payment plan was actually set despite the error
              // Sometimes WeTravel returns an error but still sets the payment plan
              if (updateError.response?.data?.error?.includes('trip_options')) {
                console.warn("⚠️ [WeTravel] Payment plan update returned trip_options error");
                console.warn("  - Checking if payment plan was actually set despite the error...");
                
                // Wait a moment for WeTravel to process
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                try {
                  // Verify if payment plan was actually set
                  const verifyResponse = await axios.get(
                    `${this.apiUrl}/draft_trips/${tripUuid}/packages/${packageId}/payment_plan`,
                    {
                      headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  
                  const verifiedPlan = verifyResponse.data?.data;
                  console.log("  - Verified Payment Plan:", JSON.stringify(verifiedPlan, null, 2));
                  
                  // Check if payment plan has the required fields for deposits
                  if (verifiedPlan?.allow_partial_payment && verifiedPlan?.deposit) {
                    console.log("✅ [WeTravel] Payment plan WAS set correctly despite trip_options error!");
                    console.log("  - allow_partial_payment:", verifiedPlan.allow_partial_payment);
                    console.log("  - deposit:", verifiedPlan.deposit);
                    console.log("  - installments:", JSON.stringify(verifiedPlan.installments, null, 2));
                    paymentPlanSet = true;
                    // Payment plan is set correctly, we can continue
                    return response.data.data;
                  } else {
                    console.warn("  - Payment plan not set correctly, deposit or allow_partial_payment missing");
                    console.warn("  - allow_partial_payment:", verifiedPlan?.allow_partial_payment);
                    console.warn("  - deposit:", verifiedPlan?.deposit);
                    // Continue to retry logic below
                  }
                } catch (verifyError) {
                  if (verifyError.response?.status === 404) {
                    console.warn("  - Payment plan verification returned 404 - package might not exist yet");
                    console.warn("  - This is OK, we'll try to create the payment plan");
                  } else {
                    console.warn("  - Could not verify payment plan:", verifyError.message);
                  }
                  // Continue to retry logic below
                }
                
                // If verification failed, try to fix trip_options
                console.warn("  - Attempting to fix trip_options issue...");
                
                try {
                  // Get the trip to see trip_options structure
                  const tripResponse = await axios.get(
                    `${this.apiUrl}/draft_trips/${tripUuid}`,
                    {
                      headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  
                  const tripData = tripResponse.data?.data;
                  const tripOptions = tripData?.trip_options || [];
                  
                  if (tripOptions.length > 0) {
                    console.log("  - Found trip_options, structure:", JSON.stringify(tripOptions, null, 2));
                    console.log("  - trip_options[0] has payment_plan?", !!tripOptions[0]?.payment_plan);
                    
                    // Try multiple retries with increasing delays
                    let retrySuccess = false;
                    for (let retryAttempt = 1; retryAttempt <= 3; retryAttempt++) {
                      const delay = retryAttempt * 3; // 3, 6, 9 seconds
                      console.log(`  - Retry attempt ${retryAttempt}/3: Waiting ${delay} seconds...`);
                      await new Promise(resolve => setTimeout(resolve, delay * 1000));
                      
                      try {
                        // Retry payment plan update
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
                        
                        console.log(`✅ [WeTravel] Payment plan updated successfully on retry attempt ${retryAttempt}`);
                        console.log("  - Plan Response:", JSON.stringify(planResponse.data, null, 2));
                        paymentPlanSet = true;
                        retrySuccess = true;
                        break; // Success, exit retry loop
                      } catch (retryError) {
                        console.warn(`  - Retry attempt ${retryAttempt} failed:`, retryError.response?.data?.error || retryError.message);
                        if (retryAttempt === 3) {
                          // Last attempt failed
                          throw updateError;
                        }
                      }
                    }
                    
                    if (!retrySuccess) {
                      throw updateError;
                    }
                  } else {
                    // No trip_options found - this might be OK, try to create payment plan anyway
                    console.log("  - No trip_options found, trying to create payment plan directly...");
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    
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
                      
                      console.log("✅ [WeTravel] Payment plan created successfully");
                      console.log("  - Plan Response:", JSON.stringify(planResponse.data, null, 2));
                      paymentPlanSet = true;
                    } catch (noTripOptionsError) {
                      throw updateError; // Throw original error
                    }
                  }
                } catch (retryError) {
                  console.error("  - Retry failed:", retryError.response?.data || retryError.message);
                  throw updateError; // Throw original error
                }
              } else {
                throw updateError;
              }
            }
            
            // Verify the payment plan was set correctly (if we got a successful response)
            if (paymentPlanSet) {
              const verifyResponse = await axios.get(
                `${this.apiUrl}/draft_trips/${tripUuid}/packages/${packageId}/payment_plan`,
                {
                  headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              
              const verifiedPlan = verifyResponse.data?.data;
              console.log("✅ [WeTravel] Final verification of payment plan:", JSON.stringify(verifiedPlan, null, 2));
              
              if (!verifiedPlan?.allow_partial_payment || !verifiedPlan?.deposit) {
                throw new Error("Payment plan verification failed: deposit or allow_partial_payment not set correctly");
              }
              
              console.log("✅ [WeTravel] Payment plan verified successfully!");
              console.log("  - allow_partial_payment:", verifiedPlan.allow_partial_payment);
              console.log("  - deposit:", verifiedPlan.deposit);
              console.log("  - installments count:", verifiedPlan.installments?.length || 0);
            }
            
          } catch (planError) {
            console.error("❌ [WeTravel] CRITICAL: Failed to update payment plan via dedicated endpoint:");
            console.error("  - Error:", planError.response?.data || planError.message);
            console.error("  - Status:", planError.response?.status);
            console.error("  - Trip UUID:", tripUuid);
            console.error("  - Package ID:", packageId);
            console.error("  - This means deposit payment will NOT work correctly!");
            // Throw error - we cannot proceed without a proper payment plan for deposits
            throw new Error(`CRITICAL: Failed to set deposit payment plan. Deposit payments will not work. Error: ${planError.response?.data?.error || planError.message}`);
          }
        } else {
          console.error("❌ [WeTravel] CRITICAL: Cannot update payment plan: Package ID not found");
          console.error("  - Response structure:", JSON.stringify(response.data.data, null, 2));
          throw new Error("CRITICAL: Failed to set deposit payment plan: Package ID not found in payment link response. Deposit payments will not work.");
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
          // For deposits, create payment link WITHOUT payment_plan in trip_options
          // WeTravel's payment_links endpoint rejects payment_plan in trip_options
          console.log("🔄 [WeTravel] Retry - Creating DEPOSIT payment link:");
          console.log("  - Deposit Amount:", depositAmount);
          console.log("  - Total Amount:", totalAmount);

          // For deposits, do NOT include trip_options with payment_plan
          // Payment plan will be set via dedicated endpoint after payment link creation
          paymentLinkData = {
            data: {
              ...baseData,
              pricing: {
                price: totalAmount,
                days_before_departure: daysBeforeDeparture,
              },
              // Do NOT include trip_options with payment_plan - it causes validation errors
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
                  throw postError;
                }
                
                console.log("✅ [WeTravel] Retry - Payment plan updated successfully");
                
                // Verify the payment plan was set correctly
                const verifyResponse = await axios.get(
                  `${this.apiUrl}/draft_trips/${tripUuid}/packages/${packageId}/payment_plan`,
                  {
                    headers: {
                      Authorization: `Bearer ${this.accessToken}`,
                      "Content-Type": "application/json",
                    },
                  }
                );
                
                const verifiedPlan = verifyResponse.data?.data;
                console.log("✅ [WeTravel] Retry - Verified payment plan:", JSON.stringify(verifiedPlan, null, 2));
                
                if (!verifiedPlan?.allow_partial_payment || !verifiedPlan?.deposit) {
                  throw new Error("Payment plan verification failed: deposit or allow_partial_payment not set correctly");
                }
                
              } catch (planError) {
                console.error("❌ [WeTravel] Retry - CRITICAL: Failed to update payment plan:");
                console.error("  - Error:", planError.response?.data || planError.message);
                console.error("  - Status:", planError.response?.status);
                throw new Error(`CRITICAL: Failed to set deposit payment plan. Deposit payments will not work. Error: ${planError.response?.data?.error || planError.message}`);
              }
            } else {
              console.error("❌ [WeTravel] Retry - CRITICAL: Cannot update payment plan: Package ID not found");
              throw new Error("CRITICAL: Failed to set deposit payment plan: Package ID not found in payment link response. Deposit payments will not work.");
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

  /**
   * Create deposit payment link using Trips Builder API
   * This avoids trip_options validation errors from payment_links endpoint
   * @param {Object} orderData - Order data including trip details and pricing
   * @returns {Promise<Object>} - Payment link data
   */
  async createDepositPaymentLinkViaTripsBuilder(orderData) {
    const {
      tripTitle,
      tripId,
      startDate,
      endDate,
      totalAmount,
      currency = "USD",
      daysBeforeDeparture = 2,
      participantInfo,
      travelersNumber = 1,
      depositAmount,
      remainingAmount,
      returnUrl,
    } = orderData;

    try {
      console.log("🏗️ [WeTravel] Creating deposit payment link via Trips Builder API...");
      
      // Step 1: Create draft trip
      console.log("  Step 1: Creating draft trip...");
      const tripData = {
        data: {
          trip: {
            title: this.sanitizeTitle(tripTitle),
            trip_id: tripId,
            start_date: startDate,
            end_date: endDate,
            currency: currency,
            participant_fees: "all",
            destination: tripTitle.split("(")[0].trim() || "Tanzania", // Extract destination from title or default
            can_contribute: false,
            group_min: 1,
            group_max: Math.max(travelersNumber || 1, 100),
            listing_status: "published", // or "draft" if you want to keep it as draft
            participant_list_show_type: "all",
            waiting_list_enabled: false,
            capacity: Math.max(travelersNumber || 1, 100),
          },
        },
      };

      const tripResponse = await axios.post(
        `${this.apiUrl}/draft_trips`,
        tripData,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const tripUuid = tripResponse.data.data.trip.uuid;
      console.log("  ✅ Draft trip created, UUID:", tripUuid);

      // Step 2: Create package for the trip
      console.log("  Step 2: Creating package...");
      const packageData = {
        data: {
          package: {
            name: "Standard Package",
            price: totalAmount,
            days_before_departure: daysBeforeDeparture,
            currency: currency,
          },
        },
      };

      const packageResponse = await axios.post(
        `${this.apiUrl}/draft_trips/${tripUuid}/packages`,
        packageData,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const packageId = packageResponse.data.data.package.id;
      console.log("  ✅ Package created, ID:", packageId);

      // Step 3: Set payment plan on the package
      console.log("  Step 3: Setting payment plan on package...");
      const paymentPlanData = {
        data: {
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
        },
      };

      const planResponse = await axios.post(
        `${this.apiUrl}/draft_trips/${tripUuid}/packages/${packageId}/payment_plan`,
        paymentPlanData,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("  ✅ Payment plan set:", JSON.stringify(planResponse.data, null, 2));

      // Step 4: Publish the trip to create payment link
      console.log("  Step 4: Publishing trip...");
      const publishResponse = await axios.post(
        `${this.apiUrl}/draft_trips/${tripUuid}/publish`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("  ✅ Trip published");

      // Step 5: Get the payment link from the published trip
      const publishedTrip = publishResponse.data.data.trip;
      const paymentLinkUrl = publishedTrip.url;

      console.log("✅ [WeTravel] Deposit payment link created via Trips Builder API");
      console.log("  - Payment Link URL:", paymentLinkUrl);
      console.log("  - Trip UUID:", tripUuid);

      // Return in the same format as payment_links endpoint
      return {
        trip: {
          uuid: tripUuid,
          url: paymentLinkUrl,
          trip_id: tripId,
        },
        packages: [
          {
            id: packageId,
          },
        ],
      };
    } catch (error) {
      console.error("❌ [WeTravel] Error creating deposit payment link via Trips Builder API:");
      console.error("  - Error:", error.response?.data || error.message);
      console.error("  - Status:", error.response?.status);
      throw new Error(`Failed to create deposit payment link via Trips Builder: ${error.response?.data?.error || error.message}`);
    }
  }
}

// Export a singleton instance
module.exports = new WeTravelService();
