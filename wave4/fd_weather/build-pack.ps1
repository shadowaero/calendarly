# Builds fdw-pack.txt: line 1 = base64(fdw-unpack.cjs), then file markers + base64 lines.
$ErrorActionPreference = 'Stop'
$dir = 'c:\Users\xxtoo\Documents\IDX6011\wave4\fd_weather'
function B64OfLF($path) {
  $txt = [IO.File]::ReadAllText($path)
  $txt = $txt -replace "`r`n", "`n"
  $bytes = [Text.Encoding]::UTF8.GetBytes($txt)
  return [Convert]::ToBase64String($bytes)
}
$unpackLine = B64OfLF (Join-Path $dir 'fdw-unpack.cjs')
$files = @(
  @{ src = 'sensordb.js';        dst = '/tmp/fdw-sensordb.js' },
  @{ src = 'routes-sensors.js';  dst = '/tmp/fdw-routes-sensors.js' },
  @{ src = 'ws-component.js';    dst = '/tmp/fdw-ws-component.js' },
  @{ src = 'fdw-apply-server.cjs'; dst = '/tmp/fdw-apply-server.cjs' },
  @{ src = 'fdw-apply-client.cjs'; dst = '/tmp/fdw-apply-client.cjs' }
)
$parts = New-Object System.Collections.Generic.List[string]
$parts.Add($unpackLine)
foreach ($f in $files) {
  $b = B64OfLF (Join-Path $dir $f.src)
  $parts.Add('###FDWFILE:' + $f.dst)
  $parts.Add($b)
  Write-Output ("packed " + $f.src + " -> " + $f.dst + " (" + $b.Length + " b64 chars)")
}
$out = Join-Path $dir 'fdw-pack.txt'
[IO.File]::WriteAllText($out, ($parts -join "`n") + "`n")
Write-Output ('WROTE ' + $out + ' (' + (Get-Item $out).Length + ' bytes)')