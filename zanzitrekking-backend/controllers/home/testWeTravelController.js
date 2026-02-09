const weTravelService = require("../../utilities/wetravelService");
const { responseReturn } = require("../../utilities/response");

/**
 * Test WeTravel API Controller
 * Used to test WeTravel API connection and token generation
 */
class TestWeTravelController {
  /**
   * Test WeTravel API connection and token generation
   */
  testConnection = async (req, res) => {
    try {
      console.log("[Test] Testing WeTravel API connection...");
      console.log("[Test] API Key configured:", !!process.env.WETRAVEL_API_KEY);
      console.log("[Test] API Key length:", process.env.WETRAVEL_API_KEY?.length || 0);
      console.log("[Test] Using demo API:", process.env.WETRAVEL_USE_DEMO === "true");
      
      // Check if API key is configured
      if (!process.env.WETRAVEL_API_KEY) {
        return responseReturn(res, 400, {
          error: "WETRAVEL_API_KEY is not configured in environment variables",
        });
      }

      // Extract key ID from JWT token (first part of the token)
      try {
        const tokenParts = process.env.WETRAVEL_API_KEY.split(".");
        if (tokenParts.length >= 1) {
          const header = JSON.parse(Buffer.from(tokenParts[0], "base64").toString());
          console.log("[Test] Token Key ID (kid):", header.kid);
          console.log("[Test] Token Algorithm:", header.alg);
        }
      } catch (e) {
        console.log("[Test] Could not parse token header:", e.message);
      }

      // Test getting access token
      console.log("[Test] Attempting to get access token...");
      const accessToken = await weTravelService.getAccessToken();

      if (!accessToken) {
        return responseReturn(res, 500, {
          error: "Failed to obtain access token",
        });
      }

      console.log("[Test] ✅ Successfully obtained access token");
      console.log("[Test] Access token length:", accessToken.length);

      // Test API endpoint (list payment links)
      try {
        const axios = require("axios");
        const apiUrl = process.env.WETRAVEL_USE_DEMO === "true"
          ? "https://api.demo.wetravel.to/v2"
          : "https://api.wetravel.com/v2";

        console.log("[Test] Testing API endpoint:", `${apiUrl}/payment_links`);
        
        const testResponse = await axios.get(`${apiUrl}/payment_links`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          params: {
            per_page: 1,
            page: 1,
          },
        });

        console.log("[Test] ✅ API endpoint test successful");
        console.log("[Test] Response status:", testResponse.status);

        return responseReturn(res, 200, {
          message: "WeTravel API connection test successful",
          details: {
            accessTokenObtained: true,
            apiUrl: apiUrl,
            apiTestSuccessful: true,
            paymentLinksCount: testResponse.data?.data?.length || 0,
          },
        });
      } catch (apiError) {
        console.error("[Test] ❌ API endpoint test failed:", apiError.response?.data || apiError.message);
        return responseReturn(res, 200, {
          message: "Access token obtained but API endpoint test failed",
          details: {
            accessTokenObtained: true,
            apiTestSuccessful: false,
            apiError: apiError.response?.data || apiError.message,
          },
        });
      }
    } catch (error) {
      console.error("[Test] ❌ WeTravel API test error:", error);
      return responseReturn(res, 500, {
        error: "WeTravel API test failed",
        message: error.message,
        details: error.response?.data || error.stack,
      });
    }
  };
}

module.exports = new TestWeTravelController();
