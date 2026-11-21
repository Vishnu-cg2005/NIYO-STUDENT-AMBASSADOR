import React, { useState, useEffect } from 'react';
import {
  FiGrid,
  FiShare2,
  FiAward,
  FiUsers,
  FiZap,
  FiUserPlus,
  FiMessageSquare,
  FiUser,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiCopy,
  FiCheck,
  FiDownload,
  FiSearch,
  FiFilter,
  FiAlertCircle,
  FiExternalLink,
  FiArrowRight,
  FiArrowLeft,
  FiMenu,
  FiX,
  FiBell,
  FiStar,
  FiUploadCloud,
  FiSend,
  FiRefreshCw,
  FiTrash2,
  FiHelpCircle,
  FiCpu,
  FiCheckSquare,
} from 'react-icons/fi';
import { BsMegaphone, BsQrCode } from 'react-icons/bs';
import {
  getOnboardingStatus,
  setOnboardingCompleted,
  getAmbassadorProfile,
  saveAmbassadorProfile,
  getAmbassadorDashboardMetrics,
  getReferralDetails,
  getEarningsSummary,
  getAmbassadorCampaigns,
  submitCampaignTask,
  getTaskSubmissions,
  getCommunityAmbassadors,
  submitAmbassadorRecommendation,
  submitAmbassadorFeedback,
} from './ambassadorService';
import {
  getAiAssistantStatus,
  sendChatMessage,
  generateSocialMediaContent,
  askNiyoFaqAssistant,
  categorizeFeedbackText,
} from './aiService';

export default function AmbassadorPortal({
  currentUser,
  onNavigateHome,
  onNavigateDashboard,
}) {
  const userId = currentUser?.id || 'current_ambassador';

  // Onboarding state
  const [isOnboarded, setIsOnboarded] = useState(() => getOnboardingStatus(userId));
  const [onboardingStep, setOnboardingStep] = useState(1); // 1: Welcome, 2: Setup Profile, 3: Get Started

  // Portal view state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Profile state
  const [profile, setProfile] = useState(() => getAmbassadorProfile(userId));
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(profile?.photoUrl || '');
  const [profileErrors, setProfileErrors] = useState({});

  // Dashboard & Metrics state
  const [dashboardMetrics, setDashboardMetrics] = useState(() => getAmbassadorDashboardMetrics(userId));

  // Referrals state
  const ambassadorCode = `NIYO-${(profile?.fullName || 'CAMPUS').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase()}2026`;
  const [referralData, setReferralData] = useState(() => getReferralDetails(userId, ambassadorCode));
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Earnings state
  const [earnings, setEarnings] = useState(() => getEarningsSummary(userId));

  // Campaigns state
  const [campaignFilter, setCampaignFilter] = useState('All');
  const [campaigns, setCampaigns] = useState(() => getAmbassadorCampaigns('All'));
  const [selectedCampaignForTask, setSelectedCampaignForTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ postUrl: '', notes: '', screenshotName: '' });
  const [taskSubmissions, setTaskSubmissions] = useState(() => getTaskSubmissions());

  // Community state
  const [commSearch, setCommSearch] = useState('');
  const [commCountry, setCommCountry] = useState('All');
  const [communityList, setCommunityList] = useState(() => getCommunityAmbassadors());

  // Recommendation state
  const [recForm, setRecForm] = useState({ name: '', email: '', university: '', country: 'India', reason: '' });
  const [recErrors, setRecErrors] = useState({});
  const [recSubmitted, setRecSubmitted] = useState(false);

  // Feedback state
  const [fbForm, setFbForm] = useState({ category: 'Platform Experience', rating: 5, text: '' });
  const [fbSubmitted, setFbSubmitted] = useState(false);
  const [fbCategorizing, setFbCategorizing] = useState(false);
  const [fbAiResult, setFbAiResult] = useState(null);

  // AI Assistant suite state (Real NVIDIA NIM integration)
  const [aiSection, setAiSection] = useState('chat'); // 'chat' | 'social' | 'faq'
  const [aiServiceStatus, setAiServiceStatus] = useState(null);

  // 1. Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "👋 Hi there! I'm your Niyo Campus AI Growth Assistant powered by NVIDIA NIM. How can I help you accelerate your student outreach, plan campus booths, or craft promotional copy today?",
      timestamp: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [lastFailedChat, setLastFailedChat] = useState(null);

  // 2. Social Media Content State
  const [socialTopic, setSocialTopic] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('Instagram');
  const [socialTone, setSocialTone] = useState('Engaging & Friendly');
  const [socialLanguage, setSocialLanguage] = useState('English');
  const [socialContentType, setSocialContentType] = useState('Full Post');
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialError, setSocialError] = useState(null);
  const [socialOutput, setSocialOutput] = useState('');
  const [copiedSocial, setCopiedSocial] = useState(false);

  // 3. FAQ Assistant State
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqList, setFaqList] = useState([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqError, setFaqError] = useState(null);

  // Notification state
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState(() => [
    { id: 1, title: 'Ambassador Application Approved', text: 'Welcome to Niyo Campus! Your ambassador portal is now active.', time: 'Just now', unread: true },
  ]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3500);
  };

  useEffect(() => {
    setCampaigns(getAmbassadorCampaigns(campaignFilter));
  }, [campaignFilter]);

  useEffect(() => {
    setCommunityList(getCommunityAmbassadors({ search: commSearch, country: commCountry }));
  }, [commSearch, commCountry]);

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePhotoPreview(url);
      setProfile((prev) => ({ ...prev, photoUrl: url }));
      triggerToast('Profile photo updated.');
    }
  };

  // Profile Save
  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    if (!profile.fullName?.trim()) {
      setProfileErrors({ fullName: 'Full name is required.' });
      return;
    }
    setProfileErrors({});
    saveAmbassadorProfile(userId, profile);
    triggerToast('Ambassador profile saved successfully.');
  };

  // Copy helpers
  const handleCopy = (text, type) => {
    try {
      navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else if (type === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else if (type === 'ai') {
        setCopiedAi(true);
        setTimeout(() => setCopiedAi(false), 2000);
      }
      triggerToast('Copied to clipboard!');
    } catch {
      // fallback
    }
  };

  // Task Submission Handler
  const handleSubmitTask = (e) => {
    e.preventDefault();
    if (!taskForm.postUrl.trim()) {
      triggerToast('Please provide a valid post or submission link.');
      return;
    }

    const res = submitCampaignTask({
      campaignId: selectedCampaignForTask?.id || 'CAMP-AMB-101',
      campaignTitle: selectedCampaignForTask?.title || 'Campus Campaign',
      postUrl: taskForm.postUrl.trim(),
      notes: taskForm.notes,
      screenshotName: taskForm.screenshotName || 'submission_screenshot.png',
    });

    setTaskSubmissions(getTaskSubmissions());
    setTaskModalOpen(false);
    setTaskForm({ postUrl: '', notes: '', screenshotName: '' });
    triggerToast('Task submitted for review! Bounty verification in progress.');
  };

  // Recommendation Submission Handler
  const handleRecommendSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!recForm.name.trim()) errs.name = 'Candidate name is required.';
    if (!recForm.email.trim()) errs.email = 'Candidate email is required.';
    if (!recForm.university.trim()) errs.university = 'University is required.';
    if (!recForm.reason.trim()) errs.reason = 'Please explain why you recommend this student.';

    if (Object.keys(errs).length > 0) {
      setRecErrors(errs);
      return;
    }

    setRecErrors({});
    submitAmbassadorRecommendation(recForm);
    setRecSubmitted(true);
    triggerToast('Ambassador recommendation submitted!');
    setTimeout(() => {
      setRecForm({ name: '', email: '', university: '', country: 'India', reason: '' });
      setRecSubmitted(false);
    }, 4000);
  };

  useEffect(() => {
    getAiAssistantStatus().then((res) => {
      setAiServiceStatus(res);
    });
  }, []);

  // Feedback Auto-Categorize (LLM Categorization - No Student PII)
  const handleFeedbackAutoCategorize = async () => {
    if (!fbForm.text.trim()) {
      triggerToast('Please enter your feedback text first.');
      return;
    }
    setFbCategorizing(true);
    const result = await categorizeFeedbackText({ feedbackText: fbForm.text });
    setFbCategorizing(false);
    if (result.success) {
      setFbAiResult(result);
      triggerToast(`AI Categorized as: ${result.category}`);
    } else {
      triggerToast(result.error || 'Categorization unavailable.');
    }
  };

  // Feedback Submission Handler
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!fbForm.text.trim()) {
      triggerToast('Please write your feedback message before submitting.');
      return;
    }

    let finalAi = fbAiResult;
    if (!finalAi) {
      setFbCategorizing(true);
      const res = await categorizeFeedbackText({ feedbackText: fbForm.text });
      setFbCategorizing(false);
      if (res.success) {
        finalAi = res;
        setFbAiResult(res);
      }
    }

    const submissionPayload = {
      ...fbForm,
      aiCategory: finalAi?.category || 'Uncategorized',
      aiReason: finalAi?.reason || 'Direct submission',
    };

    submitAmbassadorFeedback(submissionPayload);
    setFbSubmitted(true);
    triggerToast('Thank you! Feedback received.');
    setTimeout(() => {
      setFbForm({ category: 'Platform Experience', rating: 5, text: '' });
      setFbSubmitted(false);
      setFbAiResult(null);
    }, 6000);
  };

  // Chat Handlers
  const handleSendChatMessage = async (presetText) => {
    const textToSend = (presetText || chatInput).trim();
    if (!textToSend || chatLoading) return;

    setChatError(null);
    setLastFailedChat(null);

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    setChatInput('');
    setChatLoading(true);

    const res = await sendChatMessage({
      messages: updated,
      message: textToSend,
      context: `${profile?.university || 'University Campus'} ambassador`,
    });

    setChatLoading(false);

    if (res.success) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      setChatError(res.error || 'Failed to get response from NVIDIA NIM.');
      setLastFailedChat(textToSend);
    }
  };

  const handleRetryChat = () => {
    if (lastFailedChat) {
      handleSendChatMessage(lastFailedChat);
    }
  };

  const handleClearChat = () => {
    setChatMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "👋 Conversation cleared. What ambassador topic would you like to explore next?",
        timestamp: 'Just now',
      },
    ]);
    setChatError(null);
    setLastFailedChat(null);
  };

  // Social Media Content Generation Handler
  const handleGenerateSocial = async () => {
    if (!socialTopic.trim()) {
      setSocialError('Please enter a campaign topic or focus area.');
      return;
    }

    setSocialLoading(true);
    setSocialError(null);

    const res = await generateSocialMediaContent({
      topic: socialTopic,
      platform: socialPlatform,
      tone: socialTone,
      language: socialLanguage,
      contentType: socialContentType,
    });

    setSocialLoading(false);

    if (res.success) {
      setSocialOutput(res.content);
    } else {
      setSocialError(res.error || 'Could not generate content from NVIDIA NIM.');
    }
  };

  // Niyo Card & Program FAQ Handler
  const handleAskFaq = async (presetQ) => {
    const q = (presetQ || faqQuestion).trim();
    if (!q || faqLoading) return;

    setFaqLoading(true);
    setFaqError(null);
    setFaqQuestion('');

    const res = await askNiyoFaqAssistant({ question: q });
    setFaqLoading(false);

    if (res.success) {
      setFaqList((prev) => [
        {
          id: Date.now(),
          q,
          a: res.reply,
        },
        ...prev,
      ]);
    } else {
      setFaqError(res.error || 'Failed to retrieve verified FAQ answer.');
    }
  };

  // ==========================================================================
  // ONBOARDING FLOW MODAL / SCREEN
  // ==========================================================================
  if (!isOnboarded) {
    return (
      <div className="ambassador-onboarding-wrapper">
        <div className="page-shell">
          <div className="onboarding-card shadow-lg p-4 p-md-5 mx-auto bg-white rounded border">
            {/* Step 1: Welcome / Congratulations */}
            {onboardingStep === 1 && (
              <div className="text-center py-3">
                <div className="welcome-confetti-pill d-inline-block px-3 py-1 rounded-pill mb-3">
                  🎉 APPLICATION APPROVED
                </div>
                <h1 className="fw-bold mb-2 text-dark">Welcome to the Niyo Campus Team!</h1>
                <p className="text-muted lead mx-auto mb-4" style={{ maxWidth: '580px' }}>
                  Congratulations, <strong>{profile?.fullName || 'Ambassador'}</strong>! You have been selected to represent Niyo across your university. Let’s configure your ambassador identity.
                </p>

                <div className="row g-3 text-start mb-4 max-w-lg mx-auto" style={{ maxWidth: '600px' }}>
                  <div className="col-12 col-md-4">
                    <div className="p-3 bg-light rounded text-center border">
                      <FiAward size={28} className="text-primary mb-2" />
                      <h6 className="fw-bold mb-1">Official ID</h6>
                      <span className="small text-muted">{ambassadorCode}</span>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="p-3 bg-light rounded text-center border">
                      <FiShare2 size={28} className="text-success mb-2" />
                      <h6 className="fw-bold mb-1">Referral Link</h6>
                      <span className="small text-muted">Ready to share</span>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="p-3 bg-light rounded text-center border">
                      <BsMegaphone size={28} className="text-info mb-2" />
                      <h6 className="fw-bold mb-1">Campaigns</h6>
                      <span className="small text-muted">{campaigns.length} {campaigns.length === 1 ? 'Campaign' : 'Campaigns'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="button button-primary px-5 py-3"
                  onClick={() => setOnboardingStep(2)}
                >
                  Set Up Profile <FiArrowRight className="ms-2" />
                </button>
              </div>
            )}

            {/* Step 2: Set Up Profile */}
            {onboardingStep === 2 && (
              <div>
                <div className="text-center mb-4">
                  <span className="badge bg-primary-subtle text-primary border px-3 py-1 rounded-pill mb-2">
                    Step 2: Profile Customization
                  </span>
                  <h2 className="fw-bold text-dark">Ambassador Profile Details</h2>
                  <p className="text-muted small">Update your bio, photo, and preferences so peers can connect with you.</p>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-4 text-center">
                    <div className="profile-photo-circle mx-auto mb-2" style={{ width: '96px', height: '96px', borderRadius: '50%', background: '#ede9fe', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {profilePhotoPreview ? (
                        <img src={profilePhotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <FiUser size={40} className="text-primary" />
                      )}
                    </div>
                    <label htmlFor="onboarding-photo" className="btn btn-sm btn-outline-primary cursor-pointer">
                      <FiUploadCloud className="me-1" /> Upload Photo
                    </label>
                    <input
                      id="onboarding-photo"
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={handlePhotoUpload}
                    />
                  </div>

                  <div className="col-12 col-md-8">
                    <div className="row g-2">
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Display Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={profile.fullName}
                          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">University</label>
                        <input
                          type="text"
                          className="form-control"
                          value={profile.university}
                          onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Country</label>
                        <input
                          type="text"
                          className="form-control"
                          value={profile.country}
                          onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Short Ambassador Bio</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between pt-3 border-top">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setOnboardingStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => {
                      handleSaveProfile();
                      setOnboardingStep(3);
                    }}
                  >
                    Continue <FiArrowRight className="ms-2" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Get Started */}
            {onboardingStep === 3 && (
              <div className="text-center py-3">
                <div className="welcome-confetti-pill d-inline-block px-3 py-1 rounded-pill mb-3 bg-success-subtle text-success border-success-subtle">
                  ✨ SETUP COMPLETE
                </div>
                <h2 className="fw-bold mb-2 text-dark">You’re All Set, Ambassador!</h2>
                <p className="text-muted mx-auto mb-4" style={{ maxWidth: '540px' }}>
                  Your referral link has been generated and your Ambassador Portal is ready. Access active campaigns, rewards, and the global directory right away.
                </p>

                <div className="p-3 bg-light rounded text-start border mb-4 mx-auto" style={{ maxWidth: '540px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-muted">Your Ambassador Referral Link:</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-decoration-none p-0"
                      onClick={() => handleCopy(referralData.referralLink, 'link')}
                    >
                      {copiedLink ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <code className="text-primary small d-block word-break-all">{referralData.referralLink}</code>
                </div>

                <button
                  type="button"
                  className="button button-primary px-5 py-3"
                  onClick={() => {
                    setOnboardingCompleted(userId);
                    setIsOnboarded(true);
                  }}
                >
                  Enter Ambassador Dashboard <FiArrowRight className="ms-2" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // MAIN AMBASSADOR PORTAL LAYOUT
  // ==========================================================================
  return (
    <div className="ambassador-portal-wrapper">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="ambassador-toast" role="alert">
          <FiCheck className="me-2" />
          <span>{toastMessage}</span>
          <button type="button" className="btn-close-toast ms-auto" onClick={() => setToastMessage(null)}>
            <FiX />
          </button>
        </div>
      )}

      {/* Task Submission Modal */}
      {taskModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold m-0 text-dark">Submit Campaign Task</h4>
              <button type="button" className="btn-close-clean" onClick={() => setTaskModalOpen(false)}>
                <FiX size={20} />
              </button>
            </div>

            <p className="small text-muted mb-3">
              Submitting for: <strong>{selectedCampaignForTask?.title || 'Selected Campaign'}</strong>
            </p>

            <form onSubmit={handleSubmitTask}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Proof Link (Social Media Post / Event Recording) *</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://instagram.com/p/... or https://linkedin.com/posts/..."
                  value={taskForm.postUrl}
                  onChange={(e) => setTaskForm({ ...taskForm, postUrl: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Task Notes / Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Describe your session, number of attendees, or campus engagement..."
                  value={taskForm.notes}
                  onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Upload Photo / Screenshot (Optional)</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => setTaskForm({ ...taskForm, screenshotName: e.target.files?.[0]?.name || '' })}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setTaskModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  Submit Task for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="admin-container">
        {/* Dark Navy Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-brand-box">
            <div className="d-flex align-items-center gap-2">
              <span className="brand-mark admin-mark" aria-hidden="true">
                <i></i><i></i><i></i>
              </span>
              <div>
                <span className="sidebar-brand-title">Niyo <b>Campus</b></span>
                <span className="sidebar-portal-tag bg-success-subtle text-success">AMBASSADOR</span>
              </div>
            </div>
            <button type="button" className="d-md-none btn-close-white ms-auto" onClick={() => setSidebarOpen(false)}>
              <FiX color="#fff" size={20} />
            </button>
          </div>

          {/* Ambassador profile preview badge in sidebar */}
          <div className="px-3 py-2 border-bottom border-secondary border-opacity-25 d-flex align-items-center gap-2">
            <div className="applicant-avatar bg-primary text-white" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
              {(profile?.fullName || 'AM').split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <div className="text-white small fw-bold text-truncate">{profile?.fullName}</div>
              <div className="text-muted small text-truncate" style={{ fontSize: '0.7rem' }}>{profile?.university}</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            <button
              type="button"
              className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
            >
              <FiGrid className="nav-icon" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'referrals' ? 'active' : ''}`}
              onClick={() => { setActiveTab('referrals'); setSidebarOpen(false); }}
            >
              <FiShare2 className="nav-icon" />
              <span>Referrals & Links</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'earnings' ? 'active' : ''}`}
              onClick={() => { setActiveTab('earnings'); setSidebarOpen(false); }}
            >
              <FiAward className="nav-icon" />
              <span>Earnings & Payouts</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'campaigns' ? 'active' : ''}`}
              onClick={() => { setActiveTab('campaigns'); setSidebarOpen(false); }}
            >
              <BsMegaphone className="nav-icon" />
              <span>Campaigns & Tasks</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'community' ? 'active' : ''}`}
              onClick={() => { setActiveTab('community'); setSidebarOpen(false); }}
            >
              <FiUsers className="nav-icon" />
              <span>Global Community</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'ai-assistant' ? 'active' : ''}`}
              onClick={() => { setActiveTab('ai-assistant'); setSidebarOpen(false); }}
            >
              <FiZap className="nav-icon" />
              <span>AI Growth Assistant</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'recommend' ? 'active' : ''}`}
              onClick={() => { setActiveTab('recommend'); setSidebarOpen(false); }}
            >
              <FiUserPlus className="nav-icon" />
              <span>Recommend Student</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'feedback' ? 'active' : ''}`}
              onClick={() => { setActiveTab('feedback'); setSidebarOpen(false); }}
            >
              <FiMessageSquare className="nav-icon" />
              <span>Feedback Hub</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
            >
              <FiUser className="nav-icon" />
              <span>My Profile</span>
            </button>
          </nav>

          {/* Sidebar Footer */}
          <div className="sidebar-footer">
            <div className="demo-mode-badge mb-2">
              <span className="status-dot"></span>
              <span>Ambassador Active</span>
            </div>
            <button
              type="button"
              className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2 mb-2"
              onClick={onNavigateDashboard}
            >
              <FiArrowLeft /> Application Status
            </button>
            <button
              type="button"
              className="btn btn-link btn-sm text-muted w-100 p-0 text-decoration-none"
              onClick={onNavigateHome}
            >
              Exit to Home
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="admin-main">
          {/* Top Header Bar */}
          <header className="admin-header">
            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="btn btn-sm d-md-none p-0 text-dark"
                onClick={() => setSidebarOpen(true)}
              >
                <FiMenu size={24} />
              </button>
              <div>
                <h1 className="admin-page-title m-0">
                  {activeTab === 'dashboard' && 'Ambassador Dashboard'}
                  {activeTab === 'referrals' && 'Referral Links & Tracking'}
                  {activeTab === 'earnings' && 'Earnings & Reward Ledger'}
                  {activeTab === 'campaigns' && 'Ambassador Campaigns'}
                  {activeTab === 'community' && 'Global Ambassador Directory'}
                  {activeTab === 'ai-assistant' && 'AI Growth & Marketing Assistant'}
                  {activeTab === 'recommend' && 'Recommend a Future Ambassador'}
                  {activeTab === 'feedback' && 'Ambassador Feedback Hub'}
                  {activeTab === 'profile' && 'Ambassador Profile'}
                </h1>
                <span className="admin-breadcrumb text-muted small">
                  Niyo Ambassador &gt; {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              {/* Notification Bell */}
              <div className="position-relative">
                <button
                  type="button"
                  className="btn-notification-bell"
                  onClick={() => setShowNotif(!showNotif)}
                >
                  <FiBell size={20} />
                  {notifications.some((n) => n.unread) && <span className="notification-dot"></span>}
                </button>

                {showNotif && (
                  <div className="notifications-dropdown shadow-lg">
                    <div className="notif-header d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Ambassador Alerts</span>
                      <span className="badge bg-primary rounded-pill">
                        {notifications.filter((n) => n.unread).length} new
                      </span>
                    </div>
                    <div className="notif-list">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                            <div className="notif-title fw-semibold small">{n.title}</div>
                            <div className="notif-text text-muted small">{n.text}</div>
                            <div className="notif-time text-end text-secondary" style={{ fontSize: '0.7rem' }}>{n.time}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-muted small">No notifications yet.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Chip */}
              <div
                className="admin-profile-pill d-flex align-items-center gap-2 cursor-pointer"
                onClick={() => setActiveTab('profile')}
              >
                <div className="admin-avatar" style={{ background: '#4f35b5' }}>
                  {(profile?.fullName || 'AM').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="d-none d-sm-block text-start">
                  <div className="admin-name fw-semibold">{profile?.fullName}</div>
                  <div className="admin-role text-muted" style={{ fontSize: '0.72rem' }}>Ambassador</div>
                </div>
              </div>
            </div>
          </header>

          {/* Dynamic Views */}
          <main className="admin-content-view">
            {/* ========================================================= */}
            {/* 1. DASHBOARD TAB */}
            {/* ========================================================= */}
            {activeTab === 'dashboard' && (
              <div className="dashboard-view">
                {/* Greeting banner */}
                <div className="welcome-banner p-4 rounded bg-white border shadow-sm mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div>
                    <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill fw-bold mb-1">
                      ACTIVE AMBASSADOR
                    </span>
                    <h2 className="fw-bold text-dark m-0">Hello, {profile?.fullName}!</h2>
                    <p className="text-muted small m-0 mt-1">
                      Ready to drive student financial literacy at <strong>{profile?.university}</strong>? Here is your campus overview.
                    </p>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="button button-primary compact-btn"
                      onClick={() => handleCopy(referralData.referralLink, 'link')}
                    >
                      <FiCopy className="me-1" /> {copiedLink ? 'Copied Link!' : 'Copy Referral Link'}
                    </button>
                  </div>
                </div>

                {/* 3 Main Stat Cards */}
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-4">
                    <div className="metric-card card-total">
                      <div className="metric-icon-box"><FiShare2 size={24} /></div>
                      <div className="metric-content">
                        <span className="metric-label">Total Referrals</span>
                        <h2 className="metric-number">{dashboardMetrics.totalReferrals}</h2>
                        <span className="metric-trend trend-positive">Students invited via link</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="metric-card card-approved">
                      <div className="metric-icon-box"><FiCheckCircle size={24} /></div>
                      <div className="metric-content">
                        <span className="metric-label">Successful Onboardings</span>
                        <h2 className="metric-number">{dashboardMetrics.successfulOnboardings}</h2>
                        <span className="metric-trend trend-positive">Niyo cards activated</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="metric-card card-pending">
                      <div className="metric-icon-box"><FiAward size={24} /></div>
                      <div className="metric-content">
                        <span className="metric-label">Total Earnings</span>
                        <h2 className="metric-number">{dashboardMetrics.totalEarnings}</h2>
                        <span className="metric-trend text-muted">
                          {dashboardMetrics.pendingEarnings && dashboardMetrics.pendingEarnings !== '₹0'
                            ? `${dashboardMetrics.pendingEarnings} pending payout`
                            : 'No pending payouts'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Active Campaign Card */}
                {dashboardMetrics.activeCampaign ? (
                  <div className="chart-card p-4 rounded bg-white border shadow-sm mb-4">
                    <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                      <div>
                        <span className="badge bg-success mb-2">ACTIVE CAMPAIGN</span>
                        <h4 className="fw-bold text-dark m-0">{dashboardMetrics.activeCampaign.title}</h4>
                      </div>
                      <span className="text-muted small">
                        <FiCalendar className="me-1" /> Deadline: {dashboardMetrics.activeCampaign.endDate}
                      </span>
                    </div>
                    <p className="text-secondary small mb-3">{dashboardMetrics.activeCampaign.description}</p>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 border-top">
                      <span className="fw-semibold text-primary small">
                        Reward Bounty: {dashboardMetrics.activeCampaign.bounty}
                      </span>
                      <button
                        type="button"
                        className="button button-primary compact-btn"
                        onClick={() => {
                          setSelectedCampaignForTask(dashboardMetrics.activeCampaign);
                          setTaskModalOpen(true);
                        }}
                      >
                        Submit Task Proof <FiArrowRight className="ms-1" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="chart-card p-4 rounded bg-white border shadow-sm mb-4 text-center">
                    <BsMegaphone size={32} className="text-secondary mb-2" />
                    <h5 className="fw-bold text-dark m-0">No Active Campaign Assigned</h5>
                    <p className="text-muted small m-0 mt-1">There are no ongoing campaigns assigned yet. Check back soon for new campus initiatives!</p>
                  </div>
                )}

                {/* Quick Shortcuts Grid */}
                <h5 className="fw-bold mb-3 text-dark">Ambassador Quick Actions</h5>
                <div className="row g-3">
                  <div className="col-6 col-md-3">
                    <button
                      type="button"
                      className="p-3 bg-white rounded border shadow-sm text-center w-100 hover-card"
                      onClick={() => setActiveTab('referrals')}
                    >
                      <FiShare2 size={24} className="text-primary mb-2" />
                      <div className="fw-bold small text-dark">Referral Links & QR</div>
                    </button>
                  </div>
                  <div className="col-6 col-md-3">
                    <button
                      type="button"
                      className="p-3 bg-white rounded border shadow-sm text-center w-100 hover-card"
                      onClick={() => setActiveTab('campaigns')}
                    >
                      <BsMegaphone size={24} className="text-success mb-2" />
                      <div className="fw-bold small text-dark">Campaign Bounties</div>
                    </button>
                  </div>
                  <div className="col-6 col-md-3">
                    <button
                      type="button"
                      className="p-3 bg-white rounded border shadow-sm text-center w-100 hover-card"
                      onClick={() => setActiveTab('ai-assistant')}
                    >
                      <FiZap size={24} className="text-warning mb-2" />
                      <div className="fw-bold small text-dark">AI Post Generator</div>
                    </button>
                  </div>
                  <div className="col-6 col-md-3">
                    <button
                      type="button"
                      className="p-3 bg-white rounded border shadow-sm text-center w-100 hover-card"
                      onClick={() => setActiveTab('community')}
                    >
                      <FiUsers size={24} className="text-info mb-2" />
                      <div className="fw-bold small text-dark">Ambassador Directory</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 2. REFERRALS TAB */}
            {/* ========================================================= */}
            {activeTab === 'referrals' && (
              <div className="referrals-view">
                {/* Link & QR Card */}
                <div className="p-4 rounded bg-white border shadow-sm mb-4">
                  <div className="row g-4 align-items-center">
                    <div className="col-12 col-md-8">
                      <span className="badge bg-primary-subtle text-primary border px-3 py-1 rounded-pill mb-2">
                        YOUR AMBASSADOR LINK
                      </span>
                      <h3 className="fw-bold text-dark mb-2">Share & Earn Student Rewards</h3>
                      <p className="text-muted small mb-3">
                        Share your unique link or code with campus peers. Earn ₹500 for every peer who completes their Niyo Global Card activation.
                      </p>

                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control"
                          value={referralData.referralLink}
                          readOnly
                        />
                        <button
                          type="button"
                          className="button button-primary"
                          onClick={() => handleCopy(referralData.referralLink, 'link')}
                        >
                          {copiedLink ? <FiCheck /> : <FiCopy />} {copiedLink ? 'Copied' : 'Copy Link'}
                        </button>
                      </div>

                      <div className="d-flex align-items-center gap-3 flex-wrap">
                        <span className="small text-muted">Direct Code: <strong className="text-dark">{ambassadorCode}</strong></span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleCopy(ambassadorCode, 'code')}
                        >
                          {copiedCode ? 'Copied Code' : 'Copy Code'}
                        </button>
                      </div>

                      {/* 1-Click Social Share Buttons */}
                      <div className="mt-3 pt-3 border-top">
                        <span className="small text-muted d-block mb-2">1-Click Share to Student Channels:</span>
                        <div className="d-flex flex-wrap gap-2">
                          <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Hey! Get zero-markup forex and student travel benefits with Niyo Global: ' + referralData.referralLink)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-success"
                          >
                            WhatsApp
                          </a>
                          <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralData.referralLink)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            LinkedIn
                          </a>
                          <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Students traveling abroad! Save on currency conversion with Niyo: ' + referralData.referralLink)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-dark"
                          >
                            Twitter / X
                          </a>
                          <a
                            href={`https://t.me/share/url?url=${encodeURIComponent(referralData.referralLink)}&text=${encodeURIComponent('Niyo Campus Student Ambassador Link')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-info"
                          >
                            Telegram
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Container */}
                    <div className="col-12 col-md-4 text-center">
                      <div className="p-3 bg-light rounded border d-inline-block text-center">
                        <div className="qr-box p-3 bg-white rounded border mb-2 mx-auto" style={{ width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg viewBox="0 0 100 100" width="130" height="130">
                            {/* SVG QR Code Simulation */}
                            <rect width="100" height="100" fill="#ffffff" />
                            <rect x="10" y="10" width="24" height="24" fill="#17152f" />
                            <rect x="14" y="14" width="16" height="16" fill="#ffffff" />
                            <rect x="18" y="18" width="8" height="8" fill="#4f35b5" />
                            <rect x="66" y="10" width="24" height="24" fill="#17152f" />
                            <rect x="70" y="14" width="16" height="16" fill="#ffffff" />
                            <rect x="74" y="18" width="8" height="8" fill="#4f35b5" />
                            <rect x="10" y="66" width="24" height="24" fill="#17152f" />
                            <rect x="14" y="70" width="16" height="16" fill="#ffffff" />
                            <rect x="18" y="74" width="8" height="8" fill="#4f35b5" />
                            <rect x="42" y="16" width="6" height="6" fill="#17152f" />
                            <rect x="52" y="24" width="8" height="6" fill="#4f35b5" />
                            <rect x="40" y="44" width="18" height="18" fill="#4f35b5" rx="3" />
                            <rect x="66" y="52" width="10" height="10" fill="#17152f" />
                            <rect x="80" y="74" width="10" height="10" fill="#17152f" />
                          </svg>
                        </div>
                        <span className="small fw-semibold text-dark d-block">Scan to Apply</span>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>Niyo Campus QR Code</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Referral Stats Grid */}
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-white rounded border text-center">
                      <span className="text-muted small">Link Clicks</span>
                      <h3 className="fw-bold text-dark m-0 mt-1">{referralData.stats.clicks}</h3>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-white rounded border text-center">
                      <span className="text-muted small">Signups</span>
                      <h3 className="fw-bold text-primary m-0 mt-1">{referralData.stats.signups}</h3>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-white rounded border text-center">
                      <span className="text-muted small">Cards Activated</span>
                      <h3 className="fw-bold text-success m-0 mt-1">{referralData.stats.activations}</h3>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-white rounded border text-center">
                      <span className="text-muted small">Conversion Rate</span>
                      <h3 className="fw-bold text-info m-0 mt-1">{referralData.stats.conversionRate}</h3>
                    </div>
                  </div>
                </div>

                {/* Referral History Table */}
                <div className="p-4 rounded bg-white border shadow-sm">
                  <h4 className="fw-bold text-dark mb-3">Recent Campus Onboardings</h4>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Student Name</th>
                          <th>College</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Reward</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referralData.history.length > 0 ? (
                          referralData.history.map((r) => (
                            <tr key={r.id}>
                              <td className="fw-semibold text-dark">{r.name}</td>
                              <td className="text-muted small">{r.college}</td>
                              <td className="small">{r.date}</td>
                              <td>
                                <span className={`badge ${r.status === 'Card Activated' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                  {r.status}
                                </span>
                              </td>
                              <td className="fw-bold text-success">{r.reward}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center py-4 text-muted">
                              <FiShare2 size={24} className="text-secondary mb-2 d-block mx-auto" />
                              No referrals recorded yet. Share your referral link with students on campus to begin earning!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 3. EARNINGS TAB */}
            {/* ========================================================= */}
            {activeTab === 'earnings' && (
              <div className="earnings-view">
                {/* 3 Metric Cards */}
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-4">
                    <div className="metric-card card-approved">
                      <div className="metric-icon-box"><FiAward size={24} /></div>
                      <div className="metric-content">
                        <span className="metric-label">Total Earned</span>
                        <h2 className="metric-number">{earnings.totalEarned}</h2>
                        <span className="metric-trend trend-positive">Cumulative 2026 earnings</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="metric-card card-pending">
                      <div className="metric-icon-box"><FiClock size={24} /></div>
                      <div className="metric-content">
                        <span className="metric-label">Pending Verification</span>
                        <h2 className="metric-number">{earnings.pendingAmount}</h2>
                        <span className="metric-trend trend-warning">In review queue</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="metric-card card-total">
                      <div className="metric-icon-box"><FiCheckCircle size={24} /></div>
                      <div className="metric-content">
                        <span className="metric-label">Disbursed to Bank</span>
                        <h2 className="metric-number">{earnings.paidAmount}</h2>
                        <span className="metric-trend text-muted">Via UPI / NEFT</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reward Breakdown info card */}
                <div className="p-3 bg-light rounded border mb-4">
                  <h6 className="fw-bold text-dark mb-2">Ambassador Reward Structure:</h6>
                  <div className="row g-2 small text-secondary">
                    <div className="col-md-4">• <strong>₹500</strong> per verified card activation</div>
                    <div className="col-md-4">• <strong>₹1,500 - ₹2,500</strong> for campaign bounties</div>
                    <div className="col-md-4">• <strong>₹2,000</strong> milestone bonus every 10 onboardings</div>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="p-4 rounded bg-white border shadow-sm">
                  <h4 className="fw-bold text-dark mb-3">Earnings & Payout Ledger</h4>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Transaction ID</th>
                          <th>Type</th>
                          <th>Description</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {earnings.transactions.length > 0 ? (
                          earnings.transactions.map((t) => (
                            <tr key={t.id}>
                              <td><span className="badge bg-light text-secondary border">{t.id}</span></td>
                              <td className="fw-semibold text-dark">{t.type}</td>
                              <td className="text-muted small">{t.description}</td>
                              <td className="small">{t.date}</td>
                              <td className={`fw-bold ${t.amount.startsWith('+') ? 'text-success' : 'text-primary'}`}>
                                {t.amount}
                              </td>
                              <td>
                                <span className={`badge ${t.status === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                  {t.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-4 text-muted">
                              <FiClock size={24} className="text-secondary mb-2 d-block mx-auto" />
                              No earnings or payouts recorded yet. Complete campaigns and onboard peers to see transactions here.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 4. CAMPAIGNS TAB */}
            {/* ========================================================= */}
            {activeTab === 'campaigns' && (
              <div className="campaigns-view">
                {/* Filter pills */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                  <div className="d-flex gap-2">
                    {['All', 'Ongoing', 'Upcoming', 'Completed'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        className={`filter-pill-btn ${campaignFilter === f ? 'active' : ''}`}
                        onClick={() => setCampaignFilter(f)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <span className="text-muted small">
                    Showing <strong>{campaigns.length}</strong> campaigns
                  </span>
                </div>

                {/* Campaign Grid */}
                <div className="row g-4 mb-4">
                  {campaigns.length > 0 ? (
                    campaigns.map((c) => (
                      <div key={c.id} className="col-12 col-md-6">
                        <div className="p-4 bg-white rounded border shadow-sm h-100 d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <span className={`badge ${c.status === 'Ongoing' ? 'bg-success' : c.status === 'Upcoming' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                                {c.status}
                              </span>
                              <span className="text-muted small"><FiCalendar className="me-1" /> {c.endDate}</span>
                            </div>

                            <h4 className="fw-bold text-dark mb-2">{c.title}</h4>
                            <p className="text-muted small mb-3">{c.description}</p>

                            <div className="p-3 bg-light rounded mb-3 small">
                              <strong className="text-primary d-block mb-1">Task Instructions:</strong>
                              <ul className="m-0 ps-3 text-secondary">
                                {c.instructions?.map((inst, idx) => (
                                  <li key={idx}>{inst}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="d-flex justify-content-between align-items-center small mb-3">
                              <span className="text-muted">Target: <strong>{c.target}</strong></span>
                              <span className="text-success fw-bold">Bounty: {c.bounty}</span>
                            </div>
                          </div>

                          <div className="pt-3 border-top d-flex justify-content-end">
                            <button
                              type="button"
                              className="button button-primary compact-btn"
                              disabled={c.status === 'Completed'}
                              onClick={() => {
                                setSelectedCampaignForTask(c);
                                setTaskModalOpen(true);
                              }}
                            >
                              {c.status === 'Completed' ? 'Campaign Ended' : 'Submit Task Proof'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <div className="p-5 bg-white rounded border shadow-sm text-center">
                        <BsMegaphone size={36} className="text-secondary mb-2" />
                        <h5 className="fw-bold text-dark mb-1">No Campaigns Assigned Yet</h5>
                        <p className="text-muted small mb-0">There are no campaigns matching the selected filter right now.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Task Submissions History */}
                <div className="p-4 bg-white rounded border shadow-sm">
                  <h4 className="fw-bold text-dark mb-3">Your Task Submissions</h4>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Task ID</th>
                          <th>Campaign</th>
                          <th>Proof Link</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taskSubmissions.length > 0 ? (
                          taskSubmissions.map((s) => (
                            <tr key={s.id}>
                              <td><span className="badge bg-light text-dark border">{s.id}</span></td>
                              <td className="fw-semibold text-dark">{s.campaignTitle}</td>
                              <td>
                                <a href={s.postUrl} target="_blank" rel="noreferrer" className="text-primary text-truncate d-inline-block" style={{ maxWidth: '240px' }}>
                                  {s.postUrl}
                                </a>
                              </td>
                              <td className="small text-muted">{s.submittedAt}</td>
                              <td>
                                <span className={`badge ${s.status === 'Verified' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                  {s.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center py-4 text-muted">
                              <FiFileText size={24} className="text-secondary mb-2 d-block mx-auto" />
                              No task submissions yet. Submit proof for an active campaign above to claim rewards!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 5. COMMUNITY DIRECTORY TAB */}
            {/* ========================================================= */}
            {activeTab === 'community' && (
              <div className="community-view">
                {/* Search & Filters */}
                <div className="p-3 bg-white rounded border shadow-sm mb-4">
                  <div className="row g-2 align-items-center">
                    <div className="col-12 col-md-6">
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0"><FiSearch /></span>
                        <input
                          type="text"
                          className="form-control border-start-0"
                          placeholder="Search ambassadors by name, university, or country..."
                          value={commSearch}
                          onChange={(e) => setCommSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <select
                        className="form-select"
                        value={commCountry}
                        onChange={(e) => setCommCountry(e.target.value)}
                      >
                        <option value="All">All Countries</option>
                        <option value="India">India</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Singapore">Singapore</option>
                        <option value="France">France</option>
                      </select>
                    </div>
                    <div className="col-6 col-md-3 text-end">
                      <span className="small text-muted"><strong>{communityList.length}</strong> Ambassadors</span>
                    </div>
                  </div>
                </div>

                {/* Ambassador Cards Grid */}
                <div className="row g-4">
                  {communityList.length > 0 ? (
                    communityList.map((amb) => (
                      <div key={amb.id} className="col-12 col-md-6 col-xl-4">
                        <div className="p-4 bg-white rounded border shadow-sm h-100 d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex align-items-center gap-3 mb-3">
                              <div className="applicant-avatar bg-primary text-white fs-6" style={{ width: '48px', height: '48px' }}>
                                {amb.avatar}
                              </div>
                              <div>
                                <h5 className="fw-bold text-dark m-0">{amb.name}</h5>
                                <span className="small text-muted">{amb.flag} {amb.country}</span>
                              </div>
                            </div>

                            <div className="mb-2">
                              <div className="small fw-semibold text-dark">{amb.college}</div>
                              <div className="small text-muted">{amb.department} ({amb.year})</div>
                            </div>

                            <p className="small text-secondary mb-3">{amb.bio}</p>

                            <div className="d-flex justify-content-between small text-muted pt-2 border-top mb-3">
                              <span>⭐ {amb.rating}</span>
                              <span>{amb.referrals} Referrals</span>
                              <span>{amb.campaigns} Campaigns</span>
                            </div>
                          </div>

                          <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                            {amb.linkedin ? (
                              <a href={amb.linkedin} target="_blank" rel="noreferrer" className="small text-primary text-decoration-none">
                                <FiExternalLink className="me-1" /> LinkedIn
                              </a>
                            ) : (
                              <span />
                            )}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => triggerToast(`Connection request sent to ${amb.name}! (Prototype Demo Mode)`)}
                            >
                              Connect
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <div className="p-5 bg-white rounded border shadow-sm text-center">
                        <FiUsers size={36} className="text-secondary mb-2" />
                        <h5 className="fw-bold text-dark mb-1">No Ambassadors Found</h5>
                        <p className="text-muted small mb-0">No approved ambassadors found matching your search criteria.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 6. AI GROWTH ASSISTANT TAB */}
            {/* ========================================================= */}
            {activeTab === 'ai-assistant' && (
              <div className="ai-assistant-view">
                {/* Status / Model Banner */}
                <div className="p-4 bg-white rounded border shadow-sm mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2 pb-3 border-bottom">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-warning text-dark fw-bold">AI GROWTH SUITE</span>
                        {aiServiceStatus?.configured ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1">
                            <FiCpu /> NVIDIA NIM Connected ({aiServiceStatus.model})
                          </span>
                        ) : (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle d-inline-flex align-items-center gap-1">
                            <FiAlertCircle /> Setup Needed (.env)
                          </span>
                        )}
                      </div>
                      <h3 className="fw-bold text-dark m-0">Ambassador AI Growth Assistant</h3>
                      <p className="text-muted small m-0">Empowering student ambassadors with real-time generative marketing, outreach strategies, and verified program FAQs.</p>
                    </div>

                    {/* Clear / Status Info */}
                    <div className="d-flex align-items-center gap-2">
                      {aiSection === 'chat' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                          onClick={handleClearChat}
                          title="Clear chat history"
                        >
                          <FiTrash2 /> Clear Conversation
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Setup Warning if API Key is missing */}
                  {aiServiceStatus && !aiServiceStatus.configured && (
                    <div className="alert alert-warning d-flex align-items-center gap-2 mb-4">
                      <FiAlertCircle size={20} className="flex-shrink-0 text-warning" />
                      <div className="small">
                        <strong>Server Configuration Needed:</strong> The server-side <code>NVIDIA_API_KEY</code> has not been set in <code>.env</code>. Live LLM calls will return a setup error until the key is configured.
                      </div>
                    </div>
                  )}

                  {/* Mode Sub-Navigation Tabs */}
                  <div className="d-flex gap-2 mb-4 flex-wrap">
                    <button
                      type="button"
                      className={`filter-pill-btn ${aiSection === 'chat' ? 'active' : ''}`}
                      onClick={() => setAiSection('chat')}
                    >
                      💬 Ambassador AI Chat
                    </button>
                    <button
                      type="button"
                      className={`filter-pill-btn ${aiSection === 'social' ? 'active' : ''}`}
                      onClick={() => setAiSection('social')}
                    >
                      📱 Social Media Generator
                    </button>
                    <button
                      type="button"
                      className={`filter-pill-btn ${aiSection === 'faq' ? 'active' : ''}`}
                      onClick={() => setAiSection('faq')}
                    >
                      ❓ Card & Program FAQs
                    </button>
                  </div>

                  {/* ============================================================ */}
                  {/* 1. AMBASSADOR AI CHAT SUB-VIEW */}
                  {/* ============================================================ */}
                  {aiSection === 'chat' && (
                    <div className="ai-chat-subview">
                      {/* Quick Starter Chips */}
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                        <span className="small text-muted fw-semibold">Quick Prompts:</span>
                        {[
                          'Orientation booth script for freshers',
                          'How to explain 0% forex markup simply',
                          'Organize a study abroad Q&A session',
                          'Instagram reel hook ideas for university students',
                        ].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            className="ai-chip-button"
                            onClick={() => handleSendChatMessage(chip)}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>

                      {/* Interactive Chat Window */}
                      <div className="ai-chat-container mb-3 shadow-sm">
                        <div className="ai-chat-header">
                          <div className="d-flex align-items-center gap-2">
                            <div className="spinner-grow spinner-grow-sm text-success" role="status" style={{ width: '8px', height: '8px' }}></div>
                            <span className="small fw-bold text-dark">Live Ambassador Dialogue</span>
                            <span className="badge bg-light text-muted border" style={{ fontSize: '10px' }}>NVIDIA NIM</span>
                          </div>
                          <span className="small text-muted" style={{ fontSize: '11px' }}>Enter to send • Shift+Enter for newline</span>
                        </div>

                        <div className="ai-chat-messages">
                          {chatMessages.map((msg) => (
                            <div key={msg.id} className={`ai-chat-msg ${msg.role}`}>
                              <div className="ai-msg-avatar">
                                {msg.role === 'user' ? 'ME' : <FiCpu size={18} />}
                              </div>
                              <div>
                                <div className="ai-msg-bubble">
                                  <pre className="m-0 text-inherit" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '13.5px' }}>
                                    {msg.content}
                                  </pre>
                                </div>
                                <span className="ai-msg-time">{msg.timestamp}</span>
                              </div>
                            </div>
                          ))}

                          {chatLoading && (
                            <div className="ai-chat-msg assistant">
                              <div className="ai-msg-avatar">
                                <FiCpu size={18} />
                              </div>
                              <div className="ai-typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Error & Retry Banner */}
                        {chatError && (
                          <div className="p-3 bg-danger-subtle border-top border-danger-subtle d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <span className="text-danger small">
                              <FiAlertCircle className="me-1" /> {chatError}
                            </span>
                            {lastFailedChat && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                                onClick={handleRetryChat}
                              >
                                <FiRefreshCw /> Retry Request
                              </button>
                            )}
                          </div>
                        )}

                        {/* Input Bar */}
                        <div className="ai-chat-input-bar">
                          <textarea
                            placeholder="Ask advice on organizing campus drives, pitching zero forex, or student engagement tactics..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendChatMessage();
                              }
                            }}
                            disabled={chatLoading}
                            rows="1"
                          />
                          <button
                            type="button"
                            className="button button-primary compact-btn"
                            onClick={() => handleSendChatMessage()}
                            disabled={chatLoading || !chatInput.trim()}
                          >
                            {chatLoading ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            ) : (
                              <>Send <FiSend className="ms-1" /></>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* 2. SOCIAL MEDIA CONTENT GENERATOR SUB-VIEW */}
                  {/* ============================================================ */}
                  {aiSection === 'social' && (
                    <div className="ai-social-subview">
                      <div className="row g-3 mb-3">
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold">Campaign Topic / Focus Area *</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Study abroad packing tips, Zero ATM withdrawal fees in Europe, Fall orientation..."
                            value={socialTopic}
                            onChange={(e) => setSocialTopic(e.target.value)}
                          />
                        </div>

                        <div className="col-6 col-md-3">
                          <label className="form-label small fw-semibold">Target Platform</label>
                          <select
                            className="form-select"
                            value={socialPlatform}
                            onChange={(e) => setSocialPlatform(e.target.value)}
                          >
                            <option value="Instagram">Instagram (Post / Carousel)</option>
                            <option value="LinkedIn">LinkedIn (Professional Post)</option>
                            <option value="Twitter/X">Twitter / X (Thread / Post)</option>
                            <option value="WhatsApp">WhatsApp (Student Group Broadcast)</option>
                          </select>
                        </div>

                        <div className="col-6 col-md-3">
                          <label className="form-label small fw-semibold">Content Type</label>
                          <select
                            className="form-select"
                            value={socialContentType}
                            onChange={(e) => setSocialContentType(e.target.value)}
                          >
                            <option value="Full Post">Full Structured Post</option>
                            <option value="Caption">Short Punchy Caption</option>
                            <option value="Short Announcement">Campus Announcement</option>
                            <option value="Story/Reel Script">Story / Reel Video Script</option>
                          </select>
                        </div>

                        <div className="col-6 col-md-3">
                          <label className="form-label small fw-semibold">Tone</label>
                          <select
                            className="form-select"
                            value={socialTone}
                            onChange={(e) => setSocialTone(e.target.value)}
                          >
                            <option value="Engaging & Friendly">Engaging & Peer-Friendly</option>
                            <option value="Professional & Academic">Professional & Academic</option>
                            <option value="Urgent / Semester Deadline">Urgent / Semester Travel Deadline</option>
                            <option value="Direct & Punchy">Direct, Bulleted & Punchy</option>
                          </select>
                        </div>

                        <div className="col-6 col-md-3">
                          <label className="form-label small fw-semibold">Language</label>
                          <select
                            className="form-select"
                            value={socialLanguage}
                            onChange={(e) => setSocialLanguage(e.target.value)}
                          >
                            <option value="English">English</option>
                            <option value="Hinglish">Hinglish (Hindi + English)</option>
                          </select>
                        </div>

                        <div className="col-12 col-md-6 d-flex align-items-end gap-2">
                          <button
                            type="button"
                            className="button button-primary py-2 px-4 flex-grow-1"
                            onClick={handleGenerateSocial}
                            disabled={socialLoading}
                          >
                            {socialLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                Generating with NVIDIA NIM...
                              </>
                            ) : (
                              <>
                                <FiZap className="me-1" /> Generate Promotional Content
                              </>
                            )}
                          </button>

                          {socialOutput && (
                            <button
                              type="button"
                              className="btn btn-outline-secondary py-2 px-3"
                              onClick={handleGenerateSocial}
                              disabled={socialLoading}
                              title="Regenerate another variation"
                            >
                              <FiRefreshCw />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Preset Inspiration Chips */}
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-4">
                        <span className="small text-muted fw-semibold">Preset Topics:</span>
                        {[
                          'Zero Forex Markup on 150+ Currencies',
                          'Free Airport Lounge Passes for Outbound Students',
                          'Zero Account Maintenance Fees for Freshers',
                          'Safety & Instant Card Freeze via Mobile App',
                        ].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            className="ai-chip-button"
                            onClick={() => setSocialTopic(chip)}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>

                      {/* Social Generator Error */}
                      {socialError && (
                        <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                          <FiAlertCircle />
                          <span>{socialError}</span>
                        </div>
                      )}

                      {/* Generated Social Output */}
                      {socialOutput && (
                        <div className="p-4 rounded bg-light border position-relative shadow-sm">
                          <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                            <span className="small fw-bold text-primary d-inline-flex align-items-center gap-1">
                              <FiCheckSquare color="#4f35b5" /> Generated Copy ({socialPlatform} • {socialContentType})
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                              onClick={() => {
                                handleCopy(socialOutput, 'ai');
                                setCopiedSocial(true);
                                setTimeout(() => setCopiedSocial(false), 2500);
                              }}
                            >
                              {copiedSocial ? <FiCheck color="#10b981" /> : <FiCopy />}
                              {copiedSocial ? 'Copied to Clipboard!' : 'Copy Copy'}
                            </button>
                          </div>
                          <pre className="m-0 text-dark small" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: '1.6' }}>
                            {socialOutput}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* 3. NIYO CARD & PROGRAM FAQ ASSISTANT SUB-VIEW */}
                  {/* ============================================================ */}
                  {aiSection === 'faq' && (
                    <div className="ai-faq-subview">
                      <div className="p-3 bg-purple-subtle border rounded mb-3">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <FiHelpCircle className="text-primary" />
                          <strong className="text-dark small">Grounded Knowledge Policy:</strong>
                        </div>
                        <p className="m-0 text-secondary small">
                          This assistant answers strictly based on verified Niyo Campus program guidelines and official card policies (0% forex markup, live Visa exchange rates, zero AMC, airport lounge access). Any unconfirmed loan or external policy inquiry is redirected to official support.
                        </p>
                      </div>

                      {/* FAQ Preset Chips */}
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                        <span className="small text-muted fw-semibold">Common Questions:</span>
                        {[
                          'How does 0% forex markup work on Niyo Global?',
                          'Are there any card issuance or annual maintenance fees?',
                          'Which countries accept the Niyo card?',
                          'How does international airport lounge access work for students?',
                          'What app safety controls are available if a card is lost?',
                        ].map((q) => (
                          <button
                            key={q}
                            type="button"
                            className="ai-chip-button"
                            onClick={() => handleAskFaq(q)}
                          >
                            {q}
                          </button>
                        ))}
                      </div>

                      {/* FAQ Input Bar */}
                      <div className="input-group mb-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ask any question about Niyo Global card fees, currency usage, or student perks..."
                          value={faqQuestion}
                          onChange={(e) => setFaqQuestion(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAskFaq();
                            }
                          }}
                          disabled={faqLoading}
                        />
                        <button
                          type="button"
                          className="button button-primary"
                          onClick={() => handleAskFaq()}
                          disabled={faqLoading || !faqQuestion.trim()}
                        >
                          {faqLoading ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                          ) : (
                            'Ask FAQ Assistant'
                          )}
                        </button>
                      </div>

                      {faqError && (
                        <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                          <FiAlertCircle />
                          <span>{faqError}</span>
                        </div>
                      )}

                      {/* FAQ Results Stream */}
                      <div className="d-flex flex-column gap-3">
                        {faqList.map((item) => (
                          <div key={item.id} className="p-3 bg-white border rounded shadow-sm">
                            <div className="fw-bold text-dark small mb-2 d-flex align-items-center gap-2">
                              <span className="badge bg-primary">Q</span> {item.q}
                            </div>
                            <div className="small text-secondary ps-4 border-start border-2 border-primary-subtle">
                              <pre className="m-0" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#1e293b' }}>
                                {item.a}
                              </pre>
                            </div>
                          </div>
                        ))}

                        {faqList.length === 0 && !faqLoading && (
                          <div className="text-center py-4 text-muted small border rounded bg-light">
                            Select a common question above or type your inquiry to get verified Niyo Card & Program answers.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 7. RECOMMEND AN AMBASSADOR TAB */}
            {/* ========================================================= */}
            {activeTab === 'recommend' && (
              <div className="recommend-view">
                <div className="p-4 bg-white rounded border shadow-sm mx-auto" style={{ maxWidth: '680px' }}>
                  <h3 className="fw-bold text-dark mb-2">Recommend a Future Ambassador</h3>
                  <p className="text-muted small mb-4">
                    Know a campus leader, club president, or enthusiastic peer? Recommend them to the Niyo Campus program.
                  </p>

                  {recSubmitted && (
                    <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
                      <FiCheckCircle size={20} />
                      <div>
                        <strong>Recommendation Received!</strong> Our team will review this candidate profile.
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleRecommendSubmit}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Candidate Full Name *</label>
                      <input
                        type="text"
                        className={`form-control ${recErrors.name ? 'is-invalid' : ''}`}
                        placeholder="e.g. Ananya Sen"
                        value={recForm.name}
                        onChange={(e) => setRecForm({ ...recForm, name: e.target.value })}
                      />
                      {recErrors.name && <div className="invalid-feedback">{recErrors.name}</div>}
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Candidate Email *</label>
                        <input
                          type="email"
                          className={`form-control ${recErrors.email ? 'is-invalid' : ''}`}
                          placeholder="student@university.edu"
                          value={recForm.email}
                          onChange={(e) => setRecForm({ ...recForm, email: e.target.value })}
                        />
                        {recErrors.email && <div className="invalid-feedback">{recErrors.email}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">University / College *</label>
                        <input
                          type="text"
                          className={`form-control ${recErrors.university ? 'is-invalid' : ''}`}
                          placeholder="e.g. BITS Pilani"
                          value={recForm.university}
                          onChange={(e) => setRecForm({ ...recForm, university: e.target.value })}
                        />
                        {recErrors.university && <div className="invalid-feedback">{recErrors.university}</div>}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Country</label>
                      <input
                        type="text"
                        className="form-control"
                        value={recForm.country}
                        onChange={(e) => setRecForm({ ...recForm, country: e.target.value })}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-semibold">Reason for Recommendation *</label>
                      <textarea
                        className={`form-control ${recErrors.reason ? 'is-invalid' : ''}`}
                        rows="3"
                        placeholder="Describe their student society presence, leadership experience, or why they would excel..."
                        value={recForm.reason}
                        onChange={(e) => setRecForm({ ...recForm, reason: e.target.value })}
                      />
                      {recErrors.reason && <div className="invalid-feedback">{recErrors.reason}</div>}
                    </div>

                    <button type="submit" className="button button-primary w-100 py-3">
                      Submit Recommendation
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 8. FEEDBACK HUB TAB */}
            {/* ========================================================= */}
            {activeTab === 'feedback' && (
              <div className="feedback-view">
                <div className="p-4 bg-white rounded border shadow-sm mx-auto" style={{ maxWidth: '680px' }}>
                  <h3 className="fw-bold text-dark mb-2">Ambassador Feedback Hub</h3>
                  <p className="text-muted small mb-4">
                    Your direct channel to Niyo product and campus teams. Suggest campaign improvements, platform features, or report issues.
                  </p>

                  {fbSubmitted && (
                    <div className="alert alert-success d-flex flex-column gap-2 mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <FiCheckCircle size={20} className="text-success flex-shrink-0" />
                        <div>
                          <strong>Feedback Submitted!</strong> Thank you for helping us improve Niyo Campus.
                        </div>
                      </div>
                      {fbAiResult && (
                        <div className="p-2 bg-white rounded border border-success-subtle small text-dark">
                          <span className="badge bg-primary me-2">AI Categorized</span>
                          <strong>{fbAiResult.category}:</strong> {fbAiResult.reason}
                        </div>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleFeedbackSubmit}>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label small fw-semibold m-0">Feedback Category</label>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-decoration-none p-0 d-inline-flex align-items-center gap-1 small"
                          onClick={handleFeedbackAutoCategorize}
                          disabled={fbCategorizing || !fbForm.text.trim()}
                        >
                          {fbCategorizing ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                          ) : (
                            <FiCpu className="text-primary" />
                          )}
                          <span>Classify with AI</span>
                        </button>
                      </div>
                      <select
                        className="form-select"
                        value={fbForm.category}
                        onChange={(e) => setFbForm({ ...fbForm, category: e.target.value })}
                      >
                        <option value="Platform Experience">Platform & Dashboard UX</option>
                        <option value="Campaigns & Bounties">Campaigns & Rewards</option>
                        <option value="Card Features">Niyo Global Card Features</option>
                        <option value="Community Events">Campus Events & Sponsorships</option>
                        <option value="Other">Other Ideas</option>
                      </select>
                      {fbAiResult && (
                        <div className="mt-1 small text-muted d-flex align-items-center gap-1">
                          <span className="badge bg-purple-subtle text-primary border" style={{ fontSize: '11px' }}>
                            <FiCpu className="me-1" /> AI Assigned: {fbAiResult.category}
                          </span>
                          <span className="text-truncate" style={{ fontSize: '12px' }}>({fbAiResult.reason})</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold d-block">Overall Satisfaction</label>
                      <div className="d-flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="btn btn-sm p-1 border-0"
                            onClick={() => setFbForm({ ...fbForm, rating: star })}
                          >
                            <FiStar
                              size={24}
                              color={star <= fbForm.rating ? '#f59e0b' : '#cbd5e1'}
                              fill={star <= fbForm.rating ? '#f59e0b' : 'none'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-semibold">Your Suggestions & Comments *</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Tell us what's working well and what we can do to support your campus chapter..."
                        value={fbForm.text}
                        onChange={(e) => setFbForm({ ...fbForm, text: e.target.value })}
                        required
                      />
                    </div>

                    <button type="submit" className="button button-primary w-100 py-3">
                      Send Feedback
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 9. PROFILE VIEW / EDIT TAB */}
            {/* ========================================================= */}
            {activeTab === 'profile' && (
              <div className="profile-view">
                <div className="p-4 bg-white rounded border shadow-sm mx-auto" style={{ maxWidth: '780px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                    <div>
                      <h3 className="fw-bold text-dark m-0">Ambassador Profile</h3>
                      <span className="text-muted small">Manage your public directory identity and contact preferences</span>
                    </div>
                    <button
                      type="button"
                      className="button button-primary compact-btn"
                      onClick={handleSaveProfile}
                    >
                      Save Profile
                    </button>
                  </div>

                  <form onSubmit={handleSaveProfile}>
                    <div className="row g-4 mb-4">
                      {/* Photo preview */}
                      <div className="col-12 col-md-4 text-center">
                        <div className="profile-photo-circle mx-auto mb-2" style={{ width: '110px', height: '110px', borderRadius: '50%', background: '#ede9fe', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {profilePhotoPreview ? (
                            <img src={profilePhotoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <FiUser size={48} className="text-primary" />
                          )}
                        </div>
                        <label htmlFor="profile-tab-photo" className="btn btn-sm btn-outline-secondary cursor-pointer">
                          <FiUploadCloud className="me-1" /> Change Photo
                        </label>
                        <input
                          id="profile-tab-photo"
                          type="file"
                          accept="image/*"
                          className="d-none"
                          onChange={handlePhotoUpload}
                        />
                        <div className="text-muted mt-2" style={{ fontSize: '0.72rem' }}>
                          JPG, PNG or WebP under 2MB
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="col-12 col-md-8">
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="form-label small fw-semibold">Full Name *</label>
                            <input
                              type="text"
                              className={`form-control ${profileErrors.fullName ? 'is-invalid' : ''}`}
                              value={profile.fullName}
                              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                            />
                            {profileErrors.fullName && <div className="invalid-feedback">{profileErrors.fullName}</div>}
                          </div>

                          <div className="col-md-6">
                            <label className="form-label small fw-semibold">Email Address</label>
                            <input
                              type="email"
                              className="form-control"
                              value={profile.email}
                              readOnly
                            />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label small fw-semibold">Phone Number</label>
                            <input
                              type="text"
                              className="form-control"
                              value={profile.phone}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">College / University</label>
                        <input
                          type="text"
                          className="form-control"
                          value={profile.university}
                          onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Country</label>
                        <input
                          type="text"
                          className="form-control"
                          value={profile.country}
                          onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Course / Major</label>
                        <input
                          type="text"
                          className="form-control"
                          value={profile.course}
                          onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Current Year of Study</label>
                        <select
                          className="form-select"
                          value={profile.yearOfStudy}
                          onChange={(e) => setProfile({ ...profile, yearOfStudy: e.target.value })}
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="Post Graduate">Post Graduate</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Short Bio for Community Directory</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Social links */}
                    <h5 className="fw-bold text-dark mb-3">Social Profiles</h5>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">LinkedIn Profile URL</label>
                        <input
                          type="url"
                          className="form-control"
                          placeholder="https://linkedin.com/in/..."
                          value={profile.linkedin}
                          onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Instagram Profile URL</label>
                        <input
                          type="url"
                          className="form-control"
                          placeholder="https://instagram.com/..."
                          value={profile.instagram}
                          onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-end">
                      <button type="submit" className="button button-primary px-4 py-2">
                        Save Profile Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
