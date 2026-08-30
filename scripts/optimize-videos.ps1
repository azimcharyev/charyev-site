<#
  Готовит облегчённые копии роликов для сайта.

  Исходники (сотни мегабайт) лежат в src/assets/cases и src/assets/gallery и
  в git не попадают. Сайт использует только то, что делает этот скрипт:

    optimized/thumb   — 270 px, 20 FPS. Только карточки Hero: их показывают
                        шириной 82-135 px, и 540 px там уходили впустую. На
                        главной таких роликов играет с десяток одновременно,
                        поэтому лишний декод бил по плавности сильнее всего.
    optimized/thumb-background — 160 px, 15 FPS, с запечённым размытием.
                        Дальний план остаётся живым без дорогого CSS-filter.
    optimized/preview — 540 px, 20 FPS. Отдельные ролики на странице кейса
                        (до 382 px) и лента кейсов.
    optimized/detail  — 720 px, 25 FPS. Крупные слоты страницы кейса (~360 px,
                        то есть с запасом под retina).

  Все ролики на сайте немые, без контролов и крутятся бесконечным лупом, так
  что полная длина исходника не нужна: берём $Duration секунд начиная с
  $Start. Точку входа можно задать отдельно для каждого ролика — поле Start в
  таблице ниже. Оно же единственное, что стоит трогать, если в кадр попадает
  неудачное начало.

  Запуск (ffmpeg приезжает вместе с npm install, отдельно ставить не нужно):

    .\scripts\optimize-videos.ps1

  Готовые файлы пропускаются. Чтобы пересобрать всё заново — ключ -Force,
  чтобы один ролик — удалите его копию из src/assets/optimized и запустите
  скрипт снова.
#>

param(
  # По умолчанию берём ffmpeg из node_modules (пакет ffmpeg-static).
  [string]$FfmpegPath,
  # Папка с исходными cases/gallery. Может лежать вне git-репозитория.
  [string]$SourceAssetsRoot,
  # Папка с закреплёнными роликами China.MP4 и wedding.MP4.
  [string]$FixedSourceRoot,
  # Сколько секунд оставляем от каждого ролика.
  [double]$Duration = 12,
  # Пересобрать даже то, что уже готово.
  [switch]$Force
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$assetsRoot = Join-Path $projectRoot 'src\assets'
$thumbRoot = Join-Path $assetsRoot 'optimized\thumb'
$backgroundRoot = Join-Path $assetsRoot 'optimized\thumb-background'
$previewRoot = Join-Path $assetsRoot 'optimized\preview'
$detailRoot = Join-Path $assetsRoot 'optimized\detail'
if (-not $SourceAssetsRoot) { $SourceAssetsRoot = $assetsRoot }
$nikolayRoot = Join-Path $SourceAssetsRoot 'cases\nikolay-petrov'

if (-not $FfmpegPath) {
  $FfmpegPath = Join-Path $projectRoot 'node_modules\ffmpeg-static\ffmpeg.exe'
}
if (-not (Test-Path -LiteralPath $FfmpegPath)) {
  throw "Не найден ffmpeg: $FfmpegPath. Выполните npm install или укажите -FfmpegPath."
}

New-Item -ItemType Directory -Force -Path $thumbRoot, $backgroundRoot, $previewRoot, $detailRoot | Out-Null

function Find-NikolayVideo([string]$Pattern) {
  # Ролики сняты и переданы с macOS, а там имена лежат в NFD: `й` хранится как
  # `и` + U+0306. Точно такая же на вид строка из этого файла записана в NFC,
  # поэтому -Filter '*парней*' молча ничего не находит. Сводим обе стороны к
  # NFC и только потом сравниваем.
  $needle = $Pattern.Normalize([Text.NormalizationForm]::FormC)
  $match = Get-ChildItem -LiteralPath $nikolayRoot -File |
    Where-Object { $_.Name.Normalize([Text.NormalizationForm]::FormC) -like $needle } |
    Select-Object -First 1
  if (-not $match) { throw "Не найден ролик Николая: $Pattern" }
  return $match.FullName
}

# Start — с какой секунды исходника берём кусок. 0 означает «с начала».
$videos = @(
  @{ Name = 'nikolay-studio'; Source = Find-NikolayVideo '*кто я+*.mp4'; Detail = $true; Start = 0 },
  @{ Name = 'nikolay-seated'; Source = Find-NikolayVideo '*49 а не 21+*.mp4'; Detail = $true; Start = 0 },
  @{ Name = 'nikolay-standing'; Source = Find-NikolayVideo '*видел как здоровых парней+*.mp4'; Detail = $true; Start = 0 },
  @{ Name = 'nikolay-closeup'; Source = Find-NikolayVideo '*5 признаков+*.mp4'; Detail = $false; Start = 0 },
  @{ Name = 'nikolay-finger'; Source = Find-NikolayVideo '*спецназ это+*.mp4'; Detail = $true; Start = 0 },
  @{ Name = 'nikolay-army'; Source = Find-NikolayVideo '*удивило больше всего в армии+*.mp4'; Detail = $false; Start = 0 },
  @{ Name = 'dental-intro-01'; Source = Join-Path $SourceAssetsRoot 'cases\dental-implant\intro-01.mp4'; Detail = $true; Start = 0 },
  @{ Name = 'dental-intro-02'; Source = Join-Path $SourceAssetsRoot 'cases\dental-implant\intro-02.mp4'; Detail = $true; Start = 0 },
  @{ Name = 'lida-intro-01'; Source = Join-Path $SourceAssetsRoot 'cases\lida-lyutikova\intro-01.mp4'; Detail = $true; Start = 0 },
  @{ Name = 'lida-intro-02'; Source = Join-Path $SourceAssetsRoot 'cases\lida-lyutikova\intro-02.mp4'; Detail = $true; Start = 0 },
  @{ Name = 'standalone-01'; Source = Join-Path $SourceAssetsRoot 'gallery\standalone\standalone-01.mp4'; Detail = $false; Start = 0 },
  @{ Name = 'standalone-02'; Source = Join-Path $SourceAssetsRoot 'gallery\standalone\standalone-02.mov'; Detail = $false; Start = 0 },
  @{ Name = 'standalone-03'; Source = Join-Path $SourceAssetsRoot 'gallery\standalone\standalone-03.mov'; Detail = $false; Start = 0 },
  @{ Name = 'standalone-04'; Source = Join-Path $SourceAssetsRoot 'gallery\standalone\standalone-04.mp4'; Detail = $false; Start = 0 },
  @{ Name = 'standalone-05'; Source = Join-Path $SourceAssetsRoot 'gallery\standalone\standalone-05.mov'; Detail = $false; Start = 0 },
  @{ Name = 'standalone-06'; Source = Join-Path $SourceAssetsRoot 'gallery\standalone\standalone-06.mp4'; Detail = $false; Start = 0 }
)

function Convert-Video {
  param(
    [string]$Source,
    [string]$Destination,
    [int]$Width,
    [int]$Fps,
    [int]$Crf,
    [double]$Start,
    [string]$VideoFilter
  )

  if ((Test-Path -LiteralPath $Destination) -and -not $Force) {
    Write-Host "Пропуск готового файла: $Destination"
    return
  }

  Write-Host "Кодирование: $Destination"
  # -ss до -i — быстрый поиск по ключевым кадрам; -t после — длина куска.
  if (-not $VideoFilter) {
    $VideoFilter = "scale=${Width}:-2:flags=lanczos,fps=${Fps}"
  }

  # refs=3 вместо x264 default для veryslow (16) сильно уменьшает буфер
  # декодера. Это критично для Hero, где одновременно играют 14 роликов.
  & $FfmpegPath `
    -hide_banner `
    -loglevel error `
    -stats `
    -y `
    -ss $Start `
    -i $Source `
    -t $Duration `
    -map '0:v:0' `
    -vf $VideoFilter `
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
  if (-not (Test-Path -LiteralPath $video.Source)) {
    throw "Не найден исходник: $($video.Source)"
  }

  Convert-Video `
    -Source $video.Source `
    -Destination (Join-Path $thumbRoot "$($video.Name).mp4") `
    -Width 270 `
    -Fps 20 `
    -Crf 30 `
    -Start $video.Start

  # Для дальнего плана Hero делаем отдельную уже размытую копию. Так все
  # ролики продолжают играть, но браузеру не приходится размывать восемь
  # движущихся DOM-слоёв на каждом кадре.
  Convert-Video `
    -Source $video.Source `
    -Destination (Join-Path $backgroundRoot "$($video.Name).mp4") `
    -Width 160 `
    -Fps 15 `
    -Crf 31 `
    -Start $video.Start `
    -VideoFilter 'scale=160:-2:flags=lanczos,fps=15,gblur=sigma=6'

  Convert-Video `
    -Source $video.Source `
    -Destination (Join-Path $previewRoot "$($video.Name).mp4") `
    -Width 540 `
    -Fps 20 `
    -Crf 29 `
    -Start $video.Start

  if ($video.Detail) {
    Convert-Video `
      -Source $video.Source `
      -Destination (Join-Path $detailRoot "$($video.Name).mp4") `
      -Width 720 `
      -Fps 25 `
      -Crf 26 `
      -Start $video.Start
  }
}

if ($FixedSourceRoot) {
  $fixedVideos = @(
    @{ Name = 'china-fixed'; Source = Join-Path $FixedSourceRoot 'China.MP4'; Width = 640 },
    @{ Name = 'wedding-fixed'; Source = Join-Path $FixedSourceRoot 'wedding.MP4'; Width = 360 }
  )

  foreach ($video in $fixedVideos) {
    if (-not (Test-Path -LiteralPath $video.Source)) {
      throw "Не найден закреплённый ролик: $($video.Source)"
    }
    Convert-Video `
      -Source $video.Source `
      -Destination (Join-Path $thumbRoot "$($video.Name).mp4") `
      -Width $video.Width `
      -Fps 24 `
      -Crf 30 `
      -Start 0
  }
}

$optimized = Get-ChildItem -LiteralPath (Join-Path $assetsRoot 'optimized') -Recurse -File
$sizeMb = [math]::Round(($optimized | Measure-Object Length -Sum).Sum / 1MB, 1)
Write-Host "Готово: $($optimized.Count) файлов, $sizeMb МБ"
