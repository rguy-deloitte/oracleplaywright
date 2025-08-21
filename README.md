# oracleplaywright

[Get started with Playwright](https://playwright.dev/) 

To get started with Oracle Testing using data within Excel, take a look at: `tests/example-oracle-with-excel-data.spec.ts`

## Run tests using:
`npx playwright test` - Automated mode  
`npx playwright test --ui` - UI mode  
`npx playwright test --ui --debug` - UI Interactive mode  

---
## ToDo
### Playwright
- config file .. appConfig.json
- input file .. Madhu -- periods, ledger ..any other inputs for scripts (x)
 
### Core test processors .. test scenarios ..
- create invoice
- upload manaual journal
- run report
- search supplier ..
 
### Common Services
- oracle-ui -- Login, Logout, Navigate to Fusion Tiles, Reporting BI Publisher, AFCS (x)
- file-service  - local read and write CVS, XLSX (x)
- oracle-rest - job status ..., BI Publisher (x)
- oracle-data-loader --- supplier data, fixed config files ..  
- sharepoint - read, write
 
### Citi
- User load raw file to sharepoint (SSO) ..
- OurSolution reads the file and transforms into Oracle AFCS and GL journal
- Playwright reads the file from Sharepoint and loads to Oracle AFCS | GL -- through screen clicks
- Wait for Oracle process to run .. back end or REST api to trigger the process
- Log into AFCS and GL to vaidate results
- Run a BI publisher report to validates all lines from source have been successfully processed into AFCS and GL.