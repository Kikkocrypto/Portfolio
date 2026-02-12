# Genera una chiave JWT sicura (256 bit) per .env
# Uso: .\generate-jwt-secret.ps1
# Copia l'output in .env come valore di JWT_SECRET

$bytes = [byte[]]::new(32)
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)

Write-Host ""
Write-Host "Aggiungi questa riga al file .env (o sostituisci JWT_SECRET):"
Write-Host ""
Write-Host "JWT_SECRET=$secret"
Write-Host ""
Write-Host "Oppure copia solo il valore dopo il segno ="
Write-Host ""
