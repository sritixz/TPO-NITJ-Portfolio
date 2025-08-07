import Logs from "../models/logs.js";

export const logMiddleware = async (req, res, next) => {
  try {
    if (req.method !== "GET") {
    const ua = req.useragent;
    console.log(req.ip);
    await Logs.create({
      userId: req.user?.userId || null,
      userType: req.user?.userType || null,
      url: req.originalUrl,
      method: req.method,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      userAgent: req.get("User-Agent"),
      deviceInfo: {
        browser: ua.browser,
        os: ua.os,
        deviceType: ua.isMobile ? "Mobile" : ua.isTablet ? "Tablet" : "Desktop",
      },
    });
}
  } catch (err) {
    console.error("Logging Error:", err.message);
  }
  next();
};

export default logMiddleware;
