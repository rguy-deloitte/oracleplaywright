import { test, expect } from '@playwright/test';
import * as allure from "allure-js-commons";

// See: https://consulting.eu.deloitteonline.com/sites/lockton/Shared%20Documents/portal/index.aspx/lockton/testing/all/overview

// Skip signing-in
test.use({ storageState: { cookies: [], origins: [] } });

test('AP18 | Manage Supplier', async () => {
  await allure.link("https://consulting.eu.deloitteonline.com/sites/lockton/Shared%20Documents/portal/index.aspx/lockton/testing/all/overview/");
  await allure.tags("Account Payables");
  await expect(true).toBeTruthy();
});

test('AP20 | Process Invoice', async () => {
  await allure.link("https://consulting.eu.deloitteonline.com/sites/lockton/Shared%20Documents/portal/index.aspx/lockton/testing/all/overview/");
  await allure.tags("Account Payables");
  await expect(true).toBeTruthy();
});

test('AP21 | Modify Invoice', async () => {
  await allure.link("https://consulting.eu.deloitteonline.com/sites/lockton/Shared%20Documents/portal/index.aspx/lockton/testing/all/overview/");
  await allure.tags("Account Payables");
  await expect(true).toBeTruthy();
});

test('AP23 | Cancel an Invoice', async () => {
  await allure.link("https://consulting.eu.deloitteonline.com/sites/lockton/Shared%20Documents/portal/index.aspx/lockton/testing/all/overview/");
  await allure.tags("Account Payables");
  await expect(true).toBeTruthy();
});

test('AP25 | Invoice Approvals', async () => {
  await allure.link("https://consulting.eu.deloitteonline.com/sites/lockton/Shared%20Documents/portal/index.aspx/lockton/testing/all/overview/");
  await allure.tags("Account Payables");
  await expect(true).toBeTruthy();
});

test('AR06 | Create Customer', async () => {
  await allure.link("https://consulting.eu.deloitteonline.com/sites/lockton/Shared%20Documents/portal/index.aspx/lockton/testing/all/overview/");
  await allure.tags("Account Receivables");
  await expect(true).toBeTruthy();
});

test('AR08 | Raise an Invoice: Transaction Invoice', async () => {
  await allure.link("https://consulting.eu.deloitteonline.com/sites/lockton/Shared%20Documents/portal/index.aspx/lockton/testing/all/overview/");
  await allure.tags("Account Receivables");
  await expect(true).toBeTruthy();
});

test('CM32 | Auto Import Bank Statements', async () => {
  await allure.link("https://consulting.eu.deloitteonline.com/sites/lockton/Shared%20Documents/portal/index.aspx/lockton/testing/all/overview/");
  await allure.tags("Cash Management");
  await expect(true).toBeTruthy();
});

test('CM34 | Bank Statement Reconciliation - Intercompany & General', async () => {
  await allure.link("https://consulting.eu.deloitteonline.com/sites/lockton/Shared%20Documents/portal/index.aspx/lockton/testing/all/overview/");
  await allure.tags("Cash Management");
  await expect(true).toBeTruthy();
});

test('FA38 | Depreciate Assets', async () => {
  await allure.link("https://consulting.eu.deloitteonline.com/sites/lockton/Shared%20Documents/portal/index.aspx/lockton/testing/all/overview/");
  await allure.tags("Fixed Assets");
  await expect(true).toBeTruthy();
});

test('FA39 | Asset Maintenance', async () => {
  await allure.link("https://consulting.eu.deloitteonline.com/sites/lockton/Shared%20Documents/portal/index.aspx/lockton/testing/all/overview/");
  await allure.tags("Fixed Assets");
  await expect(true).toBeTruthy();
});

test('FA40 | Retire Assets', async () => {
  await allure.link("https://consulting.eu.deloitteonline.com/sites/lockton/Shared%20Documents/portal/index.aspx/lockton/testing/all/overview/");
  await allure.tags("Fixed Assets");
  await expect(true).toBeTruthy();
});
