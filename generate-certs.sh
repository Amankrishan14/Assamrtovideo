#!/bin/bash

# Generate self-signed SSL certificates for localhost
echo "🔐 Generating SSL certificates for localhost..."

openssl req -x509 -newkey rsa:4096 \
  -keyout key.pem \
  -out cert.pem \
  -days 365 \
  -nodes \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:::1"

if [ $? -eq 0 ]; then
  echo "✅ Certificates generated successfully!"
  echo "📝 Files created:"
  echo "   - key.pem (private key)"
  echo "   - cert.pem (certificate)"
  echo ""
  echo "⚠️  Your browser will show a security warning for self-signed certificates."
  echo "   Click 'Advanced' and then 'Proceed to localhost' to continue."
else
  echo "❌ Failed to generate certificates. Make sure OpenSSL is installed."
  exit 1
fi






