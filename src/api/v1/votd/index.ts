import express, { Request, Response, Router } from "express";
import { getVotd } from "../core";
import { apiCache, getVotdExpireTime, setToCache } from "../../../cache";

// Router
const router: Router = express.Router();

/**
 * @swagger
 * /api/v1/votd:
 *   get:
 *     summary: Verse of the day
 *     tags: [Bible]
 *     parameters:
 *       - name: lang
 *         in: query
 *         required: false
 *         description: |
 *              Language code for the verse of the day (e.g., sk, en, fr, de). Defaults to 'en' if not provided.
 *              You can provide list of comma separated languages. First found language is returned.
 *         schema:
 *           type: string
 *           example: sk,en,de
 *       - name: version
 *         in: query
 *         required: false
 *         description: Bible version (e.g. KJV, ASV or a numeric id). Overrides lang. Defaults to KJV when lang is not given.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: OK
 */
router.get("/", async (req: Request, res: Response) => {
  const lang = (req.query.lang as string) || "en";
  // Without lang or version, use the same default Bible as /verse.
  const version =
    (req.query.version as string | undefined) ??
    (req.query.lang ? undefined : process.env.DEFAULT_BIBLE_VERSION || "KJV");
  const cacheKey = `votd:${lang}:${version ?? ""}`;

  try {
    const cached = apiCache.get(cacheKey) as string | null;
    if (cached) {
      if (process.env.NODE_ENV === "development")
        console.log("Verse of the day fetched from Memory");
      return res.status(200).send(JSON.parse(cached));
    }

    const data = await getVotd(lang, version);
    if (!data)
      return res
        .status(404)
        .send({ code: 404, message: `No Bible available for '${lang}'.` });

    setToCache(cacheKey, JSON.stringify(data), getVotdExpireTime());

    if (process.env.NODE_ENV === "development")
      console.log("Verse of the day fetched from API");
    return res.status(200).send(data);
  } catch (err: Error | any) {
    console.error("Error getting verse of the day:", err);
    if (err?.status === 400)
      return res.status(400).send({ code: 400, message: err.message });
    return res
      .status(502)
      .send({ code: 502, message: "Error getting verse of the day." });
  }
});

module.exports = router;
