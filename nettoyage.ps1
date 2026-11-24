# Nettoyage du projet Instrunaka (à placer dans projet-instrumentales\ puis lancer)
#   .\nettoyage.ps1            -> simulation : affiche seulement ce qui serait supprimé
#   .\nettoyage.ps1 -Appliquer -> supprime réellement
param([switch]$Appliquer)
$r = $PSScriptRoot

# Fichiers parasites créés par des commandes mal collées (supprimés seulement s'ils sont de petits fichiers)
$parasites = 'path','path)','path))','type','php','psql','email','delete()','each(function','backend.zip'
# Autres éléments inutiles
$inutiles = @(
  'backend\routes.txt','backend\migrations.txt','backend\.phpunit.result.cache','backend\app\profil','backend\database\database.sqlite',
  'frontend\app_backup','frontend\app\layout.backup.tsx','frontend\npm','frontend\app\fonts','frontend\app\blog',
  'frontend\components\layout\AdminLayout.tsx','frontend\components\instrumental\AudioPlayer.tsx',
  'frontend\components\instrumental\PlayButton.tsx','frontend\lib\demoData.ts'
)
$cibles = @()
foreach ($n in $parasites) {
  $p = Join-Path $r "backend\$n"
  if ((Test-Path -LiteralPath $p -PathType Leaf) -and ((Get-Item -LiteralPath $p).Length -lt 4096)) { $cibles += $p }
}
foreach ($n in $inutiles) { $p = Join-Path $r $n; if (Test-Path -LiteralPath $p) { $cibles += $p } }

foreach ($c in $cibles) {
  if ($Appliquer) { Remove-Item -LiteralPath $c -Recurse -Force; Write-Host "Supprimé : $c" -ForegroundColor Green }
  else { Write-Host "[simulation] $c" -ForegroundColor Yellow }
}

# Dump SQL contenant de vraies données : déplacé HORS du projet (pas supprimé)
$sql = Join-Path $r 'backend\backup_avant_phase4.sql'
if (Test-Path -LiteralPath $sql) {
  $dest = Join-Path $env:USERPROFILE 'Documents\sauvegardes-instrunaka'
  if ($Appliquer) { New-Item -ItemType Directory -Force -Path $dest | Out-Null; Move-Item -LiteralPath $sql -Destination $dest -Force; Write-Host "Déplacé vers $dest : backup_avant_phase4.sql" -ForegroundColor Green }
  else { Write-Host "[simulation] déplacerait backup_avant_phase4.sql vers $env:USERPROFILE\Documents\sauvegardes-instrunaka" -ForegroundColor Yellow }
}
if (-not $Appliquer) { Write-Host "`nRien n'a été supprimé. Relance avec -Appliquer pour confirmer." -ForegroundColor Cyan }
