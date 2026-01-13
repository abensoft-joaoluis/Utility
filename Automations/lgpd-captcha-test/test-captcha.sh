#!/bin/bash

# Usage: ./test-captcha.sh YOUR_API_KEY RECAPTCHA_TOKEN

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <API_KEY> <RECAPTCHA_TOKEN>"
    echo ""
    echo "Example:"
    echo "  $0 AIzaSyD... 03AGdBq26..."
    echo ""
    echo "You can get the token from:"
    echo "  1. Browser console after completing captcha"
    echo "  2. Debug panel in the mockup"
    echo "  3. Network tab (look for g-recaptcha-response)"
    exit 1
fi

API_KEY="$1"
TOKEN="$2"

# Create temporary request file with actual values
cat > request-temp.json <<EOF
{
  "event": {
    "token": "$TOKEN",
    "expectedAction": "LOGIN",
    "siteKey": "6LeqFEMsAAAAAFyg11AZ7coDZZI63tmdv-rZI28c"
  }
}
EOF

echo "Sending reCAPTCHA assessment request..."
echo ""

curl -X POST \
  "https://recaptchaenterprise.googleapis.com/v1/projects/sisleal-gcp/assessments?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d @request-temp.json

echo ""
echo ""

# Clean up
rm -f request-temp.json
