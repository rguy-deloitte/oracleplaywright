import * as xlsx from 'xlsx';
const path = require('path');

export class ExcelService {
    static workbook: xlsx.WorkBook;
    static resultsSheet: xlsx.WorkSheet;
    static fileNameAndPath: string;

    static readExcelData(testFileName: string) {
        const setupDataSheetName = 'Setup';
        const loopDataSheetName = 'Loop';
        let setupData: any[] = [];    // Data items from the Setup sheet
        let loopData: any[][] = [];   // Data items from the Loop sheet

        const sourceDataXslxFilename = path.basename(testFileName, '.spec.ts');
        this.fileNameAndPath = path.join(__dirname, '..', '..', 'excel-data-files', sourceDataXslxFilename);
        const sourceDataXslxFilePath = this.fileNameAndPath + '.xlsx';

        // check if file exists
        const fs = require('fs');
        if (!fs.existsSync(sourceDataXslxFilePath)) {
            console.error(`Error: The Excel file ${sourceDataXslxFilePath} does not exist.`);
            process.exit(1);
        }

        // const workbook = xlsx.readFile(sourceDataXslxFilePath);
        this.workbook = xlsx.readFile(sourceDataXslxFilePath);
        setupData = (xlsx.utils.sheet_to_json(this.workbook.Sheets[setupDataSheetName], { raw: false, header: 1 }) as any[][]).map((item: any[]) => {return item[1]});
        loopData = (xlsx.utils.sheet_to_json(this.workbook.Sheets[loopDataSheetName], { raw: false, header: 1 }) as any[][]).map((item: any[]) => {return [item[0], item[1]]});
        if (setupData.length === 0 || loopData.length === 0) {
            console.error(`Error with format of Excel file: ${sourceDataXslxFilePath}`);
            process.exit(1);
        }
        loopData.shift();   // remove header row

        return { setupData, loopData };
    }

    static isWorkbookOpen(): boolean {
        return this.workbook !== undefined;
    }

    static writeResultsHeaderRow(headings: string[]) {
        this.resultsSheet = xlsx.utils.aoa_to_sheet([headings]);
        xlsx.utils.book_append_sheet(this.workbook, this.resultsSheet, 'results');      
    }

    static writeResultsResultRow(results: string[]) {
        xlsx.utils.sheet_add_aoa(this.resultsSheet!, [results], {origin:-1});
    }

    static save() {
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const dateTimeFormatted = 
            now.getFullYear().toString() +
            pad(now.getMonth() + 1) +
            pad(now.getDate()) + '-' +
            pad(now.getHours()) +
            pad(now.getMinutes()) +
            pad(now.getSeconds());

        xlsx.writeFile(this.workbook, this.fileNameAndPath + '-results-' + dateTimeFormatted + '.xlsx');
    }

}
