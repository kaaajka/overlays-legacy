$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$inputData = Get-Content -LiteralPath $args[0] -Raw -Encoding UTF8 | ConvertFrom-Json
$synth = New-Object -ComObject SAPI.SpVoice
$tokens = @($synth.GetVoices())
if ($inputData.action -eq 'voices') {
  @($tokens | ForEach-Object { @{ id=$_.Id; name=$_.GetDescription(); language=$_.GetAttribute('Language'); gender=$_.GetAttribute('Gender') } }) | ConvertTo-Json -Compress
} else {
  $voice = $tokens | Where-Object { $_.Id -eq $inputData.voice } | Select-Object -First 1
  if (!$voice) { throw 'Selected voice is no longer available' }
  $synth.Voice = $voice
  $synth.Rate = 1
  $stream = New-Object -ComObject SAPI.SpFileStream
  try {
    $stream.Open($inputData.output, 3)
    $synth.AudioOutputStream = $stream
    [void]$synth.Speak([string]$inputData.text)
  } finally { $stream.Close() }
}
