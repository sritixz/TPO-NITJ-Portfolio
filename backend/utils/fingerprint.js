import crypto from 'crypto';
import FingerprintTracker from "../models/fingerprinttracker.js"
export const generateFingerprint = (req) => {
  const headers = req.headers;
  const data = {
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    userAgent: headers['user-agent'] || '',
    accept: headers['accept'] || '',
    language: headers['accept-language'] || '',
    encoding: headers['accept-encoding'] || '',
    connection: headers['connection'] || '',
    dnt: headers['dnt'] || '',
    deviceMemory: headers['device-memory'] || '',
    viewportWidth: headers['x-viewport-width'] || '',
    viewportHeight: headers['x-viewport-height'] || '',
    timezone: headers['x-timezone'] || '',
    screenRes: headers['x-screen-resolution'] || '',
    platform: headers['x-platform'] || '',
    cores: headers['x-hardware-concurrency'] || '',
  };
  const rawFingerprint = Object.values(data).join('||');
  console.log("Raw Fingerprint Data:", rawFingerprint);
  const hash = crypto.createHash('sha256').update(rawFingerprint).digest('hex');
  return hash;
};

// Middleware: attach fingerprint
export const attachFingerprint = async (req, res, next) => {
  const fp = generateFingerprint(req);
  req.fingerprint = fp;
  next();
};

export const limitFingerprint = async (req, res, next) => {
  try {
    const fingerprint = req.fingerprint;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Find or create fingerprint tracking entry
    const trackingEntry = await FingerprintTracker.findOneAndUpdate(
      { fingerprint },
      { 
        $inc: { requestCount: 1 },
        $set: { ip, timestamp: new Date() }
      },
      { 
        upsert: true,
        new: true,
        setDefaultsOnInsert: true 
      }
    );

    // Define rate limit (e.g., 100 requests per 5 minutes)
    const MAX_REQUESTS = 5;
    const TIME_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Check if request count exceeds limit
    if (trackingEntry.requestCount > MAX_REQUESTS) {
      console.warn(`Rate limit exceeded for fingerprint: ${fingerprint}`);
      console.warn(`Request count: ${trackingEntry.requestCount}, IP: ${ip}`);
      // Calculate time since first request in this window
      const timeDiff = new Date() - new Date(trackingEntry.timestamp);
      
      if (timeDiff <= TIME_WINDOW) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.'
        });
      } else {
        // Reset count if time window has passed
        await FingerprintTracker.updateOne(
          { fingerprint },
          { $set: { requestCount: 1, timestamp: new Date() } }
        );
      }
    }

    next();
  } catch (error) {
    console.error('Fingerprint rate limiting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};