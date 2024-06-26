const UserCertificateDetails = require("./certificate.model.js");
const {
  loadCertificateTemplate,
  addDetailsToCertificate,
  generateModifiedPDF,
  authorize,
  uploadPDFToDrive,
  extractFileIdFromUrl,
  deleteFileFromDrive
} = require("./certificate.utils.js");

exports.generateCertificate = async (req, res) => {
  try {
    const details = req.body;

    if (!details) throw new Error("Enter the details");

    const template = await loadCertificateTemplate();

    const modifiedTemplate = await addDetailsToCertificate(template, details);

    const modifiedPDF = await generateModifiedPDF(modifiedTemplate);

    const authClient = await authorize();

    const driveResponse = await uploadPDFToDrive(
      authClient,
      modifiedPDF,
      details.name
    );

    const driveFileId = driveResponse.id;

    const driveUrl = `https://drive.google.com/file/d/${driveFileId}/view?usp=drive_link`;

    const certificateDetails = await UserCertificateDetails.create({
      ...details,
      driveUrl: driveUrl,
    });

    res.status(201).json({
      certificateDetails,
      message: "Certificate generated successfully",
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    res.status(500).json({ message: "Failed to generate certificate" });
  }
};

exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await UserCertificateDetails.find({});

    if (!certificates)
      return res.status(400).json({ message: "No certificates available" });

    res.status(200).json({
      certificates,
      message: "Certificates fetched successfully",
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    res.status(500).json({ message: "Failed to generate certificate" });
  }
};

exports.deleteCertificate = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) return res.status(400).json({ message: "Enter valid id" });

    const certificate = await UserCertificateDetails.findById(id);

    if (!certificate) return res.status(404).json({ message: "Certificate not found" });

    const fileId = extractFileIdFromUrl(certificate.driveUrl);

    const authClient = await authorize();
    await deleteFileFromDrive(authClient, fileId);

    await UserCertificateDetails.findByIdAndDelete(id);

    res.status(200).json({
      message: "Certificate deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    res.status(500).json({ message: "Failed to delete certificate" });
  }
};
