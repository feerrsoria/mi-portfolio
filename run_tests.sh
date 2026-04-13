#!/bin/bash

OUTPUT_FILE="test-summary.md"
TEMP_LOG="/tmp/test_run.log"
DATE=$(date "+%Y-%m-%d %H:%M:%S")

# Initialize summary file
echo "# Test Execution Summary" > $OUTPUT_FILE
echo "Generated at: $DATE" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Function to run a test section and format output
run_test_section() {
    local title=$1
    local command=$2
    
    echo "Running: $title..."
    echo "## $title" >> $OUTPUT_FILE
    
    # Run command and capture output & exit code
    # We use 'script' to preserve colors if possible, but here we'll just use raw output for simplicity
    # and filter ANSI escape codes later to keep it clean.
    eval "$command" > "$TEMP_LOG" 2>&1
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo "### Status: ✅ PASSED" >> $OUTPUT_FILE
    else
        echo "### Status: ❌ FAILED" >> $OUTPUT_FILE
    fi
    
    echo "<details><summary>View Full Output</summary>" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
    echo "\`\`\`" >> $OUTPUT_FILE
    # Filter ANSI escape codes (colors) for cleaner markdown
    sed -r "s/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g" "$TEMP_LOG" >> $OUTPUT_FILE
    echo "\`\`\`" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
    echo "</details>" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
}

# 0. Type Checking
run_test_section "Static Analysis (Type Checking)" "npm run test:compile"

# 1. Unit Tests
run_test_section "Unit Tests (Client Component Layer)" "npx vitest run tests/unit --coverage --coverage.reporter=text"

# 2. Integration Tests
run_test_section "Integration Tests (Context & Provider Layer)" "npx vitest run tests/integration --coverage --coverage.reporter=text"

# 3. E2E Tests (Mocked)
# We need to make sure the web server is not running or handled by playwright
run_test_section "End-to-End Tests (Mocked Networking Layer)" "npx playwright test e2e-tests/auth-flow-mock.spec.ts"

# 4. E2E Tests (Real)
run_test_section "End-to-End Tests (Real Connection Layer)" "npx playwright test e2e-tests/auth-flow-real.spec.ts"

# Cleanup
rm -f "$TEMP_LOG"

echo "Tests finished. Report saved to $OUTPUT_FILE."
