import { expect, Locator } from "@playwright/test";

export async function addJournalLines(tableRows: Locator, accountNumber: string, addRowButton: Locator, newEntryRows: string [][]){
  for (let loopRow = 1; loopRow < newEntryRows.length; loopRow++) {
    // If there is not a new row ready to fill, click Add Row button
    // Empty journal starts with 2 empty rows
    if (loopRow > await tableRows.count()) {
      await addRowButton.click();
      await expect(tableRows).toHaveCount(loopRow)
    }

    // When adding a new row, it does not appear at the end of the table, search from bottom to
    // find the row number matching 'row' and store the locator
    let tableLength = await tableRows.count();
    let selectedRow = tableRows.first();
    for (let tableRow = 0; tableRow < tableLength; tableRow++){
      selectedRow = tableRows.nth(tableRow);
                
      // Cell index 2 contains the Line Number
      let lineNumber = await selectedRow.getByRole('cell').nth(2).textContent();

      // If lineNumber matches row in loopData, exit loop with correct selectedRow
      if (lineNumber == loopRow.toString()){ break; }
    }

    await addJournalLine(selectedRow, accountNumber, newEntryRows[loopRow]);
  }
}

export async function addJournalLine(tableRow: Locator, accountNumber: string, newRowData: string[]){
  await tableRow.getByRole('cell').nth(3).click();
            
  await tableRow.getByRole('textbox', { name: 'Account' }).fill(accountNumber);
  await tableRow.getByRole('textbox', { name: 'Entered Debit' }).fill(newRowData[0]);
  await tableRow.getByRole('textbox', { name: 'Description Mandatory' }).fill(newRowData[1]);
}