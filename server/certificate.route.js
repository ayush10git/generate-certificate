const { Router } = require("express");
const { generateCertificate, getAllCertificates, deleteCertificate } = require("./certificate.controller");

const router = Router();

router.route("/generate").post(generateCertificate);
router.route("/get").get(getAllCertificates);
router.route("/delete/:id").delete(deleteCertificate);

module.exports = router;