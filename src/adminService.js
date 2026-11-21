/**
 * adminService.js
 * 
 * Centralized service module for Niyo Campus Student Ambassador Admin Portal.
 * Manages Applications, Campaigns, Ambassadors, Earnings, and Feedback.
 * 
 * DEMO & MOCK DATA NOTICE:
 * This file currently uses realistic mock data persisted in localStorage
 * so that all admin actions (approvals, rejections, remarks, campaign creation)
 * remain interactive and stateful across page reloads.
 * 
 * SUPABASE INTEGRATION READINESS:
 * Each function below has clear comments outlining the exact Supabase query
 * to replace the mock implementation when the Supabase database tables are created.
 */

// Storage keys
const STORAGE_KEYS = {
  APPLICATIONS: 'niyo_admin_applications_v1',
  CAMPAIGNS: 'niyo_admin_campaigns_v1',
  AMBASSADORS: 'niyo_admin_ambassadors_v1',
  EARNINGS: 'niyo_admin_earnings_v1',
  FEEDBACK: 'niyo_admin_feedback_v1',
};

// Default seed applications
const DEFAULT_APPLICATIONS = [
  {
    id: 'APP-1024',
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@iitd.ac.in',
    phone: '+91 98765 43210',
    college: 'IIT Delhi',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech',
    yearOfStudy: '3rd Year',
    cgpa: '8.8',
    country: 'India',
    linkedin: 'https://linkedin.com/in/aaravsharma-iitd',
    socialLinks: 'https://twitter.com/aarav_dev',
    resume: 'resume_aarav_sharma.pdf',
    motivation: 'I want to bridge financial literacy on campus and help international exchange students navigate forex easily with Niyo Global.',
    campusPresence: 'Head of Student Technical Society; organized hackathon with 800+ student participants.',
    experience: 'Previous campus lead for Google Developer Student Clubs (GDSC).',
    ideas: 'Host a forex & travel masterclass for students planning semester abroad and graduate studies.',
    status: 'Pending',
    submittedAt: 'Nov 20, 2026',
    adminRemarks: '',
  },
  {
    id: 'APP-1023',
    fullName: 'Ananya Mukherjee',
    email: 'ananya.m@bits-pilani.ac.in',
    phone: '+91 98112 34567',
    college: 'BITS Pilani',
    department: 'Economics & Finance',
    degree: 'M.Sc (Tech)',
    yearOfStudy: '4th Year',
    cgpa: '9.2',
    country: 'India',
    linkedin: 'https://linkedin.com/in/ananyamukherjee',
    socialLinks: 'https://instagram.com/ananya.finance',
    resume: 'ananya_resume_2026.pdf',
    motivation: 'Passionate about fintech and personal finance management for college students living independently.',
    campusPresence: 'Vice President of Finance Club BITS; active mentor to junior batches.',
    experience: 'Led marketing activations for annual college cultural festival (Oasis).',
    ideas: 'Distribute zero-markup forex awareness infographics and coordinate airport pickup card activations.',
    status: 'Under Review',
    submittedAt: 'Nov 19, 2026',
    adminRemarks: 'Strong economics background. Good candidate for finance club liaison.',
  },
  {
    id: 'APP-1022',
    fullName: 'Rohan Deshmukh',
    email: 'rohan.d@manipal.edu',
    phone: '+91 97654 32109',
    college: 'Manipal Academy of Higher Education',
    department: 'Business Administration',
    degree: 'BBA',
    yearOfStudy: '2nd Year',
    cgpa: '8.4',
    country: 'India',
    linkedin: 'https://linkedin.com/in/rohan-deshmukh-manipal',
    socialLinks: '',
    resume: 'rohan_cv.pdf',
    motivation: 'Eager to build leadership skills and introduce digital banking perks to freshman students.',
    campusPresence: 'Hostel representative and volunteer coordinator for college sports meet.',
    experience: 'Event coordinator for local student entrepreneurship summit.',
    ideas: 'Orientation week pop-up booth with interactive quiz on student budgeting and savings.',
    status: 'Approved',
    submittedAt: 'Nov 17, 2026',
    adminRemarks: 'Interview completed on Nov 18. Approved for South Campus chapter.',
  },
  {
    id: 'APP-1021',
    fullName: 'Sneha Patel',
    email: 'sneha.patel@nirmauni.ac.in',
    phone: '+91 94231 87654',
    college: 'Nirma University',
    department: 'Information Technology',
    degree: 'B.Tech',
    yearOfStudy: '3rd Year',
    cgpa: '7.9',
    country: 'India',
    linkedin: 'https://linkedin.com/in/snehapatel-tech',
    socialLinks: 'https://github.com/snehapatel',
    resume: 'sneha_patel_resume.pdf',
    motivation: 'Help fellow students manage semester expenses and study abroad preparation fees safely.',
    campusPresence: 'Class representative, active member of Rotaract Youth Club.',
    experience: 'Student social media coordinator for technical symposium.',
    ideas: 'Host weekly Instagram live sessions on smart student banking with student testimonials.',
    status: 'Approved',
    submittedAt: 'Nov 15, 2026',
    adminRemarks: 'Strong digital outreach proposal. Onboarded to social advocacy cell.',
  },
  {
    id: 'APP-1020',
    fullName: 'Kabir Verma',
    email: 'kabir.v@du.ac.in',
    phone: '+91 99100 22334',
    college: 'Delhi University (SRCC)',
    department: 'Commerce',
    degree: 'B.Com (Hons)',
    yearOfStudy: '1st Year',
    cgpa: '8.1',
    country: 'India',
    linkedin: 'https://linkedin.com/in/kabirverma-du',
    socialLinks: '',
    resume: '',
    motivation: 'Looking for campus ambassador certificate and internship credits.',
    campusPresence: 'First-year student, exploring campus societies.',
    experience: 'None so far in college.',
    ideas: 'Send promotional flyers in WhatsApp groups.',
    status: 'Rejected',
    submittedAt: 'Nov 12, 2026',
    adminRemarks: 'Profile lacks prior leadership experience or structured campus plan. Reapply in 2nd year.',
  },
  {
    id: 'APP-1019',
    fullName: 'Fatima Al-Zahra',
    email: 'fatima.z@kcl.ac.uk',
    phone: '+44 7700 900123',
    college: "King's College London",
    department: 'Global Health & Social Medicine',
    degree: 'B.Sc',
    yearOfStudy: '2nd Year',
    cgpa: '3.7/4.0',
    country: 'United Kingdom',
    linkedin: 'https://linkedin.com/in/fatima-kcl',
    socialLinks: 'https://twitter.com/fatima_kcl',
    resume: 'fatima_kcl_cv.pdf',
    motivation: 'Support international Indian and Asian diaspora students studying in London with zero-markup forex solutions.',
    campusPresence: 'President of South Asian Student Society; oversees 450+ student members.',
    experience: 'Student ambassador for international student orientation council.',
    ideas: 'Campus meetups during fresher induction week focusing on international debit card fees comparison.',
    status: 'Pending',
    submittedAt: 'Nov 21, 2026',
    adminRemarks: '',
  },
  {
    id: 'APP-1018',
    fullName: 'David Tan',
    email: 'david.tan@nus.edu.sg',
    phone: '+65 9123 4567',
    college: 'National University of Singapore',
    department: 'Computer Science',
    degree: 'B.Comp',
    yearOfStudy: '3rd Year',
    cgpa: '4.6/5.0',
    country: 'Singapore',
    linkedin: 'https://linkedin.com/in/davidtan-nus',
    socialLinks: 'https://github.com/davidtannus',
    resume: 'david_nus_cv.pdf',
    motivation: 'Advocate for seamless borderless spending solutions across ASEAN student exchange programs.',
    campusPresence: 'NUS Fintech Society committee lead; organized university-wide crypto & banking seminar.',
    experience: 'Previous campus ambassador for global payment gateway.',
    ideas: 'Webinar on cross-border tuition payments and smart multicurrency travel cards.',
    status: 'Under Review',
    submittedAt: 'Nov 18, 2026',
    adminRemarks: 'Very solid fintech society background. High potential for NUS campus pilot.',
  },
];

// Default seed campaigns
const DEFAULT_CAMPAIGNS = [
  {
    id: 'CAMP-201',
    title: 'Fall Campus Orientation Drive 2026',
    description: 'Welcome freshers and introduce smart banking perks, zero-forex benefits, and campus community registration.',
    startDate: '2026-11-01',
    endDate: '2026-12-15',
    status: 'Ongoing',
    targetAmbassadors: 45,
    activeParticipants: 38,
    incentive: 'Exclusive Niyo Campus Kit + Leaderboard Certificate',
  },
  {
    id: 'CAMP-202',
    title: 'Global Study Abroad Awareness Blitz',
    description: 'Empower outbound exchange students with zero-markup forex education, multi-currency accounts, and airport lounge perks.',
    startDate: '2026-12-01',
    endDate: '2027-01-20',
    status: 'Upcoming',
    targetAmbassadors: 30,
    activeParticipants: 12,
    incentive: 'Forex Voucher + Letter of Recommendation for top leads',
  },
  {
    id: 'CAMP-203',
    title: 'Fintech Leadership & Financial Literacy Month',
    description: 'Conduct workshops, budget masterclasses, and peer-to-peer discussions on building early credit and smart savings.',
    startDate: '2026-10-01',
    endDate: '2026-11-15',
    status: 'Completed',
    targetAmbassadors: 50,
    activeParticipants: 50,
    incentive: 'Fintech Excellence Certificate + Amazon Gift Vouchers',
  },
  {
    id: 'CAMP-204',
    title: 'Campus Hackathon & Techfest Sponsorship',
    description: 'Engage engineering college tech fests with developer bounties and smart campus debit privileges.',
    startDate: '2026-11-15',
    endDate: '2026-12-30',
    status: 'Ongoing',
    targetAmbassadors: 25,
    activeParticipants: 22,
    incentive: 'Full Event Sponsorship + Official Niyo Merchandise',
  },
];

// Default seed ambassadors
const DEFAULT_AMBASSADORS = [
  {
    id: 'AMB-01',
    name: 'Rohan Deshmukh',
    email: 'rohan.d@manipal.edu',
    college: 'Manipal Academy of Higher Education',
    country: 'India',
    joinedDate: 'Nov 18, 2026',
    status: 'Active',
    campaignsCompleted: 2,
    rating: 4.8,
  },
  {
    id: 'AMB-02',
    name: 'Sneha Patel',
    email: 'sneha.patel@nirmauni.ac.in',
    college: 'Nirma University',
    country: 'India',
    joinedDate: 'Nov 16, 2026',
    status: 'Active',
    campaignsCompleted: 3,
    rating: 4.9,
  },
  {
    id: 'AMB-03',
    name: 'Aditya Kulkarni',
    email: 'aditya.k@iitm.ac.in',
    college: 'IIT Madras',
    country: 'India',
    joinedDate: 'Oct 05, 2026',
    status: 'Active',
    campaignsCompleted: 5,
    rating: 5.0,
  },
  {
    id: 'AMB-04',
    name: 'Meera Iyer',
    email: 'meera.iyer@christuniversity.in',
    college: 'Christ University Bangalore',
    country: 'India',
    joinedDate: 'Oct 14, 2026',
    status: 'Active',
    campaignsCompleted: 4,
    rating: 4.7,
  },
];

// Default seed feedback
const DEFAULT_FEEDBACK = [
  {
    id: 'FB-01',
    author: 'Sneha Patel',
    role: 'Ambassador',
    college: 'Nirma University',
    category: 'Campaign Materials',
    message: 'The zero-markup forex comparison charts were really helpful during our study abroad seminar. Could we get printed posters for next month?',
    date: 'Nov 20, 2026',
    status: 'Reviewed',
  },
  {
    id: 'FB-02',
    author: 'Rohan Deshmukh',
    role: 'Ambassador',
    college: 'MAHE',
    category: 'Portal UX',
    message: 'The new ambassador task tracking is super smooth. Would love to have a direct leaderboard view to see our campus standing!',
    date: 'Nov 19, 2026',
    status: 'In Progress',
  },
  {
    id: 'FB-03',
    author: 'Priya Sundaram',
    role: 'Student Applicant',
    college: 'SRM Institute',
    category: 'Application Process',
    message: 'Application form step navigation was very intuitive and saved my draft when my internet dropped.',
    date: 'Nov 16, 2026',
    status: 'Reviewed',
  },
];

// Helper to safely read from localStorage
function readStorage(key, defaultData) {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item);
  } catch (err) {
    console.warn(`[adminService] Failed to read ${key} from storage:`, err);
    return defaultData;
  }
}

// Helper to safely write to localStorage
function writeStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[adminService] Failed to write ${key} to storage:`, err);
  }
}

// Check and sync any user-submitted application from student portal
function syncStudentSubmission() {
  try {
    const submittedStr = localStorage.getItem('niyo_submitted_application');
    if (submittedStr) {
      const submitted = JSON.parse(submittedStr);
      const all = readStorage(STORAGE_KEYS.APPLICATIONS, DEFAULT_APPLICATIONS);
      const index = all.findIndex((a) => a.email === submitted.email || (submitted.id && a.id === submitted.id));
      if (index === -1 && submitted.email) {
        const newApp = {
          id: submitted.id || `APP-${Math.floor(1000 + Math.random() * 9000)}`,
          fullName: submitted.fullName || 'Student Applicant',
          email: submitted.email || 'student@university.edu',
          phone: submitted.phone || '+91 90000 00000',
          college: submitted.collegeName || submitted.college || 'University',
          department: submitted.department || 'General',
          degree: submitted.degree || 'Undergraduate',
          yearOfStudy: submitted.currentYear || submitted.yearOfStudy || 'Current',
          cgpa: submitted.cgpaPercentage || submitted.cgpa || '8.0',
          country: submitted.country || 'India',
          linkedin: submitted.linkedin || '',
          socialLinks: submitted.socialLinks || '',
          resume: submitted.resumeUrl || (submitted.resume ? submitted.resume.name || 'resume.pdf' : ''),
          motivation: submitted.whyAmbassador || submitted.motivation || 'Interested in campus ambassador leadership.',
          campusPresence: submitted.communityEventDetails || submitted.campusPresence || 'Active in student societies.',
          experience: submitted.experience || '',
          ideas: submitted.ideas || '',
          status: submitted.status || 'Pending',
          submittedAt: submitted.submittedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          adminRemarks: submitted.adminRemarks || '',
        };
        const updated = [newApp, ...all];
        writeStorage(STORAGE_KEYS.APPLICATIONS, updated);
      }
    }
  } catch (err) {
    console.warn('[adminService] Error syncing student submission:', err);
  }
}

// Run initial sync on load
syncStudentSubmission();

/**
 * Submits a new student application and stores it in the central application pool.
 * Set initial status to 'Pending'.
 * 
 * SUPABASE EQUIVALENT:
 * const { data, error } = await supabase.from('applications').insert([{ ...payload, status: 'Pending' }]).select();
 */
export function submitStudentApplication(formData) {
  const all = readStorage(STORAGE_KEYS.APPLICATIONS, DEFAULT_APPLICATIONS);
  const newId = `APP-${Math.floor(2000 + Math.random() * 8000)}`;
  const submissionDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const newApp = {
    ...formData,
    id: newId,
    college: formData.collegeName || formData.college || 'University',
    yearOfStudy: formData.currentYear || formData.yearOfStudy || 'Current',
    cgpa: formData.cgpaPercentage || formData.cgpa || '8.0',
    motivation: formData.whyAmbassador || formData.motivation || '',
    campusPresence: formData.communityEventDetails || formData.campusPresence || '',
    status: 'Pending',
    submittedAt: submissionDate,
    adminRemarks: '',
  };

  const updated = [newApp, ...all];
  writeStorage(STORAGE_KEYS.APPLICATIONS, updated);
  
  try {
    localStorage.setItem('niyo_submitted_application', JSON.stringify(newApp));
  } catch {
    // ignore
  }

  return { success: true, application: newApp };
}

/**
 * Retrieves the student's submitted application by email or ID from the single source of truth.
 * Ensures the student dashboard reflects real-time status changes made by Admins.
 */
export function getStudentApplication(emailOrId) {
  syncStudentSubmission();
  const all = readStorage(STORAGE_KEYS.APPLICATIONS, DEFAULT_APPLICATIONS);
  if (!emailOrId) return null;

  const cleanKey = String(emailOrId).trim().toLowerCase();
  const found = all.find(
    (a) =>
      (a.email && a.email.toLowerCase() === cleanKey) ||
      (a.id && a.id.toLowerCase() === cleanKey)
  );
  if (found) return found;

  try {
    const local = localStorage.getItem('niyo_submitted_application');
    if (local) {
      const parsed = JSON.parse(local);
      if (
        (parsed.email && parsed.email.toLowerCase() === cleanKey) ||
        (parsed.id && parsed.id.toLowerCase() === cleanKey)
      ) {
        const matched = all.find((a) => a.id === parsed.id || (a.email && a.email.toLowerCase() === cleanKey));
        return matched || parsed;
      }
    }
  } catch {
    // fallback
  }

  return null;
}

// ============================================================================
// APPLICATION MANAGEMENT API / HELPER FUNCTIONS
// ============================================================================

/**
 * Get all applications with optional filtering.
 * 
 * SUPABASE EQUIVALENT:
 * let query = supabase.from('applications').select('*').order('submitted_at', { ascending: false });
 * if (status && status !== 'All') query = query.eq('status', status);
 * if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,college.ilike.%${search}%`);
 * const { data, error } = await query;
 */
export function getApplications({ search = '', status = 'All' } = {}) {
  syncStudentSubmission();
  const all = readStorage(STORAGE_KEYS.APPLICATIONS, DEFAULT_APPLICATIONS);

  return all.filter((app) => {
    const matchesStatus =
      status === 'All' ? true : app.status.toLowerCase() === status.toLowerCase();

    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (app.fullName && app.fullName.toLowerCase().includes(q)) ||
      (app.email && app.email.toLowerCase().includes(q)) ||
      (app.college && app.college.toLowerCase().includes(q)) ||
      (app.id && app.id.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });
}

/**
 * Retrieve single application details by ID.
 * 
 * SUPABASE EQUIVALENT:
 * const { data, error } = await supabase.from('applications').select('*').eq('id', id).single();
 */
export function getApplicationById(id) {
  const all = readStorage(STORAGE_KEYS.APPLICATIONS, DEFAULT_APPLICATIONS);
  return all.find((app) => app.id === id) || null;
}

/**
 * Update application status (Approve, Reject, Under Review, Pending) and save remarks.
 * 
 * SUPABASE EQUIVALENT:
 * const { data, error } = await supabase
 *   .from('applications')
 *   .update({ status: newStatus, admin_remarks: remarks, updated_at: new Date().toISOString() })
 *   .eq('id', id)
 *   .select();
 */
export function updateApplicationStatus(id, newStatus, remarks = '') {
  const all = readStorage(STORAGE_KEYS.APPLICATIONS, DEFAULT_APPLICATIONS);
  let updatedApp = null;

  const nextList = all.map((app) => {
    if (app.id === id) {
      updatedApp = {
        ...app,
        status: newStatus,
        adminRemarks: remarks !== undefined ? remarks : app.adminRemarks,
        updatedAt: new Date().toISOString(),
      };
      return updatedApp;
    }
    return app;
  });

  writeStorage(STORAGE_KEYS.APPLICATIONS, nextList);

  // If approved, also ensure ambassador record is added/updated
  if (newStatus === 'Approved' && updatedApp) {
    syncAmbassadorOnApproval(updatedApp);
  }

  // Also sync back to student user dashboard if this was their application
  try {
    const studentApp = localStorage.getItem('niyo_submitted_application');
    if (studentApp) {
      const parsed = JSON.parse(studentApp);
      if (
        (parsed.email && updatedApp?.email && parsed.email.toLowerCase() === updatedApp.email.toLowerCase()) ||
        parsed.id === updatedApp?.id
      ) {
        localStorage.setItem(
          'niyo_submitted_application',
          JSON.stringify({ ...parsed, status: newStatus, adminRemarks: remarks })
        );
      }
    }
  } catch {
    // ignore
  }

  // Dispatch custom window event so Student Dashboard reacts immediately
  try {
    window.dispatchEvent(new CustomEvent('niyo_application_status_changed', { detail: updatedApp }));
  } catch {
    // ignore
  }

  return { success: true, application: updatedApp };
}

/**
 * Batch update application status for selected IDs.
 * 
 * SUPABASE EQUIVALENT:
 * const { data, error } = await supabase
 *   .from('applications')
 *   .update({ status: newStatus })
 *   .in('id', ids);
 */
export function batchUpdateApplicationStatus(ids = [], newStatus) {
  if (!ids.length) return { success: false, count: 0 };
  const all = readStorage(STORAGE_KEYS.APPLICATIONS, DEFAULT_APPLICATIONS);

  const nextList = all.map((app) => {
    if (ids.includes(app.id)) {
      return {
        ...app,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return app;
  });

  writeStorage(STORAGE_KEYS.APPLICATIONS, nextList);
  return { success: true, count: ids.length };
}

/**
 * Save or update admin remarks for an application.
 * 
 * SUPABASE EQUIVALENT:
 * const { data, error } = await supabase.from('applications').update({ admin_remarks: remarks }).eq('id', id);
 */
export function saveApplicationRemarks(id, remarks) {
  const all = readStorage(STORAGE_KEYS.APPLICATIONS, DEFAULT_APPLICATIONS);
  const nextList = all.map((app) => {
    if (app.id === id) {
      return { ...app, adminRemarks: remarks };
    }
    return app;
  });
  writeStorage(STORAGE_KEYS.APPLICATIONS, nextList);
  return { success: true };
}

// Automatically add to Ambassadors roster when an application is Approved
function syncAmbassadorOnApproval(app) {
  const ambassadors = readStorage(STORAGE_KEYS.AMBASSADORS, DEFAULT_AMBASSADORS);
  const exists = ambassadors.some((amb) => amb.email === app.email);
  if (!exists) {
    const newAmb = {
      id: `AMB-0${ambassadors.length + 1}`,
      name: app.fullName,
      email: app.email,
      college: app.college,
      country: app.country || 'India',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active',
      campaignsCompleted: 0,
      rating: 5.0,
    };
    writeStorage(STORAGE_KEYS.AMBASSADORS, [newAmb, ...ambassadors]);
  }
}

// ============================================================================
// CAMPAIGN MANAGEMENT API / HELPER FUNCTIONS
// ============================================================================

/**
 * Retrieve campaigns with optional status filter.
 * 
 * SUPABASE EQUIVALENT:
 * let query = supabase.from('campaigns').select('*').order('start_date', { ascending: false });
 * if (status && status !== 'All') query = query.eq('status', status);
 * const { data, error } = await query;
 */
export function getCampaigns(status = 'All') {
  const all = readStorage(STORAGE_KEYS.CAMPAIGNS, DEFAULT_CAMPAIGNS);
  if (!status || status === 'All') return all;
  return all.filter((c) => c.status.toLowerCase() === status.toLowerCase());
}

/**
 * Create a new campaign.
 * 
 * SUPABASE EQUIVALENT:
 * const { data, error } = await supabase.from('campaigns').insert([campaignData]).select();
 */
export function createCampaign(campaignData) {
  const all = readStorage(STORAGE_KEYS.CAMPAIGNS, DEFAULT_CAMPAIGNS);
  const newCampaign = {
    id: `CAMP-${Math.floor(200 + all.length + 1)}`,
    title: campaignData.title.trim(),
    description: campaignData.description.trim(),
    startDate: campaignData.startDate,
    endDate: campaignData.endDate,
    status: campaignData.status || 'Upcoming',
    targetAmbassadors: parseInt(campaignData.targetAmbassadors, 10) || 30,
    activeParticipants: 0,
    incentive: campaignData.incentive?.trim() || 'Certificate + Swag Pack',
    createdAt: new Date().toISOString(),
  };

  const updated = [newCampaign, ...all];
  writeStorage(STORAGE_KEYS.CAMPAIGNS, updated);
  return { success: true, campaign: newCampaign };
}

/**
 * Update an existing campaign.
 * 
 * SUPABASE EQUIVALENT:
 * const { data, error } = await supabase.from('campaigns').update(campaignData).eq('id', id).select();
 */
export function updateCampaign(id, campaignData) {
  const all = readStorage(STORAGE_KEYS.CAMPAIGNS, DEFAULT_CAMPAIGNS);
  let updatedCampaign = null;

  const nextList = all.map((c) => {
    if (c.id === id) {
      updatedCampaign = { ...c, ...campaignData };
      return updatedCampaign;
    }
    return c;
  });

  writeStorage(STORAGE_KEYS.CAMPAIGNS, nextList);
  return { success: true, campaign: updatedCampaign };
}

/**
 * Delete a campaign.
 * 
 * SUPABASE EQUIVALENT:
 * const { error } = await supabase.from('campaigns').delete().eq('id', id);
 */
export function deleteCampaign(id) {
  const all = readStorage(STORAGE_KEYS.CAMPAIGNS, DEFAULT_CAMPAIGNS);
  const nextList = all.filter((c) => c.id !== id);
  writeStorage(STORAGE_KEYS.CAMPAIGNS, nextList);
  return { success: true };
}

// ============================================================================
// AMBASSADORS, EARNINGS, FEEDBACK API
// ============================================================================

export function getAmbassadors() {
  return readStorage(STORAGE_KEYS.AMBASSADORS, DEFAULT_AMBASSADORS);
}

export function getEarningsSummary() {
  return {
    totalDisbursed: '₹3,45,000',
    pendingPayouts: '₹42,500',
    avgPerAmbassador: '₹8,625',
    activeEarners: 40,
    recentPayouts: [
      { id: 'PAY-891', ambassador: 'Aditya Kulkarni', college: 'IIT Madras', amount: '₹12,500', date: 'Nov 18, 2026', status: 'Completed' },
      { id: 'PAY-890', ambassador: 'Sneha Patel', college: 'Nirma University', amount: '₹8,000', date: 'Nov 16, 2026', status: 'Completed' },
      { id: 'PAY-889', ambassador: 'Meera Iyer', college: 'Christ University', amount: '₹9,500', date: 'Nov 14, 2026', status: 'Completed' },
      { id: 'PAY-888', ambassador: 'Rohan Deshmukh', college: 'MAHE', amount: '₹4,500', date: 'Nov 10, 2026', status: 'Processing' },
    ],
  };
}

export function getFeedbackList() {
  return readStorage(STORAGE_KEYS.FEEDBACK, DEFAULT_FEEDBACK);
}

// ============================================================================
// DASHBOARD METRICS SUMMARY API
// ============================================================================

/**
 * Calculate metrics for summary cards and chart rendering.
 * 
 * SUPABASE EQUIVALENT:
 * const { count: total } = await supabase.from('applications').select('*', { count: 'exact', head: true });
 * const { count: pending } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'Pending');
 * const { count: approved } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'Approved');
 * const { count: rejected } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'Rejected');
 */
export function getDashboardMetrics() {
  const applications = readStorage(STORAGE_KEYS.APPLICATIONS, DEFAULT_APPLICATIONS);
  const campaigns = readStorage(STORAGE_KEYS.CAMPAIGNS, DEFAULT_CAMPAIGNS);

  const total = applications.length;
  const pending = applications.filter((a) => a.status === 'Pending').length;
  const underReview = applications.filter((a) => a.status === 'Under Review').length;
  const approved = applications.filter((a) => a.status === 'Approved').length;
  const rejected = applications.filter((a) => a.status === 'Rejected').length;

  // Monthly trends for Applications Over Time chart
  const applicationsOverTime = [
    { month: 'Jun', count: 18, approved: 12 },
    { month: 'Jul', count: 32, approved: 20 },
    { month: 'Aug', count: 54, approved: 35 },
    { month: 'Sep', count: 76, approved: 48 },
    { month: 'Oct', count: 98, approved: 64 },
    { month: 'Nov', count: Math.max(115, total * 8), approved: Math.max(72, approved * 6) },
  ];

  return {
    total,
    pending,
    underReview,
    approved,
    rejected,
    approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    recentApplications: applications.slice(0, 5),
    recentCampaigns: campaigns.slice(0, 4),
    applicationsOverTime,
  };
}

/**
 * Reset demo data back to default initial seed.
 */
export function resetDemoData() {
  writeStorage(STORAGE_KEYS.APPLICATIONS, DEFAULT_APPLICATIONS);
  writeStorage(STORAGE_KEYS.CAMPAIGNS, DEFAULT_CAMPAIGNS);
  writeStorage(STORAGE_KEYS.AMBASSADORS, DEFAULT_AMBASSADORS);
  writeStorage(STORAGE_KEYS.FEEDBACK, DEFAULT_FEEDBACK);
  return { success: true };
}
