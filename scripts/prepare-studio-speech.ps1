# Offline spoken fixtures. Production Tipply voices/URLs are never replaced.
$taskOutput = Join-Path (Split-Path $PSScriptRoot -Parent) 'dev-assets/studio-speech'
New-Item -ItemType Directory -Path $taskOutput -Force | Out-Null
$taskVoice = New-Object -ComObject SAPI.SpVoice
$taskPolish = $taskVoice.GetVoices() | Where-Object { $_.GetDescription() -like '*Paulina*' } | Select-Object -First 1
if ($taskPolish) { $taskVoice.Voice = $taskPolish }
$taskVoice.Rate = 1
$taskClips = @(
  @{name='nickname'; text='Kaaajka.'},
  @{name='amount'; text='Pięćdziesiąt siedem złotych, trzydzieści dwa grosze.'},
  @{name='message'; text='Dziękuję za stream!'}
)
$taskManifest = @()
foreach ($taskClip in $taskClips) {
  $taskPath = Join-Path $taskOutput ($taskClip.name + '.wav')
  $taskStream = New-Object -ComObject SAPI.SpFileStream
  $taskStream.Open($taskPath, 3)
  $taskVoice.AudioOutputStream = $taskStream
  [void]$taskVoice.Speak($taskClip.text)
  $taskStream.Close()
  $taskDuration = (& ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $taskPath)
  $taskManifest += @{name=$taskClip.name; text=$taskClip.text; duration=[double]::Parse($taskDuration,[Globalization.CultureInfo]::InvariantCulture); file=($taskClip.name+'.wav'); voice=$taskVoice.Voice.GetDescription()}
}
$taskManifest | ConvertTo-Json | Set-Content -Encoding utf8 -LiteralPath (Join-Path (Split-Path $PSScriptRoot -Parent) 'src/dev/motion-studio/speech.json')
