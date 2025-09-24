import { expect, Locator, Page } from "@playwright/test";
import * as navUtils from "./form";

// Function to fill and add rows to a table which has numbered rows
// Each iterable in newRows will create a new row using the button addRowButton and will check
// the row number using the indexColumn cell
export async function addNumberedTableRows(page: Page, newRows: Record<string, string>[], tableRows: Locator, addRowButton: Locator, indexColumn: number = 2){
  for (let i = 0; i < newRows.length; i++) {
    // Rows in table are not zero indexed
    let rowIndex = i + 1;

    // If there is not a new row ready to fill, click the Add Row button
    if (rowIndex > await tableRows.count()) {
      await addRowButton.click();
      await expect(tableRows).toHaveCount(rowIndex);
    }

    // When adding a new row to a numbered table, it is not garuanteed to be added at the end
    // Iterate through all rows to find the newest
    let tableLength = await tableRows.count();
    for (let tableRow = 0; tableRow < tableLength; tableRow++) {
      let selectedRow = await tableRows.nth(tableRow);

      // Search the indexCell of each row to find the one that matches the new rowIndex
      let lineNumber = await selectedRow.getByRole('cell').nth(indexColumn).textContent();

      // If lineNumber matches row in input data, fill data and break loop
      if (lineNumber == rowIndex.toString()){ 
        await selectedRow.getByRole('cell').nth(indexColumn).click();

        await navUtils.fillAllFieldsByName(page, selectedRow, newRows[i]);
        break; 
      }
    }
  }
}
