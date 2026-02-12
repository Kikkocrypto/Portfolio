#!/usr/bin/env bash
# Genera una chiave JWT sicura (256 bit) per .env
# Uso: ./generate-jwt-secret.sh
# Copia l'output in .env come valore di JWT_SECRET

SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)

echo ""
echo "Aggiungi questa riga al file .env (o sostituisci JWT_SECRET):"
echo ""
echo "JWT_SECRET=$SECRET"
echo ""
echo "Oppure copia solo il valore dopo il segno ="
echo ""
