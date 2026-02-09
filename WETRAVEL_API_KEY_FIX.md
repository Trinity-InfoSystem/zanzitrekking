# WeTravel API Key Fix

## Problem

The error shows:
```
Unknown key id: 59d157a0, available keys: ["44b0c789", "d61bc312"]
```

This means the `.env` file on your cPanel server is using an **old/demo API key** instead of the **production API key**.

## Solution

### 1. Update `.env` file on cPanel

Go to your cPanel File Manager and edit the `.env` file in:
```
/home/safariszanzico/api.zanzisafaris.com/.env
```

**Replace the `WETRAVEL_API_KEY` with the production key:**

```env
# Production WeTravel API Key (Refresh Token)
WETRAVEL_API_KEY=eyJraWQiOiJkNjFiYzMxMiIsImFsZyI6IkVTMjU2In0.eyJpZCI6MTE5NTcwMSwia2luZCI6InJlZnJlc2giLCJpYXQiOjE3NzA2NDI2MDgsImV4cCI6MjA4NjEyODAwMCwidmVyIjo1LCJwdWIiOnRydWUsInNjb3BlcyI6WyJydzphbGwiXSwianRpIjoiZTYwZDhlZjgtMTFhNS00MjE1LWFlY2EtOTNmYzkxNTE3NjcwIiwic2JkIjpudWxsfQ.yqB4qBukm1ivljwqcOfdeiB3ajmsksmRbCwyfSG-ScaxcFu9wcoEwijI6x1Z6fWbEI95xWcynYXjy0A64x5Zqw

# Make sure this is set to false for production
WETRAVEL_USE_DEMO=false

# Webhook secret (from WeTravel dashboard)
WETRAVEL_WEBHOOK_SECRET=your_webhook_secret_here
```

### 2. Restart Node.js Application

After updating the `.env` file:

1. Go to cPanel → **Node.js Selector**
2. Find `api.zanzisafaris.com`
3. Click **"Restart"** or **"Reload"**

Or create a restart file:
```bash
touch /home/safariszanzico/api.zanzisafaris.com/tmp/restart.txt
```

### 3. Test the API Connection

Test the WeTravel API connection using the new test endpoint:

```bash
curl https://api.zanzisafaris.com/api/webhooks/wetravel/test
```

**Expected Success Response:**
```json
{
  "message": "WeTravel API connection test successful",
  "details": {
    "accessTokenObtained": true,
    "apiUrl": "https://api.wetravel.com/v2",
    "apiTestSuccessful": true,
    "paymentLinksCount": 0
  }
}
```

**If you still get an error**, check:
- The API key is correctly pasted (no extra spaces or line breaks)
- The `.env` file was saved
- The Node.js app was restarted

## Verification

### Check Token Key ID

The production API key should have key ID `d61bc312` in its JWT header. You can verify this by:

1. Decoding the JWT token header (first part before the first dot)
2. The `kid` field should be `"d61bc312"`

The test endpoint will also show the key ID in the logs.

## API Key Details

- **Type**: Refresh Token (JWT)
- **Key ID**: `d61bc312` (should match one of the available keys)
- **Account ID**: `1195701`
- **Environment**: Production (`api.wetravel.com`)

## Common Issues

### Issue: Still getting "Unknown key id" error

**Solution:**
1. Double-check the API key is correctly pasted in `.env`
2. Make sure there are no extra spaces or quotes around the key
3. Restart the Node.js application
4. Check server logs for the actual key ID being used

### Issue: API test endpoint returns 404

**Solution:**
- Make sure you've deployed the latest code with the test endpoint
- Check that the route is registered in `server.js`

### Issue: Access token obtained but API calls fail

**Solution:**
- Verify the access token is being used correctly
- Check API endpoint URLs match your WeTravel account type
- Ensure `WETRAVEL_USE_DEMO=false` for production

## Next Steps

After fixing the API key:

1. ✅ Test API connection: `curl https://api.zanzisafaris.com/api/webhooks/wetravel/test`
2. ✅ Create a test order to verify payment link generation
3. ✅ Complete a test payment to trigger the webhook
4. ✅ Verify order status updates automatically

---

**Last Updated**: February 2026
**Status**: Ready for testing
