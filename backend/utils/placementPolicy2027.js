import PlacementRegistration from "../models/placement-registration.js";
import OfferTracker from "../models/offertracker.js";


export const BATCH_2027 = "2027";

export const PHASE_I_START = new Date("2026-06-01T00:00:00+05:30");
export const PHASE_I_END = new Date("2026-12-01T23:59:59+05:30");
export const PHASE_II_START = new Date("2026-12-02T00:00:00+05:30");

export const IT_UNCOUNTABLE_CTC = 4.5;
export const CORE_UNCOUNTABLE_CTC = 3.5;
export const MAX_PHASE_I_APPLICATIONS = 50;
export const DREAM_CTC_MULTIPLIER = 1.5;
export const BATCH_PLACED_THRESHOLD = 0.7;
export const CTP_WORKSHOP_THRESHOLD = 80;

export const getPlacementPhase = (date = new Date()) => {
  if (date <= PHASE_I_END) return "I";
  return "II";
};

export const parseCtcForPolicy = (ctc, ctcMin) => {
  const minParsed = parseFloat(ctcMin);
  if (!Number.isNaN(minParsed)) return minParsed;

  const parsed = parseFloat(ctc);
  if (!Number.isNaN(parsed)) return parsed;

  return 0;
};

export const computeIsCountable = (jobCategory, ctcForPolicy, jobSector) => {
  if (jobSector === "PSU") return true;

  const ctc = parseFloat(ctcForPolicy) || 0;
  const isTech =
    jobCategory === "Tech" || jobCategory === "Tech+Non-Tech";
  const threshold = isTech ? IT_UNCOUNTABLE_CTC : CORE_UNCOUNTABLE_CTC;

  return ctc > threshold;
};

export const computeJobClass = (ctc, jobSector) => {
  const parsedCtc = parseFloat(ctc) || 0;

  if (parsedCtc > 20 || jobSector === "PSU") return "A";
  if (parsedCtc > 12 && parsedCtc <= 20) return "B";
  if (parsedCtc > 5 && parsedCtc <= 12) return "C";
  return "D";
};

export const isJobTargetingBatch2027 = (eligibilityCriteria = []) =>
  Array.isArray(eligibilityCriteria) &&
  eligibilityCriteria.some((c) => String(c.eligible_batch) === BATCH_2027);

export const validateInternDurationFor2027 = (
  jobType,
  internshipDuration,
  eligibilityCriteria,
) => {
  if (!isJobTargetingBatch2027(eligibilityCriteria)) return null;

  const internTypes = ["Intern", "Intern+PPO", "Intern+FTE"];
  if (!internTypes.includes(jobType)) return null;

  const duration = String(internshipDuration || "").toLowerCase();
  const isSixMonth =
    duration.includes("6") ||
    internshipDuration === "6m Intern" ||
    internshipDuration === "6";

  if (!isSixMonth) {
    return "For batch 2027, internship-based offers must be 6 months duration";
  }

  return null;
};

export const isOfferCountable = (offer) => {
  if (typeof offer.isCountable === "boolean") return offer.isCountable;
  if (offer.offer_sector === "PSU") return true;

  const ctc = parseFloat(offer.offer_ctc) || 0;
  const category = offer.offer_category || "";
  const isTech =
    category === "Tech" ||
    offer.offer_job_category === "Tech" ||
    offer.offer_job_category === "Tech+Non-Tech";

  const threshold = isTech ? IT_UNCOUNTABLE_CTC : CORE_UNCOUNTABLE_CTC;
  return ctc > threshold;
};

export const getCountableOffers = (offerTracker) =>
  (offerTracker?.offer || []).filter(isOfferCountable);

export const getBatchPlacedPercent = async (batch, course) => {
  const registeredQuery = { batch, interested: true };
  if (course) registeredQuery.course = course;

  const registeredStudents = await PlacementRegistration.find(registeredQuery).select(
    "studentId",
  );
  if (registeredStudents.length === 0) return null;

  let placedCount = 0;
  for (const entry of registeredStudents) {
    const tracker = await OfferTracker.findOne({ studentId: entry.studentId });
    if (getCountableOffers(tracker).length > 0) placedCount++;
  }

  return placedCount / registeredStudents.length;
};

export const countDistinctAppliedCompanies = async (studentId, JobProfile) => {
  const appliedJobs = await JobProfile.find({ Applied_Students: studentId }).select(
    "company_name",
  );
  return new Set(
    appliedJobs.map((j) => j.company_name?.trim()).filter(Boolean),
  ).size;
};

export const buildJobPolicyFields = ({
  job_category,
  job_sector,
  ctc,
  ctcMin,
  isDream = false,
}) => {
  const ctcForPolicy = parseCtcForPolicy(ctc, ctcMin);
  const normalizedSector = job_sector || "Private";
  const isCountable = computeIsCountable(
    job_category,
    ctcForPolicy,
    normalizedSector,
  );
  const normalizedIsDream = normalizedSector === "PSU" || !!isDream;

  return {
    ctcForPolicy,
    isCountable,
    isDream: normalizedIsDream,
    job_class: computeJobClass(ctcForPolicy, normalizedSector),
  };
};

/**
 * Check if a student is in 7th semester based on their current semester field
 * @param {Object} student - Student object with currentSemester field
 * @returns {boolean} True if student is in 7th semester
 */
export const isStudentIn7thSemester = (student) => {
  if (!student) return false;
  const semester = parseInt(student.currentSemester) || 0;
  return semester === 7;
};



/**
 * Check if a 7th semester student can use the Phase I 1.5x early-access policy
 * for dream or non-dream companies.
 * @param {Object} student - Student object with allow7thSem1_5xEarlyAccess field
 * @param {Object} job - Job profile object
 * @returns {boolean} True if student can use the Phase I early-access policy
 */
export const can7thSemApplyInPhaseIWithEarlyAccess = (student, job) => {
  if (!student || !job) return false;

  if (!isStudentIn7thSemester(student)) {
    return false;
  }

  return student.allow7thSem1_5xEarlyAccess ?? false;
};
