@echo off
echo Deploying Flow Orchestrator to Google Cloud Run...
echo This will take 3-5 minutes...
echo.

cd /d c:\Users\sethp\Downloads\Affiliate-Flow-Prototype\services\flow-orchestrator

gcloud run deploy flow-orchestrator ^
  --source . ^
  --region=us-central1 ^
  --allow-unauthenticated ^
  --set-env-vars GCP_PROJECT_ID=affiliateflow-abzfy ^
  --memory=1Gi ^
  --cpu=1 ^
  --min-instances=0 ^
  --max-instances=10 ^
  --timeout=60

echo.
echo.
echo Deployment complete!
echo.
echo Getting service URL...
gcloud run services describe flow-orchestrator --region=us-central1 --format="value(status.url)" > ..\..\ORCHESTRATOR_URL.txt

set /p URL=<..\..\ORCHESTRATOR_URL.txt
echo.
echo ==================================================
echo   Flow Orchestrator Deployed Successfully!
echo ==================================================
echo.
echo URL: %URL%
echo.
echo Next steps:
echo 1. Add to client/.env.local:
echo    FLOW_ORCHESTRATOR_URL=%URL%
echo    ENABLE_CLOUD_FLOW=true
echo.
echo 2. Restart your Next.js dev server
echo.
pause
