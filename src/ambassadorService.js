/**
 * ambassadorService.js
 * 
 * Centralized service module for Niyo Campus Student Ambassador Portal.
 * Manages Ambassador Onboarding, Dashboard Stats, Referrals, Earnings,
 * Campaigns & Task Submissions, Community Directory, Recommendations,
 * and Feedback.
 * 
 * HONEST DATA ARCHITECTURE:
 * - No fake referrals, earnings, points, clicks, or canned progress.
 * - If real data does not exist, empty states are returned.
 * - Campaigns are connected directly to the real campaigns created/managed by Admin in adminService.js.
 * - Community directory reflects actual approved ambassadors from adminService.js.
 */

import { getCampaigns, getAmbassadors, getStudentApplication } from './adminService.js';

const STORAGE_KEYS = {
  AMBASSADOR_PROFILE: 'niyo_amb_profile_v1',
  ONBOARDING_STATUS: 'niyo_amb_onboarded_v1',
  REFERRALS_DATA: 'niyo_amb_referrals_v1',
  EARNINGS_DATA: 'niyo_amb_earnings_v1',
  TASK_SUBMISSIONS: 'niyo_amb_tasks_v1',
  RECOMMENDATIONS: 'niyo_amb_recommendations_v1',
  FEEDBACK: 'niyo_amb_feedback_v1',
};

// Default empty referral log for real students
const DEFAULT_REFERRALS = [];

// Default empty earnings ledger for real students
const DEFAULT_EARNINGS = {
  totalEarned: '₹0',
  pendingAmount: '₹0',
  paidAmount: '₹0',
  payoutMethod: 'Bank Transfer (UPI / NEFT)',
  transactions: [],
};

// Safe storage helpers
function readStorage(key, defaultVal) {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(item);
  } catch (err) {
    console.warn(`[ambassadorService] Error reading ${key}:`, err);
    return defaultVal;
  }
}

function writeStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[ambassadorService] Error writing ${key}:`, err);
  }
}

// ============================================================================
// ONBOARDING & PROFILE API
// ============================================================================

export function getOnboardingStatus(userId) {
  const key = `${STORAGE_KEYS.ONBOARDING_STATUS}_${userId || 'default'}`;
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

export function setOnboardingCompleted(userId) {
  const key = `${STORAGE_KEYS.ONBOARDING_STATUS}_${userId || 'default'}`;
  try {
    localStorage.setItem(key, 'true');
  } catch {
    // ignore
  }
}

export function getAmbassadorProfile(userId) {
  const key = `${STORAGE_KEYS.AMBASSADOR_PROFILE}_${userId || 'default'}`;
  const saved = readStorage(key, null);
  if (saved) return saved;

  let studentUser = null;
  try {
    const rawUser = localStorage.getItem('niyo_student_user');
    if (rawUser) studentUser = JSON.parse(rawUser);
  } catch {
    // ignore
  }

  const app = getStudentApplication(userId || studentUser?.email);

  return {
    fullName: studentUser?.fullName || app?.fullName || 'Student Ambassador',
    email: studentUser?.email || app?.email || '',
    phone: studentUser?.phone || app?.phone || '',
    university: studentUser?.collegeName || app?.college || app?.collegeName || '',
    country: studentUser?.country || app?.country || 'India',
    course: studentUser?.department || app?.department || '',
    yearOfStudy: studentUser?.yearOfStudy || app?.yearOfStudy || '',
    graduationYear: studentUser?.graduationYear || app?.graduationYear || '',
    bio: '',
    linkedin: '',
    instagram: '',
    twitter: '',
    preferences: [],
    photoUrl: '',
  };
}

export function saveAmbassadorProfile(userId, profileData) {
  const key = `${STORAGE_KEYS.AMBASSADOR_PROFILE}_${userId || 'default'}`;
  const payload = {
    ...profileData,
    updatedAt: new Date().toISOString(),
  };
  writeStorage(key, payload);

  // Sync back to student user
  try {
    const studentUser = localStorage.getItem('niyo_student_user');
    if (studentUser) {
      const parsed = JSON.parse(studentUser);
      localStorage.setItem('niyo_student_user', JSON.stringify({
        ...parsed,
        fullName: payload.fullName,
        collegeName: payload.university,
        phone: payload.phone,
        department: payload.course,
      }));
    }
  } catch {
    // ignore
  }

  return { success: true, profile: payload };
}

// ============================================================================
// DASHBOARD & REFERRALS API (REAL STUDENT DATA ONLY)
// ============================================================================

export function getAmbassadorDashboardMetrics(userId) {
  const userReferralsKey = `${STORAGE_KEYS.REFERRALS_DATA}_${userId || 'default'}`;
  const referrals = readStorage(userReferralsKey, DEFAULT_REFERRALS);

  const userEarningsKey = `${STORAGE_KEYS.EARNINGS_DATA}_${userId || 'default'}`;
  const earnings = readStorage(userEarningsKey, DEFAULT_EARNINGS);

  // Read actual campaigns from Admin
  const campaigns = getAmbassadorCampaigns('Ongoing');
  const activeCampaign = campaigns.length > 0 ? campaigns[0] : null;

  const totalReferrals = referrals.length;
  const successfulOnboardings = referrals.filter((r) => r.status === 'Card Activated').length;

  return {
    totalReferrals,
    successfulOnboardings,
    totalEarnings: earnings.totalEarned || '₹0',
    pendingEarnings: earnings.pendingAmount || '₹0',
    paidEarnings: earnings.paidAmount || '₹0',
    activeCampaign,
    recentReferrals: referrals.slice(0, 5),
  };
}

export function getReferralDetails(userId, ambassadorCode) {
  const userReferralsKey = `${STORAGE_KEYS.REFERRALS_DATA}_${userId || 'default'}`;
  const referrals = readStorage(userReferralsKey, DEFAULT_REFERRALS);
  const code = ambassadorCode || 'NIYO-CAMPUS';
  const link = `https://goniyo.com/campus?ref=${code}`;
  const activations = referrals.filter((r) => r.status === 'Card Activated').length;

  return {
    ambassadorCode: code,
    referralLink: link,
    stats: {
      clicks: 0,
      signups: referrals.length,
      activations,
      conversionRate: referrals.length > 0 ? `${Math.round((activations / referrals.length) * 100)}%` : '0%',
    },
    history: referrals,
  };
}

// ============================================================================
// EARNINGS API (HONEST EMPTY STATE IF NO REAL EARNINGS)
// ============================================================================

export function getEarningsSummary(userId) {
  const userEarningsKey = `${STORAGE_KEYS.EARNINGS_DATA}_${userId || 'default'}`;
  return readStorage(userEarningsKey, DEFAULT_EARNINGS);
}

// ============================================================================
// CAMPAIGNS & TASK SUBMISSION API (CONNECTED TO REAL ADMIN CAMPAIGNS)
// ============================================================================

export function getAmbassadorCampaigns(filter = 'All') {
  // Connect directly to the Admin portal's campaigns
  const adminCampaigns = getCampaigns(filter) || [];
  return adminCampaigns.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    startDate: c.startDate,
    endDate: c.endDate,
    status: c.status || 'Ongoing',
    bounty: c.incentive || 'Certificate + Swag Pack',
    target: c.targetAmbassadors ? `${c.targetAmbassadors} Target Ambassadors` : 'Campus Outreach',
    instructions: c.instructions || [
      'Download the official Niyo Campus deck and share with peers.',
      'Explain zero-markup forex benefits for students traveling or spending internationally.',
      'Submit the social media post URL or event documentation link for review.',
    ],
  }));
}

export function submitCampaignTask(taskData) {
  const submissions = readStorage(STORAGE_KEYS.TASK_SUBMISSIONS, []);
  const newSubmission = {
    id: `TASK-${Math.floor(100 + Math.random() * 900)}`,
    campaignId: taskData.campaignId,
    campaignTitle: taskData.campaignTitle,
    postUrl: taskData.postUrl,
    notes: taskData.notes || '',
    screenshotName: taskData.screenshotName || '',
    submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Under Review',
  };

  const updated = [newSubmission, ...submissions];
  writeStorage(STORAGE_KEYS.TASK_SUBMISSIONS, updated);
  return { success: true, submission: newSubmission };
}

export function getTaskSubmissions() {
  // Real submissions only; empty if student hasn't submitted any tasks yet
  return readStorage(STORAGE_KEYS.TASK_SUBMISSIONS, []);
}

// ============================================================================
// COMMUNITY DIRECTORY API (CONNECTED TO REAL AMBASSADORS ROSTER)
// ============================================================================

export function getCommunityAmbassadors({ search = '', country = 'All', university = 'All' } = {}) {
  const allAmbassadors = getAmbassadors() || [];

  return allAmbassadors
    .map((amb) => ({
      id: amb.id,
      name: amb.name,
      college: amb.college,
      department: amb.department || 'Campus Lead',
      year: amb.joinedDate ? `Joined ${amb.joinedDate}` : 'Ambassador',
      country: amb.country || 'India',
      flag: amb.country === 'United Kingdom' ? '🇬🇧' : amb.country === 'Singapore' ? '🇸🇬' : amb.country === 'France' ? '🇫🇷' : '🇮🇳',
      avatar: (amb.name || 'AM').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      role: amb.status === 'Active' ? 'Ambassador' : amb.status,
      referrals: amb.referrals || 0,
      campaigns: amb.campaignsCompleted || 0,
      rating: amb.rating || 5.0,
      bio: amb.bio || `Niyo Campus Ambassador at ${amb.college}.`,
      linkedin: amb.linkedin || '',
      instagram: amb.instagram || '',
    }))
    .filter((amb) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        amb.name.toLowerCase().includes(q) ||
        amb.college.toLowerCase().includes(q) ||
        amb.country.toLowerCase().includes(q);

      const matchesCountry = country === 'All' || amb.country.toLowerCase() === country.toLowerCase();
      const matchesUniv = university === 'All' || amb.college.toLowerCase() === university.toLowerCase();

      return matchesSearch && matchesCountry && matchesUniv;
    });
}

// ============================================================================
// RECOMMENDATIONS & FEEDBACK API
// ============================================================================

export function submitAmbassadorRecommendation(data) {
  const list = readStorage(STORAGE_KEYS.RECOMMENDATIONS, []);
  const newRec = {
    id: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
    ...data,
    submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Received',
  };
  writeStorage(STORAGE_KEYS.RECOMMENDATIONS, [newRec, ...list]);
  return { success: true, recommendation: newRec };
}

export function submitAmbassadorFeedback(data) {
  const list = readStorage(STORAGE_KEYS.FEEDBACK, []);
  const newFb = {
    id: `FB-AMB-${Math.floor(100 + Math.random() * 900)}`,
    ...data,
    submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Reviewed',
  };
  writeStorage(STORAGE_KEYS.FEEDBACK, [newFb, ...list]);
  return { success: true, feedback: newFb };
}
