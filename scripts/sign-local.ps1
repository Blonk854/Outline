$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$package = Get-Content (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json
$executable = Join-Path $projectRoot "release/Outline-$($package.version)-portable.exe"
if (-not (Test-Path -LiteralPath $executable)) {
    throw "Build the portable app first with npm run package:win: $executable"
}

$subject = 'CN=BigSoy Studios Outline Local Test'
$certificate = Get-ChildItem Cert:\CurrentUser\My |
    Where-Object { $_.Subject -eq $subject -and $_.HasPrivateKey -and $_.NotAfter -gt (Get-Date).AddDays(1) } |
    Sort-Object NotAfter -Descending |
    Select-Object -First 1

if (-not $certificate) {
    $certificate = New-SelfSignedCertificate -Type CodeSigningCert -Subject $subject `
        -CertStoreLocation Cert:\CurrentUser\My -KeyAlgorithm RSA -KeyLength 3072 `
        -HashAlgorithm SHA256 -KeyExportPolicy NonExportable -NotAfter (Get-Date).AddYears(1)
}

$publicCertificate = Join-Path $env:TEMP ([guid]::NewGuid().ToString() + '.cer')
try {
    Export-Certificate -Cert $certificate -FilePath $publicCertificate | Out-Null
    foreach ($store in 'Root', 'TrustedPublisher') {
        $existing = Get-ChildItem "Cert:\CurrentUser\$store" |
            Where-Object Thumbprint -eq $certificate.Thumbprint
        if (-not $existing) {
            Import-Certificate -FilePath $publicCertificate -CertStoreLocation "Cert:\CurrentUser\$store" | Out-Null
        }
    }
}
finally {
    Remove-Item -LiteralPath $publicCertificate -ErrorAction SilentlyContinue
}

$signature = Set-AuthenticodeSignature -LiteralPath $executable -Certificate $certificate -HashAlgorithm SHA256
if ($signature.Status -ne 'Valid') {
    throw "Signature verification failed: $($signature.Status) - $($signature.StatusMessage)"
}

Write-Output "Signed $executable"
Write-Output "Certificate: $($certificate.Subject) [$($certificate.Thumbprint)]"
Write-Output 'Trusted only for the current Windows user. This does not confer SmartScreen reputation.'