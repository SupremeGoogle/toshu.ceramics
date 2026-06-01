const SHEET_NAME = "Заявки";

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);

  const payload = JSON.parse(e.postData.contents || "{}");
  const headers = [
    "createdAt",
    "type",
    "interest",
    "name",
    "phone",
    "email",
    "message",
    "source",
    "consent"
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  sheet.appendRow(headers.map((key) => payload[key] || ""));

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
