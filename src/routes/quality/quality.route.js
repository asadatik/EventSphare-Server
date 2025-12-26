
const express = require("express");
const { getAllQuality,getSingleQuality } = require("../../controller/quality/quality.controller");


const router = express.Router();

router.get("/getQuality", getAllQuality);
router.get("/getQuality/:id", getSingleQuality);



module.exports = router;