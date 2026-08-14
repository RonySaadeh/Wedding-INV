/**
 * RSVP -> Google Sheet logger.
 *
 * Setup:
 * 1. Open (or create) the Google Sheet where you want responses to land.
 * 2. Extensions -> Apps Script.
 * 3. Delete any starter code, paste this whole file in, save.
 * 4. Deploy -> New deployment -> gear icon -> "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Deploy, authorize the permissions Google asks for.
 * 6. Copy the "Web app URL" (ends in /exec).
 * 7. Paste it into CONFIG.rsvpEndpoint in js/script.js.
 *
 * Every submitted RSVP appends one row to a sheet tab named "RSVPs"
 * (created automatically on first submission) with: timestamp, the
 * party's name, everyone marked attending, everyone marked not
 * attending, and a count of attendees. It also emails NOTIFY_EMAILS a
 * copy of each submission — an independent channel from the Sheet, so
 * you'd still know a response came in even if the Sheet write itself
 * silently failed. Listed as multiple addresses (rather than a
 * primary + fallback) since the script has no way to detect a
 * delivery failure on one address in order to retry another — sending
 * to both up front is what actually protects against one inbox
 * missing it.
 *
 * Note: if you ever edit this script after deploying, you need to
 * create a NEW deployment (or "Manage deployments" -> edit -> new
 * version) for the changes to take effect — saving alone doesn't
 * update a live deployment.
 */

var SHEET_NAME = "RSVPs";
var NOTIFY_EMAILS = "rony.saadehmisc@hotmail.com,rooney.saade666@gmail.com";

function doPost(e) {
  var sheet = getOrCreateSheet_();
  var data = JSON.parse(e.postData.contents);
  var attending = data.attending || [];
  var declined = data.declined || [];

  sheet.appendRow([
    new Date(),
    data.party || "",
    attending.join(", "),
    declined.join(", "),
    attending.length,
  ]);

  notifyByEmail_(data.party || "", attending, declined);

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Best-effort: a mail hiccup (e.g. the daily MailApp quota) shouldn't
// turn a successful Sheet write into a failed request.
function notifyByEmail_(party, attending, declined) {
  try {
    var lines = [
      "Party: " + party,
      "Attending: " + (attending.join(", ") || "—"),
      "Not attending: " + (declined.join(", ") || "—"),
    ];
    MailApp.sendEmail(
      NOTIFY_EMAILS,
      "New RSVP: " + party,
      lines.join("\n")
    );
  } catch (err) {
    // Swallow — the Sheet row above is the source of truth.
  }
}

function doGet() {
  return ContentService
    .createTextOutput("RSVP endpoint is live. POST RSVP data here.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp", "Party", "Attending", "Not Attending", "Attending Count"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
