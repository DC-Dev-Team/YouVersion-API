# YouVersion-API

Express Rest API for getting verses and such from YouVersion.

# Cloning

Because this project uses submodules, you'll need to clone it with the `--recurse` flag.

```bash
git clone --recurse https://github.com/Glowstudent777/YouVersion-API.git && cd YouVersion-API
```

# Building and Running

> **Note**
> I use `pnpm` in these examples. `NPM` will also work if you don't have or want to install `pnpm`

```bash
pnpm i && pnpm run build
```

## YouVersion Platform app key

Verses are fetched from the official [YouVersion Platform API](https://developers.youversion.com), which needs an app key from [platform.youversion.com](https://platform.youversion.com). Set it as `YOU_VERSION_API_KEY`, either in a `.env` file in the project root or in the environment:

```bash
echo "YOU_VERSION_API_KEY=your-app-key" > .env
```

With Docker, pass it at runtime (`docker compose` reads it from your shell or a `.env` next to `docker-compose.yml`):

```bash
docker run -e YOU_VERSION_API_KEY=your-app-key -p 3000:3000 youversion-api
```

Which Bible versions you can use depends on the Bibles enabled for your key; see [Versions](#options-and-queries) below.

## Running

And to run use

```bash
pnpm run start
```

# Making Requests

| Query   | Default | Required | Example     |
| ------- | ------- | -------- | ----------- |
| book    | None    | true     | John or JHN |
| chapter | 1       | false    | 7 or 10     |
| verses  | All     | false    | 16, 1-3 or 1,5-7 |
| version | KJV (`DEFAULT_BIBLE_VERSION`) | false | KJV, BSB or 3034 |

## Examples

Gets all of `John 1 KJV`

```
https://serverAddress.com/api/v1/verse?book=John
```

<br>

Gets `John 3:16 NLT`

```
https://serverAddress.com/api/v1/verse?book=John&chapter=3&verses=16&version=NLT
```

---

## Responses

Requests return a JSON object and a status code.

### Good Responses

A good API call responds with a `200 OK` and the requested verse(s).

```json
{
  "verses": {
    "16": "..."
  },
  "citation": "John 3:16",
  "version": {
    "id": 116,
    "abbreviation": "NLT",
    "title": "...",
    "copyright": "..."
  }
}
```

Requesting a whole chapter (no `verses`) also includes a `title`. Show the `version` abbreviation and `copyright` wherever you display the text; YouVersion's terms require attribution.

<br>

Checking the API status is pretty simple, just make a request to the following route and if everything is fine it'll respond with a `200 OK` and no JSON object.

```
https://serverAddress.com/api/v1/status
```

### Bad Responses

If no book is specified in the query, it will prompt a `400 Bad Response` and an error message

```json
{
  "code": 400,
  "message": "Missing field 'book'"
}
```

<br>

Trying to access a book that does not exist will prompt a similar `400 Bad Response` but with a different error message

```json
{
  "code": 400,
  "message": "Could not find book 'Coffee' by name or alias."
}
```

# Options and Queries

<details>
<summary>Books and Aliases</summary>

| Book              | Alias |
| ----------------- | ----- |
| Genesis           | GEN   |
| Exodus            | EXO   |
| Leviticus         | LEV   |
| Numbers           | NUM   |
| Deuteronomy       | DEU   |
| Joshua            | JOS   |
| Judges            | JDG   |
| Ruth              | RUT   |
| 1st Samuel        | 1SA   |
| 2nd Samuel        | 2SA   |
| 1st Kings         | 1KI   |
| 2nd Kings         | 2KI   |
| 1st Chronicles    | 1CH   |
| 2nd Chronicles    | 2CH   |
| Ezra              | EZR   |
| Nehemiah          | NEH   |
| Esther            | EST   |
| Job               | JOB   |
| Psalms            | PSA   |
| Proverbs          | PRO   |
| Ecclesiastes      | ECC   |
| Song of Songs     | SNG   |
| Isaiah            | ISA   |
| Jeremiah          | JER   |
| Lamentations      | LAM   |
| Ezekiel           | EZK   |
| Daniel            | DAN   |
| Hosea             | HOS   |
| Joel              | JOL   |
| Amos              | AMO   |
| Obadiah           | OBA   |
| Jonah             | JON   |
| Micah             | MIC   |
| Nahum             | NAM   |
| Habakkuk          | HAB   |
| Zephaniah         | ZEP   |
| Haggai            | HAG   |
| Zechariah         | ZEC   |
| Malachi           | MAL   |
| Matthew           | MAT   |
| Mark              | MRK   |
| Luke              | LUK   |
| John              | JHN   |
| Acts              | ACT   |
| Romans            | ROM   |
| 1st Corinthians   | 1CO   |
| 2nd Corinthians   | 2CO   |
| Galatians         | GAL   |
| Ephesians         | EPH   |
| Philippians       | PHP   |
| Colossians        | COL   |
| 1st Thessalonians | 1TH   |
| 2nd Thessalonians | 2TH   |
| 1st Timothy       | 1TI   |
| 2nd Timothy       | 2TI   |
| Titus             | TIT   |
| Philemon          | PHM   |
| Hebrews           | HEB   |
| James             | JAS   |
| 1st Peter         | 1PE   |
| 2nd Peter         | 2PE   |
| 1st John          | 1JN   |
| 2nd John          | 2JN   |
| 3rd John          | 3JN   |
| Jude              | JUD   |
| Revelation        | REV   |

</details>

<details>
<summary>Versions</summary>

`version` accepts an English Bible abbreviation (e.g. `KJV`, `ASV`, `BSB`) or a numeric YouVersion Platform Bible id. Only English Bibles are served, since abbreviations repeat across languages.

**KJV** (the default) is served from a bundled public-domain copy (`src/api/v1/core/src/db/kjv.json`, 66 books, 31,102 verses) because the YouVersion Platform API doesn't offer the English KJV. KJV requests don't call YouVersion and work without an app key.

Other versions come from YouVersion. Which ones work depends on the Bibles enabled for your app key on [platform.youversion.com](https://platform.youversion.com); requesting one that isn't enabled returns a `400` listing the ones that are. To see them directly:

```bash
curl -H "X-YVP-App-Key: $YOU_VERSION_API_KEY" "https://api.youversion.com/v1/bibles?language_ranges[]=en&fields[]=id&fields[]=abbreviation&page_size=*"
```

The default is `KJV`; set `DEFAULT_BIBLE_VERSION` to change it.

</details>
