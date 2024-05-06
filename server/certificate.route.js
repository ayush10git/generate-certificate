const { Router } = require("express");
const { generateCertificate, getAllCertificates } = require("./certificate.controller");

const router = Router();

router.route("/generate").post(generateCertificate);
router.route("/get").get(getAllCertificates);

module.exports = router;