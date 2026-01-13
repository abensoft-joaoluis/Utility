# LGPD Captcha Test

Test environment for debugging the LGPD form reCAPTCHA integration.

## Quick Start

```bash
./serve.py
```

Then open: http://localhost:8080

## Files

- `index.html` - LGPD form mockup with debug console
- `serve.py` - Python HTTP server

## Usage

1. Run the server: `./serve.py`
2. Open http://localhost:8080 in browser
3. Click "Debug" button to see logs
4. Test the reCAPTCHA flow

## reCAPTCHA Config

- Site Key: `6LehEfIpAAAAAIFkuU0NjZXvZCy3b0B5ogGAp7jX`
- Language: Portuguese (pt-BR)
- Type: Checkbox (v2)

## Notes

- The reCAPTCHA domain must be whitelisted in Google Cloud Console
- Add `localhost` to allowed domains for testing
- Server runs on port 8080 by default (change in serve.py if needed)

