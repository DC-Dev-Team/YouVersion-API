import express, { Request, Response, Router } from "express";
import {
  listAvailableVersions,
  normalizeLanguage,
  toApiError,
} from "../core";

const router: Router = express.Router();

/**
 * @swagger
 * /api/v1/versions:
 *   get:
 *     summary: Lists Bible versions available to this API
 *     tags: [Bible]
 *     parameters:
 *       - in: query
 *         name: language
 *         required: false
 *         description: BCP-47 language range, or * for all accessible languages.
 *         schema:
 *           type: string
 *           default: en
 *     responses:
 *       200:
 *         description: Available Bible versions
 */
router.get("/", async (req: Request, res: Response) => {
  const language = (req.query.language ?? "en").toString();
  const normalized = normalizeLanguage(language, true);

  if (!normalized) {
    return res.status(400).json({
      code: 400,
      message: `Invalid language range '${language}'.`,
    });
  }

  try {
    const versions = await listAvailableVersions(normalized);
    return res.status(200).json({
      language: normalized,
      count: versions.length,
      versions,
    });
  } catch (err) {
    const error = toApiError(err);
    return res.status(error.code).json(error);
  }
});

module.exports = router;
