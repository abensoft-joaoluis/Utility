#!/usr/bin/env python3
"""
LGPD Captcha Test Server
Serves the LGPD form mockup for testing reCAPTCHA integration
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

# Configuration
PORT = 8080
DIRECTORY = Path(__file__).parent

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler to serve files from the script's directory"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def log_message(self, format, *args):
        # Custom log format with colors
        sys.stderr.write("\033[94m[%s]\033[0m %s\n" % (self.log_date_time_string(), format % args))


def main():
    """Start the HTTP server"""

    # Change to the script's directory
    os.chdir(DIRECTORY)

    print("=" * 60)
    print("  LGPD Captcha Test Server")
    print("=" * 60)
    print()
    print(f"📁 Serving from: {DIRECTORY}")
    print(f"🌐 URL: http://localhost:{PORT}")
    print(f"🌐 Network URL: http://127.0.0.1:{PORT}")
    print()
    print("📋 Quick Test Steps:")
    print("   1. Open http://localhost:{PORT} in your browser")
    print("   2. Click 'Debug' button (bottom-right)")
    print("   3. Check the checkbox to accept terms")
    print("   4. Complete the reCAPTCHA")
    print("   5. Click 'Confirmar' to submit")
    print()
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    print()

    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n")
        print("=" * 60)
        print("  Server stopped")
        print("=" * 60)
        sys.exit(0)
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"\n❌ Error: Port {PORT} is already in use.")
            print(f"   Try killing the process using port {PORT} or change PORT in serve.py")
            print(f"   To find the process: lsof -i :{PORT}")
            sys.exit(1)
        else:
            raise


if __name__ == "__main__":
    main()

