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
      let tokenKeyId = "unknown";
      let tokenAccountId = "unknown";
      try {
        const tokenParts = process.env.WETRAVEL_API_KEY.split(".");
        if (tokenParts.length >= 2) {
          const header = JSON.parse(Buffer.from(tokenParts[0], "base64").toString());
          const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
          tokenKeyId = header.kid;
          tokenAccountId = payload.id;
          console.log("[Test] Token Key ID (kid):", tokenKeyId);
          console.log("[Test] Token Account ID:", tokenAccountId);
          console.log("[Test] Token Algorithm:", header.alg);
          
          // Check if key ID matches available keys
          if (tokenKeyId !== "d61bc312" && tokenKeyId !== "44b0c789") {
            console.warn("[Test] ⚠️ WARNING: Token key ID does not match available keys!");
            console.warn("[Test] Expected: d61bc312 or 44b0c789");
            console.warn("[Test] Found:", tokenKeyId);
          }
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
            tokenKeyId: tokenKeyId,
            tokenAccountId: tokenAccountId,
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
        // Extract key ID from error if available
        let errorKeyId = "unknown";
        if (error.response?.data?.error) {
          const errorMsg = error.response.data.error;
          if (errorMsg.includes("Unknown key id:")) {
            const match = errorMsg.match(/Unknown key id: ([a-f0-9]+)/);
            if (match) errorKeyId = match[1];
          }
        }

        return responseReturn(res, 500, {
          error: "WeTravel API test failed",
          message: error.message,
          details: {
            apiError: error.response?.data || error.message,
            currentTokenKeyId: tokenKeyId,
            currentTokenAccountId: tokenAccountId,
            errorKeyId: errorKeyId,
            expectedKeyIds: ["d61bc312", "44b0c789"],
            fix: "Update WETRAVEL_API_KEY in .env file on cPanel with the production key and restart the Node.js app",
          },
        });
    }
  };
}

module.exports = new TestWeTravelController();
