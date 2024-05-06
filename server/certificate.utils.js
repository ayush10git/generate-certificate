const fs = require("fs");
const { google } = require("googleapis");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const { Readable } = require("stream");
const private_key = require("./constants");

async function loadCertificateTemplate() {
  const templateBytes = fs.readFileSync("TDC.pdf");
  return PDFDocument.load(templateBytes);
}

async function addDetailsToCertificate(template, details) {
  const { email, name, course, date } = details;

  const page = template.getPages()[0]; // Assuming the details are added to the first page

  const { width, height } = page.getSize();

  const bodyFont = await template.embedFont(StandardFonts.HelveticaBold);

  const nameSize = 44;
  const bodySize = 18;
  const bodyColor = rgb(0, 0, 0);
  const nameColor = rgb(1, 0.3, 0.1);

  const bodyX = width / 2;
  const bodyY = height - 200;

  const leftOffset = 100;
  const downOffset = 30;

  const centeredNameX = bodyX - (name.length * nameSize) / 4; // Adjust as needed
  const centeredNameY = bodyY - downOffset;

  const courseText = `For successfully completing the Tutedude ${course}`;
  const courseWidth = bodyFont.widthOfTextAtSize(courseText, bodySize);
  const maxCourseWidth = width - 2 * leftOffset; // Maximum width allowed

  const courseX = Math.max(bodyX - courseWidth / 2, leftOffset); // Centered horizontally with minimum left offset
  const courseY = bodyY - 50 - downOffset;

  page.drawText(name, {
    x: centeredNameX,
    y: centeredNameY,
    size: nameSize,
    font: bodyFont,
    color: nameColor,
    lineHeight: 25,
    textAlign: "center",
  });

  page.drawText(courseText, {
    x: courseX,
    y: courseY,
    size: bodySize,
    font: bodyFont,
    color: bodyColor,
    lineHeight: 25,
    textAlign: "center",
    maxWidth: maxCourseWidth, // Limit the width of the text
  });

  const lastLineText = `course on ${date}.`;
  const lastLineWidth = bodyFont.widthOfTextAtSize(lastLineText, bodySize);
  const lastLineX = Math.max(bodyX - leftOffset + 20, leftOffset);
  const lastLineY = bodyY - 85 - downOffset;

  page.drawText(lastLineText, {
    x: lastLineX,
    y: lastLineY,
    size: bodySize,
    font: bodyFont,
    color: bodyColor,
    lineHeight: 25,
    textAlign: "center",
  });

  return template;
}


async function generateModifiedPDF(template) {
  return template.save();
}

const SCOPE = ["https://www.googleapis.com/auth/drive"];

async function authorize() {
  const jwtClient = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    private_key,
    SCOPE
  );

  await jwtClient.authorize();

  return jwtClient;
}

async function uploadPDFToDrive(authClient, pdfBuffer, name) {
  return new Promise((resolve, reject) => {
    const drive = google.drive({ version: "v3", auth: authClient });

    const fileMetadata = {
      name: `${name}-certificate`,
      parents: [process.env.DRIVE_ID],
      mimeType: "application/pdf",
    };

    const media = {
      mimeType: "application/pdf",
      body: pdfBuffer,
    };

    const mediaStream = new Readable();
    mediaStream.push(pdfBuffer);
    mediaStream.push(null);

    drive.files.create(
      {
        resource: fileMetadata,
        media: { ...media, body: mediaStream },
        fields: "id",
      },
      (err, file) => {
        if (err) {
          console.error("Error uploading PDF to Google Drive:", err);
          reject(err);
        } else {
          resolve(file.data);
        }
      }
    );
  });
}

module.exports = {loadCertificateTemplate, uploadPDFToDrive, authorize, generateModifiedPDF, addDetailsToCertificate}

