param(
  [string]$SourceRoot = 'D:\Горизонталь\Горизонталь',
  [string]$FfmpegPath,
  [double]$DetailDuration = 18,
  [double]$PreviewDuration = 12,
  [switch]$SkipPhotos,
  [switch]$Force
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$assetsRoot = Join-Path $projectRoot 'src\assets'
$previewRoot = Join-Path $assetsRoot 'optimized\horizontal-preview'
$detailRoot = Join-Path $assetsRoot 'optimized\horizontal-detail'
$rolfImageRoot = Join-Path $assetsRoot 'cases\horizontal\rolf-oil'

if (-not $FfmpegPath) {
  $FfmpegPath = Join-Path $projectRoot 'node_modules\ffmpeg-static\ffmpeg.exe'
}

if (-not (Test-Path -LiteralPath $FfmpegPath)) {
  throw "Не найден ffmpeg: $FfmpegPath"
}

if (-not (Test-Path -LiteralPath $SourceRoot)) {
  throw "Не найдена папка с горизонтальными кейсами: $SourceRoot"
}

New-Item -ItemType Directory -Force -Path $previewRoot, $detailRoot, $rolfImageRoot | Out-Null

$videos = @(
  @{ Name = 'gogo-rent'; Folder = 'Gogo rent'; File = 'GOGO RENT. new 01.06.mov'; Preview = $true; Start = 0 },
  @{ Name = 'park-estate'; Folder = 'Park estate'; File = 'park estate fin.rndr 3.2.mov'; Preview = $true; Start = 0 },
  @{ Name = 'okeany'; Folder = 'Океаны клип'; File = 'fin rndr+cc.mov'; Preview = $true; Start = 0 },
  @{ Name = 'rolf-oil'; Folder = 'Рольф'; File = 'ROLF.mp4'; Preview = $true; Start = 0 },
  @{ Name = 'rolf-backstage'; Folder = 'Рольф'; File = 'бекстейдж (ROLF).mov'; Preview = $false; Start = 0 },
  @{ Name = 'birthday-sergey'; Folder = 'С днем рождения Сережа'; File = 'youtube_-V2niHpPYxw_1920x1080_h264.mp4'; Preview = $true; Start = 0 },
  @{ Name = 'texmod'; Folder = 'Текс Мод'; File = 'Азим Чарыев - Азим Чарыев Имиджевый HR видеоролик для компании Текс Мод (2160p).mp4'; Preview = $true; Start = 0 }
)

function Convert-Video {
  param(
    [string]$Source,
    [string]$Destination,
    [int]$Width,
    [int]$Fps,
    [int]$Crf,
    [double]$Duration,
    [double]$Start
  )

  if ((Test-Path -LiteralPath $Destination) -and -not $Force) {
    Write-Host "Пропуск готового файла: $Destination"
    return
  }

  Write-Host "Кодирование: $Destination"
  & $FfmpegPath `
    -hide_banner `
    -loglevel error `
    -stats `
    -y `
    -ss $Start `
    -i $Source `
    -t $Duration `
    -map '0:v:0' `
    -vf "scale=${Width}:-2:flags=lanczos,fps=${Fps}" `
    -an `
    -c:v libx264 `
    -preset slow `
    -crf $Crf `
    -profile:v high `
    -level:v 3.1 `
    -refs 3 `
    -bf 2 `
    -pix_fmt yuv420p `
    -tag:v avc1 `
    -fps_mode cfr `
    -movflags '+faststart' `
    $Destination

  if ($LASTEXITCODE -ne 0) {
    throw "FFmpeg завершился с кодом ${LASTEXITCODE}: $Source"
  }
}

foreach ($video in $videos) {
  $source = Join-Path (Join-Path $SourceRoot $video.Folder) $video.File
  if (-not (Test-Path -LiteralPath $source)) {
    throw "Не найден исходник: $source"
  }

  $detail = Join-Path $detailRoot "$($video.Name).mp4"
  Convert-Video `
    -Source $source `
    -Destination $detail `
    -Width 1280 `
    -Fps 24 `
    -Crf 27 `
    -Duration $DetailDuration `
    -Start $video.Start

  if ($video.Preview) {
    Convert-Video `
      -Source $detail `
      -Destination (Join-Path $previewRoot "$($video.Name).mp4") `
      -Width 960 `
      -Fps 18 `
      -Crf 30 `
      -Duration $PreviewDuration `
      -Start 0
  }
}

$rolfPhotos = @(
  @{ Source = 'grdr 2023-06-15 054837.962.JPG'; Destination = 'rolf-production-01-web.jpg' },
  @{ Source = 'grdr 2023-06-15 143723.740.JPG'; Destination = 'rolf-production-02-web.jpg' }
)

if (-not $SkipPhotos) {
  foreach ($photo in $rolfPhotos) {
    $source = Join-Path (Join-Path $SourceRoot 'Рольф') $photo.Source
    $destination = Join-Path $rolfImageRoot $photo.Destination

    if ((Test-Path -LiteralPath $destination) -and -not $Force) {
      Write-Host "Пропуск готового файла: $destination"
      continue
    }

    Write-Host "Оптимизация фото: $destination"
    & $FfmpegPath `
      -hide_banner `
      -loglevel error `
      -y `
      -i $source `
      -vf 'scale=1280:-2:flags=lanczos' `
      -frames:v 1 `
      -q:v 3 `
      $destination

    if ($LASTEXITCODE -ne 0) {
      throw "FFmpeg завершился с кодом ${LASTEXITCODE}: $source"
    }
  }
}

$outputs = Get-ChildItem -LiteralPath $previewRoot, $detailRoot, $rolfImageRoot -File
$sizeMb = [math]::Round(($outputs | Measure-Object Length -Sum).Sum / 1MB, 1)
Write-Host "Готово: $($outputs.Count) файлов, $sizeMb МБ"
