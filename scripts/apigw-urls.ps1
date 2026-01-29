# PowerShell script to fetch API Gateway URLs from AWS SSM Parameter Store

param(
    [string]$BuildOption
)

$file = "../frontend/src/urls.js"

# Get URLs from AWS SSM Parameter Store
$capPhotoUri = (aws ssm get-parameter --name "/fridge-log/capture-photo-api-url" --region us-east-1 | ConvertFrom-Json).Parameter.Value
$emailExistenceUri = (aws ssm get-parameter --name "/fridge-log/check-email-existence-api-url" --region us-east-1 | ConvertFrom-Json).Parameter.Value
$deleteItemUri = (aws ssm get-parameter --name "/fridge-log/delete-item-api-url" --region us-east-1 | ConvertFrom-Json).Parameter.Value
$readFromDDBUri = (aws ssm get-parameter --name "/fridge-log/get-items-api-url" --region us-east-1 | ConvertFrom-Json).Parameter.Value
$writeToDDBUri = (aws ssm get-parameter --name "/fridge-log/put-item-api-url" --region us-east-1 | ConvertFrom-Json).Parameter.Value

# Create urls.js file
if (Test-Path $file) {
    Remove-Item $file -Force
}
New-Item -Path $file -ItemType File -Force | Out-Null

# Output URLs to urls.js file
$content = @"
const urls = {
  capturePhotoApiUrl: '$capPhotoUri',
  checkEmailExistenceApiUrl: '$emailExistenceUri',
  deleteItemApiUrl: '$deleteItemUri',
  readFromDDBUrl: '$readFromDDBUri',
  writeToDDBUrl: '$writeToDDBUri'
};
export default urls;
"@

Set-Content -Path $file -Value $content

# Compile React app (optional)
switch ($BuildOption) {
    "dev" {
        Set-Location "../frontend/src"
        bun run dev
    }
    "build" {
        Set-Location "../frontend/src"
        bun run build
        bun run start
    }
    default {
        Write-Host "No build option provided. Use 'dev' or 'build'."
    }
}
