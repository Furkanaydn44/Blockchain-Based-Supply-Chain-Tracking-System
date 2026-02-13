@echo off
echo PharmaChain Baslatiliyor... 🚀

:: 1. Hardhat Node'u Başlat (Yeni pencerede)
start cmd /k "cd backend && npx hardhat node"

:: Node'un açılması için 5 saniye bekle
timeout /t 5

:: 2. Kontratı Deploy Et (Burada adresi kopyalaman gerekecek!)
start cmd /k "cd backend && npx hardhat run scripts/deploy.js --network localhost && echo ADRESI KOPYALA! && pause"

:: 3. Frontend'i Başlat
start cmd /k "cd client && npm start"

echo Islem Tamam! Lutfen Deploy penceresinden yeni adresi alip App.js'e yapistir.
pause