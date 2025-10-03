// Run using: npx playwright test tests/reports/perf.snapshot.spec.ts --ui
import test from '@playwright/test';
import * as reportService from './report';
test.slow();



// *** Note *** Login handled in auth.setup.ts
test.describe.configure({ mode: 'serial' });  // Required to ensure tests run in expected order and that beforeAll & afterAll only run once


test.describe('Trial Balance Report', async () => {

    test(`Run Report:`, async ({ page }, testInfo) => {
        await reportService.navigateToReport(page, testInfo, 'Trial Balance Report');
    });

});
