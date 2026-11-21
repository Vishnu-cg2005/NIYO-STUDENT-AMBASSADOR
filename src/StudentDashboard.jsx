import React, { useState, useEffect } from 'react';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiUser,
  FiBook,
  FiAward,
  FiExternalLink,
  FiLogOut,
  FiHome,
  FiInfo,
  FiEdit2,
  FiCalendar,
  FiXCircle,
  FiMessageSquare,
  FiShare2,
  FiCheck,
  FiCopy,
  FiDownload,
  FiTag,
} from 'react-icons/fi';
import { BsMegaphone } from 'react-icons/bs';
import { getStudentApplication, getCampaigns } from './adminService';
import { getReferralDetails, getEarningsSummary } from './ambassadorService';

function Brand({ onNavigateHome }) {
  return (
    <a
      className="brand"
      href="#home"
      onClick={(e) => {
        e.preventDefault();
        onNavigateHome();
      }}
      aria-label="Niyo Campus home"
    >
      <span className="brand-mark" aria-hidden="true">
        <i></i><i></i><i></i>
      </span>
      <span>Niyo <b>Campus</b></span>
    </a>
  );
}

export default function StudentDashboard({
  onNavigateHome,
  onNavigateApply,
  onNavigateAmbassador,
  onLogout,
  currentUser,
}) {
  const [user, setUser] = useState(currentUser || null);
  const [application, setApplication] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [referralStats, setReferralStats] = useState(null);
  const [earningsStats, setEarningsStats] = useState(null);

  // Load application from single source of truth
  const reloadApplication = () => {
    try {
      let activeUser = currentUser;
      if (!activeUser) {
        const stored = localStorage.getItem('niyo_student_user');
        if (stored) activeUser = JSON.parse(stored);
      }
      if (activeUser) setUser(activeUser);

      const app = getStudentApplication(activeUser?.email || activeUser?.id);
      setApplication(app);
    } catch (err) {
      console.warn('[StudentDashboard] Error loading application:', err);
    }
  };

  useEffect(() => {
    reloadApplication();

    // Listen to admin status updates dispatched in same or other tabs
    const handleStatusChange = (e) => {
      if (e?.detail) {
        setApplication(e.detail);
      } else {
        reloadApplication();
      }
    };

    window.addEventListener('niyo_application_status_changed', handleStatusChange);
    window.addEventListener('storage', reloadApplication);

    return () => {
      window.removeEventListener('niyo_application_status_changed', handleStatusChange);
      window.removeEventListener('storage', reloadApplication);
    };
  }, [currentUser]);

  const studentName = application?.fullName || user?.fullName || 'Student Ambassador';
  const collegeName = application?.college || application?.collegeName || user?.collegeName || 'University Campus';
  const isGoogle = user?.authProvider === 'google';
  const status = application?.status || 'Pending';
  const isApproved = status.toLowerCase() === 'approved';
  const isRejected = status.toLowerCase() === 'rejected';
  const isUnderReview = status.toLowerCase() === 'under review';
  const isPending = status.toLowerCase() === 'pending';

  const ambassadorCode = `NIYO-${(studentName || 'CAMPUS').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase()}${application?.id?.replace(/[^0-9]/g, '')?.slice(0, 3) || '2026'}`;
  const referralLink = `https://goniyo.com/campus?ref=${ambassadorCode}`;

  useEffect(() => {
    if (isApproved) {
      const activeId = user?.email || user?.id || 'current_ambassador';
      setActiveCampaigns(getCampaigns('Ongoing') || []);
      setReferralStats(getReferralDetails(activeId, ambassadorCode));
      setEarningsStats(getEarningsSummary(activeId));
    }
  }, [isApproved, user, ambassadorCode]);

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="dashboard-page">
      <header className="site-header" role="banner">
        <div className="page-shell header-inner">
          <Brand onNavigateHome={onNavigateHome} />
          <div className="app-header-nav">
            <a
              href="#home"
              className="app-nav-link"
              onClick={(e) => {
                e.preventDefault();
                onNavigateHome();
              }}
            >
              Home
            </a>
            {isApproved && onNavigateAmbassador && (
              <button
                type="button"
                className="button button-primary header-portal-btn d-inline-flex align-items-center gap-1"
                style={{ padding: '8px 16px', fontSize: '13px' }}
                onClick={onNavigateAmbassador}
              >
                Ambassador Portal &rarr;
              </button>
            )}
            {!application && (
              <button
                type="button"
                className="app-nav-link btn-link"
                onClick={onNavigateApply}
              >
                Application Form
              </button>
            )}
            <button
              type="button"
              className="button button-secondary logout-btn"
              onClick={onLogout}
            >
              <FiLogOut aria-hidden="true" /> Log Out
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="dashboard-main">
        <div className="page-shell">
          {/* Welcome Banner */}
          <div className="dashboard-welcome-banner">
            <div className="welcome-text">
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span className="welcome-badge">
                  {isApproved ? 'Official Ambassador' : 'Student Applicant Portal'}
                </span>
                {isGoogle && (
                  <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                    <svg viewBox="0 0 24 24" width="13" height="13">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Google Account
                  </span>
                )}
                {application?.id && (
                  <span className="badge bg-secondary-subtle text-secondary border" style={{ fontSize: '0.75rem' }}>
                    App ID: {application.id}
                  </span>
                )}
              </div>
              <h1>Welcome, {studentName}</h1>
              <p className="college-tag">{collegeName}</p>
            </div>

            <div className="banner-actions">
              {isApproved ? (
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="badge bg-success px-3 py-2 rounded-pill fs-6">
                    <FiCheckCircle className="me-1" /> Ambassador Active
                  </span>
                  {onNavigateAmbassador && (
                    <button
                      type="button"
                      className="button button-primary banner-btn"
                      onClick={onNavigateAmbassador}
                    >
                      Open Ambassador Portal &rarr;
                    </button>
                  )}
                </div>
              ) : application ? (
                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                  <FiClock className="me-1 text-primary" /> Application Locked in Review
                </span>
              ) : (
                <button
                  type="button"
                  className="button button-secondary banner-btn"
                  onClick={onNavigateApply}
                >
                  <FiEdit2 aria-hidden="true" /> Fill Application Form
                </button>
              )}
            </div>
          </div>

          {/* Prototype Sync Note */}
          <div className="auth-prototype-notice dashboard-notice mb-4">
            <FiInfo aria-hidden="true" />
            <span>
              <strong>Live Workflow Preview:</strong> Application status is updated directly by Niyo Campus Admins. Any decision made in the Admin portal immediately reflects here.
            </span>
          </div>

          {/* ========================================================= */}
          {/* APPLICATION STATUS & TIMELINE SECTION */}
          {/* ========================================================= */}
          {application ? (
            <div className="dashboard-content-grid mb-4">
              {/* Status Timeline Card */}
              <div className="dashboard-card status-card">
                <div className="card-top-row">
                  <div>
                    <span className="card-kicker">APPLICATION STATUS</span>
                    <h2>
                      {isApproved && 'Application Approved'}
                      {isRejected && 'Application Not Approved'}
                      {isUnderReview && 'Application Under Review'}
                      {isPending && 'Application Pending'}
                    </h2>
                  </div>
                  <span className={`status-pill ${isApproved ? 'approved' : isRejected ? 'rejected' : isUnderReview ? 'under-review' : 'pending'}`}>
                    <span className="pulse-dot"></span> {status}
                  </span>
                </div>

                <div className="submission-meta">
                  <FiCalendar aria-hidden="true" />
                  <span>Submitted on {application.submittedAt || 'Recently'}</span>
                </div>

                {/* Status Explanation Message */}
                <div className="status-message-box p-3 rounded my-3 bg-light border">
                  {isPending && (
                    <p className="m-0 small text-secondary">
                      Your application has been received and is currently in the <strong>Pending</strong> queue. A Niyo Campus Admin will evaluate your academic profile and community responses shortly.
                    </p>
                  )}
                  {isUnderReview && (
                    <p className="m-0 small text-secondary">
                      The Niyo Campus team is <strong>actively reviewing</strong> your application credentials and campus activation proposals.
                    </p>
                  )}
                  {isApproved && (
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <p className="m-0 small text-success fw-medium">
                        <strong>Congratulations!</strong> Your student ambassador application has been approved by Niyo administrators. Your Ambassador Toolkit, referrals, and campaigns are unlocked.
                      </p>
                      {onNavigateAmbassador && (
                        <button
                          type="button"
                          className="btn btn-sm btn-success d-inline-flex align-items-center gap-1 fw-bold text-nowrap"
                          onClick={onNavigateAmbassador}
                        >
                          Open Ambassador Portal &rarr;
                        </button>
                      )}
                    </div>
                  )}
                  {isRejected && (
                    <p className="m-0 small text-muted">
                      Thank you for your interest in the Niyo Campus Student Ambassador Program. Unfortunately, your application was not approved for the current semester cohort.
                    </p>
                  )}
                </div>

                {/* Admin Remarks if provided */}
                {application.adminRemarks && (
                  <div className="admin-remarks-box p-3 rounded mb-3 bg-white border border-primary-subtle">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <FiMessageSquare className="text-primary" />
                      <strong className="text-dark small">Reviewer Note from Niyo Campus:</strong>
                    </div>
                    <p className="m-0 text-secondary small">{application.adminRemarks}</p>
                  </div>
                )}

                {/* 3-Step Review Progress Timeline */}
                <div className="review-timeline">
                  {/* Step 1: Submission */}
                  <div className="timeline-node-item completed">
                    <div className="node-circle">
                      <FiCheckCircle aria-hidden="true" />
                    </div>
                    <div>
                      <h4>Application Submitted</h4>
                      <p>Details received on {application.submittedAt || 'Date'}.</p>
                    </div>
                  </div>

                  <div className={`timeline-connector ${!isPending ? 'active' : ''}`}></div>

                  {/* Step 2: Review Queue */}
                  <div className={`timeline-node-item ${isApproved || isRejected ? 'completed' : isUnderReview ? 'active' : 'upcoming'}`}>
                    <div className="node-circle">
                      {isApproved || isRejected ? <FiCheckCircle /> : isUnderReview ? <FiClock /> : <span>2</span>}
                    </div>
                    <div>
                      <h4>Review & Evaluation</h4>
                      <p>
                        {isApproved || isRejected ? 'Evaluation completed' : isUnderReview ? 'Currently being evaluated' : 'Pending in queue'}
                      </p>
                    </div>
                  </div>

                  <div className={`timeline-connector ${isApproved ? 'active' : isRejected ? 'rejected' : ''}`}></div>

                  {/* Step 3: Decision */}
                  <div className={`timeline-node-item ${isApproved ? 'completed' : isRejected ? 'rejected' : 'upcoming'}`}>
                    <div className="node-circle">
                      {isApproved ? <FiCheckCircle /> : isRejected ? <FiXCircle /> : <span>3</span>}
                    </div>
                    <div>
                      <h4>
                        {isApproved ? 'Ambassador Onboarded' : isRejected ? 'Application Closed' : 'Final Selection Decision'}
                      </h4>
                      <p>
                        {isApproved ? 'Accepted to Niyo Campus' : isRejected ? 'Not selected for this cycle' : 'Notification upon review'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submitted Details Summary Card */}
              <div className="dashboard-card details-card">
                <div className="card-top-row">
                  <div>
                    <span className="card-kicker">APPLICATION SUMMARY</span>
                    <h2>Submitted Details</h2>
                  </div>
                  <span className="badge bg-light text-secondary border">Read-Only</span>
                </div>

                <div className="details-section">
                  <h3>
                    <FiUser aria-hidden="true" /> Personal & University Details
                  </h3>
                  <div className="detail-grid">
                    <div>
                      <strong>Full Name:</strong> <span>{application.fullName || '—'}</span>
                    </div>
                    <div>
                      <strong>Email Address:</strong> <span>{application.email || '—'}</span>
                    </div>
                    <div>
                      <strong>Phone Number:</strong> <span>{application.phone || '—'}</span>
                    </div>
                    <div>
                      <strong>College Name:</strong> <span>{application.college || application.collegeName || '—'}</span>
                    </div>
                    <div>
                      <strong>Department:</strong> <span>{application.department || '—'}</span>
                    </div>
                    <div>
                      <strong>Current Year:</strong> <span>{application.yearOfStudy || application.currentYear || '—'}</span>
                    </div>
                    <div>
                      <strong>City & State:</strong> <span>{application.cityState || application.country || '—'}</span>
                    </div>
                    <div>
                      <strong>CGPA:</strong> <span>{application.cgpa || application.cgpaPercentage || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h3>
                    <FiAward aria-hidden="true" /> Community & Motivation
                  </h3>
                  <div className="essay-block mb-2">
                    <strong>Why Niyo Ambassador:</strong>
                    <p className="small text-secondary mb-0">{application.motivation || application.whyAmbassador || '—'}</p>
                  </div>
                  <div className="essay-block">
                    <strong>Leadership & Experience:</strong>
                    <p className="small text-secondary mb-0">{application.campusPresence || application.communityEventDetails || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State if not submitted yet */
            <div className="dashboard-empty-card mb-4">
              <div className="empty-icon-wrap" aria-hidden="true">
                <FiFileText />
              </div>
              <h2>No Application Submitted Yet</h2>
              <p>
                You haven’t submitted your Niyo Student Ambassador application yet. Complete the 3-step application form to start your campus leadership journey.
              </p>
              <button
                type="button"
                className="button button-primary"
                onClick={onNavigateApply}
              >
                Start Application Now <FiExternalLink aria-hidden="true" />
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* AMBASSADOR DASHBOARD & PERKS — ONLY VISIBLE WHEN APPROVED */}
          {/* ========================================================= */}
          {isApproved && (
            <div className="ambassador-approved-section mt-4">
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div>
                  <span className="badge bg-primary px-3 py-1 rounded-pill mb-1">AMBASSADOR ACCESS UNLOCKED</span>
                  <h3 className="fw-bold m-0 text-dark">Ambassador Toolkit & Active Campaigns</h3>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {onNavigateAmbassador && (
                    <button
                      type="button"
                      className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 fw-semibold"
                      onClick={onNavigateAmbassador}
                    >
                      Open Full Ambassador Portal &rarr;
                    </button>
                  )}
                  <span className="badge bg-light text-dark border p-2">
                    Referral Code: <strong className="text-primary">{ambassadorCode}</strong>
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                    onClick={handleCopyLink}
                  >
                    {copiedLink ? <FiCheck color="#10b981" /> : <FiCopy />}
                    {copiedLink ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* 3 Ambassador Metric Cards (Real Student Data) */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-4">
                  <div className="dashboard-card p-3 h-100">
                    <span className="text-muted small fw-bold text-uppercase">Ambassador Status</span>
                    <h3 className="fw-bold text-success mt-1 mb-1">Active Ambassador</h3>
                    <p className="text-muted small m-0">Verified for {collegeName}</p>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div className="dashboard-card p-3 h-100">
                    <span className="text-muted small fw-bold text-uppercase">Total Referrals</span>
                    <h3 className="fw-bold text-primary mt-1 mb-1">
                      {referralStats?.stats?.signups ?? 0} {referralStats?.stats?.signups === 1 ? 'Student' : 'Students'}
                    </h3>
                    <p className="text-muted small m-0">
                      {referralStats?.stats?.activations ?? 0} cards activated
                    </p>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div className="dashboard-card p-3 h-100">
                    <span className="text-muted small fw-bold text-uppercase">Total Earnings</span>
                    <h3 className="fw-bold text-dark mt-1 mb-1">
                      {earningsStats?.totalEarned || '₹0'}
                    </h3>
                    <p className="text-muted small m-0">
                      {earningsStats?.pendingAmount && earningsStats.pendingAmount !== '₹0' ? `${earningsStats.pendingAmount} pending verification` : 'No pending payouts'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Campaigns available for the ambassador */}
              <div className="dashboard-card p-4 mb-4">
                <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <BsMegaphone className="text-primary" /> Active Campus Campaigns
                </h4>
                {activeCampaigns.length > 0 ? (
                  <div className="row g-3">
                    {activeCampaigns.map((camp) => (
                      <div key={camp.id} className="col-12 col-md-6">
                        <div className="p-3 rounded border bg-light h-100 d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className={`badge ${camp.status === 'Ongoing' ? 'bg-success' : 'bg-info text-dark'}`}>
                                {camp.status || 'Active'}
                              </span>
                              <span className="text-muted small">Ends {camp.endDate || 'TBD'}</span>
                            </div>
                            <h5 className="fw-bold text-dark mb-1">{camp.title}</h5>
                            <p className="text-secondary small mb-2">{camp.description}</p>
                          </div>
                          <div className="pt-2 border-top d-flex justify-content-between align-items-center small">
                            <span className="text-primary fw-semibold">Reward: {camp.incentive || camp.bounty || 'Campus Bounty'}</span>
                            {onNavigateAmbassador && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary py-0 px-2"
                                onClick={onNavigateAmbassador}
                              >
                                View Campaign &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded border bg-light text-center">
                    <BsMegaphone size={32} className="text-secondary mb-2" />
                    <h6 className="fw-bold text-dark mb-1">No Campus Campaigns Assigned Yet</h6>
                    <p className="text-muted small mb-0">Check back soon for new campus bounties and drives launched by the Niyo team.</p>
                  </div>
                )}
              </div>

              {/* Ambassador Resource Hub */}
              <div className="dashboard-card p-4">
                <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <FiBook className="text-primary" /> Ambassador Resource Hub
                </h4>
                <div className="row g-3">
                  <div className="col-12 col-sm-6 col-md-4">
                    <div className="p-3 rounded border bg-light text-center">
                      <FiFileText size={28} className="text-primary mb-2" />
                      <h6 className="fw-bold mb-1">Official Pitch Deck</h6>
                      <p className="text-muted small mb-2">Presentation slides for club & campus events</p>
                      <button type="button" className="btn btn-sm btn-outline-secondary w-100" onClick={() => alert('Pitch deck download preview')}>
                        <FiDownload className="me-1" /> Download Deck
                      </button>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6 col-md-4">
                    <div className="p-3 rounded border bg-light text-center">
                      <FiAward size={28} className="text-success mb-2" />
                      <h6 className="fw-bold mb-1">Appointment Letter</h6>
                      <p className="text-muted small mb-2">Official letter certifying ambassador tenure</p>
                      <button type="button" className="btn btn-sm btn-outline-secondary w-100" onClick={() => alert('Certificate preview')}>
                        <FiDownload className="me-1" /> View Certificate
                      </button>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6 col-md-4">
                    <div className="p-3 rounded border bg-light text-center">
                      <FiShare2 size={28} className="text-info mb-2" />
                      <h6 className="fw-bold mb-1">Social Media Kit</h6>
                      <p className="text-muted small mb-2">Branded banners, templates & posters</p>
                      <button type="button" className="btn btn-sm btn-outline-secondary w-100" onClick={() => alert('Social media assets pack')}>
                        <FiDownload className="me-1" /> Asset Pack
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="site-footer" role="contentinfo">
        <div className="page-shell">
          <div className="footer-bottom">
            <p>© Niyo Campus. Student Ambassador Program.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
