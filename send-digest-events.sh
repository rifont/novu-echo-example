#!/bin/bash

# Define the API key and endpoint
NOVU_API_KEY=$(cat .env.local | grep NOVU_API_KEY | cut -d '=' -f2)
ENDPOINT="https://api.novu.co/v1/events/trigger"

# Array of messages to be sent
messages=("You got 1 like on your dog post" "You got a new friend request" "You have a new message in your mail")

# Iterate over each message in the array
for message in "${messages[@]}"; do
  # Use curl to send the POST request with the current message in the payload
  curl --location --request POST "$ENDPOINT" \
    --header "Authorization: ApiKey $NOVU_API_KEY" \
    --header "Content-Type: application/json" \
    --data-raw "{
      \"name\": \"ai-digest\",
      \"to\": {
        \"subscriberId\": \"richard@fontein.co\",
        \"email\": \"richard@fontein.co\"
      },
      \"payload\": {
        \"message\": \"$message\"
      }
    }"
done
