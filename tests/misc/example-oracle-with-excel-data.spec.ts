// This Example test script automates the scheduling of a new process in Oracle Fusion using Playwright and Excel data.
// Ensure you have the required Excel file in the correct directory: excel-data-files/example-oracle-with-excel-data.xlsx
// Run using: npx playwright test tests/misc/example-oracle-with-excel-data.spec.ts
import { test } from '@playwright/test';
import { ExcelService } from '../../src/services/excel.service';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
// *** Note *** Login handled in auth.setup.ts
const authFile = path.join(__dirname, '../.auth/auth-state.json');
test.use({ storageState: authFile });
test.describe.configure({ mode: 'serial' });  // Required to ensure tests run in expected order and that beforeAll & afterAll only run once

let testLoopStartTime: Date = new Date(), testLoopEndTime: Date = new Date();
let apiContext: any;
const getDataFromExcelFile = true;      // Set to true to read data from Excel file
const generateResultsExcelFile = true;  // Set to true to write results to results excel file (filename *-results-YYYYMMDD-hhmmss.xlsx)
let setupData: any[] = [];              // Data items from the Setup Excel sheet
let loopData: any[][] = [];             // Data items from the Loop Excel sheet
const skipRatherThanSubmit = false;     // Set to true to skip submission and just take screenshots
if (getDataFromExcelFile) ({ setupData, loopData } = ExcelService.readExcelData(__filename));
if (generateResultsExcelFile) ExcelService.writeResultsHeaderRow(['ACCOUNTING PERIOD', 'BALANCING SEGMENT', 'REQUESTID', 'STARTTIME', 'ENDTIME', 'RESULT']);

test.beforeAll(async ({ playwright }) => {
  // Setup Oracle API. See: https://docs.oracle.com/en/cloud/saas/financials/25c/farfa/Quick_Start.html
  apiContext = await playwright.request.newContext({
    baseURL: process.env.APIBASEURL,
    extraHTTPHeaders: {
        'Authorization': `Basic ${process.env.URLCREDENTIALS}`,
        'Content-Type': 'application/vnd.oracle.adf.resourcecollection+json',
    },
  });
});

test.afterAll(async () => {
  await apiContext.dispose();
  if (generateResultsExcelFile) ExcelService.save();
});

test.beforeEach(async ({ page }) => {
  // Navigate to where the process begins
  await page.goto(setupData[0]);
  await page.getByRole('link', { name: 'Tools' }).click();
  await page.getByTitle('Scheduled Processes').click();
  await page.getByRole('button', { name: 'Schedule New Process' }).click();
  await page.getByRole('combobox', { name: 'Name' }).click();
  await page.getByRole('combobox', { name: 'Name' }).fill(setupData[1]);
  await page.getByRole('combobox', { name: 'Name' }).press('Enter');
});

for (let row = 1; row < loopData.length; row++) {
  test(`Process: ${loopData[row][0]}`, async ({ page }, testInfo) => {
      test.slow();
      await test.step('Access Home Page', async () => {
        testLoopStartTime = new Date();

        await page.getByRole('button', { name: 'OK' }).click();
        await page.getByLabel('Data Access Set').click();
        await page.getByLabel('Data Access Set').selectOption(setupData[2]);
        await page.getByLabel('Ledger or Ledger Set').selectOption(setupData[3]);
        await page.getByLabel('Target Currency').selectOption(setupData[4]);
        await page.getByLabel('Accounting Period').selectOption(loopData[row][0]);
        await page.getByRole('combobox', { name: 'Balancing Segment' }).click();
        await page.getByRole('combobox', { name: 'Balancing Segment' }).fill(loopData[row][1]);
        await page.getByRole('combobox', { name: 'Balancing Segment' }).press('Enter');
        await page.waitForTimeout(1000);
        if (skipRatherThanSubmit) {
            await testInfo.attach(`${loopData[row][0]} Final Screen (cancelled)...`, { body: await page.screenshot(), contentType: 'image/png' });
            await page.getByRole('button', { name: 'Cancel', exact: true }).click();
        } else {
            await page.getByRole('button', { name: 'Submit', exact: true }).click();

            const processSubmittedMessage = await page.getByText(/Process \d+ was submitted\./).textContent();
            const processNumber = processSubmittedMessage?.match(/^Process (\d+) was submitted\.$/)?.[1];
            await testInfo.attach(`${loopData[row][0]} Final Screen (submitted)...`, { body: await page.screenshot(), contentType: 'image/png' });
            await page.getByRole('button', { name: 'OK' }).click();

            if (processNumber) {
              let jobStatus, jobStatusJson, jobRequestStatus = '';
              do {
                await page.waitForTimeout(1000);
                jobStatus = await apiContext.get('./erpintegrations', { params: `?finder=ESSJobStatusRF;requestId=${processNumber}` })
                  .catch((e) => console.log('Error with api call:', e));
                jobStatusJson = await jobStatus.json();
                jobRequestStatus = jobStatusJson.items[0].RequestStatus;
              } while (!['SUCCEEDED', 'CANCELED', 'ERROR', 'ERROR MANUAL RECOVERY', 'EXPIRED', 'FINISHED', 'HOLD', 'VALIDATION FAILED', 'WARNING'].includes(jobRequestStatus));  // See: https://docs.oracle.com/en/cloud/saas/applications-common/25c/oacpr/statuses-of-scheduled-processes.html

              testLoopEndTime = new Date();
              ExcelService.writeResultsResultRow([loopData[row][0], loopData[row][1], processNumber, testLoopStartTime, testLoopEndTime, jobRequestStatus]);

            } else {
              console.log('Process number not found in the submission confirmation message:', processSubmittedMessage);
              // throw new Error('Process number not found in the submission confirmation message.');
            }
        }
        await page.getByRole('button', { name: 'Schedule New Process' }).click();
      });
  });
};

// for (let row = 1; row < loopData.length; row++) {
//     console.log('yyy', loopData.length);
//     const randomNumber = generateRandomNumber();
//     test(`Create Supplier${row}`, async ({ page, request }, testInfo) => {
//         console.log(`*** RUNNING TEST${row}`);
//         await test.step('Access Home Page', async () => {
//             await page.goto('https://eiiv-dev6.fa.us6.oraclecloud.com/fscmUI/faces/FuseWelcome');

//         });
//     });
// }



// test.describe('Test Describe', () => {
//   test.beforeAll(async ({ playwright }) => {
//     console.log('*** BEFORE ALL!!!');

//     // // Load data from Excel file & prepare results file if required
//     // if (getDataFromExcelFile) ({ setupData, loopData } = ExcelService.readExcelData(__filename));
//     // if (generateResultsExcelFile) ExcelService.writeResultsHeaderRow(['ACCOUNTING PERIOD', 'BALANCING SEGMENT', 'REQUESTID', 'STARTTIME', 'ENDTIME', 'RESULT']);

//     console.log('aaa', loopData.length);

//     // Setup Oracle API. See: https://docs.oracle.com/en/cloud/saas/financials/25c/farfa/Quick_Start.html
//     apiContext = await playwright.request.newContext({
//       baseURL: process.env.APIBASEURL,
//       extraHTTPHeaders: {
//           'Authorization': `Basic ${process.env.URLCREDENTIALS}`,
//           'Content-Type': 'application/vnd.oracle.adf.resourcecollection+json',
//       },
//     });
//   });

//   test.afterAll(async ({ }) => {
//     console.log('*** AFTER ALL');
//     await apiContext.dispose();
//     if (generateResultsExcelFile) ExcelService.save();
//     console.log('zzz', loopData.length);
//   });

//   // *** Note *** Login handled in auth.setup.ts
//   test.beforeEach(async ({ page }) => {
//     console.log('*** BEFORE EACH');
//     // Navigate to where the process begins
//     await page.goto(setupData[0]);
//     await page.getByRole('link', { name: 'Tools' }).click();
//     await page.getByTitle('Scheduled Processes').click();
//     await page.getByRole('button', { name: 'Schedule New Process' }).click();
//     await page.getByRole('combobox', { name: 'Name' }).click();
//     await page.getByRole('combobox', { name: 'Name' }).fill(setupData[1]);
//     await page.getByRole('combobox', { name: 'Name' }).press('Enter');
//   });

//   console.log('xxx', loopData.length);
//   for (let row = 1; row < loopData.length; row++) {
//       console.log('yyy', loopData.length);
//       const randomNumber = generateRandomNumber();
//       test(`Create Supplier${row}`, async ({ page, request }, testInfo) => {
//           console.log(`*** RUNNING TEST${row}`);
//           await test.step('Access Home Page', async () => {
//               await page.goto('https://eiiv-dev6.fa.us6.oraclecloud.com/fscmUI/faces/FuseWelcome');

//           });
//       });
//   }


  /*
  for (let row = 1; row < loopData.length; row++) {
    test(`Process: ${loopData[row][0]}`, async ({ page }, testInfo) => {
          await test.step('Access Home Page', async () => {
                testLoopStartTime = new Date();

                await page.getByRole('button', { name: 'OK' }).click();
                await page.getByLabel('Data Access Set').click();
                await page.getByLabel('Data Access Set').selectOption(setupData[2]);
                await page.getByLabel('Ledger or Ledger Set').selectOption(setupData[3]);
                await page.getByLabel('Target Currency').selectOption(setupData[4]);
                await page.getByLabel('Accounting Period').selectOption(loopData[row][0]);
                await page.getByRole('combobox', { name: 'Balancing Segment' }).click();
                await page.getByRole('combobox', { name: 'Balancing Segment' }).fill(loopData[row][1]);
                await page.getByRole('combobox', { name: 'Balancing Segment' }).press('Enter');
                await page.waitForTimeout(1000);
                if (skipRatherThanSubmit) {
                    await testInfo.attach(`${loopData[row][0]} Final Screen (cancelled)...`, { body: await page.screenshot(), contentType: 'image/png' });
                    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
                } else {
                    await page.getByRole('button', { name: 'Submit', exact: true }).click();

                    const processSubmittedMessage = await page.getByText(/Process \d+ was submitted\./).textContent();
                    const processNumber = processSubmittedMessage?.match(/^Process (\d+) was submitted\.$/)?.[1];
                    await testInfo.attach(`${loopData[row][0]} Final Screen (submitted)...`, { body: await page.screenshot(), contentType: 'image/png' });
                    await page.getByRole('button', { name: 'OK' }).click();

                    if (processNumber) {
                      let jobStatus, jobStatusJson, jobRequestStatus = '';
                      do {
                        await page.waitForTimeout(1000);
                        jobStatus = await apiContext.get('./erpintegrations', { params: `?finder=ESSJobStatusRF;requestId=${processNumber}` })
                          .catch((e) => console.log('Error with api call:', e));
                        jobStatusJson = await jobStatus.json();
                        jobRequestStatus = jobStatusJson.items[0].RequestStatus;
                      } while (!['SUCCEEDED', 'CANCELED', 'ERROR', 'ERROR MANUAL RECOVERY', 'EXPIRED', 'FINISHED', 'HOLD', 'VALIDATION FAILED', 'WARNING'].includes(jobRequestStatus));  // See: https://docs.oracle.com/en/cloud/saas/applications-common/25c/oacpr/statuses-of-scheduled-processes.html

                      testLoopEndTime = new Date();
                      ExcelService.writeResultsResultRow([loopData[row][0], loopData[row][1], processNumber, testLoopStartTime, testLoopEndTime, jobRequestStatus]);

                    } else {
                      console.log('Process number not found in the submission confirmation message:', processSubmittedMessage);
                      // throw new Error('Process number not found in the submission confirmation message.');
                    }
                }
                await page.getByRole('button', { name: 'Schedule New Process' }).click();

          });
      });

  }

});
  */

// function generateRandomNumber() {
//     return Math.floor(Math.random() * 900) + 100;
// }

// test('Test not in loop', async ({ page }) => {
//   for (let row = 1; row < loopData.length; row++) {
//     await test.step(`Process: ${loopData[row][0]}`, async () => {
//           await page.getByRole('button');
//     });
//   }
// });

// for (let row = 1; row < loopData.length; row++) {
//   test(`Process Excel: ${loopData[row][0]}`, async ({ page }) => {
//           await page.getByRole('button');
//   });
// }

// loopData.forEach(row => {
//   test(`Foreach Process Excel: ${row[0]}`, async ({ page }) => {
//           await page.getByRole('button');
//   });
// })

/*
// Schedule New Process
for (let row = 1; row < loopData.length; row++) {
  test(`Process: ${loopData[row][0]}`, async ({ page }, testInfo) => {
    await test.step('Access Home Page', async () => {
      testLoopStartTime = new Date();

      await page.getByRole('button', { name: 'OK' }).click();
      await page.getByLabel('Data Access Set').click();
      await page.getByLabel('Data Access Set').selectOption(setupData[2]);
      await page.getByLabel('Ledger or Ledger Set').selectOption(setupData[3]);
      await page.getByLabel('Target Currency').selectOption(setupData[4]);
      await page.getByLabel('Accounting Period').selectOption(loopData[row][0]);
      await page.getByRole('combobox', { name: 'Balancing Segment' }).click();
      await page.getByRole('combobox', { name: 'Balancing Segment' }).fill(loopData[row][1]);
      await page.getByRole('combobox', { name: 'Balancing Segment' }).press('Enter');
      await page.waitForTimeout(1000);
      if (skipRatherThanSubmit) {
          await testInfo.attach(`${loopData[row][0]} Final Screen (cancelled)...`, { body: await page.screenshot(), contentType: 'image/png' });
          await page.getByRole('button', { name: 'Cancel', exact: true }).click();
      } else {
          await page.getByRole('button', { name: 'Submit', exact: true }).click();

          const processSubmittedMessage = await page.getByText(/Process \d+ was submitted\./).textContent();
          const processNumber = processSubmittedMessage?.match(/^Process (\d+) was submitted\.$/)?.[1];
          await testInfo.attach(`${loopData[row][0]} Final Screen (submitted)...`, { body: await page.screenshot(), contentType: 'image/png' });
          await page.getByRole('button', { name: 'OK' }).click();

          if (processNumber) {
            let jobStatus, jobStatusJson, jobRequestStatus = '';
            do {
              await page.waitForTimeout(1000);
              jobStatus = await apiContext.get('./erpintegrations', { params: `?finder=ESSJobStatusRF;requestId=${processNumber}` })
                .catch((e) => console.log('Error with api call:', e));
              jobStatusJson = await jobStatus.json();
              jobRequestStatus = jobStatusJson.items[0].RequestStatus;
            } while (!['SUCCEEDED', 'CANCELED', 'ERROR', 'ERROR MANUAL RECOVERY', 'EXPIRED', 'FINISHED', 'HOLD', 'VALIDATION FAILED', 'WARNING'].includes(jobRequestStatus));  // See: https://docs.oracle.com/en/cloud/saas/applications-common/25c/oacpr/statuses-of-scheduled-processes.html

            testLoopEndTime = new Date();
            ExcelService.writeResultsResultRow([loopData[row][0], loopData[row][1], processNumber, testLoopStartTime, testLoopEndTime, jobRequestStatus]);

          } else {
            console.log('Process number not found in the submission confirmation message:', processSubmittedMessage);
            // throw new Error('Process number not found in the submission confirmation message.');
          }
      }
      await page.getByRole('button', { name: 'Schedule New Process' }).click();

    });
  });
}
*/

/*
test('Oracle With Excel Data Example', async ({ page }, testInfo) => {

  // Navigate to Scheduled Processes
  await test.step('Login into Oracle Fusion', async () => {
      await page.goto(setupData[0]);

      // *** Note *** Login handled in auth.setup.ts
      // Navigate to where the process begins
      await page.getByRole('link', { name: 'Tools' }).click();
      await page.getByTitle('Scheduled Processes').click();
      await page.getByRole('button', { name: 'Schedule New Process' }).click();
      await page.getByRole('combobox', { name: 'Name' }).click();
      await page.getByRole('combobox', { name: 'Name' }).fill(setupData[1]);
      await page.getByRole('combobox', { name: 'Name' }).press('Enter');
  });

  // Schedule New Process
  for (let row = 1; row < loopData.length; row++) {
      await test.step(`Process: ${loopData[row][0]}`, async () => {
        testLoopStartTime = new Date();

        await page.getByRole('button', { name: 'OK' }).click();
        await page.getByLabel('Data Access Set').click();
        await page.getByLabel('Data Access Set').selectOption(setupData[2]);
        await page.getByLabel('Ledger or Ledger Set').selectOption(setupData[3]);
        await page.getByLabel('Target Currency').selectOption(setupData[4]);
        await page.getByLabel('Accounting Period').selectOption(loopData[row][0]);
        await page.getByRole('combobox', { name: 'Balancing Segment' }).click();
        await page.getByRole('combobox', { name: 'Balancing Segment' }).fill(loopData[row][1]);
        await page.getByRole('combobox', { name: 'Balancing Segment' }).press('Enter');
        await page.waitForTimeout(1000);
        if (skipRatherThanSubmit) {
            await testInfo.attach(`${loopData[row][0]} Final Screen (cancelled)...`, { body: await page.screenshot(), contentType: 'image/png' });
            await page.getByRole('button', { name: 'Cancel', exact: true }).click();
        } else {
            await page.getByRole('button', { name: 'Submit', exact: true }).click();

            const processSubmittedMessage = await page.getByText(/Process \d+ was submitted\./).textContent();
            const processNumber = processSubmittedMessage?.match(/^Process (\d+) was submitted\.$/)?.[1];
            await testInfo.attach(`${loopData[row][0]} Final Screen (submitted)...`, { body: await page.screenshot(), contentType: 'image/png' });
            await page.getByRole('button', { name: 'OK' }).click();

            if (processNumber) {
              let jobStatus, jobStatusJson, jobRequestStatus = '';
              do {
                await page.waitForTimeout(1000);
                jobStatus = await apiContext.get('./erpintegrations', { params: `?finder=ESSJobStatusRF;requestId=${processNumber}` })
                  .catch((e: any) => console.log('Error with api call:', e));
                jobStatusJson = await jobStatus.json();
                jobRequestStatus = jobStatusJson.items[0].RequestStatus;
              } while (!['SUCCEEDED', 'CANCELED', 'ERROR', 'ERROR MANUAL RECOVERY', 'EXPIRED', 'FINISHED', 'HOLD', 'VALIDATION FAILED', 'WARNING'].includes(jobRequestStatus));  // See: https://docs.oracle.com/en/cloud/saas/applications-common/25c/oacpr/statuses-of-scheduled-processes.html

              testLoopEndTime = new Date();
              ExcelService.writeResultsResultRow([loopData[row][0], loopData[row][1], processNumber, testLoopStartTime, testLoopEndTime, jobRequestStatus]);

            } else {
              console.log('Process number not found in the submission confirmation message:', processSubmittedMessage);
              // throw new Error('Process number not found in the submission confirmation message.');
            }
        }
        await page.getByRole('button', { name: 'Schedule New Process' }).click();
      });
    }
});


*/