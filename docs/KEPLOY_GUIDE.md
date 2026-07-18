# Keploy API Testing Guide

This guide details how to execute Keploy test recording and replaying to validate the CivicPulse Express backend APIs.

---

## 1. Quick Start (Run API tests with Vitest)

To run the API unit and integration test suite:
```bash
npm run test:api
```
This runs the local API tests using Vitest to mock and validate routes for Geocode, Vision AI, Voice STT, and authentication middleware.

---

## 2. API Recording with Keploy CLI

Keploy automatically captures API calls to database, third-party services, and mocks them.

### To Record Test Cases:
1. Ensure Keploy is installed locally on your system ([Install Keploy CLI](https://docs.keploy.io/docs/keploy-installation/)).
2. Start recording:
   ```bash
   keploy record -c "npm run dev"
   ```
3. Use a tool like Postman, curl, or the web UI to hit endpoints (e.g. create reports, fetch map pins, verify logins).
4. Stop the terminal execution. Keploy will write YAML files under `keploy/tests` and `keploy/mocks`.

---

## 3. Replay Regression Tests

To run the regression suite locally using Keploy:
```bash
npm run test:keploy
```
This commands Keploy to spin up the local server, replay the captured requests, and compare the response bodies, headers, and status codes to ensure nothing has regressed.
