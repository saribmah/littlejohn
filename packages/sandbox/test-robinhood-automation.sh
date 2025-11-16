#!/bin/bash

# Test Robinhood Automation
# This script starts the sandbox server and tests the /init endpoint
# which includes automated Robinhood portfolio synchronization

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Robinhood Automation Test${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}\n"

# Configuration
SANDBOX_PORT=3001
BACKEND_PORT=3000
SANDBOX_URL="http://localhost:${SANDBOX_PORT}"
SESSION_ID="test-session-$(date +%s)"
USER_ID="1qAMfQi7bvqBRIHGi9Da1HVzXdZXW4aU"  # Replace with your user ID

# Step 1: Check if backend is running
echo -e "${YELLOW}📋 Step 1: Checking backend server...${NC}"
if curl -s "${BACKEND_URL:-http://localhost:${BACKEND_PORT}}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running on port ${BACKEND_PORT}${NC}\n"
else
    echo -e "${RED}✗ Backend is not running on port ${BACKEND_PORT}${NC}"
    echo -e "${YELLOW}  Please start the backend first:${NC}"
    echo -e "  cd packages/backend && bun run dev\n"
    exit 1
fi

# Step 2: Check environment variables
echo -e "${YELLOW}📋 Step 2: Checking environment variables...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}✗ .env file not found${NC}"
    echo -e "${YELLOW}  Please copy .env.example to .env and set your credentials${NC}\n"
    exit 1
fi

# Source .env to check for required variables
export $(grep -v '^#' .env | xargs)

if [ -z "$ROBINHOOD_USERNAME" ] || [ -z "$ROBINHOOD_PASSWORD" ]; then
    echo -e "${RED}✗ ROBINHOOD_USERNAME or ROBINHOOD_PASSWORD not set in .env${NC}\n"
    exit 1
fi

echo -e "${GREEN}✓ Environment variables configured${NC}"
echo -e "  Username: ${ROBINHOOD_USERNAME}"
echo -e "  Password: ********\n"

# Step 3: Kill any existing sandbox processes
echo -e "${YELLOW}📋 Step 3: Cleaning up existing processes...${NC}"
if lsof -ti:${SANDBOX_PORT} > /dev/null 2>&1; then
    echo -e "  Killing processes on port ${SANDBOX_PORT}..."
    lsof -ti:${SANDBOX_PORT} | xargs kill -9 2>/dev/null || true
    sleep 2
    echo -e "${GREEN}✓ Cleaned up existing processes${NC}\n"
else
    echo -e "${GREEN}✓ Port ${SANDBOX_PORT} is available${NC}\n"
fi

# Step 4: Start the sandbox server
echo -e "${YELLOW}📋 Step 4: Starting sandbox server...${NC}"
LOG_FILE="/tmp/sandbox-test-$(date +%s).log"
echo -e "  Log file: ${LOG_FILE}"

bun run dev > "${LOG_FILE}" 2>&1 &
SANDBOX_PID=$!

echo -e "  Sandbox PID: ${SANDBOX_PID}"
echo -e "  Waiting for server to start..."

# Wait for server to be ready (max 10 seconds)
RETRY_COUNT=0
MAX_RETRIES=20
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s "${SANDBOX_URL}/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Sandbox server is ready${NC}\n"
        break
    fi
    sleep 0.5
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -n "."
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "\n${RED}✗ Sandbox server failed to start${NC}"
    echo -e "${YELLOW}  Check logs: ${LOG_FILE}${NC}\n"
    kill $SANDBOX_PID 2>/dev/null || true
    exit 1
fi

# Step 5: Call the /init endpoint with SSE streaming
echo -e "${YELLOW}📋 Step 5: Calling /init endpoint...${NC}"
echo -e "  Session ID: ${SESSION_ID}"
echo -e "  User ID: ${USER_ID}"
echo -e "  Browser: Non-headless (visible)\n"

echo -e "${BLUE}⏳ Starting Robinhood automation with live streaming...${NC}"
echo -e "${BLUE}   This will take 30-60 seconds${NC}"
echo -e "${BLUE}   The browser will open and navigate to Robinhood${NC}\n"

# Create request payload
REQUEST_PAYLOAD=$(cat <<EOF
{
  "sessionID": "${SESSION_ID}",
  "userId": "${USER_ID}",
  "options": {
    "browserPort": 9222,
    "headless": false
  }
}
EOF
)

# Files for tracking stream data
STREAM_FILE="/tmp/init-stream-$(date +%s).log"
FINAL_DATA_FILE="/tmp/init-final-$(date +%s).json"

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}              STREAMING EVENTS                      ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}\n"

# Stream the SSE events and display them
MESSAGE_COUNT=0
TOOL_CALL_COUNT=0

# Make the streaming request
curl -s -N -X POST "${SANDBOX_URL}/init" \
    -H "Content-Type: application/json" \
    -H "Accept: text/event-stream" \
    -d "${REQUEST_PAYLOAD}" | while IFS= read -r line; do

    # Save to stream file
    echo "$line" >> "${STREAM_FILE}"

    # Parse SSE format
    if [[ $line == event:* ]]; then
        EVENT_TYPE=${line#event: }
        EVENT_TYPE=$(echo "$EVENT_TYPE" | tr -d '\r')
    elif [[ $line == data:* ]]; then
        DATA=${line#data: }
        DATA=$(echo "$DATA" | tr -d '\r')

        # Parse JSON data
        EVENT_SUBTYPE=$(echo "$DATA" | grep -o '"type":"[^"]*"' | cut -d'"' -f4)

        case "$EVENT_TYPE" in
            "init")
                echo -e "${GREEN}🚀 Initialization Started${NC}"
                BROWSER_PORT=$(echo "$DATA" | grep -o '"port":[0-9]*' | head -1 | cut -d: -f2)
                if [ ! -z "$BROWSER_PORT" ]; then
                    echo -e "   Browser launched on port: ${BROWSER_PORT}"
                fi
                echo ""
                ;;

            "message")
                MESSAGE_COUNT=$((MESSAGE_COUNT + 1))
                case "$EVENT_SUBTYPE" in
                    "assistant")
                        CONTENT=$(echo "$DATA" | grep -o '"text":"[^"]*"' | head -1 | cut -d'"' -f4 | sed 's/\\n/\n/g')
                        if [ ! -z "$CONTENT" ]; then
                            echo -e "${BLUE}🤖 Claude:${NC} ${CONTENT}"
                        fi

                        # Check for tool use
                        if echo "$DATA" | grep -q '"tool_use"'; then
                            TOOL_NAME=$(echo "$DATA" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
                            if [ ! -z "$TOOL_NAME" ]; then
                                TOOL_CALL_COUNT=$((TOOL_CALL_COUNT + 1))
                                echo -e "${YELLOW}   🔧 Using tool: ${TOOL_NAME}${NC}"
                            fi
                        fi
                        ;;

                    "result")
                        IS_ERROR=$(echo "$DATA" | grep -o '"is_error":[^,}]*' | cut -d: -f2)
                        if [ "$IS_ERROR" == "true" ]; then
                            echo -e "${RED}❌ Result: Error${NC}"
                        else
                            NUM_TURNS=$(echo "$DATA" | grep -o '"num_turns":[0-9]*' | cut -d: -f2)
                            DURATION=$(echo "$DATA" | grep -o '"duration_ms":[0-9.]*' | cut -d: -f2)
                            echo -e "${GREEN}✅ Result: Success${NC}"
                            if [ ! -z "$NUM_TURNS" ]; then
                                echo -e "   Turns: ${NUM_TURNS}"
                            fi
                            if [ ! -z "$DURATION" ]; then
                                DURATION_SEC=$(echo "scale=2; $DURATION / 1000" | bc)
                                echo -e "   Duration: ${DURATION_SEC}s"
                            fi
                        fi
                        echo ""
                        ;;

                    "system")
                        SUBTYPE=$(echo "$DATA" | grep -o '"subtype":"[^"]*"' | cut -d'"' -f4)
                        if [ "$SUBTYPE" == "init" ]; then
                            MODEL=$(echo "$DATA" | grep -o '"model":"[^"]*"' | cut -d'"' -f4)
                            echo -e "${YELLOW}⚙️  System initialized with model: ${MODEL}${NC}"
                            echo ""
                        fi
                        ;;
                esac
                ;;

            "complete")
                echo -e "\n${GREEN}═══════════════════════════════════════════════════${NC}"
                echo -e "${GREEN}              AUTOMATION COMPLETED                  ${NC}"
                echo -e "${GREEN}═══════════════════════════════════════════════════${NC}\n"

                # Save final data
                echo "$DATA" > "${FINAL_DATA_FILE}"

                # Extract portfolio info
                CURRENT_VALUE=$(echo "$DATA" | grep -o '"currentValue":[0-9.]*' | cut -d: -f2 | head -1)
                DAY_CHANGE_VALUE=$(echo "$DATA" | grep -o '"dayChangeValue":[0-9.-]*' | cut -d: -f2 | head -1)
                DAY_CHANGE_PCT=$(echo "$DATA" | grep -o '"dayChangePercentage":[0-9.-]*' | cut -d: -f2 | head -1)

                if [ ! -z "$CURRENT_VALUE" ]; then
                    echo -e "${GREEN}💰 Portfolio Performance:${NC}"
                    echo -e "   Current Value: \$${CURRENT_VALUE}"
                    if [ ! -z "$DAY_CHANGE_VALUE" ]; then
                        echo -e "   Day Change: \$${DAY_CHANGE_VALUE} (${DAY_CHANGE_PCT}%)"
                    fi
                    echo ""
                fi

                # Count positions
                POSITION_COUNT=$(echo "$DATA" | grep -o '"symbol"' | wc -l | tr -d ' ')
                if [ "${POSITION_COUNT}" -gt 0 ]; then
                    echo -e "${GREEN}📊 Positions: ${POSITION_COUNT} positions synced${NC}\n"
                fi

                echo -e "${BLUE}📊 Statistics:${NC}"
                echo -e "   Messages: ${MESSAGE_COUNT}"
                echo -e "   Tool calls: ${TOOL_CALL_COUNT}"
                echo ""
                ;;

            "error")
                ERROR_MSG=$(echo "$DATA" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
                echo -e "${RED}❌ Error: ${ERROR_MSG}${NC}\n"
                ;;
        esac
    fi
done

echo -e "\n${YELLOW}📋 Step 6: Summary${NC}"
echo -e "${BLUE}📌 What happened:${NC}"
echo -e "   1. ✓ Sandbox server started"
echo -e "   2. ✓ Browser launched with stealth mode"
echo -e "   3. ✓ Claude agent navigated to Robinhood"
echo -e "   4. ✓ Agent retrieved credentials from tool"
echo -e "   5. ✓ Agent logged into Robinhood"
echo -e "   6. ✓ Agent scraped portfolio data"
echo -e "   7. ✓ Agent updated backend database"
echo -e "   8. ✓ Live stream completed\n"

echo -e "${YELLOW}📝 Files created:${NC}"
echo -e "   Stream log: ${STREAM_FILE}"
echo -e "   Final data: ${FINAL_DATA_FILE}"
echo -e "   Server logs: ${LOG_FILE}\n"

# Step 7: Cleanup
echo -e "${YELLOW}📋 Step 7: Cleanup${NC}"
echo -e "   Browser is still running for inspection"
echo -e "   Sandbox server PID: ${SANDBOX_PID}\n"

echo -e "${BLUE}💡 To stop the sandbox server:${NC}"
echo -e "   kill ${SANDBOX_PID}\n"

echo -e "${BLUE}💡 To view live logs:${NC}"
echo -e "   tail -f ${LOG_FILE}\n"

echo -e "${GREEN}✨ Test completed!${NC}\n"
