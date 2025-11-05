import * as xlsx from 'xlsx';
//const path = require('path');
import * as path from 'path';

export class ExcelService {
    static workbook: xlsx.WorkBook;
    static fileDirectory: string = path.join(__dirname, '..', '..', 'excel-data-files');
    static fileName: string;
    static resultsJson: Record<string, any>[] = [];

    static setupSheetName = 'Setup';
    static loopSheetName = 'Loop';

    // static readExcelData(testFileName: string) {
    //     let setupData: any[] = [];    // Data items from the Setup sheet
    //     let loopData: any[][] = [];   // Data items from the Loop sheet

    //     const sourceDataXslxFilename = path.basename(testFileName, '.spec.ts');
    //     this.fileNameAndPath = path.join(__dirname, '..', '..', 'excel-data-files', sourceDataXslxFilename);
    //     const sourceDataXslxFilePath = this.fileNameAndPath + '.xlsx';

    //     // check if file exists
    //     const fs = require('fs');
    //     if (!fs.existsSync(sourceDataXslxFilePath)) {
    //         console.error(`Error: The Excel file ${sourceDataXslxFilePath} does not exist.`);
    //         process.exit(1);
    //     }

    //     // const workbook = xlsx.readFile(sourceDataXslxFilePath);
    //     this.workbook = xlsx.readFile(sourceDataXslxFilePath);
    //     setupData = (xlsx.utils.sheet_to_json(this.workbook.Sheets[setupDataSheetName], { raw: false, header: 1 }) as any[][]).map((item: any[]) => {return item[1]});
    //     loopData = (xlsx.utils.sheet_to_json(this.workbook.Sheets[loopDataSheetName], { raw: false, header: 1 }) as any[][]).map((item: any[]) => {return [item[0], item[1], item[2], item[3], item[4]]});
    //     if (setupData.length === 0 || loopData.length === 0) {
    //         console.error(`Error with format of Excel file: ${sourceDataXslxFilePath}`);
    //         process.exit(1);
    //     }
    //     loopData.shift();   // remove header row

    //     return { setupData, loopData };
    // }

    static isWorkbookOpen(): boolean {
        return this.workbook !== undefined;
    }

    static addResultsRow(resultsData: Record<string, any>) {
        this.resultsJson.push(resultsData);
    }

    // static writeResultsHeaderRow(headings: string[]) {
    //     this.resultsSheet = xlsx.utils.aoa_to_sheet([headings]);
    //     xlsx.utils.book_append_sheet(this.workbook, this.resultsSheet, 'results');      
    // }

    // static writeResultsResultRow(results: string[]) {
    //     xlsx.utils.sheet_add_aoa(this.resultsSheet!, [results], {origin:-1});
    // }

    static saveResults() {
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const dateTimeFormatted = 
            now.getFullYear().toString() +
            pad(now.getMonth() + 1) +
            pad(now.getDate()) + '-' +
            pad(now.getHours()) +
            pad(now.getMinutes()) +
            pad(now.getSeconds());

        let resultsWorkbook = this.workbook;
        let resultsSheet = xlsx.utils.json_to_sheet(this.resultsJson);
        xlsx.utils.book_append_sheet(resultsWorkbook, resultsSheet, 'results');

        let resultsFileName = this.fileName + '-results-' + dateTimeFormatted + '.xlsx';

        xlsx.writeFile(resultsWorkbook, path.join(this.fileDirectory, resultsFileName));
    }

    static readExcelToRecords(testFileName: string) {
        let setupData: Record<string, any> = {};
        let loopData: Record<string, any>[] = [];

        this.fileName = path.basename(testFileName, '.spec.ts');
        let sourcePath = path.join(this.fileDirectory, this.fileName + '.xlsx');

        // check if file exists
        const fs = require('fs');
        if (!fs.existsSync(sourcePath)) {
            console.error(`Error: The Excel file ${sourcePath} does not exist.`);
            process.exit(1);
        }

        this.workbook = xlsx.readFile(sourcePath);

        // Check that the workbook contains a sheet called 'Setup'
        if (this.workbook.Sheets['Setup'] == undefined) { throw Error("Excel workbook does not contain a sheet called 'Setup'") };

        // Read the rows of the Setup sheet and add column A as keys and B as values
        const setupSheet = xlsx.utils.sheet_to_json(this.workbook.Sheets['Setup'], { raw: false, header: 1 }) as any[][];
        setupSheet.forEach(row => {
            setupData[row[0]] = row[1];
        });

        // Check that the workbook contains a sheet called 'Loop'
        if (this.workbook.Sheets['Loop'] == undefined) { throw Error("Excel workbook does not contain a sheet called 'Loop'") };

        // Convert the headers and rows into JSON objects
        loopData = xlsx.utils.sheet_to_json(this.workbook.Sheets['Loop']);

        return { setupData, loopData };
    }

    static updateLoopValue(rowIndex: number, columnName: string, value: any, type: string) {
        let loopSheet = this.workbook.Sheets['Loop'];
        let columnIndex = 0;

        for (let i = 0; i < 1000; i++) {
            let headerCell = loopSheet[xlsx.utils.encode_cell({ c: i, r: 0 })];
            
            if (headerCell != undefined && headerCell['v'] == columnName) {
                columnIndex = i;
                break;
            }

            if (i == 999) { throw Error(`Column '${columnName}' does not exist`)}
        }

        const updateCell = xlsx.utils.encode_cell({ c: columnIndex, r: rowIndex + 1 });
        loopSheet[updateCell] = { 't': type,
                                  'v': value,
                                  'r': `<t>${value}</t>`,
                                  'h': value,
                                  'w': value }

        this.workbook.Sheets['Loop'] = loopSheet;
    }

    static updateLoopRow(rowIndex: number, rowData: Record<string, any>) {
        Object.keys(rowData).forEach((key) => {
            this.updateLoopValue(rowIndex, key, rowData[key]['value'], rowData[key]['format']);
        });
        
        xlsx.writeFile(this.workbook, path.join(this.fileDirectory, this.fileName + '.xlsx'));
    }

    static updateSetupSheet(setupData: Record<string, any>) {
        let setupSheet = this.workbook.Sheets['Setup'];

        for (let i = 0; i < Object.keys(setupData).length; i++) {
            let key = Object.keys(setupData)[i];

            setupSheet[xlsx.utils.encode_cell({ c: 0, r: i })] = { 't': 's',
                                                                   'v': key,
                                                                   'r': `<t>${key}</t>`,
                                                                   'h': key,
                                                                   'w': key }

            setupSheet[xlsx.utils.encode_cell({ c: 1, r: i })] = { 't': 's',
                                                                   'v': setupData[key],
                                                                   'r': `<t>${setupData[key]}</t>`,
                                                                   'h': setupData[key],
                                                                   'w': setupData[key] }

            console.log(`${key} is ${setupData[key]}`)
        }

        this.workbook.Sheets['Setup'] = setupSheet;
        console.log(setupSheet);
        
        xlsx.writeFile(this.workbook, path.join(this.fileDirectory, this.fileName + '.xlsx'));
    }
}