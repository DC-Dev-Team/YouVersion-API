import express, { Router } from "express";

// Router
const router: Router = express.Router();

const status = require("./status");
const verse = require("./verse/verse");
const votd = require("./votd/index");
const versions = require("./versions/index");

router.use("/status", status);
router.use("/verse", verse);
router.use("/votd", votd);
router.use("/versions", versions);

export default router;
