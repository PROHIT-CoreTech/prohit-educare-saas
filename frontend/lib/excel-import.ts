import * as XLSX from 'xlsx';
import { isValidMobile } from './validation';

export interface RawStudentRow {
  name: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  standard: number;
  medium?: string;
  stream?: string;
  rollNo?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  address?: string;
  emergencyPhone?: string;
  customTotalFee?: number;
}

export interface ValidatedStudentRow extends RawStudentRow {
  rowNum: number;
  isValid: boolean;
  error?: string;
}

/**
 * Downloads a sample Excel file (.xlsx) with pre-filled headers and demo rows.
 */
export function downloadSampleExcelTemplate() {
  const headers = [
    'Student Name',
    'Parent Name',
    'Parent Phone',
    'Parent Email',
    'Standard',
    'Medium',
    'Stream',
    'Roll No',
    'Date of Birth',
    'Blood Group',
    'Address',
    'Emergency Phone',
    'Total Annual Fee',
  ];

  const sampleRows = [
    [
      'Aarav Sharma',
      'Rajesh Sharma',
      '9876543210',
      'rajesh@example.com',
      10,
      'english',
      'none',
      '1001',
      '2010-05-15',
      'B+',
      '123 Park Street, Pune',
      '9876543211',
      35000,
    ],
    [
      'Ananya Patel',
      'Suresh Patel',
      '9823012345',
      'suresh@example.com',
      11,
      'english',
      'science',
      '1101',
      '2009-08-20',
      'O+',
      '45 FC Road, Pune',
      '9823012346',
      45000,
    ],
    [
      'Rohan Kulkarni',
      'Vijay Kulkarni',
      '9765432109',
      'vijay@example.com',
      8,
      'marathi',
      'none',
      '801',
      '2012-11-04',
      'A+',
      '78 Kothrud, Pune',
      '9765432100',
      30000,
    ],
  ];

  const worksheetData = [headers, ...sampleRows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 22 }, // Student Name
    { wch: 20 }, // Parent Name
    { wch: 15 }, // Parent Phone
    { wch: 25 }, // Parent Email
    { wch: 10 }, // Standard
    { wch: 15 }, // Medium
    { wch: 12 }, // Stream
    { wch: 10 }, // Roll No
    { wch: 15 }, // Date of Birth
    { wch: 12 }, // Blood Group
    { wch: 30 }, // Address
    { wch: 18 }, // Emergency Phone
    { wch: 18 }, // Total Annual Fee
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bulk_Students_Sample');

  XLSX.writeFile(workbook, 'PROHIT_Bulk_Student_Import_Template.xlsx');
}

/**
 * Parses uploaded Excel (.xlsx, .xls, .csv) file into JSON objects.
 */
export async function parseExcelFile(file: File): Promise<ValidatedStudentRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const validatedRows: ValidatedStudentRow[] = jsonRows.map((row, index) => {
          const rowNum = index + 2; // Row 1 is headers

          // Map column name keys safely (handles variations in casing/spaces)
          const name = String(row['Student Name'] || row['student_name'] || row['Name'] || '').trim();
          const parentName = String(row['Parent Name'] || row['parent_name'] || '').trim();
          const parentPhone = String(row['Parent Phone'] || row['parent_phone'] || row['Phone'] || '').trim();
          const parentEmail = String(row['Parent Email'] || row['parent_email'] || '').trim();
          const stdRaw = row['Standard'] || row['standard'] || row['Std'] || 10;
          const standard = Number(stdRaw) || 10;
          const medium = String(row['Medium'] || row['medium'] || (standard >= 11 ? 'english' : 'english')).trim().toLowerCase();
          const stream = String(row['Stream'] || row['stream'] || (standard >= 11 ? 'science' : 'none')).trim().toLowerCase();
          const rollNo = String(row['Roll No'] || row['roll_no'] || '').trim();
          const dateOfBirth = String(row['Date of Birth'] || row['dob'] || '').trim();
          const bloodGroup = String(row['Blood Group'] || row['blood_group'] || '').trim();
          const address = String(row['Address'] || row['address'] || '').trim();
          const emergencyPhone = String(row['Emergency Phone'] || row['emergency_phone'] || '').trim();
          const customTotalFee = Number(row['Total Annual Fee'] || row['customTotalFee'] || row['Fee']) || undefined;

          let isValid = true;
          let error = '';

          if (!name) {
            isValid = false;
            error = 'Student Name is required';
          } else if (!parentName) {
            isValid = false;
            error = 'Parent Name is required';
          } else if (!parentPhone || !isValidMobile(parentPhone)) {
            isValid = false;
            error = 'Invalid Parent Phone (Must be 10 digits starting with 6-9)';
          } else if (emergencyPhone && !isValidMobile(emergencyPhone)) {
            isValid = false;
            error = 'Invalid Emergency Phone (Must be 10 digits starting with 6-9)';
          } else if (standard < 1 || standard > 15) {
            isValid = false;
            error = 'Standard must be a number between 1 and 15';
          }

          return {
            rowNum,
            name,
            parentName,
            parentPhone,
            parentEmail: parentEmail || undefined,
            standard,
            medium,
            stream,
            rollNo: rollNo || undefined,
            dateOfBirth: dateOfBirth || undefined,
            bloodGroup: bloodGroup || undefined,
            address: address || undefined,
            emergencyPhone: emergencyPhone || undefined,
            customTotalFee,
            isValid,
            error: error || undefined,
          };
        });

        resolve(validatedRows);
      } catch (err) {
        reject(new Error('Failed to parse Excel file. Please ensure it is a valid .xlsx, .xls, or .csv file.'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}
