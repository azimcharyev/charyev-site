<#
  Готовит фотографии для раздела «Фото» на главной.

  Оригиналы лежат в Assets рядом с рабочей копией и весят по 3–17 МБ каждая —
  в git они не попадают. Сайт использует только копии из
  src/assets/gallery/photo: 800 px по ширине, этого хватает и на плитку 366 px
  на десктопе, и на 341 px на мобильном с запасом под retina.

  Запуск (ffmpeg приезжает с npm install, отдельно ставить не нужно):

    .\scripts\optimize-gallery-photos.ps1

  Готовые файлы пропускаются, -Force пересобирает всё заново.
#>

param(
  [string]$SourceRoot = 'C:\Users\micha\Downloads\Charyev_web\Assets\archive-2026-08-24_01-40-39\archive',
  [string]$FfmpegPath,
  [int]$Width = 800,
  [switch]$Force
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$targetRoot = Join-Path $projectRoot 'src\assets\gallery\photo'

if (-not $FfmpegPath) {
  $FfmpegPath = Join-Path $projectRoot 'node_modules\ffmpeg-static\ffmpeg.exe'
}
if (-not (Test-Path -LiteralPath $FfmpegPath)) {
  throw "Не найден ffmpeg: $FfmpegPath. Выполните npm install или укажите -FfmpegPath."
}
if (-not (Test-Path -LiteralPath $SourceRoot)) {
  throw "Не найдена папка с фотографиями: $SourceRoot"
}

New-Item -ItemType Directory -Force -Path $targetRoot | Out-Null

# Имена латиницей: они превращаются в имена импортов в caseDetails.ts.
$photos = @(
  @{ Source = 'Девушка (1).JPG'; Name = 'girl-01' },
  @{ Source = 'Девушка (2).JPG'; Name = 'girl-02' },
  @{ Source = 'Девушка (3).JPG'; Name = 'girl-03' },
  @{ Source = 'Дентал (1).jpg'; Name = 'dental-01' },
  @{ Source = 'Дентал (2).jpg'; Name = 'dental-02' },
  @{ Source = 'Дентал (3).jpg'; Name = 'dental-03' },
  @{ Source = 'Корабли (1).jpg'; Name = 'ships-01' },
  @{ Source = 'Корабли (2).jpg'; Name = 'ships-02' },
  @{ Source = 'Корабли (3).jpg'; Name = 'ships-03' },
  @{ Source = 'Николай (1).jpg'; Name = 'nikolay-01' },
  @{ Source = 'Николай (2).jpg'; Name = 'nikolay-02' },
  @{ Source = 'Николай (3).jpg'; Name = 'nikolay-03' }
)

foreach ($photo in $photos) {
  $source = Join-Path $SourceRoot $photo.Source
  if (-not (Test-Path -LiteralPath $source)) {
    throw "Не найден исходник: $source"
  }

  $destination = Join-Path $targetRoot "$($photo.Name).jpg"
  if ((Test-Path -LiteralPath $destination) -and -not $Force) {
    Write-Host "Пропуск готового файла: $destination"
    continue
  }

  Write-Host "Оптимизация: $destination"
  & $FfmpegPath `
    -hide_banner `
    -loglevel error `
    -y `
    -i $source `
    -vf "scale=${Width}:-2:flags=lanczos" `
    -frames:v 1 `
    -q:v 4 `
    $destination

  if ($LASTEXITCODE -ne 0) {
    throw "FFmpeg завершился с кодом ${LASTEXITCODE}: $source"
  }
}

$outputs = Get-ChildItem -LiteralPath $targetRoot -File
$sizeMb = [math]::Round(($outputs | Measure-Object Length -Sum).Sum / 1MB, 1)
Write-Host "Готово: $($outputs.Count) файлов, $sizeMb МБ"
