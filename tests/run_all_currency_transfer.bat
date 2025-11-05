:: Run from top level of repository using 'call tests\run_all_currency_transfer.bat'

:loop
timeout /t 1 >nul
npx playwright test tests/translation/currrency-transfer-ledger-balances.spec.ts | find "No tests found"    
if errorlevel 1 goto :loop
echo Run complete!