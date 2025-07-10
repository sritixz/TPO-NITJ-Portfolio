// import { createChallenge, verifySolution } from "altcha-lib";

// export const getCaptchaChallenge = async (req, res) => {
//   try {
//     const challenge = await createChallenge({
//       hmacKey: process.env.ALTCHA_SECRET,
//       maxNumber: 100000,
//     });
//     console.log("Generated Captcha Challenge:", challenge);
//     res.status(200).json(challenge);
//   } catch (err) {
//     console.error("Error generating captcha challenge:", err);
//     res.status(500).json({ error: "Failed to generate captcha challenge" });
//   }
// };

// export const verifyCaptchaSolution = async (req, res) => {
//   const { payload } = req.body;
//   if (!payload) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Captcha payload is missing" });
//   }
//   try {
//     const ok = await verifySolution(payload, process.env.ALTCHA_SECRET);
//     console.log("Captcha verification result:", ok);
//     if (ok) {
//       console.log("Captcha verified");
//       res.status(200).json({ success: true, payload });
//     } else {
//       res.status(400).json({ success: false, message: "Captcha verification failed" });
//     }
//   } catch (err) {
//     console.error("Error verifying captcha solution:", err);
//     res.status(500).json({ success: false, message: "Error verifying captcha solution" });
//   }
// };


import { createCanvas } from "canvas";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();



// Generate a random CAPTCHA string
const generateCaptchaString = (length = 6) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Generate CAPTCHA image
const generateCaptchaImage = (text) => {
  try {
    const canvas = createCanvas(300, 80);
    const ctx = canvas.getContext("2d");

    // Background: light gray
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise: varied lines, rectangles, and circles
    // Thin, semi-transparent lines
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Small rectangles for texture
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.15)`;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        8,
        8
      );
    }

    // Small circles for additional noise
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 5 + 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    // Distorted text: faded color
    ctx.font = "32px Arial"; // Slightly larger for readability
    ctx.fillStyle = "rgba(51, 51, 51, 0.6)"; // Faded dark gray
    for (let i = 0; i < text.length; i++) {
      ctx.save();
      ctx.translate(40 + i * 40, 50); // Adjusted spacing for wider canvas
      ctx.rotate((Math.random() - 0.5) * 0.3); // Reduced rotation for readability
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

    return canvas.toDataURL("image/png");
  } catch (err) {
    console.error("Error generating CAPTCHA image:", err);
    throw new Error("Failed to generate CAPTCHA image");
  }
};

// Endpoint to generate CAPTCHA
 export const generateCaptcha = async (req, res) => {
  try {
    const captchaText = generateCaptchaString();
    const captchaData = {
      text: captchaText,
      expires: Date.now() + 5 * 60 * 1000, 
      attempts: 0,
      maxAttempts: 3,
    };
    const captchaToken = jwt.sign(captchaData, process.env.JWT_SECRET);

    res.cookie("captchaToken", captchaToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 5 * 60 * 1000,
    });

    const captchaImage = generateCaptchaImage(captchaText);
    res.status(200).json({ image: captchaImage });
  } catch (err) {
    console.error("Error generating CAPTCHA:", err);
    res.status(500).json({ success: false, error: "Failed to generate CAPTCHA" });
  }
}

// Endpoint to verify CAPTCHA
export const verifyCaptcha = async (req, res) => {
  const { captchaInput, interactionTime } = req.body;
  const captchaToken = req.cookies.captchaToken;

  if (!captchaInput || !captchaToken) {
    console.error("CAPTCHA input or token missing");
    return res.status(400).json({ success: false, error: "CAPTCHA input or token missing" });
  }

  // Bot detection: reject fast submissions
  // if (interactionTime < 500) {
  //   console.warn("Suspicious interaction detected: too fast");
  //   return res.status(400).json({ success: false, error: "Suspicious interaction" });
  // }

  try {
    const decoded = jwt.verify(captchaToken, process.env.JWT_SECRET);

    if (decoded.expires < Date.now()) {
      res.clearCookie("captchaToken");
      return res.status(400).json({ success: false, error: "CAPTCHA expired" });
    }

    if (decoded.attempts >= decoded.maxAttempts) {
      res.clearCookie("captchaToken");
      return res.status(429).json({ success: false, error: "Too many attempts" });
    }

    // Increment attempts
    decoded.attempts += 1;
    const updatedToken = jwt.sign(decoded, process.env.JWT_SECRET);

    // Update cookie with new token
    res.cookie("captchaToken", updatedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 5 * 60 * 1000,
    });

    if (captchaInput === decoded.text) {
      decoded.verified = true; // Mark as verified
      const finalToken = jwt.sign(decoded, process.env.JWT_SECRET);
      res.cookie("captchaToken", finalToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production"?"None":"Lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 5 * 60 * 1000,
      });
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Invalid CAPTCHA" });
    }
  } catch (err) {
    console.error("Error verifying CAPTCHA:", err);
    res.clearCookie("captchaToken");
    res.status(400).json({ success: false, error: "Invalid or expired token" });
  }
}