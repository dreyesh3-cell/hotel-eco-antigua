$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$rootUri = [Uri]::new($root.TrimEnd('\') + '\')
$outDir = Join-Path $root 'output'
$archivePath = Join-Path $outDir 'Hotel_Eco_Antigua_Entrega.zip'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (Test-Path -LiteralPath $archivePath) {
    Remove-Item -LiteralPath $archivePath
}

$zip = [System.IO.Compression.ZipFile]::Open($archivePath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    Get-ChildItem -LiteralPath $root -Force -File -Recurse | ForEach-Object {
        $fileUri = [Uri]::new($_.FullName)
        $relative = [Uri]::UnescapeDataString($rootUri.MakeRelativeUri($fileUri).ToString()).Replace('/', '\')
        $parts = $relative -split '[\\/]'
        $excluded = $parts[0] -in @('.git', '.sites-publish', '.sites-runtime', '.wrangler', 'node_modules', 'dist', 'build')
        $excluded = $excluded -or $relative -eq 'output\Hotel_Eco_Antigua_Entrega.zip'
        $excluded = $excluded -or ($parts[0] -eq 'output' -and $_.Extension -eq '.png')
        if ($excluded) { return }

        $entry = 'hotel-eco-antigua/' + ($relative -replace '\\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $zip, $_.FullName, $entry, [System.IO.Compression.CompressionLevel]::Optimal
        ) | Out-Null
    }
}
finally {
    $zip.Dispose()
}

Write-Host "Listo: $archivePath"
