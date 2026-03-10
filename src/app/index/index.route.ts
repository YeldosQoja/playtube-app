import express from "express";
import { getHomeHandler, getLocalVideoHandler } from "./index.controller.js";

const router = express.Router();

router.get("/home", getHomeHandler);
router.get("/videos/local/:filename", getLocalVideoHandler);

export default router;
