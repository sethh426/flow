# Kubernetes Cluster Troubleshooting Script
# Project: affiliateflow-abzfy

$PROJECT_ID = "affiliateflow-abzfy"
$REGION = "us-central1"

Write-Host "🔍 AffiliateFlow K8s Troubleshooting" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check cluster connectivity
Write-Host "1. Checking cluster connectivity..." -ForegroundColor Yellow
$clusterInfo = kubectl cluster-info 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Cluster is reachable" -ForegroundColor Green
} else {
    Write-Host "   ❌ Cannot connect to cluster" -ForegroundColor Red
    Write-Host "   Attempting to get credentials..." -ForegroundColor Yellow
    gcloud container clusters get-credentials affiliateflow-cluster --region=$REGION --project=$PROJECT_ID
}

# Check namespace
Write-Host ""
Write-Host "2. Checking namespace..." -ForegroundColor Yellow
$namespace = kubectl get namespace affiliate-flow 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Namespace exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ Namespace not found" -ForegroundColor Red
    Write-Host "   Creating namespace..." -ForegroundColor Yellow
    kubectl create namespace affiliate-flow
}

# Check pods status
Write-Host ""
Write-Host "3. Checking pod status..." -ForegroundColor Yellow
Write-Host ""
kubectl get pods -n affiliate-flow

Write-Host ""
$failedPods = kubectl get pods -n affiliate-flow --field-selector=status.phase!=Running --no-headers 2>$null
if ($failedPods) {
    Write-Host "   ⚠️  Found pods not in Running state:" -ForegroundColor Yellow
    Write-Host $failedPods
    
    Write-Host ""
    Write-Host "   Getting details for failed pods..." -ForegroundColor Yellow
    $failedPods | ForEach-Object {
        $podName = $_.Split()[0]
        Write-Host ""
        Write-Host "   Pod: $podName" -ForegroundColor Red
        kubectl describe pod $podName -n affiliate-flow | Select-String -Pattern "Events:" -Context 0,20
    }
} else {
    Write-Host "   ✓ All pods are running" -ForegroundColor Green
}

# Check deployments
Write-Host ""
Write-Host "4. Checking deployments..." -ForegroundColor Yellow
kubectl get deployments -n affiliate-flow

# Check services
Write-Host ""
Write-Host "5. Checking services..." -ForegroundColor Yellow
kubectl get services -n affiliate-flow

# Check persistent volumes
Write-Host ""
Write-Host "6. Checking persistent volumes..." -ForegroundColor Yellow
kubectl get pvc -n affiliate-flow

# Check secrets
Write-Host ""
Write-Host "7. Checking secrets..." -ForegroundColor Yellow
$secrets = kubectl get secrets -n affiliate-flow --no-headers 2>$null
if ($secrets -match "gemini-api") {
    Write-Host "   ✓ Gemini API secret exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ Gemini API secret not found" -ForegroundColor Red
    Write-Host "   Create with: kubectl create secret generic gemini-api --from-literal=api-key=YOUR_KEY -n affiliate-flow" -ForegroundColor Yellow
}

# Check HPA
Write-Host ""
Write-Host "8. Checking HorizontalPodAutoscalers..." -ForegroundColor Yellow
kubectl get hpa -n affiliate-flow

# Check ingress
Write-Host ""
Write-Host "9. Checking ingress..." -ForegroundColor Yellow
kubectl get ingress -n affiliate-flow

# Recent events
Write-Host ""
Write-Host "10. Recent events in namespace..." -ForegroundColor Yellow
kubectl get events -n affiliate-flow --sort-by='.lastTimestamp' | Select-Object -Last 10

# Resource usage
Write-Host ""
Write-Host "11. Resource usage..." -ForegroundColor Yellow
kubectl top nodes 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️  Metrics server not available" -ForegroundColor Yellow
} else {
    Write-Host ""
    kubectl top pods -n affiliate-flow 2>$null
}

# Docker images status
Write-Host ""
Write-Host "12. Checking Docker images in Artifact Registry..." -ForegroundColor Yellow
gcloud artifacts docker images list $REGION-docker.pkg.dev/$PROJECT_ID/affiliate-flow-images --format="table(IMAGE,TAGS,CREATE_TIME)" 2>$null

# Summary
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan

$totalPods = (kubectl get pods -n affiliate-flow --no-headers 2>$null | Measure-Object).Count
$runningPods = (kubectl get pods -n affiliate-flow --field-selector=status.phase=Running --no-headers 2>$null | Measure-Object).Count

Write-Host "Total pods: $totalPods" -ForegroundColor White
Write-Host "Running pods: $runningPods" -ForegroundColor Green
Write-Host "Failed/Pending pods: $($totalPods - $runningPods)" -ForegroundColor $(if ($totalPods -eq $runningPods) { "Green" } else { "Red" })

Write-Host ""
Write-Host "Common troubleshooting commands:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "View pod logs:" -ForegroundColor White
Write-Host "  kubectl logs -f <pod-name> -n affiliate-flow" -ForegroundColor Gray
Write-Host ""
Write-Host "Describe pod:" -ForegroundColor White
Write-Host "  kubectl describe pod <pod-name> -n affiliate-flow" -ForegroundColor Gray
Write-Host ""
Write-Host "Execute into pod:" -ForegroundColor White
Write-Host "  kubectl exec -it <pod-name> -n affiliate-flow -- /bin/sh" -ForegroundColor Gray
Write-Host ""
Write-Host "Delete pod (will recreate):" -ForegroundColor White
Write-Host "  kubectl delete pod <pod-name> -n affiliate-flow" -ForegroundColor Gray
Write-Host ""
Write-Host "View deployment events:" -ForegroundColor White
Write-Host "  kubectl describe deployment <deployment-name> -n affiliate-flow" -ForegroundColor Gray
Write-Host ""
