param(
    [string]$Action = "up",
    [string]$EnvFile = ".env"
)

$COMPOSE_FILE = Join-Path $PSScriptRoot ".." "docker-compose.yml"
$ENV_FILE = Join-Path $PSScriptRoot ".." $EnvFile

if (-not (Test-Path $COMPOSE_FILE)) {
    Write-Error "docker-compose.yml not found at $COMPOSE_FILE"
    exit 1
}

if (-not (Test-Path $ENV_FILE)) {
    Write-Warning ".env file not found at $ENV_FILE. Using defaults."
    $ENV_FILE = $null
}

function Ensure-DockerRunning {
    try {
        $info = docker info 2>&1 | Out-Null
        if (-not $?) {
            throw "Docker not running"
        }
    } catch {
        Write-Error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    }
}

function Show-Status {
    param([string[]]$Services)

    Write-Host "`n=== ChartFlow Service Status ===" -ForegroundColor Cyan
    $allServices = @("mysql", "backend", "frontend")

    $envArgs = @()
    if ($ENV_FILE) { $envArgs = @("--env-file", $ENV_FILE) }

    docker compose -f $COMPOSE_FILE @envArgs ps
}

switch ($Action.ToLower()) {
    "up" {
        Ensure-DockerRunning
        Write-Host "Starting ChartFlow..." -ForegroundColor Green

        $envArgs = @()
        if ($ENV_FILE) { $envArgs = @("--env-file", $ENV_FILE) }

        docker compose -f $COMPOSE_FILE @envArgs up -d --build

        if ($?) {
            Write-Host "`nChartFlow is starting! Access it at:" -ForegroundColor Green
            Write-Host "  Frontend: http://localhost" -ForegroundColor Yellow
            Write-Host "  API:      http://localhost:5000/api/v1" -ForegroundColor Yellow
            Write-Host "  API Docs: http://localhost:5000/api-docs" -ForegroundColor Yellow
            Show-Status
        }
    }

    "down" {
        Write-Host "Stopping ChartFlow..." -ForegroundColor Yellow

        $envArgs = @()
        if ($ENV_FILE) { $envArgs = @("--env-file", $ENV_FILE) }

        docker compose -f $COMPOSE_FILE @envArgs down -v
        Write-Host "ChartFlow stopped." -ForegroundColor Green
    }

    "restart" {
        Write-Host "Restarting ChartFlow..." -ForegroundColor Yellow

        $envArgs = @()
        if ($ENV_FILE) { $envArgs = @("--env-file", $ENV_FILE) }

        docker compose -f $COMPOSE_FILE @envArgs restart
        Show-Status
    }

    "logs" {
        $envArgs = @()
        if ($ENV_FILE) { $envArgs = @("--env-file", $ENV_FILE) }

        docker compose -f $COMPOSE_FILE @envArgs logs -f
    }

    "status" {
        Show-Status
    }

    "build" {
        Ensure-DockerRunning
        Write-Host "Building ChartFlow images..." -ForegroundColor Green

        $envArgs = @()
        if ($ENV_FILE) { $envArgs = @("--env-file", $ENV_FILE) }

        docker compose -f $COMPOSE_FILE @envArgs build --no-cache
        Write-Host "Build complete." -ForegroundColor Green
    }

    "setup-db" {
        Ensure-DockerRunning
        Write-Host "Setting up database..." -ForegroundColor Green

        $envArgs = @()
        if ($ENV_FILE) { $envArgs = @("--env-file", $ENV_FILE) }

        docker compose -f $COMPOSE_FILE @envArgs up -d mysql
        Write-Host "Waiting for MySQL to be ready..."
        Start-Sleep -Seconds 15

        Write-Host "Database setup complete!" -ForegroundColor Green
    }

    default {
        Write-Host @"
Usage: .\deploy.ps1 [Action]

Actions:
  up        Build and start all services (default)
  down      Stop and remove all services
  restart   Restart all services
  logs      Tail logs from all services
  status    Show service status
  build     Rebuild images without starting
  setup-db  Start only the database

Examples:
  .\deploy.ps1 up
  .\deploy.ps1 down
  .\deploy.ps1 logs

"@ -ForegroundColor Cyan
    }
}
