/**
 * Google Apps Script for Release Planning App
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Replace Code.gs with this content
 * 4. UPDATE THE SPREADSHEET_ID BELOW with your sheet's ID
 * 5. Deploy as Web App:
 *    - Click "Deploy" > "New deployment"
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone (even anonymous)
 *    - Click "Deploy"
 * 6. Copy the Web App URL to your .env file as VITE_APPS_SCRIPT_URL
 */

// IMPORTANT: Replace this with your actual Google Sheet ID
// You can find it in the URL: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
const SPREADSHEET_ID = '1e2enCCzBmIgqk6C3y4bTYteM-KPBY8eEC9N79gcGkR4';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch (action) {
      case 'createInitiative':
        return createInitiative(data);
      case 'updateInitiative':
        return updateInitiative(data);
      case 'updateInitialPlanning':
        return updateInitialPlanning(data);
      case 'updateReleasePlan':
        return updateReleasePlan(data);
      case 'updateEpic':
        return updateEpic(data);
      default:
        return ContentService.createTextOutput(JSON.stringify({
          error: 'Unknown action: ' + action
        })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'DOPOST ERROR (v5): ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Utility to get the spreadsheet robustly
 */
function getSpreadsheet() {
  try {
    // Try opening by ID first as it's most reliable for Web Apps
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    console.error('Failed to open spreadsheet by ID: ' + e.message);
    // Fallback to active spreadsheet if it's a bound script
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

/**
 * Create a new initiative by:
 * 1. Adding a row to the "initiatives" sheet
 * 2. Duplicating the "Initiative_TEMPLATE" sheet with the initiative name
 */
function createInitiative(data) {
  try {
    console.log('Starting createInitiative for: ' + data.name);
    const ss = getSpreadsheet();
    if (!ss) throw new Error('COULD NOT ACCESS SPREADSHEET. Check SPREADSHEET_ID and permissions.');
    
    const initiativesSheet = ss.getSheetByName('initiatives');
    const templateSheet = ss.getSheetByName('Initiative_TEMPLATE');
    
    if (!initiativesSheet) throw new Error('SHEET "initiatives" NOT FOUND');
    if (!templateSheet) throw new Error('SHEET "Initiative_TEMPLATE" NOT FOUND');
    
    const name = data.name;

    if (ss.getSheetByName(name)) {
      throw new Error('DUPLICATE_NAME: A sheet named "' + name + '" already exists.');
    }
    
    // Add row to initiatives list
    try {
      initiativesSheet.appendRow([name, 'Initial Planning', '', '', '', '', '']);
    } catch (e) {
      throw new Error('FAILED_TO_APPEND_ROW: ' + e.message);
    }
    
    // Duplicate template
    let newSheet;
    try {
      // Use ss.insertSheet with template option for better reliability in some contexts
      newSheet = ss.insertSheet(name, {template: templateSheet});
    } catch (e) {
      console.warn('insertSheet with template failed, trying copyTo: ' + e.message);
      try {
        newSheet = templateSheet.copyTo(ss);
        newSheet.setName(name);
      } catch (e2) {
        throw new Error('FAILED_TO_DUPLICATE_TEMPLATE: ' + e2.message);
      }
    }
    
    // Ensure changes are committed
    // SpreadsheetApp.flush(); // REMOVED: flush() can trigger UI-dependent errors in Web Apps
    
    console.log('Finalizing createInitiative successfully');
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      name: name,
      msg: 'v5 success'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('CREATE_INITIATIVE_ERROR: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      error: 'CREATE_INITIATIVE_ERROR (v5): ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Update an initiative field in the initiatives sheet
 */
function updateInitiative(data) {
  const ss = getSpreadsheet();
  const initiativesSheet = ss.getSheetByName('initiatives');
  
  if (!initiativesSheet) {
    throw new Error('initiatives sheet not found');
  }
  
  const rowIndex = data.rowIndex; // 1-indexed row number
  const updates = data.updates; // Object with field: value pairs
  
  // Column mapping (A=0, B=1, etc.)
  const columnMap = {
    'name': 0,
    'status': 1,
    'pm': 2,
    'ux': 3,
    'group': 4,
    'techLead': 5,
    'developers': 6
  };
  
  // Apply updates
  for (const [field, value] of Object.entries(updates)) {
    const colIndex = columnMap[field];
    if (colIndex !== undefined) {
      const cellValue = Array.isArray(value) ? value.join(', ') : value;
      initiativesSheet.getRange(rowIndex, colIndex + 1).setValue(cellValue);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Update Initial Planning metadata in an initiative sheet
 * Location: Row 16 (assuming row 15 is header), Columns A-F
 */
function updateInitialPlanning(data) {
  const ss = getSpreadsheet();
  const initiativeName = data.initiativeName;
  const updates = data.updates;
  
  const sheet = ss.getSheetByName(initiativeName);
  if (!sheet) {
    throw new Error('Initiative sheet not found: ' + initiativeName);
  }
  
  // Column mapping for Initial Planning (A-F, row 16)
  const columnMap = {
    'StartDate': 1,      // A
    'PlannedEndDate': 2, // B
    'Status': 3,         // C
    'PRD': 4,            // D
    'Figma': 5,          // E
    'ReleasePlanSummary': 6 // F
  };
  
  const dataRow = 16; // Row 15 is header, 16 is data
  
  for (const [field, value] of Object.entries(updates)) {
    const colIndex = columnMap[field];
    if (colIndex !== undefined) {
      sheet.getRange(dataRow, colIndex).setValue(value);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Update a Release Plan in an initiative sheet
 * Location: Rows 3-13 (row 2 is header), Columns A-D
 */
function updateReleasePlan(data) {
  const ss = getSpreadsheet();
  const initiativeName = data.initiativeName;
  const planIndex = data.planIndex; // 0-based index
  const updates = data.updates;
  
  const sheet = ss.getSheetByName(initiativeName);
  if (!sheet) {
    throw new Error('Initiative sheet not found: ' + initiativeName);
  }
  
  // Column mapping for Release Plans (A-H)
  const columnMap = {
    'id': 0,        // A (New ID Column)
    'goal': 1,      // B
    'startDate': 2, // C
    'endDate': 3,   // D
    'status': 4,    // E
    'loe': 5,       // F
    'reqDoc': 6,    // G
    'devs': 7,      // H
    'kpi': 8        // I
  };
  
  const dataRow = 3 + planIndex; // Row 2 is header, data starts at 3
  
  for (const [field, value] of Object.entries(updates)) {
    const colIndex = columnMap[field];
    if (colIndex !== undefined) {
      sheet.getRange(dataRow, colIndex + 1).setValue(value);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Update an Epic in an initiative sheet
 * Location: Rows 31-60 (row 30 is header), Columns A-I
 */
function updateEpic(data) {
  const ss = getSpreadsheet();
  const initiativeName = data.initiativeName;
  const epicIndex = data.epicIndex; // 0-based index
  const updates = data.updates;
  
  const sheet = ss.getSheetByName(initiativeName);
  if (!sheet) {
    throw new Error('Initiative sheet not found: ' + initiativeName);
  }
  
  // Column mapping for Epics (A-I)
  const columnMap = {
    'ReleaseId': 1,      // A (New Release ID)
    'Name': 2,           // B
    'Status': 3,         // C
    'Link': 6,           // F
    'loe': 7,            // G
    'ac': 8,             // H
    'figma': 9,          // I
    'description': 10    // J
  };
  
  const dataRow = 31 + epicIndex; // Row 30 is header, data starts at 31
  
  for (const [field, value] of Object.entries(updates)) {
    const colIndex = columnMap[field];
    if (colIndex !== undefined) {
      sheet.getRange(dataRow, colIndex).setValue(value);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true
  })).setMimeType(ContentService.MimeType.JSON);
}
