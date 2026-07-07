# 🔧 PMS API Integration Guide - Koenig Induction Dashboard

## Current Status

✅ **Dashboard is fully functional**
✅ **Mock data is displaying correctly**
⚠️ **PMS API returning "Permission Denied (403)" - IP whitelist issue**

---

## Issue Diagnosis

### What's Happening?
The dashboard is currently showing **sample/mock data** instead of real employee data from your PMS system. This is because:

1. **PMS API is blocking the request** with error: `Forbidden : Permission denied`
2. **Root Cause**: Your PMS API is configured with an **IP whitelist** that doesn't include your server
3. **Your machine's IP DOES work** (verified via PowerShell test)
4. **Server's IP is being blocked** (verified via Node.js server test)

### Evidence
```
✅ PowerShell (your machine):   HTTP 200 ✓ Access Granted
❌ Next.js Server (localhost):  HTTP 200 but statuscode 403 ✓ Access Denied
```

---

## Solution: 3 Steps to Enable Live PMS Data

### **Step 1: Identify Your Server's IP Address**

Run this command to find your server's public IP:
```powershell
$ip = Invoke-WebRequest -Uri "https://api.ipify.org?format=json" -UseBasicParsing | ConvertFrom-Json
Write-Host "Your Server IP: $($ip.ip)"
```

**OR** if running locally:
- Development: `127.0.0.1` (localhost)
- Deployed: Ask your hosting provider for the server's outbound IP

### **Step 2: Whitelist IP in PMS Admin Panel**

1. Log into **Koenig PMS System**
2. Navigate to: **Settings → Admin Panel → API/Integration Settings**
3. Find: **IP Whitelist** or **Firewall Rules**
4. Add these IPs:
   ```
   Your Development IP:    127.0.0.1 (if testing locally)
   Your Server IP:         [From Step 1]
   Your Office Network:    [Optional - for backup access]
   ```
5. **Save changes**

### **Step 3: Sync PMS Data**

Option A - **Automatic** (after IP whitelisting):
- Refresh the dashboard
- Data will automatically sync from PMS

Option B - **Manual** (anytime):
- Go to HR Admin → New Joiners tab
- Click blue **"Sync PMS Data"** button
- Dashboard will fetch and cache employee records

---

## Using the Dashboard Features

### **Sync Endpoint**
```
POST /api/sync-pms-data     # Trigger manual sync
GET  /api/sync-pms-data     # Get cached data
```

### **API Endpoints**
- PMS Token Test: `GET /api/test-pms`
- Manual Sync: `POST /api/sync-pms-data`
- Employee Sync Cron: `GET /api/cron/sync-joiners`

### **Data Caching**
- Cache is stored in: `.pms-cache.json`
- Cache TTL: 1 hour (3600 seconds)
- Automatic fallback if PMS unreachable

---

## Current Configuration

**Environment Variables** (`.env.local` — not committed, ask HR/IT for the actual values):
```
PMS_API_KEY=<provided by Koenig PMS admin>
PMS_USERNAME=<provided by Koenig PMS admin>
PMS_PASSWORD=<provided by Koenig PMS admin>
PMS_ROLE=Get Employee Profile Details
```

**API Base URL**: `https://api.koenig-solutions.com`

**Endpoints**:
- Token: `/api/Kites/Operator/GetToken`
- Employees: `/api/Kites/Operator/common`

---

## Troubleshooting

### "Permission Denied" Error
```
✓ Solution: Whitelist your server IP in PMS admin
✓ Confirm: Use /api/test-pms endpoint to verify
```

### Sync Button Not Responding
```
✓ Check browser console (F12) for errors
✓ Ensure server IP is whitelisted
✓ Wait 30 seconds after whitelisting (might need server restart)
```

### Data Not Updating
```
✓ Clear cache: Delete .pms-cache.json
✓ Click "Sync PMS Data" button again
✓ Or wait 1 hour for cache to expire
```

---

## What Data is Being Fetched?

The dashboard automatically pulls from PMS:

| Field | Source | Used For |
|-------|--------|----------|
| Employee Name | PMS | Joiner card title |
| Department | PMS | Joiner department display |
| Date of Joining | PMS | Join date calculation |
| Email | PMS | Invite & notification delivery |
| Designation | PMS | Role/position display |
| Reporting Manager | PMS | Management hierarchy |

---

## Next Steps

1. **Identify your server IP** (Step 1 above)
2. **Contact Koenig PMS Admin** with your IP
3. **Request to whitelist** the IP in their firewall
4. **Test** using `/api/test-pms` endpoint
5. **Sync data** using the blue button in New Joiners section

---

## Additional Help

**For PMS Admin Questions**:
- PMS API Documentation: https://api.koenig-solutions.com
- API Base: `https://api.koenig-solutions.com/api/Kites/Operator/`

**Dashboard Logs**:
- Server logs show `[PMS]` prefixed messages
- Client shows sync status in integration banner

**Manual Testing**:
```powershell
# Test PMS token endpoint (fill in real credentials from .env.local, don't commit them)
Invoke-WebRequest -Uri "https://api.koenig-solutions.com/api/Kites/Operator/GetToken" `
  -Method POST -ContentType "application/json" `
  -Body '{"userName":"<PMS_USERNAME>","userPassword":"<PMS_PASSWORD>","userRole":"Get Employee Profile Details"}' `
  -UseBasicParsing
```

---

## Summary

| Component | Status | Action |
|-----------|--------|--------|
| Dashboard UI | ✅ Working | None needed |
| Mock Data | ✅ Displaying | Being used as fallback |
| PMS Credentials | ✅ Valid | Confirmed working |
| PMS API Connectivity | ⚠️ Blocked | **Whitelist server IP** |
| Sync Functionality | ✅ Ready | Click button when IP whitelisted |

**Once IP is whitelisted, real employee data will automatically display!**
