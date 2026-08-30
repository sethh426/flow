# Old Sites Cleanup Checklist

## Sites to Delete/Disable

### 1. flowinvestorglance.web.app
**Status**: Live (needs deletion)  
**Location**: Separate Firebase project (not in this repo)  
**Action Required**:
```powershell
# List all your Firebase projects to find the project ID
firebase projects:list

# Once you identify the flowinvestorglance project ID:
firebase use <flowinvestorglance-project-id>

# Option A: Disable hosting (keeps project)
firebase hosting:disable

# Option B: Delete entire project (via console)
# Go to: https://console.firebase.google.com/
# Select flowinvestorglance project → Settings → Delete Project
```

### 2. flowearlyadopters.web.app
**Status**: Live (unclear what's deployed there)  
**Current Issue**: Showing old signup form with "Ready to Automate Everything?" not in this repo  
**Action Required**:
- Identify which Firebase project hosts this
- Determine if it should show `flow-early-adopters/public/index.html` from this repo
- Either:
  - Delete the project if unused
  - Redeploy from this repo's `flow-early-adopters/public/` folder

## Deployment Clarification Needed

### Current Setup
- **Main site**: `affiliateflow-abzfy.web.app` (deployed via GitHub Actions from `client/out`)
- **Early adopters**: Should be from `flow-early-adopters/public/index.html` but unclear where it's actually deployed

### Recommended Action
1. List all Firebase projects you own:
   ```powershell
   firebase projects:list
   ```

2. Check each project's hosting:
   ```powershell
   firebase use <project-id>
   firebase hosting:sites:list
   ```

3. Delete unused projects via console or CLI

## Clean Branding References

### Files with Old Branding (Keep for Documentation)
- `AFFILIATE_FLOW_MARKET_RESEARCH.md` - historical market research
- `CREATE_GITHUB_REPO.md` - repo creation docs
- Various `COMPLETE_DEPLOYMENT_SUMMARY.md` references to `affiliateflow-abzfy`

These can stay as they're documentation of the platform evolution.

## Next Steps
1. ✅ Verify which Firebase project serves `flowearlyadopters.web.app`
2. ⬜ Delete `flowinvestorglance` Firebase project
3. ⬜ Decide if `flowearlyadopters.web.app` should exist or be merged into main site
