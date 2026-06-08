export const formatStatusTimestamp = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Build chronological timeline (oldest → newest) for status progression.
 * Uses jobStatusHistory when available; falls back to current jobStatusInfo.
 */
export const buildJobStatusTimeline = (jobStatusInfo, jobStatusHistory = []) => {
  let entries = [];

  if (Array.isArray(jobStatusHistory) && jobStatusHistory.length > 0) {
    entries = jobStatusHistory.map((entry) => ({
      status: entry.status,
      comment: entry.comment || "",
      updatedAt: entry.updatedAt,
    }));
  } else if (jobStatusInfo?.status) {
    entries = [
      {
        status: jobStatusInfo.status,
        comment: jobStatusInfo.comment || "",
        updatedAt: jobStatusInfo.updatedAt,
      },
    ];
  }

  entries.sort(
    (a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0),
  );

  return entries.map((entry, index) => ({
    ...entry,
    step: index + 1,
    previousStatus: index > 0 ? entries[index - 1].status : null,
    isCurrent: index === entries.length - 1,
  }));
};
