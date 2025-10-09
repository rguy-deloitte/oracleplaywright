// Run using: npx playwright test tests/reports/perf.snapshot.spec.ts --ui
import { test, expect } from '@playwright/test';
import * as reportService from './report';
import { navigateToUrl } from '../util/navigation'
import * as xlsx from 'xlsx'


test.describe.configure({ mode: 'serial' });  // Required to ensure tests run in expected order and that beforeAll & afterAll only run once

test.describe('Report performance', async () => {
    test(`Run reports and measure performance`, async ({ page }, testInfo) => {
        test.setTimeout(1200000)

        const testReportsPath = __dirname + "/../../excel-data-files/report-snapshot.xlsx";

        // check if file exists
        const fs = require('fs');
        if (!fs.existsSync(testReportsPath)) {
            console.error(`Error: The Excel file ${testReportsPath} does not exist.`);
            process.exit(1);
        }

        let testBook = xlsx.readFile(testReportsPath);
        let testArray: any[][] = xlsx.utils.sheet_to_json(testBook.Sheets["Sheet1"], { raw: false, header: 1 });

        let resultArray = testArray;

        for (let i = 1; i < testArray.length; i++) {
            let resultRow = testArray[i];
            let url = resultRow[1];
            let reportName = resultRow[2];

            await test.step(`Running ${reportName}`, async () => {
                const downloadPromise = page.waitForEvent('download');
                await navigateToUrl(page, url, testInfo, 'Navigate to report url');
                let siteInitialised = Date.now();
                let runTime;
                let download;

                // Check if automatically downloading xlsx file or if need to manually request
                let fileIcon = await page.locator("[id='xdo:viewFormatIcon']").getAttribute("src");

                if (fileIcon != null && /.*preview_excel.*/.test(fileIcon)) {
                    download = await downloadPromise;
                    runTime = Date.now() - siteInitialised;
                    console.log(reportName + " downloaded immediately");
                } else {
                    let dropdownButton = page.locator("[src='/xmlpserver/static/v20250625.0650/theme/alta/images/toolbar/dropdown_md.png']")
                    await dropdownButton.click();
                    let startTime = Date.now();
                    await page.getByRole('link', { name: 'Excel (*.xlsx)' }).click();
                    download = await downloadPromise;
                    runTime = Date.now() - startTime;
                    console.log(reportName + " downloaded after click through");
                }

                let downloadPath = __dirname + '/../../excel-data-files/tmp/' + download.suggestedFilename()
                await download.saveAs(downloadPath);

                // Get number of rows in downloadPath file
                let reportRows = xlsx.utils.sheet_to_json(xlsx.readFile(downloadPath).Sheets["Sheet1"], { raw: false, header: 1 }).length - 1;

                resultRow[3] = reportRows;
                resultRow[6] = runTime/60;

                resultArray[i] = resultRow;
                let resultSheet = xlsx.utils.aoa_to_sheet(resultArray);

                if (testBook.Sheets['results']) {
                    testBook.Sheets['results'] = resultSheet;
                } else {
                    xlsx.utils.book_append_sheet(testBook, resultSheet, 'results');    
                }
                
                xlsx.writeFile(testBook, __dirname + "/../../excel-data-files/report-snapshot-results.xlsx");
            });
        }
    });
});
