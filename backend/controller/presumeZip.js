import xlsx from "xlsx";
import axios from "axios";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { extractDriveFileId, sanitizeName } from "../utils/drive.js";

const CONCURRENCY = 5;

// ---------- HELPERS ----------
const normalizeRowKeys = (row) => {
  const normalized = {};
  Object.keys(row).forEach((key) => {
    normalized[key.toLowerCase().trim()] = row[key];
  });
  return normalized;
};

const safeCleanup = (paths = []) => {
  paths.forEach((p) => {
    try {
      if (fs.existsSync(p)) {
        fs.rmSync(p, { recursive: true, force: true });
      }
    } catch (_) {}
  });
};

const downloadResume = async ({
  fileBaseName,
  resumeLink,
  rowIndex,
  tempDir,
}) => {
  const fileId = extractDriveFileId(resumeLink);
  if (!fileId) {
    throw `Row ${rowIndex}: Invalid Drive link`;
  }

  const filePath = path.join(tempDir, `${fileBaseName}.pdf`);
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

  const response = await axios({
    url: downloadUrl,
    method: "GET",
    responseType: "stream",
    timeout: 20000,
  });

  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

// ---------- CONTROLLER ----------
export const generateResumeZip = async (req, res) => {
  const { companyName, nameColumn, resumeColumn } = req.body;

  if (!companyName) {
    return res.status(400).json({ error: "Company name required" });
  }

  if (!resumeColumn) {
    return res.status(400).json({ error: "Resume column name required" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "Excel file required" });
  }

  const excelPath = req.file.path;
  const tempDir = path.join("temp", Date.now().toString());
  const zipDir = path.join("zips");
  const zipPath = path.join(zipDir, `${companyName}_Resume.zip`);

  fs.mkdirSync(tempDir, { recursive: true });
  fs.mkdirSync(zipDir, { recursive: true });

  try {
    // ---------- READ EXCEL ----------
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = xlsx.utils.sheet_to_json(sheet);

    if (!rawRows.length) {
      return res.status(400).json({ error: "Excel is empty" });
    }

    const failed = [];
    let success = 0;
    let resumeCounter = 1;
    const nameCount = {};
    const tasks = [];

    const nameKey = nameColumn?.toLowerCase().trim();
    const resumeKey = resumeColumn.toLowerCase().trim();

    rawRows.forEach((rawRow, index) => {
      const row = normalizeRowKeys(rawRow);

      const resumeLink = row[resumeKey];
      if (!resumeLink) {
        failed.push(`Row ${index + 2}: Resume link missing`);
        return;
      }

      const rawName = nameKey ? row[nameKey] : null;
      let baseName;

      if (rawName) {
        const safeName = sanitizeName(rawName);
        nameCount[safeName] = (nameCount[safeName] || 0) + 1;

        baseName =
          nameCount[safeName] > 1
            ? `${safeName}_${nameCount[safeName]}`
            : safeName;
      } else {
        baseName = `Resume_${resumeCounter++}`;
      }

      tasks.push(async () => {
        try {
          await downloadResume({
            fileBaseName: baseName,
            resumeLink,
            rowIndex: index + 2,
            tempDir,
          });
          success++;
        } catch (err) {
          failed.push(err || `Row ${index + 2}: Download failed`);
        }
      });
    });

    // ---------- PARALLEL BATCH EXECUTION ----------
    for (let i = 0; i < tasks.length; i += CONCURRENCY) {
      const batch = tasks.slice(i, i + CONCURRENCY);
      await Promise.all(batch.map((task) => task()));
    }

    // ---------- ZIP CREATION ----------
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);
    archive.directory(tempDir, false);
    await archive.finalize();

    output.on("close", () => {
      res.download(zipPath, (err) => {
        safeCleanup([tempDir, excelPath]);
        if (!err) safeCleanup([zipPath]);
      });
    });

    res.on("close", () => {
      safeCleanup([tempDir, excelPath]);
    });
  } catch (err) {
    console.error(err);
    safeCleanup([tempDir, excelPath]);
    res.status(500).json({ error: "Internal server error" });
  }
};
