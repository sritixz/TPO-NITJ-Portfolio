export const extractDriveFileId = (url) => {
  const match = url.match(/\/d\/([^/]+)/);
  return match ? match[1] : null;
};

export const sanitizeName = (name) =>
  name
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");
