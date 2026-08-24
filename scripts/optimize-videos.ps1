<#
  Готовит облегчённые копии роликов для сайта.

  Исходники (сотни мегабайт) лежат в src/assets/cases и src/assets/gallery и
  в git не попадают. Сайт использует только то, что делает этот скрипт:

    optimized/thumb   — 270 px, 20 FPS. Только карточки Hero: их показывают
                        шириной 82-135 px, и 540 px там уходили впустую. На
                        главной таких роликов играет с десяток одновременно,
                        поэтому лишний декод бил по плавности сильнее всего.
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
  # Сколько секунд оставляем от каждого ролика.
  [double]$Duration = 12,
  # Пересобрать даже то, что уже готово.
  [switch]$Force
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$assetsRoot = Join-Path $projectRoot 'src\assets'
$thumbRoot = Join-Path $assetsRoot 'optimized\thumb'
$previewRoot = Join-Path $assetsRoot 'optimized\preview'
$detailRoot = Join-Path $assetsRoot 'optimized\detail'
$nikolayRoot = Join-Path $assetsRoot 'cases\nikolay-petrov'

if (-not $FfmpegPath) {
  $FfmpegPath = Join-Path $projectRoot 'node_modules\ffmpeg-static\ffmpeg.exe'
}
if (-not (Test-Path -LiteralPath $FfmpegPath)) {
  throw "Не найден ffmpeg: $FfmpegPath. Выполните npm install или укажите -FfmpegPath."
}

New-Item -ItemType Directory -Force -Path $thumbRoot, $previewRoot, $detailRoot | Out-Null

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
  @{ Name = 'dental-intro-01'; Source = Join-Path $assetsRoot 'cases\dental-implant\intro-01.mp4'; Detail = $true; Start = 0 },
  @{ Name = 'dental-intro-02'; Source = Join-Path $assetsRoot 'cases\dental-implant\intro-02.mp4'; Detail = $true; Start = 0 },
  @{ Name = 'lida-intro-01'; Source = Join-Path $assetsRoot 'cases\lida-lyutikova\intro-01.mp4'; Detail = $true; Start = 0 },
  @{ Name = 'lida-intro-02'; Source = Join-Path $assetsRoot 'cases\lida-lyutikova\intro-02.mp4'; Detail = $true; Start = 0 },
  @{ Name = 'standalone-01'; Source = Join-Path $assetsRoot 'gallery\standalone\standalone-01.mp4'; Detail = $false; Start = 0 },
  @{ Name = 'standalone-02'; Source = Join-Path $assetsRoot 'gallery\standalone\standalone-02.mov'; Detail = $false; Start = 0 },
  @{ Name = 'standalone-03'; Source = Join-Path $assetsRoot 'gallery\standalone\standalone-03.mov'; Detail = $false; Start = 0 },
  @{ Name = 'standalone-04'; Source = Join-Path $assetsRoot 'gallery\standalone\standalone-04.mp4'; Detail = $false; Start = 0 },
  @{ Name = 'standalone-05'; Source = Join-Path $assetsRoot 'gallery\standalone\standalone-05.mov'; Detail = $false; Start = 0 },
  @{ Name = 'standalone-06'; Source = Join-Path $assetsRoot 'gallery\standalone\standalone-06.mp4'; Detail = $false; Start = 0 }
)

function Convert-Video {
  param(
    [string]$Source,
    [string]$Destination,
    [int]$Width,
    [int]$Fps,
    [int]$Crf,
    [double]$Start
  )

  if ((Test-Path -LiteralPath $Destination) -and -not $Force) {
    Write-Host "Пропуск готового файла: $Destination"
    return
  }

  Write-Host "Кодирование: $Destination"
  # -ss до -i — быстрый поиск по ключевым кадрам; -t после — длина куска.
  # preset veryslow даёт те же CRF при заметно меньшем файле: роликов мало и
  # они короткие, так что лишние минуты кодирования тут ничего не стоят.
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
    -preset veryslow `
    -crf $Crf `
    -pix_fmt yuv420p `
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

$optimized = Get-ChildItem -LiteralPath (Join-Path $assetsRoot 'optimized') -Recurse -File
$sizeMb = [math]::Round(($optimized | Measure-Object Length -Sum).Sum / 1MB, 1)
Write-Host "Готово: $($optimized.Count) файлов, $sizeMb МБ"
