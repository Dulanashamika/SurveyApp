
Write-Host "Setting up User Environment Variables..."
$ErrorActionPreference = "Stop"

# Define paths
$JavaHome = "C:\Program Files\Android\Android Studio\jbr"
$AndroidHome = "$env:LOCALAPPDATA\Android\Sdk"

# Set Process Environment Variables (temporary for this session)
$env:JAVA_HOME = $JavaHome
$env:ANDROID_HOME = $AndroidHome
$env:Path = "$JavaHome\bin;$AndroidHome\platform-tools;$AndroidHome\emulator;$AndroidHome\tools;$AndroidHome\tools\bin;$env:Path"

# Check if paths exist
if (-not (Test-Path $JavaHome)) { Write-Error "Java Home not found at $JavaHome"; exit 1 }
if (-not (Test-Path $AndroidHome)) { Write-Error "Android Home not found at $AndroidHome"; exit 1 }

# Create local.properties if missing
if (-not (Test-Path "android\local.properties")) {
    Write-Host "Creating android\local.properties..."
    # Escape backslashes for properties file
    $sdkDir = $AndroidHome -replace "\\", "\\"
    "sdk.dir=$sdkDir" | Out-File -Encoding utf8 "android\local.properties"
}

# Add verification of local.properties
Write-Host "local.properties content:"
Get-Content "android\local.properties"

# Persist to User Environment (So checking future terminals works)
try {
    [System.Environment]::SetEnvironmentVariable('JAVA_HOME', $JavaHome, 'User')
    [System.Environment]::SetEnvironmentVariable('ANDROID_HOME', $AndroidHome, 'User')
    
    $currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
    # Check if already in path to avoid duplication
    if ($currentPath -notlike "*$JavaHome\bin*") {
        $finalPath = "$currentPath;$JavaHome\bin;$AndroidHome\platform-tools;$AndroidHome\emulator;$AndroidHome\tools;$AndroidHome\tools\bin"
        [System.Environment]::SetEnvironmentVariable('Path', $finalPath, 'User')
        Write-Host "Updated User Path environment variable."
    } else {
         Write-Host "User Path seems to already contain Java Home."
    }
} catch {
    Write-Warning "Could not set permanent environment variables. You may need to run as Admin or set them manually."
}

Write-Host "Environment configured. Running React Native run-android..."
npx react-native run-android
