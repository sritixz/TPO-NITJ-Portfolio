import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as fontkit from "fontkit";
import NITJlogo from "../../assets/nitj-logo.png";
import NotoSansDevanagari from "../../assets/fonts/NotoSansDevanagari-Regular.ttf";

let cachedFont = null;
let cachedLogo = null;

const breathe = () => new Promise((resolve) => setTimeout(resolve, 0));

const GenerateNOC = async (noc) => {
  try {
    if (!cachedFont) {
      cachedFont = await fetch(NotoSansDevanagari).then((res) =>
        res.arrayBuffer(),
      );
    }
    if (!cachedLogo) {
      cachedLogo = await fetch(NITJlogo).then((res) => res.arrayBuffer());
    }

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    const englishFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const englishBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const unicodeFont = await pdfDoc.embedFont(cachedFont);
    const logoImage = await pdfDoc.embedPng(cachedLogo);

    const fontSize = 12;
    const margin = 50;
    let y = height - margin;

    const drawLine = (space = 1) => {
      y -= space * 10;
    };

    const drawText = (
      text,
      {
        font = englishFont,
        boldFont = englishBoldFont,
        size = fontSize,
        align = "left",
        lineHeight = 18,
        color = rgb(0, 0, 0),
        wrap = true,
        highlightPhrases = [],
        underlinePhrases = [],
        maxWidth = width - margin * 2,
        y: overrideY,
        x: overrideX,
      } = {},
    ) => {
      if (!text || typeof text !== "string") return;

      const cleanHighlights = [...new Set(highlightPhrases)].filter(
        (p) => typeof p === "string" && p.length > 0,
      );
      const cleanUnderlines = [...new Set(underlinePhrases)].filter(
        (p) => typeof p === "string" && p.length > 0,
      );

      const segments = [];
      let remainingText = text;
      let currentIndex = 0;

      while (remainingText.length > 0) {
        let matchIndex = remainingText.length;
        let matchedPhrase = "";
        let matchedType = "";

        for (const phrase of [...cleanHighlights, ...cleanUnderlines]) {
          const index = remainingText.indexOf(phrase);
          if (index !== -1 && index < matchIndex) {
            matchIndex = index;
            matchedPhrase = phrase;
            matchedType =
              cleanHighlights.includes(phrase) &&
              cleanUnderlines.includes(phrase)
                ? "bold-underline"
                : cleanHighlights.includes(phrase)
                  ? "bold"
                  : "underline";
          }
        }

        if (matchIndex === 0 && matchedPhrase.length > 0) {
          segments.push({
            text: matchedPhrase,
            type: matchedType,
            startIndex: currentIndex,
          });
          currentIndex += matchedPhrase.length;
          remainingText = remainingText.slice(matchedPhrase.length);
        } else {
          const endIndex = matchIndex;
          segments.push({
            text: remainingText.slice(0, endIndex),
            type: "normal",
            startIndex: currentIndex,
          });
          currentIndex += endIndex;
          remainingText = remainingText.slice(endIndex);
        }
      }

      const lines = [];
      let currentLineSegments = [];
      let currentLineWidth = 0;

      for (const segment of segments) {
        const words = segment.text.split(/(\s+)/);
        for (const word of words) {
          if (word === "") continue;
          const isSpace = /^\s+$/.test(word);
          const fontToUse = segment.type.includes("bold") ? boldFont : font;
          const wordWidth = fontToUse.widthOfTextAtSize(word, size);

          if (
            wrap &&
            !isSpace &&
            currentLineWidth + wordWidth > maxWidth &&
            currentLineSegments.length > 0
          ) {
            lines.push(currentLineSegments);
            currentLineSegments = [];
            currentLineWidth = 0;
          }
          currentLineSegments.push({
            text: word,
            font: fontToUse,
            isUnderline: segment.type.includes("underline"),
            isSpace,
            width: wordWidth,
          });
          currentLineWidth += wordWidth;
        }
      }
      if (currentLineSegments.length > 0) lines.push(currentLineSegments);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const yPos = overrideY !== undefined ? overrideY : y;
        const totalTextWidth = line.reduce((acc, w) => acc + w.width, 0);
        const spaceCount = line.filter((w) => w.isSpace).length;
        const shouldJustify =
          align === "justify" && spaceCount > 0 && i !== lines.length - 1;
        const extraSpace = shouldJustify
          ? (maxWidth - totalTextWidth) / spaceCount
          : 0;

        let currentX =
          overrideX !== undefined
            ? overrideX
            : align === "center"
              ? width / 2 - totalTextWidth / 2
              : align === "right"
                ? width - margin - totalTextWidth
                : margin;

        for (const w of line) {
          page.drawText(w.text, {
            x: currentX,
            y: yPos,
            size,
            font: w.font,
            color,
          });
          if (w.isUnderline) {
            page.drawLine({
              start: { x: currentX, y: yPos - 3 },
              end: { x: currentX + w.width, y: yPos - 3 },
              thickness: 1,
              color,
            });
          }
          currentX += w.width + (w.isSpace ? extraSpace : 0);
        }
        if (overrideY === undefined) y -= lineHeight;
      }
    };

    const logoWidth = 70;
    const logoHeight = 70;
    page.drawImage(logoImage, {
      x: margin,
      y: height - margin - logoHeight + 22,
      width: logoWidth,
      height: logoHeight,
    });

    const textMaxWidth = width - margin * 3 - logoWidth;
    // Move header up by about 20px
    const headerY = height - margin - 5;

    drawText("Dr. B.R. Ambedkar National Institute of Technology, Jalandhar", {
      size: 13,
      align: "left",
      font: englishFont,
      boldFont: englishBoldFont,
      highlightPhrases: [
        "Dr. B.R. Ambedkar",
        "National Institute of Technology, Jalandhar",
      ],
      x: margin + logoWidth + 30,
      y: headerY,
    });

    drawText(
      "(An Institute of National Importance under Ministry of Education, Govt. of India)",
      {
        size: 10,
        align: "left",
        maxWidth: textMaxWidth + 40,
        x: margin + logoWidth + 30 + 10,
        y: headerY - 18, // previously -18
      },
    );

    drawText("G T Road, Bye Pass, Jalandhar: 144027 (Punjab) India", {
      size: 10,
      align: "left",
      maxWidth: textMaxWidth,
      x: margin + logoWidth + 30 + 50,
      y: headerY - 36, // previously -36
    });

    // ---- Horizontal line under college header ----
    const lineY = height - margin - 14 - 18 - 18 - 12 - 5;

    // Top thin line
    page.drawLine({
      start: { x: 10, y: lineY },
      end: { x: width - 10, y: lineY },
      thickness: 0.8,
      color: rgb(0, 0, 0),
    });

    // Bottom bold line (3px below)
    page.drawLine({
      start: { x: 10, y: lineY - 3 },
      end: { x: width - 10, y: lineY - 3 },
      thickness: 1.6,
      color: rgb(0, 0, 0),
    });

    await breathe();

    // const isSpecialCase = (noc.course === "B.Tech" && noc.year === "4th") || noc.course === "M.Tech";
    const departmentHeading = `TRAINING & PLACEMENT OFFICE`;
    drawLine(10);
    drawText(departmentHeading, {
      size: 12,
      align: "center",
      boldFont: englishBoldFont,
      underlinePhrases: [departmentHeading],
      highlightPhrases: [departmentHeading],
    });

    drawLine(2);
    const currentY = y;
    drawText(`Reference No. ${noc.nocId || "N/A"}`, {
      size: 12,
      highlightPhrases: ["Reference No."],
      y: currentY,
    });
    drawText(`Date: ${new Date().toLocaleDateString("en-GB")}`, {
      size: 12,
      highlightPhrases: ["Date:"],
      x: width - margin - 150,
      y: currentY,
    });
    y = currentY;
    drawLine(3);

    drawText(
      `Subject: Relieving Letter for joining at ${noc.companyName || "the Organization"}`,
      {
        size: 12,
        boldFont: englishBoldFont,
        highlightPhrases: [noc.companyName, "Subject:"],
      },
    );

    await breathe();
    drawLine();
    drawText("TO WHOMSOEVER, IT MAY CONCERN", {
      align: "center",
      size: 12,
      boldFont: englishBoldFont,
      highlightPhrases: ["TO WHOMSOEVER, IT MAY CONCERN"],
    });
    drawLine();

    const noObjectionText = `The Training & Placement Office, NIT Jalandhar`;
    const forFTE = noc.purpose === "FTE";
    const fromDate = noc.internshipFrom
      ? new Date(noc.internshipFrom).toLocaleDateString("en-GB")
      : "";
    const toDate = noc.internshipTo
      ? new Date(noc.internshipTo).toLocaleDateString("en-GB")
      : "";
    const joiningDate = noc.dateOfJoining
      ? new Date(noc.dateOfJoining).toLocaleDateString("en-GB")
      : "";

    drawText(
      `It is to certify that ${noc.salutation || ""} ${noc.studentName || "Student"}, with Roll No. ${noc.rollNo || ""}, is currently studying in ${noc.course || ""}, ${noc.year || ""} Year, ${noc.semester || ""} Semester, in the Department of ${noc.department || ""} at Dr. B.R. Ambedkar National Institute of Technology, Jalandhar. ${noObjectionText} has no objection and hereby relieves ${noc.studentName || "the student"} to join as ${forFTE ? "Full Time Employee" : "an intern"} at your esteemed organization from ${forFTE ? `${joiningDate}.` : `${fromDate} to ${toDate}, for a duration of ${noc.internshipDuration || "the period specified"}.`}`,
      {
        align: "justify",
        boldFont: englishBoldFont,
        highlightPhrases: [
          noc.salutation,
          noc.studentName,
          noc.rollNo,
          noc.course,
          noc.year,
          noc.semester,
          noc.department,
          noc.companyName,
          fromDate,
          toDate,
          joiningDate,
          noc.internshipDuration,
        ],
      },
    );

    drawLine();
    drawText(
      `This Relieving Letter has been issued upon the student's request to facilitate their joining process. The institute has no objection to the student's engagement for the stated period and purpose, provided they adhere to all academic guidelines.`,
      { align: "justify" },
    );

    await breathe();
    drawLine(2);
    drawText("Best regards,");
    drawLine(6);
    drawText("TRAINING & PLACEMENT OFFICE", {
      size: 12,
      boldFont: englishBoldFont,
      highlightPhrases: ["TRAINING & PLACEMENT OFFICE"],
    });
    // drawText(`${noc.department || "NIT JALANDHAR"}`, { size: 11 });
    drawText("NIT JALANDHAR", { size: 11 });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `Relieving_Letter_${(noc.studentName || "Student").replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  } catch (error) {
    console.error("❌ ERROR:", error);
  }
};

export default GenerateNOC;
