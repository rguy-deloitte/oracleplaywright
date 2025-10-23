import { Locator, Page, expect } from "@playwright/test";


export async function waitForCursor(page: Page, interval: number = 100) {
    await page.waitForTimeout(interval);
    const start = Date.now();

    while (Date.now() - start < 30000) {
        const cursorStyle = await page.evaluate(() => document.body.style.cursor);
        if (cursorStyle == 'auto') {
            return;
        }
        await page.waitForTimeout(interval);
    }

    throw new Error("Timeout: Page never finished loading")
}

export async function waitForStablePage(page: Page) {
    await page.waitForLoadState("load");
    await page.evaluate(() => {
        return new Promise((resolve) => {
            let timeout: any;

            const observer = new MutationObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                observer.disconnect();
                resolve(undefined);
            }, 250); // Wait 250ms after last mutation
            });

            observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
            });

            // Fallback: resolve after 1 second if no mutations occur
            timeout = setTimeout(() => {
            observer.disconnect();
            resolve(undefined);
            }, 1000);
        });
    });
}

export async function fieldByName(page: Page, name: string, 
                                  value: string, fillType: string,
                                  options: { fieldType?: string,
                                             valueCheck?: string,
                                             pageSection?: Locator, 
                                             errorIfNoValue?: boolean,
                                             errorIfNoField?: boolean } ) {

    const errorIfNoValue = (options.errorIfNoValue) ? options.errorIfNoValue : false;
    const errorIfNoField = (options.errorIfNoField) ? options.errorIfNoField : true;
    const fieldType = (options.fieldType) ? options.fieldType : "textbox";

    if (value == undefined) {
        if (errorIfNoValue) {
            throw Error(`Value wasn't provided for required field ${name}`)
        } else {
            return;
        }
    }

    let field: Locator;
    switch (fieldType) {
        case "textbox":
            field = (options.pageSection) ? options.pageSection.getByRole('textbox', { name: name, exact: true }) : 
                                            page.getByRole('textbox', { name: name, exact: true });
            break;
        case "checkbox":
            field = (options.pageSection) ? options.pageSection.getByRole('checkbox', { name: name, exact: true }) : 
                                            page.getByRole('checkbox', { name: name, exact: true });
            break;
        default:
            throw Error(`${fieldType} not recognised as a type of field in function fillCheckValue`)
    }

    try {
        await expect(field).toBeVisible()
    } catch (e) {
        if (errorIfNoField) {
            throw Error(`Form field for ${name} is not editable`)
        }
        return;
    }

    switch (fillType) {
        case "fill":
            await field.fill(value);
            await field.blur();
            break;
        case "click":
            await field.click();
            const gridcell = page.getByRole('gridcell', { name: value, exact: true });
            await expect(gridcell).toBeVisible();
            await gridcell.click();
    }

    switch (options.valueCheck) {
        case "value":
            await expect(field).toHaveAttribute("value", value);
            break;
        case "value-wild":
            const regex = new RegExp(`.*${value}.*`);
            await expect(field).toHaveAttribute("value", regex);
            break;
        case "text":
            await expect(field).toHaveText(value);
            break;
        case undefined:
            break;
    }
}

export async function fillTextboxByName(page: Page, name: string, value: string, 
                                        options: {pageSection?: Locator, 
                                                  errorIfNoValue?: boolean,
                                                  errorIfNoField?: boolean } = {}) {

    const errorIfNoValue = (options.errorIfNoValue == undefined) ? false : options.errorIfNoValue;
    const errorIfNoField = (options.errorIfNoField == undefined) ? true : options.errorIfNoField;

    if (value == undefined) {
        if (errorIfNoValue) {
            throw Error(`Value wasn't provided for required field ${name}`)
        } else {
            return;
        }
    }

    const textBox = (options.pageSection) ? options.pageSection.getByRole('textbox', { name: name, exact: true }) : 
                                            page.getByRole('textbox', { name: name, exact: true });

    try {
        await expect(textBox).toBeVisible()
    } catch (e) {
        if (errorIfNoField) {
            throw Error(`Form field for ${name} is not editable`)
        }
        return;
    }

    await textBox.fill(value);
    await textBox.blur();
    await waitForStablePage(page);
}

export async function fillComboboxByName(page: Page, name: string, value: string, 
                                         options: {pageSection?: Locator, 
                                                   errorIfNoValue?: boolean,
                                                   errorIfNoField?: boolean } = {}) {

    const errorIfNoValue = (options.errorIfNoValue == undefined) ? false : options.errorIfNoValue;
    const errorIfNoField = (options.errorIfNoField == undefined) ? true : options.errorIfNoField;

    if (value == undefined) {
        if (errorIfNoValue) {
            throw Error(`Value wasn't provided for required field ${name}`)
        } else {
            return;
        }
    }

    const comboBox = (options.pageSection) ? options.pageSection.getByRole('combobox', { name: name, exact: true }) : 
                                                page.getByRole('combobox', { name: name, exact: true });

    try {
        await expect(comboBox).toBeVisible()
    } catch (e) {
        if (errorIfNoField) {
            throw Error(`Form field for ${name} is not editable`)
        }
        return;
    }

    await comboBox.fill(value);
    await comboBox.blur();
    await waitForStablePage(page);
}

export async function selectComboboxByName(page: Page, name: string, value: string, 
                                           options: {pageSection?: Locator, 
                                                     errorIfNoValue?: boolean,
                                                     errorIfNoField?: boolean } = {}) {

    const errorIfNoValue = (options.errorIfNoValue == undefined) ? false : options.errorIfNoValue;
    const errorIfNoField = (options.errorIfNoField == undefined) ? true : options.errorIfNoField;

    if (value == undefined) {
        if (errorIfNoValue) {
            throw Error(`Value wasn't provided for required field ${name}`)
        } else {
            return;
        }
    }

    const comboBox = (options.pageSection) ? options.pageSection.getByRole('combobox', { name: name, exact: true }) : 
                                                page.getByRole('combobox', { name: name, exact: true });

    try {
        await expect(comboBox).toBeVisible()
    } catch (e) {
        if (errorIfNoField) {
            throw Error(`Form field for ${name} is not editable`)
        }
        return;
    }

    await comboBox.selectOption(value);
    await comboBox.blur();
    await waitForStablePage(page);
}

export async function clickTextboxByName(page: Page, name: string, value: string, 
                                         options: {pageSection?: Locator, 
                                                   errorIfNoValue?: boolean,
                                                   errorIfNoField?: boolean } = {}) {

    const errorIfNoValue = (options.errorIfNoValue == undefined) ? false : options.errorIfNoValue;
    const errorIfNoField = (options.errorIfNoField == undefined) ? true : options.errorIfNoField;

    if (value == undefined) {
        if (errorIfNoValue) {
            throw Error(`Value wasn't provided for required field ${name}`)
        } else {
            return;
        }
    }

    const textBox = (options.pageSection) ? options.pageSection.getByRole('textbox', { name: name, exact: true }) : 
                                            page.getByRole('textbox', { name: name, exact: true });

    try {
        await expect(textBox).toBeVisible()
    } catch (e) {
        if (errorIfNoField) {
            throw Error(`Form field for ${name} is not editable`)
        }
        return;
    }

    await textBox.click();
    await waitForStablePage(page);
    await page.getByRole('gridcell', { name: value, exact: true }).click();
    await textBox.press("Enter");
    await textBox.blur();
    await waitForStablePage(page);
}

export async function clickComboboxByName(page: Page, name: string, value: string, 
                                          options: {pageSection?: Locator, 
                                                    errorIfNoValue?: boolean,
                                                    errorIfNoField?: boolean } = {}) {

    const errorIfNoValue = (options.errorIfNoValue == undefined) ? false : options.errorIfNoValue;
    const errorIfNoField = (options.errorIfNoField == undefined) ? true : options.errorIfNoField;

    if (value == undefined) {
        if (errorIfNoValue) {
            throw Error(`Value wasn't provided for required field ${name}`)
        } else {
            return;
        }
    }

    const comboBox = (options.pageSection) ? options.pageSection.getByRole('combobox', { name: name, exact: true }) : 
                                                 page.getByRole('combobox', { name: name, exact: true });

    try {
        await expect(comboBox).toBeVisible()
    } catch (e) {
        if (errorIfNoField) {
            throw Error(`Form field for ${name} is not editable`)
        }
        return;
    }

    await comboBox.click();
    await waitForStablePage(page);
    await page.getByRole('gridcell', { name: value, exact: true }).click();
    await comboBox.blur();
    await waitForStablePage(page);
}

// Takes the name of a collapsible section of the form and returns the Locator object for
// that section. This is useful if two fields have the same name but are in separate sections.
export async function getSectionFromCollapse(page: Page, buttonTitle: string){
  let collapseButtonLocator = page.getByTitle(buttonTitle, { exact: true });
  let collapseButtonId = await collapseButtonLocator.getAttribute("aria-controls");

  if (collapseButtonId == null) {
      throw Error(`Button '${buttonTitle}' has no 'aria-controls' attribute`);
  }

  collapseButtonId = collapseButtonId.replace("::content", "");

  return page.locator(`id=${collapseButtonId}`);
}

export async function clickButtonByName(page: Page, name: string, pageSection?: Locator) {
    if (pageSection) {
        await pageSection.getByRole('button', { name: name, exact: true }).click();
    } else {
        await page.getByRole('button', { name: name, exact: true }).click();
    }
    await waitForStablePage(page);
}

// Needs rewriting to fit new function format
export async function comboFillAndEnter(page: any, labelText: string, value: string) {
    const comboBox = await page.getByRole('combobox', { name: labelText, exact: true });
    await comboBox.click();
    await comboBox.fill(value);
    await comboBox.press('Enter');
}

// Needs rewriting to fit new function format
export async function setFormSelectValue(page: any, labelText: string, value: string) {
    const locator = page.getByLabel(labelText, { exact: true });
    await locator.click();  // Ensure the dropdown is focused
    await locator.selectOption(value.trim());
    await locator.press('Enter');
}

// Needs rewriting to fit new function format
export async function setFormCheckBox(page: any, labelText: string, value: boolean) {
    await page.getByText(labelText, { exact: true}).setChecked(value);
}

// Needs rewriting to fit new function format
export async function buttonClick(page: any, labelText: string) {
    await page.getByRole('button', { name: labelText, exact: true }).click();
    // await page.locator('button').getByText(labelText, { exact: true }).click();  <-- Didn't work when I tried it
}
