import { expect, Locator, Page } from "@playwright/test";
import * as navUtils from "./form";

// Function to fill and add rows to a table which has numbered rows
// Each iterable in newRows will create a new row using the button addRowButton
export async function addNumberedTableRows(page: Page, newRows: Record<string, string>[], tableRows: Locator, addRowButton: Locator){
  const initRows = await tableRows.getByRole('row').count();
  
  // If the same table is reloaded and filled again, the '_afrrk' attribute does not start from 0
  // The table initial '_selstate' will give the starting value and is offset from there
  const selState = await tableRows.getAttribute('_selstate');
  const countOffset = Number(selState?.split("'")[1]);
  
  for (let i = 0; i < newRows.length; i++) {

    // Locator for cell containing row number (which are not zero indexed)
    let numberCell = page.getByRole('cell', { name: (i+1).toString(), exact: true })

    // If there is not a new row ready to fill, click the Add Row button
    if (i >= initRows) {
      await addRowButton.click();
      await expect(async () => {
        await expect(numberCell).toBeVisible();
      }).toPass();
    }

    const currentRow = page.locator(`[_afrrk="${i+countOffset}"]`);

    await numberCell.click();
    await expect(async () => {
        await expect(currentRow.getByRole('textbox').first()).toBeVisible();
      }).toPass();

    await navUtils.fillAllFieldsByName(page, currentRow, newRows[i]);
  }

  expect(await tableRows.getAttribute("_rowcount")).toEqual(newRows.length.toString());
}
