import * as xlsx from 'xlsx';
const path = require('path');

export class ExcelService {
    static readExcelData(testFileName: string) {
        const setupDataSheetName = 'Setup';
        const loopDataSheetName = 'Loop';
        let setupData: any[] = [];    // Data items from the Setup sheet
        let loopData: any[][] = [];   // Data items from the Loop sheet

        const sourceDataXslxFilename = path.basename(testFileName, '.spec.ts') + '.xlsx';
        const sourceDataXslxFilePath = path.join(__dirname, '..', '..', 'excel-data-files', sourceDataXslxFilename);

        // check if file exists
        const fs = require('fs');
        if (!fs.existsSync(sourceDataXslxFilePath)) {
            console.error(`Error: The Excel file ${sourceDataXslxFilePath} does not exist.`);
            process.exit(1);
        }

        const workbook = xlsx.readFile(sourceDataXslxFilePath);
        setupData = (xlsx.utils.sheet_to_json(workbook.Sheets[setupDataSheetName], { raw: false, header: 1 }) as any[][]).map((item: any[]) => {return item[1]});
        loopData = (xlsx.utils.sheet_to_json(workbook.Sheets[loopDataSheetName], { raw: false, header: 1 }) as any[][]).map((item: any[]) => {return [item[0], item[1]]});
        if (setupData.length === 0 || loopData.length === 0) {
            console.error(`Error with format of Excel file: ${sourceDataXslxFilePath}`);
            process.exit(1);
        }        

        return { setupData, loopData };
    }
}