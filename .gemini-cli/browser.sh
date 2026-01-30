#!/bin/bash
# This script will log the URL that Gemini CLI tries to open.
# The authentication URL will be written to this file.
URL_FILE="/app/gemini_auth_url.txt"
# Ensure the file exists.
touch "$URL_FILE"
# Append the URL and a timestamp to the file.
echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$URL_FILE"
# Optional: Print to console as well for immediate visibility.
echo "URL would be opened: $1"