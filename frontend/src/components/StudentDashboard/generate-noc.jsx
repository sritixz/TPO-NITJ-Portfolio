import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as fontkit from "fontkit";
import NITJlogo from "../../assets/nitj-logo.png";
import NotoSansDevanagari from "../../assets/fonts/NotoSansDevanagari-Regular.ttf";
const GenerateNOC = async (noc) => {
  const fontBuffer = await fetch(NotoSansDevanagari).then((res) =>
    res.arrayBuffer(),
  );
  const logoBuffer = await fetch(NITJlogo).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();

  const englishFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const englishBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const unicodeFont = await pdfDoc.embedFont(fontBuffer);
  const logoImage = await pdfDoc.embedPng(logoBuffer);
  const fontSize = 12;
  const margin = 50;
  let y = height - margin;

  const drawLine = (space = 1) => {
    y -= space * 10;
  };

  const wrapText = (text, font, fontSize, maxWidth) => {
    const lines = [];
    const paragraphs = text.split("\n");
    paragraphs.forEach((paragraph) => {
      const words = paragraph.split(" ");
      let currentLine = "";
      let currentWidth = 0;

      words.forEach((word, index) => {
        const wordWithSpace = word + (index < words.length - 1 ? " " : "");
        const wordWidth = font.widthOfTextAtSize(wordWithSpace, fontSize);

        if (currentWidth + wordWidth <= maxWidth) {
          currentLine += wordWithSpace;
          currentWidth += wordWidth;
        } else {
          if (currentLine.trim()) lines.push(currentLine.trim());
          currentLine = wordWithSpace;
          currentWidth = wordWidth;
        }
      });

      if (currentLine.trim()) lines.push(currentLine.trim());
    });

    return lines;
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

    // STEP 1: Create segments for the entire text, identifying bold and underline phrases
    const segments = [];
    let remainingText = text;
    let currentIndex = 0;

    while (remainingText.length > 0) {
      let matchIndex = remainingText.length;
      let matchedPhrase = "";
      let matchedType = ""; // 'bold' | 'underline' | 'normal'

      // Check for matching phrases (bold or underline)
      for (const phrase of [...highlightPhrases, ...underlinePhrases]) {
        const index = remainingText.indexOf(phrase);
        if (index !== -1 && index < matchIndex) {
          matchIndex = index;
          matchedPhrase = phrase;
          matchedType =
            highlightPhrases.includes(phrase) &&
            underlinePhrases.includes(phrase)
              ? "bold-underline"
              : highlightPhrases.includes(phrase)
                ? "bold"
                : "underline";
        }
      }

      if (matchIndex === 0) {
        segments.push({
          text: matchedPhrase,
          type: matchedType,
          startIndex: currentIndex,
        });
        currentIndex += matchedPhrase.length;
        remainingText = remainingText.slice(matchedPhrase.length);
      } else {
        const endIndex =
          matchIndex === remainingText.length
            ? remainingText.length
            : matchIndex;
        segments.push({
          text: remainingText.slice(0, endIndex),
          type: "normal",
          startIndex: currentIndex,
        });
        currentIndex += endIndex;
        remainingText = remainingText.slice(endIndex);
      }
    }

    // STEP 2: Split segments into lines while preserving styling
    const lines = [];
    const lineSegments = [];
    let currentLineSegments = [];
    let currentLineWidth = 0;

    for (const segment of segments) {
      const words = segment.text.split(/(\s+)/); // Keep spaces
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

    if (currentLineSegments.length > 0) {
      lines.push(currentLineSegments);
    }

    // STEP 3: Draw each line with proper justification and styling
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

      let x = overrideX !== undefined ? overrideX : margin;
      if (align === "center") {
        x = width / 2 - totalTextWidth / 2;
      } else if (align === "right") {
        x = width - margin - totalTextWidth;
      }

      let currentX = x;
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
            start: { x: currentX, y: yPos - 3 }, // we can change offset of underline from here
            end: { x: currentX + w.width, y: yPos - 3 },
            thickness: 1,
            color,
          });
        }

        currentX += w.width;
        if (shouldJustify && w.isSpace) {
          currentX += extraSpace;
        }
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

  // y = lineY - 25; // reduce spacing so heading comes nicely under line

  const isSpecialCase =
    (noc.course === "B.Tech" && noc.year === "4th") || noc.course === "M.Tech";

  const departmentHeading = isSpecialCase
    ? `TRAINING & PLACEMENT OFFICE`
    : `DEPARTMENT OF ${noc.department}`;

  drawLine(10);
  drawText(departmentHeading, {
    size: 12,
    align: "center",
    font: englishFont,
    boldFont: englishBoldFont,
    underlinePhrases: [departmentHeading],
    highlightPhrases: [departmentHeading],
  });
  drawLine(2);

  const currentY = y;
  drawText(`Reference No. ${noc.nocId}`, {
    font: englishFont,
    size: 12,
    highlightPhrases: ["Reference No."],
    underlinePhrases: [],
    y: currentY,
  });
  drawText("Date:", {
    font: englishFont,
    size: 12,
    highlightPhrases: ["Date:"],
    x: width - margin - 120,
    align: "left",
    y: currentY,
  });
  y = currentY;
  drawLine(3);

  drawText(
    `Subject: No Objection Certificate for Undergoing Internship at ${noc.companyName}`,
    {
      font: englishFont,
      size: 12,
      boldFont: englishBoldFont,
      highlightPhrases: [noc.companyName, "Subject:"],
      underlinePhrases: [],
    },
  );
  drawLine();

  drawText("TO WHOMSOEVER, IT MAY CONCERN", {
    font: englishFont,
    align: "center",
    size: 12,
    boldFont: englishBoldFont,
    highlightPhrases: ["TO WHOMSOEVER, IT MAY CONCERN"],
  });
  drawLine();

  const noObjectionText = isSpecialCase
    ? `The Training & Placement Office & Department of ${noc.department}, NIT Jalandhar`
    : `The Department of ${noc.department}, NIT Jalandhar`;

  const forFTE = noc.purpose && noc.purpose === "FTE";
  drawText(
    `It is to certify that ${noc.salutation} ${noc.studentName}, with Roll No. ${noc.rollNo}, is currently studying in ${noc.course}, ${noc.year} Year, ${noc.semester} Semester, in the Department of ${noc.department} at Dr. B.R. Ambedkar National Institute of Technology, Jalandhar. ${noObjectionText} has no objection if ${noc.studentName} is allowed to undergo ${forFTE ? "Full Time Employment" : "an internship"} at your esteemed organization from ${
      forFTE
        ? `${new Date(noc.dateOfJoining).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}.`
        : `${new Date(noc.internshipFrom).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })} to ${new Date(noc.internshipTo).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}, for a maximum duration of ${noc.internshipDuration}.`
    }`,
    {
      font: englishFont,
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
        new Date(noc.internshipFrom).toLocaleDateString(),
        new Date(noc.internshipTo).toLocaleDateString(),
        noc.internshipDuration,
      ],
      underlinePhrases: [],
    },
  );
  drawLine();

  const joiningLetterPhrase = isSpecialCase ? "the TPO" : "their department";

  const warningText = forFTE
    ? ""
    : "Failure to submit the joining letter will result in non-evaluation of internship/training for credit purposes. The permission is granted on the condition that the student will not seek any relaxation in academic activities due to this internship.";

  drawText(
    `This NOC has been issued upon the student's request and is duly signed and stamped in its original form. It is valid only for the stated period and purpose. Furthermore, this NOC will be considered valid only if the student submits the joining letter to ${joiningLetterPhrase}, within one week of receiving an offer based on this NOC. ${warningText}`,
    { font: englishFont, align: "justify" },
  );

  drawLine(2);

  drawText("Best regards,");
  drawLine(6);

  const colWidth = 165;
  const leftX = margin;
  const centerX = margin + colWidth;
  const rightX = margin + 2 * colWidth;

  if (isSpecialCase) {
    const signatureY = y;

    // IAC Coordinator block
    drawText("IAC Coordinator", {
      font: englishFont,
      boldFont: englishBoldFont,
      highlightPhrases: ["IAC Coordinator"],
      x: leftX,
      y: signatureY,
      size: 11,
    });
    drawText(`${noc.department}`, {
      font: englishFont,
      boldFont: englishBoldFont,
      highlightPhrases: [`${noc.department}`],
      x: leftX,
      y: signatureY - 18,
      size: 11,
    });
    drawText("NIT JALANDHAR", {
      font: englishFont,
      boldFont: englishBoldFont,
      highlightPhrases: ["NIT JALANDHAR"],
      x: leftX,
      y: signatureY - 36,
      size: 11,
    });

    // Signature HEAD OF DEPARTMENT
    drawText("HEAD OF DEPARTMENT", {
      font: englishFont,
      boldFont: englishBoldFont,
      highlightPhrases: ["HEAD OF DEPARTMENT"],
      x: rightX - 40,
      y: signatureY,
      size: 11,
    });
    drawText(`${noc.department}`, {
      font: englishFont,
      boldFont: englishBoldFont,
      highlightPhrases: [`${noc.department}`],
      x: rightX - 40,
      y: signatureY - 18,
      size: 11,
    });
    drawText("NIT JALANDHAR", {
      font: englishFont,
      boldFont: englishBoldFont,
      highlightPhrases: ["NIT JALANDHAR"],
      x: rightX - 40,
      y: signatureY - 36,
      size: 11,
    });

    drawLine(12);
    // Internship Coordinator block
    drawText("Internship Coordinator", {
      font: englishFont,
      boldFont: englishBoldFont,
      highlightPhrases: ["Internship Coordinator"],
      size: 11,
    });
    drawText("Training & Placement Cell", {
      font: englishFont,
      boldFont: englishBoldFont,
      highlightPhrases: ["Training & Placement Cell"],
      size: 11,
    });
    drawText("NIT JALANDHAR", {
      font: englishFont,
      boldFont: englishBoldFont,
      highlightPhrases: ["NIT JALANDHAR"],
      size: 11,
    });
  } else {
    // Original signature
    drawText("HEAD OF DEPARTMENT", {
      font: englishFont,
      boldFont: englishBoldFont,
      highlightPhrases: ["HEAD OF DEPARTMENT"],
      size: 12,
    });
    drawText(`${noc.department}`, {
      font: englishFont,
      boldFont: englishBoldFont,
      highlightPhrases: [`${noc.department}`],
      size: 12,
    });
    drawText("NIT JALANDHAR", {
      font: englishFont,
      boldFont: englishBoldFont,
      highlightPhrases: ["NIT JALANDHAR"],
      size: 12,
    });
  }
  drawLine(6);

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `NOC_${noc.studentName}_${noc.nocId}.pdf`;
  link.click();
};

export default GenerateNOC;
