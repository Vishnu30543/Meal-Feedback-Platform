# generate-schema.ps1

Write-Host "Reading .env file..."
$envFilePath = Join-Path -Path $PSScriptRoot -ChildPath ".env"
if (Test-Path $envFilePath) {
    Get-Content $envFilePath | Where-Object { $_ -match '^\s*\w+\s*=' } | ForEach-Object {
        $name, $value = $_ -split '=', 2
        Set-Item -Path "env:\$($name.Trim())" -Value $value.Trim()
    }
} else {
    Write-Host "Error: .env file not found in the backend folder!" -ForegroundColor Red
    exit 1
}

$outputDir = Join-Path -Path $PSScriptRoot -ChildPath "schema-docs"
if (-Not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

Write-Host "Starting SchemaSpy via Docker..." -ForegroundColor Cyan
Write-Host "(This might take a minute the first time as it downloads the image)"

docker run --rm -v "$($outputDir):/output" schemaspy/schemaspy:latest -t pgsql -host ep-noisy-morning-azv32p60-pooler.c-3.ap-southeast-1.aws.neon.tech -port 5432 -db neondb -u $env:DB_USER -p $env:DB_PASSWORD -s public -connprops "sslmode\=require"

Write-Host "Done! You can now open backend/schema-docs/index.html in your browser!" -ForegroundColor Green
