# Kubernetes Cluster Management Utilities
# Project: affiliateflow-abzfy

$PROJECT_ID = "affiliateflow-abzfy"
$REGION = "us-central1"
$CLUSTER_NAME = "affiliateflow-cluster"

function Show-Menu {
    Write-Host ""
    Write-Host "🎛️  AffiliateFlow K8s Management" -ForegroundColor Cyan
    Write-Host "===============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Check cluster status" -ForegroundColor White
    Write-Host "2. View all pods" -ForegroundColor White
    Write-Host "3. View pod logs" -ForegroundColor White
    Write-Host "4. Restart deployments" -ForegroundColor White
    Write-Host "5. Scale deployment" -ForegroundColor White
    Write-Host "6. Port forward service" -ForegroundColor White
    Write-Host "7. Delete and recreate deployments" -ForegroundColor White
    Write-Host "8. View ingress info" -ForegroundColor White
    Write-Host "9. Open Kubernetes dashboard" -ForegroundColor White
    Write-Host "0. Exit" -ForegroundColor White
    Write-Host ""
}

function Get-ClusterStatus {
    Write-Host "📊 Cluster Status:" -ForegroundColor Cyan
    kubectl cluster-info
    Write-Host ""
    kubectl get nodes
    Write-Host ""
    kubectl get all -n affiliate-flow
}

function Get-AllPods {
    Write-Host "📦 All Pods in affiliate-flow namespace:" -ForegroundColor Cyan
    kubectl get pods -n affiliate-flow -o wide
}

function Get-PodLogs {
    Write-Host "Available pods:" -ForegroundColor Cyan
    kubectl get pods -n affiliate-flow --no-headers | ForEach-Object {
        $podName = $_.Split()[0]
        Write-Host "  - $podName" -ForegroundColor Gray
    }
    Write-Host ""
    $pod = Read-Host "Enter pod name (or deployment name)"
    
    if ($pod) {
        Write-Host "Streaming logs from $pod..." -ForegroundColor Yellow
        kubectl logs -f $pod -n affiliate-flow
    }
}

function Restart-Deployments {
    Write-Host "🔄 Restarting deployments..." -ForegroundColor Yellow
    
    $deployments = @(
        "master-ai-orchestrator",
        "product-mapper",
        "trend-finder",
        "redis"
    )
    
    foreach ($deployment in $deployments) {
        Write-Host "  Restarting $deployment..." -ForegroundColor Gray
        kubectl rollout restart deployment/$deployment -n affiliate-flow
    }
    
    Write-Host "✓ Restart initiated" -ForegroundColor Green
    Write-Host ""
    Write-Host "Check status with: kubectl rollout status deployment/master-ai-orchestrator -n affiliate-flow" -ForegroundColor Gray
}

function Scale-Deployment {
    Write-Host "Available deployments:" -ForegroundColor Cyan
    kubectl get deployments -n affiliate-flow --no-headers | ForEach-Object {
        $depName = $_.Split()[0]
        Write-Host "  - $depName" -ForegroundColor Gray
    }
    Write-Host ""
    
    $deployment = Read-Host "Enter deployment name"
    $replicas = Read-Host "Enter number of replicas"
    
    if ($deployment -and $replicas) {
        Write-Host "Scaling $deployment to $replicas replicas..." -ForegroundColor Yellow
        kubectl scale deployment/$deployment --replicas=$replicas -n affiliate-flow
        Write-Host "✓ Scaled" -ForegroundColor Green
    }
}

function Start-PortForward {
    Write-Host "Available services:" -ForegroundColor Cyan
    kubectl get services -n affiliate-flow --no-headers | ForEach-Object {
        $svcName = $_.Split()[0]
        Write-Host "  - $svcName" -ForegroundColor Gray
    }
    Write-Host ""
    
    $service = Read-Host "Enter service name"
    $localPort = Read-Host "Enter local port (e.g., 8080)"
    $remotePort = Read-Host "Enter remote port (e.g., 80)"
    
    if ($service -and $localPort -and $remotePort) {
        Write-Host "Port forwarding $service..." -ForegroundColor Yellow
        Write-Host "Access at: http://localhost:$localPort" -ForegroundColor Green
        kubectl port-forward service/$service $localPort:$remotePort -n affiliate-flow
    }
}

function Remove-AndRecreateDeployments {
    Write-Host "⚠️  This will delete and recreate all deployments!" -ForegroundColor Yellow
    $confirm = Read-Host "Are you sure? (yes/no)"
    
    if ($confirm -eq "yes") {
        Write-Host "Deleting deployments..." -ForegroundColor Red
        kubectl delete -f infrastructure/kubernetes/manifests/ -n affiliate-flow
        
        Start-Sleep -Seconds 5
        
        Write-Host "Recreating deployments..." -ForegroundColor Yellow
        kubectl apply -f infrastructure/kubernetes/manifests/
        
        Write-Host "✓ Deployments recreated" -ForegroundColor Green
    } else {
        Write-Host "Cancelled" -ForegroundColor Gray
    }
}

function Get-IngressInfo {
    Write-Host "🌐 Ingress Information:" -ForegroundColor Cyan
    kubectl get ingress -n affiliate-flow
    Write-Host ""
    kubectl describe ingress -n affiliate-flow
}

function Open-Dashboard {
    Write-Host "Opening Kubernetes Dashboard..." -ForegroundColor Yellow
    Write-Host "This will create a proxy to the dashboard." -ForegroundColor Gray
    Write-Host "Press Ctrl+C to stop the proxy." -ForegroundColor Gray
    Write-Host ""
    kubectl proxy
}

# Main loop
while ($true) {
    Show-Menu
    $choice = Read-Host "Select an option"
    
    switch ($choice) {
        "1" { Get-ClusterStatus }
        "2" { Get-AllPods }
        "3" { Get-PodLogs }
        "4" { Restart-Deployments }
        "5" { Scale-Deployment }
        "6" { Start-PortForward }
        "7" { Remove-AndRecreateDeployments }
        "8" { Get-IngressInfo }
        "9" { Open-Dashboard }
        "0" { 
            Write-Host "Goodbye! 👋" -ForegroundColor Cyan
            exit 
        }
        default { Write-Host "Invalid option" -ForegroundColor Red }
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}
