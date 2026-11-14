import express, { Request, Response, Router } from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import { getVerse, GetVerseError } from "../core";

// Router
const router: Router = express.Router();

/**
 * @swagger
 * /api/v1/verse:
 *   get:
 *     summary: Gets a verse
 *     description: Gets a verse
 *     tags: [Bible]
 *     parameters:
 *       - in: query
 *         name: book
 *         description: The book
 *         required: true
 *         schema:
 *           type: string
 *           default: JOHN
 *       - in: query
 *         name: chapter
 *         description: The chapter
 *         required: false
 *         schema:
 *           type: string
 *           default: 3
 *       - in: query
 *         name: verses
 *         description: The verses. Can be single e.g. 5, or range, e.g. 5-10, or comma separated. e.g. 5,10.
 *         required: false
 *         schema:
 *           type: string
 *           default: 16-18
 *       - in: query
 *         name: version
 *         required: false
 *         description: For the list of Bible versions available, see <a href="https://www.bible.com/versions">https://www.bible.com/versions</a>
 *         schema:
 *           type: string
 *           default: KJV
 *       - in: query
 *         name: language
 *         required: false
 *         description: BCP-47 language tag used to select and resolve Bible versions (for example en, es, fr, or yo).
 *         schema:
 *           type: string
 *           default: en
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           text/json:
 *             schema:
 *               type: string
 *               example: OK
 */
router.get("/", async (req: Request, res: Response) => {
  let book = req.query.book as string;
  const chapter = (req.query.chapter ??= "1");
  const verses = (req.query.verses ??= "-1" as string);
  const language = (req.query.language ?? "en").toString();
  let version = req.query.version?.toString();

  // Keep the existing English default. For another language, omitting version
  // selects the first Bible returned for that language by YouVersion.
  if (!version && language.toLowerCase().startsWith("en")) {
    version = process.env.DEFAULT_BIBLE_VERSION || "KJV";
  }

  function apiError(code: number, message: string) {
    res.status(code).send({
      code: code,
      message: message,
    });
  }
  if (!book) return apiError(400, "Missing field 'book'");
  if (isNaN(parseInt(chapter.toString())))
    return apiError(400, "Chapter must be a number");
  if (isNaN(parseInt(verses.toString())))
    return apiError(400, "Verses must be a number");
  if (parseInt(chapter.toString()) <= 0)
    return apiError(400, "Chapter must be greater than 0");

  const data = await getVerse(
    book,
    chapter.toString(),
    verses.toString(),
    version,
    language,
  );

  function isGetVerseError(data: any): data is GetVerseError {
    return (
      typeof data === "object" &&
      data !== null &&
      "code" in data &&
      "message" in data
    );
  }

  if (isGetVerseError(data)) {
    return apiError(data.code, data.message);
  } else {
    return res.status(200).json(data);
  }
});

module.exports = router;
