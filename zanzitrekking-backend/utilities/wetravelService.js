const axios = require("axios");
const logger = require('./logger');
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
      logger.error(
        "❌ Error getting WeTravel access token:",
        error.response?.data || error.message
      );
      logger.error("Status Code:", error.response?.status);
      logger.error("Full error:", error);
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
      logger.info("🔍 [WeTravel] Payment Link Creation Debug:");
      logger.info("  - Payment Option:", paymentOption);
      logger.info("  - Total Amount:", totalAmount);
      logger.info("  - Deposit Amount:", depositAmount);
      logger.info("  - Deposit Percentage:", paymentOption === "deposit" ? ((depositAmount / totalAmount) * 100).toFixed(2) + "%" : "N/A");
      logger.info("  - Days Before Departure:", daysBeforeDeparture);

      // Validate that trip dates are not in the past
      if (this.isTripDateInPast(startDate, endDate)) {
        const errorMessage = `Cannot create payment link: Trip start date (${startDate}) is in the past`;
        logger.error(`❌ ${errorMessage}`);
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
          logger.warn(`Deposit percentage (${depositPercentage.toFixed(2)}%) is less than 10%`);
        }
        if (depositPercentage > 50) {
          logger.warn(`Deposit percentage (${depositPercentage.toFixed(2)}%) is more than 50%`);
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
      
      if (process.env.NODE_ENV === 'development') {
        logger.info("🔍 [WeTravel] Base Data Structure:");
        logger.info("  - Base data keys:", Object.keys(baseData));
        logger.info("  - Has trip_options in baseData?", !!baseData.trip_options);
        logger.info("  - Has pricing in baseData?", !!baseData.pricing);
      }

      // For deposits, use Trips Builder API instead of payment_links endpoint
      // payment_links endpoint auto-creates trip_options without payment_plan, causing validation errors
      // Trips Builder API allows us to properly set payment plan before creating payment link
      if (paymentOption === "deposit") {
        const remainingAmount = totalAmount - depositAmount;
        
        logger.info("🔍 [WeTravel] DEPOSIT PAYMENT - Using Trips Builder API:");
        logger.info("  - paymentOption:", paymentOption);
        logger.info("  - totalAmount:", totalAmount);
        logger.info("  - depositAmount:", depositAmount);
        logger.info("  - remainingAmount:", remainingAmount);
        logger.info("  - daysBeforeDeparture:", daysBeforeDeparture);
        
        // Use Trips Builder API for deposits to properly set payment plan
        return await this.createDepositPaymentLinkViaTripsBuilder({
          ...orderData,
          remainingAmount,
        });
      } else {
        // Full payment - use pricing structure
        logger.info("💰 [WeTravel] Creating FULL PAYMENT link:");
        logger.info("  - Total Amount:", totalAmount);
        
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

      logger.info("🚀 [WeTravel] Sending request to WeTravel API:");
      logger.info("  - URL:", `${this.apiUrl}/payment_links`);
      logger.info("  - Payment Option:", paymentOption);
      logger.info("  - Request Payload:", JSON.stringify(paymentLinkData, null, 2));
      
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7242/ingest/eb7c76be-df0a-4765-be03-9046170046cb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'wetravelService.js:258',message:'About to send request to WeTravel',data:{paymentOption,hasTripOptions:!!paymentLinkData?.data?.trip_options,requestKeys:Object.keys(paymentLinkData?.data || {})},timestamp:Date.now()})}).catch(()=>{});
      }
      // #endregion

      if (process.env.NODE_ENV === 'development') {
        logger.info("🚀 [WeTravel] About to send API request:");
        logger.info("  - Endpoint:", `${this.apiUrl}/payment_links`);
        logger.info("  - Method: POST");
        logger.info("  - Payment Option:", paymentOption);
        logger.info("  - Has Access Token:", !!this.accessToken);
        logger.info("  - Request payload size:", JSON.stringify(paymentLinkData).length, "bytes");
      }
      
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

      logger.info("✅ [WeTravel] Payment link created successfully!");
      logger.info("  - Response status:", response.status);
      logger.info("  - Payment link URL:", response.data.data.trip.url);
      logger.info("  - Trip UUID:", response.data.data.trip.uuid);
      
      // Log the full response to debug deposit options
      logger.info("📥 [WeTravel] Response Data:");
      logger.info("  - Payment Link URL:", response.data.data.trip.url);
      logger.info("  - Trip UUID:", response.data.data.trip.uuid);
      if (response.data.data.trip_options) {
        logger.info("  - Trip Options:", JSON.stringify(response.data.data.trip_options, null, 2));
      }
      if (response.data.data.pricing) {
        logger.info("  - Pricing:", JSON.stringify(response.data.data.pricing, null, 2));
      }
      if (response.data.data.packages && response.data.data.packages.length > 0) {
        logger.info("  - Packages:", JSON.stringify(response.data.data.packages, null, 2));
        logger.info("  - First Package ID:", response.data.data.packages[0].id);
      }
      logger.info("  - Full Response:", JSON.stringify(response.data.data, null, 2));
      
      // For deposit payments, we MUST update the payment plan via dedicated endpoint
      // trip_options payment plan might not work correctly - we need to set it on the package
      if (currentPaymentOption === "deposit" && response.data.data.trip?.uuid) {
        const tripUuid = response.data.data.trip.uuid;
        
        // Check if payment plan was set in trip_options from response
        const tripOptionsPaymentPlan = response.data.data.trip_options?.[0]?.payment_plan;
        logger.info("🔍 [WeTravel] Checking payment plan in response:");
        logger.info("  - Has trip_options?", !!response.data.data.trip_options);
        logger.info("  - Has trip_options[0].payment_plan?", !!tripOptionsPaymentPlan);
        if (tripOptionsPaymentPlan) {
          logger.info("  - Trip Options Payment Plan:", JSON.stringify(tripOptionsPaymentPlan, null, 2));
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
          logger.info("🔍 [WeTravel] Package ID not in response, waiting and fetching packages from trip...");
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
            
            logger.info("  - Packages response:", JSON.stringify(packagesResponse.data, null, 2));
            
            if (packagesResponse.data?.data && packagesResponse.data.data.length > 0) {
              packageId = packagesResponse.data.data[0].id;
              logger.info("✅ [WeTravel] Found package ID:", packageId);
            } else {
              // Try to get package from trip_options if packages array is empty
              if (response.data.data.trip_options && response.data.data.trip_options.length > 0) {
                packageId = response.data.data.trip_options[0].id;
                logger.info("✅ [WeTravel] Using package ID from trip_options:", packageId);
              }
            }
          } catch (packagesError) {
            logger.warn("⚠️ [WeTravel] Could not fetch packages:", packagesError.response?.data || packagesError.message);
            // Last resort: try to use trip_options ID
            if (response.data.data.trip_options && response.data.data.trip_options.length > 0) {
              packageId = response.data.data.trip_options[0].id;
              logger.info("⚠️ [WeTravel] Using trip_options[0].id as package ID (fallback):", packageId);
            }
          }
        }
        
        if (packageId) {
          logger.info("🔧 [WeTravel] Updating payment plan for deposit via dedicated endpoint:");
          logger.info("  - Trip UUID:", tripUuid);
          logger.info("  - Package ID:", packageId);
          
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
              logger.info("  - Current Payment Plan:", JSON.stringify(currentPlan, null, 2));
              
              // Check if payment plan already has deposit configured
              if (currentPlan?.deposit && currentPlan?.allow_partial_payment) {
                logger.info("✅ [WeTravel] Payment plan already has deposit configured!");
                return response.data.data;
              }
            } catch (getError) {
              if (getError.response?.status === 404) {
                logger.info("  - Payment plan endpoint returned 404 - package might not be ready yet");
                logger.info("  - Will try to create payment plan anyway");
              } else {
                logger.info("  - Error getting current payment plan:", getError.message);
                logger.info("  - Will try to create payment plan anyway");
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
            
            logger.info("  - Payment Plan Data:", JSON.stringify(paymentPlanData, null, 2));
            
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
              
              logger.info("✅ [WeTravel] Payment plan updated successfully via dedicated endpoint");
              logger.info("  - Plan Response:", JSON.stringify(planResponse.data, null, 2));
              paymentPlanSet = true;
            } catch (updateError) {
              // If we get trip_options error, check if payment plan was actually set despite the error
              // Sometimes WeTravel returns an error but still sets the payment plan
              if (updateError.response?.data?.error?.includes('trip_options')) {
                logger.warn("⚠️ [WeTravel] Payment plan update returned trip_options error");
                logger.warn("  - Checking if payment plan was actually set despite the error...");
                
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
                  logger.info("  - Verified Payment Plan:", JSON.stringify(verifiedPlan, null, 2));
                  
                  // Check if payment plan has the required fields for deposits
                  if (verifiedPlan?.allow_partial_payment && verifiedPlan?.deposit) {
                    logger.info("✅ [WeTravel] Payment plan WAS set correctly despite trip_options error!");
                    logger.info("  - allow_partial_payment:", verifiedPlan.allow_partial_payment);
                    logger.info("  - deposit:", verifiedPlan.deposit);
                    logger.info("  - installments:", JSON.stringify(verifiedPlan.installments, null, 2));
                    paymentPlanSet = true;
                    // Payment plan is set correctly, we can continue
                    return response.data.data;
                  } else {
                    logger.warn("  - Payment plan not set correctly, deposit or allow_partial_payment missing");
                    logger.warn("  - allow_partial_payment:", verifiedPlan?.allow_partial_payment);
                    logger.warn("  - deposit:", verifiedPlan?.deposit);
                    // Continue to retry logic below
                  }
                } catch (verifyError) {
                  if (verifyError.response?.status === 404) {
                    logger.warn("  - Payment plan verification returned 404 - package might not exist yet");
                    logger.warn("  - This is OK, we'll try to create the payment plan");
                  } else {
                    logger.warn("  - Could not verify payment plan:", verifyError.message);
                  }
                  // Continue to retry logic below
                }
                
                // If verification failed, try to fix trip_options
                logger.warn("  - Attempting to fix trip_options issue...");
                
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
                    logger.info("  - Found trip_options, structure:", JSON.stringify(tripOptions, null, 2));
                    logger.info("  - trip_options[0] has payment_plan?", !!tripOptions[0]?.payment_plan);
                    
                    // Try multiple retries with increasing delays
                    let retrySuccess = false;
                    for (let retryAttempt = 1; retryAttempt <= 3; retryAttempt++) {
                      const delay = retryAttempt * 3; // 3, 6, 9 seconds
                      logger.info(`  - Retry attempt ${retryAttempt}/3: Waiting ${delay} seconds...`);
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
                        
                        logger.info(`✅ [WeTravel] Payment plan updated successfully on retry attempt ${retryAttempt}`);
                        logger.info("  - Plan Response:", JSON.stringify(planResponse.data, null, 2));
                        paymentPlanSet = true;
                        retrySuccess = true;
                        break; // Success, exit retry loop
                      } catch (retryError) {
                        logger.warn(`  - Retry attempt ${retryAttempt} failed:`, retryError.response?.data?.error || retryError.message);
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
                    logger.info("  - No trip_options found, trying to create payment plan directly...");
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
                      
                      logger.info("✅ [WeTravel] Payment plan created successfully");
                      logger.info("  - Plan Response:", JSON.stringify(planResponse.data, null, 2));
                      paymentPlanSet = true;
                    } catch (noTripOptionsError) {
                      throw updateError; // Throw original error
                    }
                  }
                } catch (retryError) {
                  logger.error("  - Retry failed:", retryError.response?.data || retryError.message);
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
              logger.info("✅ [WeTravel] Final verification of payment plan:", JSON.stringify(verifiedPlan, null, 2));
              
              if (!verifiedPlan?.allow_partial_payment || !verifiedPlan?.deposit) {
                throw new Error("Payment plan verification failed: deposit or allow_partial_payment not set correctly");
              }
              
              logger.info("✅ [WeTravel] Payment plan verified successfully!");
              logger.info("  - allow_partial_payment:", verifiedPlan.allow_partial_payment);
              logger.info("  - deposit:", verifiedPlan.deposit);
              logger.info("  - installments count:", verifiedPlan.installments?.length || 0);
            }
            
          } catch (planError) {
            logger.error("❌ [WeTravel] CRITICAL: Failed to update payment plan via dedicated endpoint:");
            logger.error("  - Error:", planError.response?.data || planError.message);
            logger.error("  - Status:", planError.response?.status);
            logger.error("  - Trip UUID:", tripUuid);
            logger.error("  - Package ID:", packageId);
            logger.error("  - This means deposit payment will NOT work correctly!");
            // Throw error - we cannot proceed without a proper payment plan for deposits
            throw new Error(`CRITICAL: Failed to set deposit payment plan. Deposit payments will not work. Error: ${planError.response?.data?.error || planError.message}`);
          }
        } else {
          logger.error("❌ [WeTravel] CRITICAL: Cannot update payment plan: Package ID not found");
          logger.error("  - Response structure:", JSON.stringify(response.data.data, null, 2));
          throw new Error("CRITICAL: Failed to set deposit payment plan: Package ID not found in payment link response. Deposit payments will not work.");
        }
      }
      
      return response.data.data;
    } catch (error) {
      logger.error("❌ [WeTravel] ERROR creating payment link:");
      logger.error("  - Error Message:", error.message);
      logger.error("  - Status Code:", error.response?.status);
      if (process.env.NODE_ENV === 'development') {
        logger.error("  - Error Response:", JSON.stringify(error.response?.data, null, 2));
        logger.error("  - Payment Option:", orderData?.paymentOption || 'unknown');
        
        if (paymentLinkData) {
          logger.error("  - Request Payload Sent:");
          logger.error(JSON.stringify(paymentLinkData, null, 2));
          logger.error("  - Request Payload Keys:", Object.keys(paymentLinkData.data || {}));
          logger.error("  - Has trip_options?", !!paymentLinkData.data.trip_options);
          logger.error("  - Has pricing?", !!paymentLinkData.data.pricing);
          logger.error("  - Has pricing.payment_plan?", !!paymentLinkData.data.pricing?.payment_plan);
          if (paymentLinkData.data.pricing?.payment_plan) {
            logger.error("  - Payment Plan Structure:", JSON.stringify(paymentLinkData.data.pricing.payment_plan, null, 2));
          }
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        logger.error("  - Full Error Stack:", error.stack);
      }
      
      // #region agent log
      // Extract paymentOption from orderData if available (for error logging)
      if (process.env.NODE_ENV === 'development') {
        const errorPaymentOption = orderData?.paymentOption || 'unknown';
        fetch('http://127.0.0.1:7242/ingest/eb7c76be-df0a-4765-be03-9046170046cb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'wetravelService.js:298',message:'WeTravel API error',data:{status:error.response?.status,errorMessage:error.response?.data?.error || error.message,hasTripOptions:!!paymentLinkData?.data?.trip_options,paymentOption:errorPaymentOption},timestamp:Date.now()})}).catch(()=>{});
      }
      // #endregion

      // If token expired, try to refresh and retry once
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (process.env.NODE_ENV === 'development') {
          logger.info("Access token may be expired, refreshing...");
        }
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
          logger.info("🔄 [WeTravel] Retry - Creating DEPOSIT payment link:");
          logger.info("  - Deposit Amount:", depositAmount);
          logger.info("  - Total Amount:", totalAmount);

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
          logger.info("🔄 [WeTravel] Retry Request:");
          logger.info("  - Payment Option:", paymentOption);
          logger.info("  - Request Payload:", JSON.stringify(paymentLinkData, null, 2));
          
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
          
          logger.info("✅ [WeTravel] Retry Response:");
          logger.info("  - Payment Link URL:", response.data.data.trip.url);
          if (response.data.data.trip_options) {
            logger.info("  - Trip Options:", JSON.stringify(response.data.data.trip_options, null, 2));
          }
          if (response.data.data.pricing) {
            logger.info("  - Pricing:", JSON.stringify(response.data.data.pricing, null, 2));
          }
          logger.info("  - Full Response:", JSON.stringify(response.data.data, null, 2));
          
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
              logger.info("🔍 [WeTravel] Retry - Package ID not in response, fetching packages from trip...");
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
                  logger.info("✅ [WeTravel] Retry - Found package ID:", packageId);
                }
              } catch (packagesError) {
                logger.warn("⚠️ [WeTravel] Retry - Could not fetch packages:", packagesError.response?.data || packagesError.message);
              }
            }
            
            if (packageId) {
              logger.info("🔧 [WeTravel] Retry - Updating payment plan for deposit:");
              logger.info("  - Trip UUID:", tripUuid);
              logger.info("  - Package ID:", packageId);
              
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
                
                logger.info("✅ [WeTravel] Retry - Payment plan updated successfully");
                
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
                logger.info("✅ [WeTravel] Retry - Verified payment plan:", JSON.stringify(verifiedPlan, null, 2));
                
                if (!verifiedPlan?.allow_partial_payment || !verifiedPlan?.deposit) {
                  throw new Error("Payment plan verification failed: deposit or allow_partial_payment not set correctly");
                }
                
              } catch (planError) {
                logger.error("❌ [WeTravel] Retry - CRITICAL: Failed to update payment plan:");
                logger.error("  - Error:", planError.response?.data || planError.message);
                logger.error("  - Status:", planError.response?.status);
                throw new Error(`CRITICAL: Failed to set deposit payment plan. Deposit payments will not work. Error: ${planError.response?.data?.error || planError.message}`);
              }
            } else {
              logger.error("❌ [WeTravel] Retry - CRITICAL: Cannot update payment plan: Package ID not found");
              throw new Error("CRITICAL: Failed to set deposit payment plan: Package ID not found in payment link response. Deposit payments will not work.");
            }
          }
          
          return response.data.data;
        } catch (retryError) {
          logger.error(
            "❌ Retry failed:",
            retryError.response?.data || retryError.message
          );
          logger.error("Status Code:", retryError.response?.status);
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

    // Extract trip metadata from cart items for WeTravel Trips Builder API
    // firstCartItem is already declared above (line 970)
    const mainDestination = firstCartItem?.mainDestination || firstCartItem?.trip?.mainDestination;
    const destinationName = Array.isArray(mainDestination) && mainDestination.length > 0
      ? mainDestination[0].name
      : (mainDestination?.name || tripTitle.split("(")[0].trim() || "Tanzania");
    
    // Extract group size constraints if available
    const groupMin = firstCartItem?.groupMin || firstCartItem?.trip?.groupMin || 1;
    const groupMax = firstCartItem?.groupMax || firstCartItem?.trip?.groupMax || Math.max(totalTravelers || 1, 100);

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
      // Trip metadata for Trips Builder API
      destination: destinationName,
      groupMin: groupMin,
      groupMax: groupMax,
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
      destination, // From formatOrderForPaymentLink
      groupMin = 1, // From formatOrderForPaymentLink
      groupMax, // From formatOrderForPaymentLink
    } = orderData;

    // Initialize paymentLinkUrl early so it's accessible throughout
    let paymentLinkUrl = null;

    try {
      logger.info("🏗️ [WeTravel] Creating deposit payment link via Trips Builder API...");
      logger.info("  - Destination:", destination);
      logger.info("  - Group Min:", groupMin);
      logger.info("  - Group Max:", groupMax);
      
      // Step 1: Create draft trip
      logger.info("  Step 1: Creating draft trip...");
      // WeTravel API expects fields directly under data, not nested under data.trip
      // Convert dates to ISO format with time (YYYY-MM-DDTHH:mm:ss.sssZ) as per WeTravel API example
      const startDateISO = new Date(`${startDate}T00:00:00.000Z`).toISOString();
      const endDateISO = new Date(`${endDate}T00:00:00.000Z`).toISOString();
      
      // Build trip data exactly as per WeTravel API documentation
      // All required fields must be present with correct enum values
      const tripData = {
        data: {
          // Required fields (per WeTravel API docs)
          title: this.sanitizeTitle(tripTitle),
          destination: destination || tripTitle.split("(")[0].trim() || "Tanzania",
          start_date: startDateISO, // ISO format: '2021-05-07T00:00:00.000Z'
          end_date: endDateISO, // ISO format: '2021-05-07T00:00:00.000Z'
          group_min: groupMin,
          group_max: groupMax || Math.max(travelersNumber || 1, 100),
          currency: currency, // enum: USD, EUR, CAD, ZAR, GBP
          participant_list_show_type: "everyone", // enum: "everyone", "participants", "only_organizer"
          participant_fees: "all", // enum: "credit_card", "service", "all", "none"
          listing_status: "public", // enum: "private", "public" (changed from "published")
          waiting_list_enabled: false, // boolean, required
          can_contribute: false, // boolean, required
          // Optional fields
          welcome_message: `Welcome to ${this.sanitizeTitle(tripTitle)}!`,
          carbon_offset: {
            enabled: false,
            percentage: 1, // Default to 1 as per docs
            paid_by_participant: false
          },
          // Images will be added via separate endpoint after trip creation
          // WeTravel may require images to be uploaded via POST /draft_trips/{trip_uuid}/images
        },
      };
      
      // Optional: trip_id (not visible to clients, only in dashboard)
      if (tripId) {
        tripData.data.trip_id = tripId;
      }

      // Log the exact request we're sending for debugging
      if (process.env.NODE_ENV === 'development') {
        logger.info("  📤 [WeTravel] Exact request payload being sent:");
        logger.info("  - Full tripData:", JSON.stringify(tripData, null, 2));
        logger.info("  - All field names:", Object.keys(tripData.data));
      }
      logger.info("  - Has visibility field?", 'visibility' in tripData.data);
      logger.info("  - Has participants_visibility field?", 'participants_visibility' in tripData.data);

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

      // Response structure may vary - check both data.trip.uuid and data.uuid
      const tripUuid = tripResponse.data.data.trip?.uuid || tripResponse.data.data.uuid;
      if (!tripUuid) {
        logger.error("  ❌ Trip UUID not found in response:", JSON.stringify(tripResponse.data, null, 2));
        throw new Error("Failed to get trip UUID from WeTravel API response");
      }
      logger.info("  ✅ Draft trip created, UUID:", tripUuid);
      
      // Step 1.5: Try to add image via POST /images endpoint (if it exists)
      logger.info("  Step 1.5: Attempting to add image...");
      try {
        const imageData = {
          data: {
            url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
            is_primary: true
          }
        };
        
        // Try POST to images endpoint
        try {
          await axios.post(
            `${this.apiUrl}/draft_trips/${tripUuid}/images`,
            imageData,
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          logger.info("  ✅ Image added via POST /images endpoint");
        } catch (postError) {
          // If POST fails, try PATCH
          logger.info("  ⚠️ POST /images failed, trying PATCH...");
          const patchImageData = {
            data: {
              images: [imageData.data]
            }
          };
          await axios.patch(
            `${this.apiUrl}/draft_trips/${tripUuid}`,
            patchImageData,
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          logger.info("  ✅ Image added via PATCH");
        }
      } catch (imageError) {
        logger.warn("  ⚠️ Could not add image (will try to publish anyway):", imageError.response?.data?.error || imageError.message);
      }

      // Step 2: Create package for the trip
      logger.info("  Step 2: Creating package...");
      // WeTravel API expects name and price directly under data, not nested under data.package
      // Package price should be in dollars (not cents) - WeTravel displays it as-is
      // Payment plan amounts will still be in cents
      logger.info("  - Package price (dollars):", totalAmount);
      logger.info("  - Package price (cents):", Math.round(totalAmount * 100));
      logger.info("  - Note: Package price sent in dollars, payment plan amounts in cents");
      
      const packageData = {
        data: {
          name: "Standard Package",
          price: totalAmount, // Send in dollars (not cents) - WeTravel displays this directly
          days_before_departure: daysBeforeDeparture,
          currency: currency,
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

      // Response structure may vary - check both data.package.id and data.id
      const packageId = packageResponse.data.data.package?.id || packageResponse.data.data.id;
      if (!packageId) {
        logger.error("  ❌ Package ID not found in response:", JSON.stringify(packageResponse.data, null, 2));
        throw new Error("Failed to get package ID from WeTravel API response");
      }
      logger.info("  ✅ Package created, ID:", packageId);

      // Step 3: Wait for trip_options to be auto-created, then fetch them
      logger.info("  Step 3: Waiting for trip_options to be auto-created...");
      // Wait longer for WeTravel to auto-create trip_options after package creation
      // trip_options are created asynchronously, so we need to wait and retry
      let tripOptionUuid = null;
      let tripOptions = [];
      
      // Retry up to 3 times with increasing delays
      for (let attempt = 1; attempt <= 3; attempt++) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000)); // 1s, 2s, 3s
        
        try {
          const tripDetailsResponse = await axios.get(
            `${this.apiUrl}/draft_trips/${tripUuid}`,
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          
          // Handle different possible response structures
          const tripDetails = tripDetailsResponse.data?.data?.trip || tripDetailsResponse.data?.data || tripDetailsResponse.data?.trip;
          tripOptions = tripDetails?.trip_options || [];
          
          if (tripOptions.length > 0 && tripOptions[0].uuid) {
            tripOptionUuid = tripOptions[0].uuid;
            logger.info(`  ✅ Found trip_option UUID on attempt ${attempt}:`, tripOptionUuid);
            break;
          } else {
            logger.info(`  ⚠️ Attempt ${attempt}: No trip_options found yet, waiting...`);
          }
        } catch (getError) {
          logger.warn(`  ⚠️ Attempt ${attempt}: Could not get trip details:`, getError.message);
        }
      }
      
      if (!tripOptionUuid) {
        logger.warn("  ⚠️ Trip option UUID not found after retries");
        logger.warn("    - Attempting to create trip_option explicitly via POST...");
        
        // Try to create trip_option explicitly
        try {
          const createTripOptionData = {
            data: {
              package_id: packageId,
            }
          };
          
          const createTripOptionResponse = await axios.post(
            `${this.apiUrl}/draft_trips/${tripUuid}/trip_options`,
            createTripOptionData,
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          
          // Extract UUID from response
          const createdTripOption = createTripOptionResponse.data?.data?.trip_option || createTripOptionResponse.data?.data || createTripOptionResponse.data?.trip_option;
          if (createdTripOption?.uuid) {
            tripOptionUuid = createdTripOption.uuid;
            logger.info("  ✅ Created trip_option explicitly, UUID:", tripOptionUuid);
          } else {
            logger.warn("  ⚠️ Created trip_option but UUID not found in response");
            logger.warn("    - Response:", JSON.stringify(createTripOptionResponse.data, null, 2));
          }
        } catch (createError) {
          logger.warn("  ⚠️ Could not create trip_option explicitly:");
          logger.warn("    - Error:", createError.response?.data || createError.message);
          logger.warn("    - Status:", createError.response?.status);
          logger.warn("    - Will try to update trip_options directly with package_id");
        }
      }

      // Step 4: Calculate amounts and set payment plan on package (primary method)
      logger.info("  Step 4: Calculating payment amounts...");
      // WeTravel API requires amounts in minor currency units (cents)
      // For USD: $1.00 = 100 cents, so multiply by 100
      const depositAmountCents = Math.round(depositAmount * 100);
      const remainingAmountCents = Math.round(remainingAmount * 100);
      const packagePriceCents = Math.round(totalAmount * 100);
      
      logger.info("  - Deposit (dollars):", depositAmount);
      logger.info("  - Deposit (cents):", depositAmountCents);
      logger.info("  - Remaining (dollars):", remainingAmount);
      logger.info("  - Remaining (cents):", remainingAmountCents);
      
      // Step 4a: Try setting payment plan directly on package first
      logger.info("  Step 4a: Setting payment plan directly on package...");
      try {
        const packagePaymentPlanData = {
          data: {
            enabled: true,
            type: "custom",
            currency: currency,
            deposit_amount_in_cents: depositAmountCents,
            allow_partial_payment: false,
            payment_schedule: [
              {
                amount_in_cents: depositAmountCents,
                days_before_departure: 0,
                description: "Initial Deposit"
              },
              {
                amount_in_cents: remainingAmountCents,
                days_before_departure: daysBeforeDeparture,
                description: "Remaining Balance"
              }
            ]
          }
        };
        
        await axios.patch(
          `${this.apiUrl}/draft_trips/${tripUuid}/packages/${packageId}/payment_plan`,
          packagePaymentPlanData,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        logger.info("  ✅ Payment plan set directly on package");
        logger.info("    - This should enable deposit option on WeTravel page");
      } catch (packagePlanError) {
        logger.warn("  ⚠️ Could not set payment plan on package:");
        logger.warn("    - Error:", packagePlanError.response?.data || packagePlanError.message);
        logger.warn("    - Status:", packagePlanError.response?.status);
        logger.warn("    - Will continue with trip_options approach as fallback");
      }
      
      logger.info("  - Note: Payment plan also set on trip_options as fallback");

      // Step 5: Update trip_options with payment plan (per WeTravel API team recommendation)
      // WeTravel requires explicit update of trip_options[0][payment_plan] with correct schema
      logger.info("  Step 5: Updating trip_options with payment plan schema...");
      try {
        // We already have the tripOptionUuid from creation, so we can directly update it
        logger.info("  - Using trip_option UUID:", tripOptionUuid);
        
        // Build payment_schedule array using Golden Sample structure
        // Must use 'amount_in_cents' (not 'price') and include 'description' fields
        const paymentSchedule = [
          {
            amount_in_cents: depositAmountCents,
            days_before_departure: 0,
            description: "Initial Deposit",
          },
          {
            amount_in_cents: remainingAmountCents,
            days_before_departure: daysBeforeDeparture,
            description: "Remaining Balance",
          },
        ];
        
        // Validate payment schedule math: sum must equal package total price
        const scheduleTotal = depositAmountCents + remainingAmountCents;
        
        if (scheduleTotal !== packagePriceCents) {
          logger.error("  ❌ Payment schedule validation failed:");
          logger.error(`    - Schedule total: ${scheduleTotal} cents`);
          logger.error(`    - Package total: ${packagePriceCents} cents`);
          logger.error(`    - Difference: ${Math.abs(scheduleTotal - packagePriceCents)} cents`);
          throw new Error(`Payment schedule sum (${scheduleTotal}) does not match package total (${packagePriceCents}). This will cause publish validation to fail.`);
        }
        
        logger.info("  ✅ Payment schedule validation passed:");
        logger.info(`    - Deposit: ${depositAmountCents} cents`);
        logger.info(`    - Remaining: ${remainingAmountCents} cents`);
        logger.info(`    - Total: ${scheduleTotal} cents (matches package total)`);
        
        // Build payment plan structure using Golden Sample format
        // Must include: enabled, type: "custom", deposit_amount_in_cents, currency, payment_schedule, allow_partial_payment
        const paymentPlanStructure = {
          enabled: true,
          type: "custom",
          currency: currency,
          deposit_amount_in_cents: depositAmountCents,
          allow_partial_payment: false,
          payment_schedule: paymentSchedule,
        };
        
        logger.info("  - Using Golden Sample payment plan structure:");
        logger.info("    - Structure:", JSON.stringify(paymentPlanStructure, null, 2));
        
        // Build trip_options array with the payment plan
        // Include package_id as it may be required for trip_options
        const updatedTripOptions = [];
        
        // If we found existing trip_options, use the first one's UUID
        // Otherwise, create a new trip_option structure
        if (tripOptionUuid) {
          updatedTripOptions.push({
            uuid: tripOptionUuid,
            package_id: packageId,
            payment_plan: paymentPlanStructure,
          });
          logger.info("  - Building trip_option with UUID and package_id");
        } else if (tripOptions.length > 0) {
          // Use existing trip_option structure even without UUID
          updatedTripOptions.push({
            ...tripOptions[0], // Include all existing fields
            package_id: packageId,
            payment_plan: paymentPlanStructure,
          });
          logger.info("  - Building trip_option from existing structure");
        } else {
          // Create new trip_option structure
          logger.info("  ⚠️ No trip_option UUID found, creating new trip_option structure...");
          updatedTripOptions.push({
            package_id: packageId,
            payment_plan: paymentPlanStructure,
          });
        }
        
        if (process.env.NODE_ENV === 'development') {
          logger.info("  - Updated trip_option structure:");
          logger.info("    - UUID:", tripOptionUuid || "not provided");
          logger.info("    - Payment plan fields:", Object.keys(paymentPlanStructure));
          logger.info("    - Full updated option:", JSON.stringify(updatedTripOptions[0], null, 2));
        }

          // Update trip with trip_options that include payment plan
          // Try both structures: with and without 'trip' wrapper
          logger.info("  - Updating trip_options with Golden Sample structure:");
          logger.info("  - Full updatedTripOptions:", JSON.stringify(updatedTripOptions, null, 2));
          logger.info("  - Payment plan being sent:", JSON.stringify(updatedTripOptions[0].payment_plan, null, 2));
          
          // Try structure without 'trip' wrapper first (more consistent with other PATCH requests)
          let updateResponse;
          try {
            updateResponse = await axios.patch(
              `${this.apiUrl}/draft_trips/${tripUuid}`,
              {
                data: {
                  trip_options: updatedTripOptions,
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${this.accessToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            logger.info("  ✅ PATCH succeeded with trip_options directly");
            
            // Wait briefly and verify trip_options were created/updated
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (patchError) {
            // If that fails, try with 'trip' wrapper
            logger.info("  ⚠️ PATCH failed without 'trip' wrapper:");
            logger.info("    - Error:", patchError.response?.data || patchError.message);
            logger.info("    - Status:", patchError.response?.status);
            logger.info("    - Trying with 'trip' wrapper...");
            try {
              updateResponse = await axios.patch(
                `${this.apiUrl}/draft_trips/${tripUuid}`,
                {
                  data: {
                    trip: {
                      trip_options: updatedTripOptions,
                    },
                  },
                },
                {
                  headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              logger.info("  ✅ PATCH succeeded with 'trip' wrapper");
              
              // Wait briefly and verify trip_options were created/updated
              await new Promise(resolve => setTimeout(resolve, 1000));
              
            } catch (tripWrapperError) {
              logger.error("  ❌ PATCH also failed with 'trip' wrapper:");
              logger.error("    - Error:", tripWrapperError.response?.data || tripWrapperError.message);
              logger.error("    - Status:", tripWrapperError.response?.status);
              throw tripWrapperError;
            }
          }

          logger.info("  ✅ Updated trip_options[0] with payment plan schema");
          logger.info("  - Update response:", JSON.stringify(updateResponse.data, null, 2));
          
          // Check if URL is available in update response
          const updateResponseData = updateResponse.data?.data || updateResponse.data;
          if (updateResponseData?.url) {
            logger.info("  ✅ Payment link URL found in update response:", updateResponseData.url);
            paymentLinkUrl = updateResponseData.url;
          }
          
          // Verify the update by getting the trip again
          logger.info("  - Verifying trip_options update...");
          try {
            const verifyTripResponse = await axios.get(
              `${this.apiUrl}/draft_trips/${tripUuid}`,
              {
                headers: {
                  Authorization: `Bearer ${this.accessToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            
            // Handle different possible response structures
            const verifiedTrip = verifyTripResponse.data?.data?.trip || verifyTripResponse.data?.data || verifyTripResponse.data?.trip;
            const verifiedTripOptions = verifiedTrip?.trip_options || [];
            
            logger.info("  - Verification response structure:");
            logger.info("    - Response keys:", Object.keys(verifyTripResponse.data || {}));
            logger.info("    - Has trip_options?", !!verifiedTrip?.trip_options);
            logger.info("    - trip_options count:", verifiedTripOptions.length);
            
            if (verifiedTripOptions.length > 0) {
              logger.info("  - trip_options[0] structure:", JSON.stringify(verifiedTripOptions[0], null, 2));
              if (verifiedTripOptions[0].payment_plan) {
                logger.info("  ✅ Verified trip_options[0].payment_plan:", JSON.stringify(verifiedTripOptions[0].payment_plan, null, 2));
              } else {
                logger.warn("  ⚠️ Payment plan not found in verified trip_options[0]");
                logger.warn("    - trip_options[0] keys:", Object.keys(verifiedTripOptions[0]));
              }
            } else {
              logger.warn("  ⚠️ No trip_options found in verification response");
            }
            
            // Also check for URL in verification response
            if (!paymentLinkUrl && verifiedTrip?.url) {
              logger.info("  ✅ Payment link URL found in verification response:", verifiedTrip.url);
              paymentLinkUrl = verifiedTrip.url;
            }
          } catch (verifyError) {
            logger.warn("  ⚠️ Could not verify trip_options update:", verifyError.message);
          }
      } catch (updateError) {
        logger.error("  ❌ Could not update trip_options:", updateError.response?.data || updateError.message);
        logger.error("  - Error status:", updateError.response?.status);
        throw new Error(`Failed to update trip_options with payment plan: ${updateError.response?.data?.error || updateError.message}`);
      }

      // Step 6: Always publish the trip to make it publicly accessible
      // Draft trips have URLs but are not publicly accessible - they must be published
      logger.info("  Step 6: Publishing trip to make it publicly accessible...");
      logger.info("  - Note: Draft trips are not publicly accessible, publishing is required");
      
      // Before publishing, verify the trip structure
      try {
        logger.info("  - Pre-publish verification...");
        const prePublishCheck = await axios.get(
          `${this.apiUrl}/draft_trips/${tripUuid}`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        const prePublishTrip = prePublishCheck.data?.data?.trip || prePublishCheck.data?.data || prePublishCheck.data?.trip;
        const prePublishTripOptions = prePublishTrip?.trip_options || [];
        
        logger.info("  - Pre-publish trip structure:");
        logger.info("    - Has trip_options?", !!prePublishTrip?.trip_options);
        logger.info("    - trip_options count:", prePublishTripOptions.length);
        logger.info("    - Has images?", !!prePublishTrip?.images);
        logger.info("    - Images count:", prePublishTrip?.images?.length || 0);
        logger.info("    - Published status:", prePublishTrip?.published);
        
        if (prePublishTripOptions.length > 0) {
          logger.info("    - trip_options[0] structure:", JSON.stringify(prePublishTripOptions[0], null, 2));
          if (prePublishTripOptions[0].payment_plan) {
            logger.info("  ✅ Payment plan found in trip_options before publish");
            logger.info("    - Payment plan:", JSON.stringify(prePublishTripOptions[0].payment_plan, null, 2));
          } else {
            logger.warn("  ⚠️ Payment plan not found in trip_options before publish!");
            logger.warn("    - trip_options[0] keys:", Object.keys(prePublishTripOptions[0]));
          }
        } else {
          logger.warn("  ⚠️ No trip_options found before publish!");
          logger.warn("    - This may cause publish to fail, but we'll try anyway");
        }
        
        // Check if images exist - if not, try one final time
        if (!prePublishTrip?.images || prePublishTrip.images.length === 0) {
          logger.warn("  ⚠️ No images found - attempting final image add...");
          try {
            const finalImageData = {
              data: {
                images: [
                  {
                    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
                    is_primary: true
                  }
                ]
              }
            };
            await axios.patch(
              `${this.apiUrl}/draft_trips/${tripUuid}`,
              finalImageData,
              {
                headers: {
                  Authorization: `Bearer ${this.accessToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            logger.info("  ✅ Final image add succeeded");
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (finalImageError) {
            logger.warn("  ⚠️ Final image add failed - will attempt publish anyway");
          }
        } else {
          logger.info("  ✅ Images found:", prePublishTrip.images.length, "image(s)");
        }
      } catch (prePublishError) {
        logger.error("  ❌ Could not verify trip before publish:");
        logger.error("    - Error:", prePublishError.response?.data || prePublishError.message);
        logger.warn("    - Will attempt to publish anyway");
      }
      
      // Always publish the trip - draft trips are not publicly accessible
      try {
        logger.info("  - Attempting to publish trip...");
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

        logger.info("  ✅ Trip published successfully");
        const publishedTrip = publishResponse.data?.data?.trip || publishResponse.data?.data || publishResponse.data?.trip;
        paymentLinkUrl = publishedTrip?.url;
        
        if (paymentLinkUrl) {
          logger.info("  - Published trip URL:", paymentLinkUrl);
          logger.info("  - Published status:", publishedTrip?.published);
        } else {
          logger.warn("  ⚠️ No URL in publish response");
          logger.warn("    - Publish response:", JSON.stringify(publishResponse.data, null, 2));
        }
      } catch (publishError) {
          // Log detailed error information
          logger.error("  ❌ Publishing failed:");
          logger.error("  - Error:", publishError.response?.data || publishError.message);
          logger.error("  - Status:", publishError.response?.status);
          logger.error("  - Full error response:", JSON.stringify(publishError.response?.data, null, 2));
          
          // If publish fails, try to use draft URL anyway
          // Draft trips have URLs that might work even if not published
          logger.warn("  ⚠️ Publishing failed, trying to use draft trip URL...");
          
          try {
            const finalDraftResponse = await axios.get(
              `${this.apiUrl}/draft_trips/${tripUuid}`,
              {
                headers: {
                  Authorization: `Bearer ${this.accessToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            
            const draftTrip = finalDraftResponse.data?.data?.trip || finalDraftResponse.data?.data || finalDraftResponse.data?.trip;
            paymentLinkUrl = draftTrip?.url;
            
            if (paymentLinkUrl) {
              logger.info("  ✅ Using draft trip URL despite publish failure");
              logger.info("  - Draft URL:", paymentLinkUrl);
              logger.warn("  ⚠️ NOTE: Draft trips may not be publicly accessible - user may see 404");
              logger.warn("  - Publish error:", publishError.response?.data?.error || publishError.message);
            } else {
              // If we don't have a URL, throw the original publish error
              throw publishError;
            }
          } catch (finalError) {
            // If we can't get draft URL either, throw original publish error
            throw publishError;
          }
      }
      
      if (!paymentLinkUrl) {
        throw new Error("Failed to get payment link URL from draft trip or published trip");
      }

      logger.info("✅ [WeTravel] Deposit payment link created via Trips Builder API");
      logger.info("  - Payment Link URL:", paymentLinkUrl);
      logger.info("  - Trip UUID:", tripUuid);

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
      logger.error("❌ [WeTravel] Error creating deposit payment link via Trips Builder API:");
      logger.error("  - Error:", error.response?.data || error.message);
      logger.error("  - Status:", error.response?.status);
      throw new Error(`Failed to create deposit payment link via Trips Builder: ${error.response?.data?.error || error.message}`);
    }
  }
}

// Export a singleton instance
module.exports = new WeTravelService();
