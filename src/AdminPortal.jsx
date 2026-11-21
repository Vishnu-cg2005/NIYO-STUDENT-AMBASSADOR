import React, { useState, useEffect, useMemo } from 'react';
import {
  FiGrid,
  FiFileText,
  FiUsers,
  FiAward,
  FiMessageSquare,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiChevronRight,
  FiEye,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBell,
  FiExternalLink,
  FiCheck,
  FiArrowLeft,
  FiRefreshCw,
  FiMenu,
  FiX,
  FiCalendar,
  FiChevronDown,
  FiShare2,
} from 'react-icons/fi';
import { BsMegaphone } from 'react-icons/bs';
import {
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  batchUpdateApplicationStatus,
  saveApplicationRemarks,
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getAmbassadors,
  getEarningsSummary,
  getFeedbackList,
  getDashboardMetrics,
  resetDemoData,
} from './adminService';

export default function AdminPortal({ onNavigateHome }) {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Application', text: 'Fatima Al-Zahra applied from King’s College London.', time: '10m ago', unread: true },
    { id: 2, title: 'Application Submitted', text: 'Aarav Sharma submitted IIT Delhi profile.', time: '1h ago', unread: true },
    { id: 3, title: 'Campaign Active', text: 'Fall Campus Orientation Drive reached 38 ambassadors.', time: '4h ago', unread: false },
  ]);

  // Dashboard Metrics
  const [metrics, setMetrics] = useState(() => getDashboardMetrics());

  // Applications State
  const [applications, setApplications] = useState([]);
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('All');
  const [selectedAppIds, setSelectedAppIds] = useState([]);
  const [viewingApp, setViewingApp] = useState(null);
  const [appRemarksInput, setAppRemarksInput] = useState('');

  // Confirmation Modal State (for Approve / Reject)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    action: null, // 'Approved' | 'Rejected' | 'Under Review'
    appId: null,
    appName: '',
    remarks: '',
  });

  // Campaigns State
  const [campaigns, setCampaigns] = useState([]);
  const [campaignFilter, setCampaignFilter] = useState('All');
  const [campaignModal, setCampaignModal] = useState({
    isOpen: false,
    isEdit: false,
    id: null,
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Upcoming',
    targetAmbassadors: 30,
    incentive: '',
    error: '',
  });

  // Ambassadors, Earnings, Feedback State
  const [ambassadors, setAmbassadors] = useState([]);
  const [earnings, setEarnings] = useState({ totalDisbursed: '', pendingPayouts: '', avgPerAmbassador: '', recentPayouts: [] });
  const [feedbackList, setFeedbackList] = useState([]);

  // Toast Helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3800);
  };

  // Reload data from service
  const refreshAllData = () => {
    setMetrics(getDashboardMetrics());
    setApplications(getApplications({ search: appSearch, status: appStatusFilter }));
    setCampaigns(getCampaigns(campaignFilter));
    setAmbassadors(getAmbassadors());
    setEarnings(getEarningsSummary());
    setFeedbackList(getFeedbackList());
  };

  useEffect(() => {
    refreshAllData();
  }, [appSearch, appStatusFilter, campaignFilter]);

  // Handle open Application View
  const handleOpenAppDetail = (appId) => {
    const full = getApplicationById(appId);
    if (full) {
      setViewingApp(full);
      setAppRemarksInput(full.adminRemarks || '');
    }
  };

  // Save Remarks
  const handleSaveRemarks = () => {
    if (!viewingApp) return;
    saveApplicationRemarks(viewingApp.id, appRemarksInput);
    setViewingApp({ ...viewingApp, adminRemarks: appRemarksInput });
    refreshAllData();
    triggerToast('Remarks saved successfully.');
  };

  // Trigger Confirmation Dialog
  const promptStatusChange = (action, app) => {
    setConfirmDialog({
      isOpen: true,
      action,
      appId: app.id,
      appName: app.fullName,
      remarks: appRemarksInput || app.adminRemarks || '',
    });
  };

  // Confirm Status Change
  const handleConfirmStatusChange = () => {
    const { appId, action, remarks } = confirmDialog;
    if (!appId || !action) return;

    updateApplicationStatus(appId, action, remarks);
    triggerToast(`Application #${appId} successfully marked as ${action}.`);
    setConfirmDialog({ isOpen: false, action: null, appId: null, appName: '', remarks: '' });

    // Update open view if active
    if (viewingApp && viewingApp.id === appId) {
      setViewingApp((prev) => ({ ...prev, status: action, adminRemarks: remarks }));
    }
    refreshAllData();
  };

  // Batch Status Update
  const handleBatchStatus = (newStatus) => {
    if (!selectedAppIds.length) return;
    batchUpdateApplicationStatus(selectedAppIds, newStatus);
    triggerToast(`Updated ${selectedAppIds.length} application(s) to ${newStatus}.`);
    setSelectedAppIds([]);
    refreshAllData();
  };

  // Toggle Single Checkbox
  const toggleSelectApp = (id) => {
    setSelectedAppIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Toggle All Checkboxes
  const toggleSelectAllApps = () => {
    if (selectedAppIds.length === applications.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(applications.map((a) => a.id));
    }
  };

  // Campaign Modal Handlers
  const openCreateCampaignModal = () => {
    setCampaignModal({
      isOpen: true,
      isEdit: false,
      id: null,
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'Upcoming',
      targetAmbassadors: 30,
      incentive: 'Official Niyo Swag Kit + Certificate',
      error: '',
    });
  };

  const openEditCampaignModal = (c) => {
    setCampaignModal({
      isOpen: true,
      isEdit: true,
      id: c.id,
      title: c.title,
      description: c.description,
      startDate: c.startDate,
      endDate: c.endDate,
      status: c.status,
      targetAmbassadors: c.targetAmbassadors,
      incentive: c.incentive || '',
      error: '',
    });
  };

  const handleSaveCampaign = (e) => {
    e.preventDefault();
    const { isEdit, id, title, description, startDate, endDate, status, targetAmbassadors, incentive } = campaignModal;

    if (!title.trim()) {
      setCampaignModal((prev) => ({ ...prev, error: 'Campaign title is required.' }));
      return;
    }
    if (!description.trim()) {
      setCampaignModal((prev) => ({ ...prev, error: 'Campaign description is required.' }));
      return;
    }
    if (!startDate || !endDate) {
      setCampaignModal((prev) => ({ ...prev, error: 'Both start and end dates are required.' }));
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setCampaignModal((prev) => ({ ...prev, error: 'End date must be after or on start date.' }));
      return;
    }

    if (isEdit && id) {
      updateCampaign(id, { title, description, startDate, endDate, status, targetAmbassadors, incentive });
      triggerToast('Campaign updated successfully.');
    } else {
      createCampaign({ title, description, startDate, endDate, status, targetAmbassadors, incentive });
      triggerToast('New campaign created successfully.');
    }

    setCampaignModal((prev) => ({ ...prev, isOpen: false, error: '' }));
    refreshAllData();
  };

  const handleDeleteCampaign = (id, title) => {
    if (window.confirm(`Are you sure you want to delete campaign: "${title}"?`)) {
      deleteCampaign(id);
      triggerToast('Campaign deleted.');
      refreshAllData();
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
    if (s === 'approved') {
      return <span className="admin-status-badge badge-approved"><FiCheckCircle /> Approved</span>;
    }
    if (s === 'rejected') {
      return <span className="admin-status-badge badge-rejected"><FiXCircle /> Rejected</span>;
    }
    if (s === 'under review') {
      return <span className="admin-status-badge badge-review"><FiClock /> Under Review</span>;
    }
    return <span className="admin-status-badge badge-pending"><FiAlertCircle /> Pending</span>;
  };

  return (
    <div className="admin-portal-wrapper">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="admin-toast" role="alert">
          <FiCheck className="me-2" />
          <span>{toastMessage}</span>
          <button
            type="button"
            className="btn-close-toast ms-auto"
            onClick={() => setToastMessage(null)}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Confirmation Modal (Approve / Reject) */}
      {confirmDialog.isOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className={`modal-icon-banner banner-${confirmDialog.action?.toLowerCase()}`}>
              {confirmDialog.action === 'Approved' ? <FiCheckCircle size={32} /> : <FiAlertCircle size={32} />}
            </div>
            <h3 className="modal-title">Confirm {confirmDialog.action}</h3>
            <p className="modal-desc">
              Are you sure you want to change the status of <strong>{confirmDialog.appName}</strong> ({confirmDialog.appId}) to{' '}
              <strong className={`status-highlight status-${confirmDialog.action?.toLowerCase()}`}>{confirmDialog.action}</strong>?
            </p>

            <div className="modal-field mt-3">
              <label htmlFor="confirm-remarks" className="form-label text-start d-block fw-semibold text-secondary small">
                Admin Remarks (Optional / Included in confirmation):
              </label>
              <textarea
                id="confirm-remarks"
                className="form-control"
                rows="3"
                placeholder="Add final review notes or instructions..."
                value={confirmDialog.remarks}
                onChange={(e) => setConfirmDialog({ ...confirmDialog, remarks: e.target.value })}
              />
            </div>

            <div className="modal-actions mt-4 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary px-3"
                onClick={() => setConfirmDialog({ isOpen: false, action: null, appId: null, appName: '', remarks: '' })}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn px-4 ${confirmDialog.action === 'Approved' ? 'btn-success' : confirmDialog.action === 'Rejected' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleConfirmStatusChange}
              >
                Confirm {confirmDialog.action}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Campaign Modal */}
      {campaignModal.isOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card campaign-modal">
            <div className="modal-header d-flex justify-content-between align-items-center mb-3">
              <h4 className="modal-title m-0 fw-bold">
                {campaignModal.isEdit ? 'Edit Campus Campaign' : 'Create New Campus Campaign'}
              </h4>
              <button
                type="button"
                className="btn-close-clean"
                onClick={() => setCampaignModal({ ...campaignModal, isOpen: false })}
              >
                <FiX size={20} />
              </button>
            </div>

            {campaignModal.error && (
              <div className="alert alert-danger py-2 small mb-3">
                <FiAlertCircle className="me-2" />
                {campaignModal.error}
              </div>
            )}

            <form onSubmit={handleSaveCampaign}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Campaign Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Winter Semester Forex & Travel Drive"
                  value={campaignModal.title}
                  onChange={(e) => setCampaignModal({ ...campaignModal, title: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Campaign Description *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Describe the campaign mission, target audience, and ambassador tasks..."
                  value={campaignModal.description}
                  onChange={(e) => setCampaignModal({ ...campaignModal, description: e.target.value })}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Start Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={campaignModal.startDate}
                    onChange={(e) => setCampaignModal({ ...campaignModal, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">End Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={campaignModal.endDate}
                    onChange={(e) => setCampaignModal({ ...campaignModal, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Status</label>
                  <select
                    className="form-select"
                    value={campaignModal.status}
                    onChange={(e) => setCampaignModal({ ...campaignModal, status: e.target.value })}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Target Ambassadors</label>
                  <input
                    type="number"
                    min="5"
                    className="form-control"
                    value={campaignModal.targetAmbassadors}
                    onChange={(e) => setCampaignModal({ ...campaignModal, targetAmbassadors: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small">Incentive / Reward</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Official Niyo Swag Kit + Certificate + Amazon Voucher"
                  value={campaignModal.incentive}
                  onChange={(e) => setCampaignModal({ ...campaignModal, incentive: e.target.value })}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-3"
                  onClick={() => setCampaignModal({ ...campaignModal, isOpen: false })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4">
                  {campaignModal.isEdit ? 'Update Campaign' : 'Publish Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Application Detail Drawer / Modal */}
      {viewingApp && (
        <div className="admin-modal-overlay">
          <div className="admin-detail-drawer">
            <div className="detail-header d-flex justify-content-between align-items-center">
              <div>
                <span className="app-id-pill">{viewingApp.id}</span>
                <h3 className="app-detail-name m-0 mt-1">{viewingApp.fullName}</h3>
                <span className="text-muted small">Submitted on {viewingApp.submittedAt}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                {renderStatusBadge(viewingApp.status)}
                <button
                  type="button"
                  className="btn-close-clean"
                  onClick={() => setViewingApp(null)}
                  aria-label="Close details"
                >
                  <FiX size={22} />
                </button>
              </div>
            </div>

            <div className="detail-body">
              {/* Quick Contact & College Pill Grid */}
              <div className="detail-card-grid mb-3">
                <div className="detail-info-block">
                  <span className="block-label">Email Address</span>
                  <span className="block-value"><a href={`mailto:${viewingApp.email}`}>{viewingApp.email}</a></span>
                </div>
                <div className="detail-info-block">
                  <span className="block-label">Phone</span>
                  <span className="block-value">{viewingApp.phone || 'Not provided'}</span>
                </div>
                <div className="detail-info-block">
                  <span className="block-label">College / University</span>
                  <span className="block-value fw-semibold">{viewingApp.college}</span>
                </div>
                <div className="detail-info-block">
                  <span className="block-label">Department & Degree</span>
                  <span className="block-value">{viewingApp.department} ({viewingApp.degree})</span>
                </div>
                <div className="detail-info-block">
                  <span className="block-label">Year of Study & CGPA</span>
                  <span className="block-value">{viewingApp.yearOfStudy} • CGPA: {viewingApp.cgpa}</span>
                </div>
                <div className="detail-info-block">
                  <span className="block-label">Country</span>
                  <span className="block-value">{viewingApp.country || 'India'}</span>
                </div>
              </div>

              {/* Profiles & Links */}
              <div className="detail-section mb-3">
                <h5 className="section-title">Profiles & Attachments</h5>
                <div className="d-flex flex-wrap gap-2">
                  {viewingApp.linkedin ? (
                    <a href={viewingApp.linkedin} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                      <FiExternalLink className="me-1" /> LinkedIn Profile
                    </a>
                  ) : (
                    <span className="text-muted small">No LinkedIn provided</span>
                  )}
                  {viewingApp.socialLinks && (
                    <a href={viewingApp.socialLinks} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">
                      <FiShare2 className="me-1" /> Portfolio / Social
                    </a>
                  )}
                  {viewingApp.resume && (
                    <span className="badge bg-light text-dark border p-2 d-inline-flex align-items-center">
                      <FiFileText className="me-1 text-primary" /> {viewingApp.resume}
                    </span>
                  )}
                </div>
              </div>

              {/* Motivation & Community Answers */}
              <div className="detail-section mb-3">
                <h5 className="section-title">Application Answers</h5>

                <div className="qa-block mb-3">
                  <h6 className="qa-question">Why do you want to become a Niyo Student Ambassador?</h6>
                  <p className="qa-answer">{viewingApp.motivation || 'No response provided.'}</p>
                </div>

                <div className="qa-block mb-3">
                  <h6 className="qa-question">Campus Leadership & Student Community Presence</h6>
                  <p className="qa-answer">{viewingApp.campusPresence || 'No response provided.'}</p>
                </div>

                <div className="qa-block mb-3">
                  <h6 className="qa-question">Prior Ambassador or Marketing Experience</h6>
                  <p className="qa-answer">{viewingApp.experience || 'None noted.'}</p>
                </div>

                <div className="qa-block mb-3">
                  <h6 className="qa-question">Ideas for Campus Activation</h6>
                  <p className="qa-answer">{viewingApp.ideas || 'No response provided.'}</p>
                </div>
              </div>

              {/* Admin Remarks Field */}
              <div className="detail-section remarks-section p-3 rounded mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label htmlFor="drawer-remarks" className="form-label m-0 fw-bold text-dark">
                    Admin Reviewer Remarks:
                  </label>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleSaveRemarks}
                  >
                    Save Remarks
                  </button>
                </div>
                <textarea
                  id="drawer-remarks"
                  className="form-control"
                  rows="3"
                  placeholder="Record interview notes, verification status, or reasons for decision..."
                  value={appRemarksInput}
                  onChange={(e) => setAppRemarksInput(e.target.value)}
                />
                <span className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                  Remarks are saved internally for administrative record and future Supabase logging.
                </span>
              </div>
            </div>

            {/* Modal Drawer Action Footer */}
            <div className="detail-footer d-flex justify-content-between align-items-center">
              <div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info me-2"
                  onClick={() => promptStatusChange('Under Review', viewingApp)}
                >
                  <FiClock className="me-1" /> Set Under Review
                </button>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => promptStatusChange('Rejected', viewingApp)}
                >
                  <FiXCircle className="me-1" /> Reject Application
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-success px-3"
                  onClick={() => promptStatusChange('Approved', viewingApp)}
                >
                  <FiCheckCircle className="me-1" /> Approve Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Admin Layout Grid */}
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
                <span className="sidebar-portal-tag">ADMIN PORTAL</span>
              </div>
            </div>
            <button
              type="button"
              className="d-md-none btn-close-white ms-auto"
              onClick={() => setSidebarOpen(false)}
            >
              <FiX color="#fff" size={20} />
            </button>
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
              className={`sidebar-link ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => { setActiveTab('applications'); setSidebarOpen(false); }}
            >
              <FiFileText className="nav-icon" />
              <span>Applications</span>
              {metrics.pending > 0 && (
                <span className="sidebar-badge">{metrics.pending}</span>
              )}
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'ambassadors' ? 'active' : ''}`}
              onClick={() => { setActiveTab('ambassadors'); setSidebarOpen(false); }}
            >
              <FiUsers className="nav-icon" />
              <span>Ambassadors</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'campaigns' ? 'active' : ''}`}
              onClick={() => { setActiveTab('campaigns'); setSidebarOpen(false); }}
            >
              <BsMegaphone className="nav-icon" />
              <span>Campaigns</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'earnings' ? 'active' : ''}`}
              onClick={() => { setActiveTab('earnings'); setSidebarOpen(false); }}
            >
              <FiAward className="nav-icon" />
              <span>Earnings</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'feedback' ? 'active' : ''}`}
              onClick={() => { setActiveTab('feedback'); setSidebarOpen(false); }}
            >
              <FiMessageSquare className="nav-icon" />
              <span>Feedback</span>
            </button>
          </nav>

          {/* Sidebar Footer info & Return to Home */}
          <div className="sidebar-footer">
            <div className="demo-mode-badge mb-3">
              <span className="status-dot"></span>
              <span>Demo Mode (Mock Data)</span>
            </div>

            <button
              type="button"
              className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={onNavigateHome}
            >
              <FiArrowLeft /> Back to Campus Home
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
                aria-label="Open sidebar"
              >
                <FiMenu size={24} />
              </button>
              <div>
                <h1 className="admin-page-title m-0">
                  {activeTab === 'dashboard' && 'Admin Dashboard'}
                  {activeTab === 'applications' && 'Application Management'}
                  {activeTab === 'ambassadors' && 'Active Ambassadors'}
                  {activeTab === 'campaigns' && 'Campaign Management'}
                  {activeTab === 'earnings' && 'Ambassador Earnings & Rewards'}
                  {activeTab === 'feedback' && 'Campus & Student Feedback'}
                </h1>
                <span className="admin-breadcrumb text-muted small">
                  Niyo Campus Admin &gt; {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              {/* Quick Search Bar */}
              <div className="admin-quick-search d-none d-lg-flex align-items-center">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Quick search applicants..."
                  value={appSearch}
                  onChange={(e) => {
                    setAppSearch(e.target.value);
                    if (activeTab !== 'applications') setActiveTab('applications');
                  }}
                />
                {appSearch && (
                  <button type="button" className="btn-clear-search" onClick={() => setAppSearch('')}>
                    <FiX size={14} />
                  </button>
                )}
              </div>

              {/* Notification Bell Dropdown */}
              <div className="notification-wrapper position-relative">
                <button
                  type="button"
                  className="btn-notification-bell"
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="Notifications"
                >
                  <FiBell size={20} />
                  <span className="notification-dot"></span>
                </button>

                {showNotifications && (
                  <div className="notifications-dropdown shadow-lg">
                    <div className="notif-header d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Notifications</span>
                      <span className="badge bg-primary rounded-pill">2 new</span>
                    </div>
                    <div className="notif-list">
                      {notifications.map((n) => (
                        <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                          <div className="notif-title fw-semibold small">{n.title}</div>
                          <div className="notif-text text-muted small">{n.text}</div>
                          <div className="notif-time text-end text-secondary" style={{ fontSize: '0.7rem' }}>{n.time}</div>
                        </div>
                      ))}
                    </div>
                    <div className="notif-footer text-center p-2 border-top">
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-decoration-none p-0"
                        onClick={() => {
                          setNotifications(notifications.map((n) => ({ ...n, unread: false })));
                          setShowNotifications(false);
                        }}
                      >
                        Mark all as read
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Avatar Profile */}
              <div className="admin-profile-pill d-flex align-items-center gap-2">
                <div className="admin-avatar">AD</div>
                <div className="d-none d-sm-block text-start">
                  <div className="admin-name fw-semibold">Campus Admin</div>
                  <div className="admin-role text-muted" style={{ fontSize: '0.72rem' }}>Operations Lead</div>
                </div>
              </div>
            </div>
          </header>

          {/* Security & Prototype Notice Banner */}
          <div className="admin-security-advisory px-4 py-2 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ background: '#fefce8', borderColor: '#fef08a' }}>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-warning text-dark fw-bold">ADMIN PREVIEW</span>
              <span className="small text-dark">
                <strong>Internal Administrative View (Isolated from Public Navigation):</strong> This screen is for authorized personnel only and is excluded from the public student website. Route separation is for development preview and is not a security boundary. Role-based access control (RBAC) and Supabase database RLS policies will enforce access when backend tables are deployed.
              </span>
            </div>
            <span className="badge bg-light text-secondary border small">Demo / Preview Data</span>
          </div>

          {/* Dynamic Page Views */}
          <main className="admin-content-view">
            {/* ========================================================= */}
            {/* VIEW 1: ADMIN DASHBOARD */}
            {/* ========================================================= */}
            {activeTab === 'dashboard' && (
              <div className="dashboard-view">
                {/* 4 Summary Cards */}
                <div className="row g-3 mb-4">
                  <div className="col-12 col-sm-6 col-xl-3">
                    <div className="metric-card card-total">
                      <div className="metric-icon-box">
                        <FiFileText size={24} />
                      </div>
                      <div className="metric-content">
                        <span className="metric-label">Total Applications</span>
                        <h2 className="metric-number">{metrics.total}</h2>
                        <span className="metric-trend trend-positive">
                          <FiCheck size={14} /> Active Applicant Pool
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6 col-xl-3">
                    <div className="metric-card card-pending">
                      <div className="metric-icon-box">
                        <FiAlertCircle size={24} />
                      </div>
                      <div className="metric-content">
                        <span className="metric-label">Pending Review</span>
                        <h2 className="metric-number">{metrics.pending + metrics.underReview}</h2>
                        <span className="metric-trend trend-warning">
                          <FiClock size={14} /> Awaiting decisions
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6 col-xl-3">
                    <div className="metric-card card-approved">
                      <div className="metric-icon-box">
                        <FiCheckCircle size={24} />
                      </div>
                      <div className="metric-content">
                        <span className="metric-label">Approved Ambassadors</span>
                        <h2 className="metric-number">{metrics.approved}</h2>
                        <span className="metric-trend trend-positive">
                          <FiCheck size={14} /> {metrics.approvalRate}% acceptance rate
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6 col-xl-3">
                    <div className="metric-card card-rejected">
                      <div className="metric-icon-box">
                        <FiXCircle size={24} />
                      </div>
                      <div className="metric-content">
                        <span className="metric-label">Rejected / Archived</span>
                        <h2 className="metric-number">{metrics.rejected}</h2>
                        <span className="metric-trend text-muted">
                          Standard evaluation criteria
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Applications Over Time Chart */}
                <div className="chart-card mb-4">
                  <div className="chart-header d-flex flex-wrap justify-content-between align-items-center mb-3">
                    <div>
                      <h4 className="chart-title m-0 fw-bold">Applications & Approvals Over Time</h4>
                      <span className="text-muted small">Monthly trend of campus ambassador applications received</span>
                    </div>
                    <div className="chart-legend d-flex align-items-center gap-3">
                      <span className="legend-item"><span className="legend-dot dot-applications"></span> Applications</span>
                      <span className="legend-item"><span className="legend-dot dot-approved"></span> Approved</span>
                    </div>
                  </div>

                  {/* Accessible SVG Bar Chart */}
                  <div className="chart-svg-container">
                    <svg viewBox="0 0 600 200" className="chart-svg" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="40" y1="30" x2="580" y2="30" stroke="#E6E8F0" strokeDasharray="4" />
                      <line x1="40" y1="80" x2="580" y2="80" stroke="#E6E8F0" strokeDasharray="4" />
                      <line x1="40" y1="130" x2="580" y2="130" stroke="#E6E8F0" strokeDasharray="4" />
                      <line x1="40" y1="170" x2="580" y2="170" stroke="#CBD5E1" />

                      {/* Bars & labels */}
                      {metrics.applicationsOverTime.map((item, idx) => {
                        const x = 70 + idx * 88;
                        const maxCount = 130;
                        const appHeight = (item.count / maxCount) * 140;
                        const appY = 170 - appHeight;

                        const apprHeight = (item.approved / maxCount) * 140;
                        const apprY = 170 - apprHeight;

                        return (
                          <g key={item.month}>
                            {/* Applications Bar */}
                            <rect
                              x={x}
                              y={appY}
                              width="22"
                              height={appHeight}
                              rx="4"
                              fill="#4F35B5"
                              opacity="0.9"
                            >
                              <title>{`${item.month}: ${item.count} Applications`}</title>
                            </rect>

                            {/* Approved Bar */}
                            <rect
                              x={x + 26}
                              y={apprY}
                              width="22"
                              height={apprHeight}
                              rx="4"
                              fill="#10B981"
                              opacity="0.9"
                            >
                              <title>{`${item.month}: ${item.approved} Approved`}</title>
                            </rect>

                            {/* Month Label */}
                            <text
                              x={x + 24}
                              y="190"
                              textAnchor="middle"
                              fill="#64748B"
                              fontSize="12"
                              fontWeight="500"
                            >
                              {item.month}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Two Column Grid: Recent Applications & Recent Campaigns */}
                <div className="row g-4">
                  {/* Recent Applications List */}
                  <div className="col-12 col-lg-7">
                    <div className="section-panel-card">
                      <div className="panel-header d-flex justify-content-between align-items-center mb-3">
                        <h4 className="panel-title m-0 fw-bold">Recent Applications</h4>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-decoration-none fw-semibold"
                          onClick={() => setActiveTab('applications')}
                        >
                          View All ({metrics.total}) &rarr;
                        </button>
                      </div>

                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Applicant</th>
                              <th>College</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {metrics.recentApplications.map((app) => (
                              <tr key={app.id}>
                                <td>
                                  <div className="fw-semibold text-dark">{app.fullName}</div>
                                  <div className="text-muted small">{app.email}</div>
                                </td>
                                <td>
                                  <div className="small fw-medium">{app.college}</div>
                                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{app.yearOfStudy}</div>
                                </td>
                                <td>{renderStatusBadge(app.status)}</td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleOpenAppDetail(app.id)}
                                  >
                                    Review
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Recent Campaigns Section */}
                  <div className="col-12 col-lg-5">
                    <div className="section-panel-card">
                      <div className="panel-header d-flex justify-content-between align-items-center mb-3">
                        <h4 className="panel-title m-0 fw-bold">Active Campaigns</h4>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-decoration-none fw-semibold"
                          onClick={() => setActiveTab('campaigns')}
                        >
                          Manage &rarr;
                        </button>
                      </div>

                      <div className="recent-campaigns-list">
                        {metrics.recentCampaigns.map((camp) => (
                          <div key={camp.id} className="mini-campaign-card p-3 mb-2 rounded border">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <h6 className="campaign-mini-title m-0 fw-bold">{camp.title}</h6>
                              <span className={`badge ${camp.status === 'Ongoing' ? 'bg-success' : 'bg-secondary'}`}>
                                {camp.status}
                              </span>
                            </div>
                            <p className="campaign-mini-desc text-muted small m-0 mb-2">
                              {camp.description.slice(0, 75)}...
                            </p>
                            <div className="d-flex justify-content-between align-items-center text-secondary small">
                              <span><FiCalendar className="me-1" /> Ends {camp.endDate}</span>
                              <span className="fw-semibold text-primary">{camp.activeParticipants}/{camp.targetAmbassadors} Ambassadors</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 2: APPLICATION MANAGEMENT */}
            {/* ========================================================= */}
            {activeTab === 'applications' && (
              <div className="applications-view">
                {/* Search & Filter Controls Card */}
                <div className="controls-card mb-4 p-3 rounded shadow-sm bg-white border">
                  <div className="row g-3 align-items-center">
                    {/* Search Input */}
                    <div className="col-12 col-md-5">
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                          <FiSearch className="text-muted" />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          placeholder="Search by name, email, university, or ID..."
                          value={appSearch}
                          onChange={(e) => setAppSearch(e.target.value)}
                        />
                        {appSearch && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary border-start-0"
                            onClick={() => setAppSearch('')}
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status Filter Tabs */}
                    <div className="col-12 col-md-7">
                      <div className="status-filter-pills d-flex flex-wrap gap-2 justify-content-md-end">
                        {['All', 'Pending', 'Under Review', 'Approved', 'Rejected'].map((status) => (
                          <button
                            key={status}
                            type="button"
                            className={`filter-pill-btn ${appStatusFilter === status ? 'active' : ''}`}
                            onClick={() => setAppStatusFilter(status)}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Batch Action Bar if items selected */}
                  {selectedAppIds.length > 0 && (
                    <div className="batch-action-bar mt-3 pt-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-2">
                      <div className="batch-count fw-semibold text-primary">
                        <FiCheck className="me-1" /> {selectedAppIds.length} applicant(s) selected
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleBatchStatus('Approved')}
                        >
                          Approve Selected
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-info"
                          onClick={() => handleBatchStatus('Under Review')}
                        >
                          Mark Under Review
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleBatchStatus('Rejected')}
                        >
                          Reject Selected
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => setSelectedAppIds([])}
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Applications Table Card */}
                <div className="panel-card bg-white rounded shadow-sm border p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 admin-table">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '40px' }}>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={applications.length > 0 && selectedAppIds.length === applications.length}
                              onChange={toggleSelectAllApps}
                              aria-label="Select all applications"
                            />
                          </th>
                          <th>Applicant Name</th>
                          <th>University / College</th>
                          <th>Country</th>
                          <th>Applied Date</th>
                          <th>Status</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.length > 0 ? (
                          applications.map((app) => (
                            <tr key={app.id} className={selectedAppIds.includes(app.id) ? 'table-active' : ''}>
                              <td>
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={selectedAppIds.includes(app.id)}
                                  onChange={() => toggleSelectApp(app.id)}
                                  aria-label={`Select ${app.fullName}`}
                                />
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div className="applicant-avatar">
                                    {app.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                  </div>
                                  <div>
                                    <div className="fw-semibold text-dark">{app.fullName}</div>
                                    <div className="text-muted small">{app.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="fw-medium text-dark">{app.college}</div>
                                <div className="text-muted small">{app.department}</div>
                              </td>
                              <td>
                                <span className="country-tag">{app.country || 'India'}</span>
                              </td>
                              <td>
                                <span className="small text-muted">{app.submittedAt}</span>
                              </td>
                              <td>{renderStatusBadge(app.status)}</td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleOpenAppDetail(app.id)}
                                >
                                  <FiEye className="me-1" /> View Details
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center py-5 text-muted">
                              <FiAlertCircle size={36} className="d-block mx-auto mb-2 opacity-50" />
                              <h5 className="m-0 fw-semibold">No Applications Found</h5>
                              <p className="small text-secondary mt-1">
                                No applications match your search query: "{appSearch}" or status filter: "{appStatusFilter}".
                              </p>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary mt-2"
                                onClick={() => {
                                  setAppSearch('');
                                  setAppStatusFilter('All');
                                }}
                              >
                                Clear All Filters
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="panel-footer p-3 border-top d-flex justify-content-between align-items-center">
                    <span className="text-muted small">
                      Showing <strong>{applications.length}</strong> applicant records
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => {
                        resetDemoData();
                        refreshAllData();
                        triggerToast('Demo applications data reset to defaults.');
                      }}
                    >
                      <FiRefreshCw className="me-1" /> Reset Demo Seed Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 3: CAMPAIGNS MANAGEMENT */}
            {/* ========================================================= */}
            {activeTab === 'campaigns' && (
              <div className="campaigns-view">
                {/* Header with Create Campaign CTA & Filter */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                  <div className="campaign-filter-tabs d-flex gap-2">
                    {['All', 'Ongoing', 'Upcoming', 'Completed'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`filter-pill-btn ${campaignFilter === st ? 'active' : ''}`}
                        onClick={() => setCampaignFilter(st)}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={openCreateCampaignModal}
                  >
                    <FiPlus /> Create Campaign
                  </button>
                </div>

                {/* Campaigns Grid */}
                <div className="row g-4">
                  {campaigns.map((c) => (
                    <div key={c.id} className="col-12 col-md-6 col-xl-6">
                      <div className="campaign-card h-100 p-4 rounded bg-white border shadow-sm d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="badge bg-light text-primary border">{c.id}</span>
                            <span className={`badge ${c.status === 'Ongoing' ? 'bg-success' : c.status === 'Upcoming' ? 'bg-info' : 'bg-secondary'}`}>
                              {c.status}
                            </span>
                          </div>

                          <h4 className="campaign-card-title fw-bold text-dark mb-2">{c.title}</h4>
                          <p className="campaign-card-desc text-muted mb-3">{c.description}</p>

                          <div className="campaign-dates p-2 bg-light rounded small mb-3 text-secondary">
                            <FiCalendar className="me-2 text-primary" />
                            <strong>Active Window:</strong> {c.startDate} &mdash; {c.endDate}
                          </div>

                          <div className="campaign-incentive small mb-3">
                            <span className="fw-semibold text-dark">Incentive: </span>
                            <span className="text-muted">{c.incentive}</span>
                          </div>

                          {/* Ambassador Participation Bar */}
                          <div className="campaign-progress mb-3">
                            <div className="d-flex justify-content-between small text-muted mb-1">
                              <span>Ambassador Participation</span>
                              <span className="fw-bold text-primary">{c.activeParticipants || 0} / {c.targetAmbassadors}</span>
                            </div>
                            <div className="progress" style={{ height: '8px' }}>
                              <div
                                className="progress-bar bg-primary"
                                style={{
                                  width: `${Math.min(100, Math.round(((c.activeParticipants || 0) / (c.targetAmbassadors || 30)) * 100))}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="card-actions pt-3 border-top d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => openEditCampaignModal(c)}
                          >
                            <FiEdit2 className="me-1" /> Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteCampaign(c.id, c.title)}
                          >
                            <FiTrash2 className="me-1" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 4: AMBASSADORS DIRECTORY */}
            {/* ========================================================= */}
            {activeTab === 'ambassadors' && (
              <div className="ambassadors-view">
                <div className="panel-card bg-white rounded shadow-sm border p-4 mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h4 className="fw-bold m-0">Student Ambassador Roster</h4>
                      <span className="text-muted small">Approved student representatives across university campuses</span>
                    </div>
                    <span className="badge bg-primary px-3 py-2 rounded-pill">
                      {ambassadors.length} Active Ambassadors
                    </span>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Ambassador</th>
                          <th>College / University</th>
                          <th>Country</th>
                          <th>Joined Date</th>
                          <th>Campaigns</th>
                          <th>Rating</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ambassadors.map((amb) => (
                          <tr key={amb.id}>
                            <td>
                              <div className="fw-semibold text-dark">{amb.name}</div>
                              <div className="text-muted small">{amb.email}</div>
                            </td>
                            <td>{amb.college}</td>
                            <td><span className="country-tag">{amb.country}</span></td>
                            <td>{amb.joinedDate}</td>
                            <td><span className="badge bg-light text-dark border">{amb.campaignsCompleted} completed</span></td>
                            <td><span className="text-warning fw-bold">★ {amb.rating}</span></td>
                            <td><span className="badge bg-success">Active</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 5: EARNINGS & REWARDS */}
            {/* ========================================================= */}
            {activeTab === 'earnings' && (
              <div className="earnings-view">
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-4">
                    <div className="metric-card card-total">
                      <div className="metric-icon-box"><FiAward size={24} /></div>
                      <div className="metric-content">
                        <span className="metric-label">Total Rewards Disbursed</span>
                        <h2 className="metric-number">{earnings.totalDisbursed}</h2>
                        <span className="metric-trend trend-positive">Across all 2026 campaigns</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="metric-card card-pending">
                      <div className="metric-icon-box"><FiClock size={24} /></div>
                      <div className="metric-content">
                        <span className="metric-label">Pending Payout Approvals</span>
                        <h2 className="metric-number">{earnings.pendingPayouts}</h2>
                        <span className="metric-trend trend-warning">Under verification</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="metric-card card-approved">
                      <div className="metric-icon-box"><FiUsers size={24} /></div>
                      <div className="metric-content">
                        <span className="metric-label">Average Payout / Ambassador</span>
                        <h2 className="metric-number">{earnings.avgPerAmbassador}</h2>
                        <span className="metric-trend trend-positive">Based on active earners</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel-card bg-white rounded shadow-sm border p-4">
                  <h4 className="fw-bold mb-3">Recent Ambassador Disbursals</h4>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Payout ID</th>
                          <th>Ambassador</th>
                          <th>College</th>
                          <th>Amount</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {earnings.recentPayouts.map((p) => (
                          <tr key={p.id}>
                            <td><span className="badge bg-light text-secondary border">{p.id}</span></td>
                            <td className="fw-semibold">{p.ambassador}</td>
                            <td className="text-muted">{p.college}</td>
                            <td className="fw-bold text-success">{p.amount}</td>
                            <td>{p.date}</td>
                            <td>
                              <span className={`badge ${p.status === 'Completed' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 6: FEEDBACK */}
            {/* ========================================================= */}
            {activeTab === 'feedback' && (
              <div className="feedback-view">
                <div className="panel-card bg-white rounded shadow-sm border p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h4 className="fw-bold m-0">Student & Ambassador Feedback</h4>
                      <span className="text-muted small">Input on campus drives, card features, and program operations</span>
                    </div>
                  </div>

                  <div className="feedback-list">
                    {feedbackList.map((fb) => (
                      <div key={fb.id} className="feedback-card p-3 mb-3 rounded border bg-light">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <span className="fw-bold text-dark me-2">{fb.author}</span>
                            <span className="badge bg-secondary me-2">{fb.role}</span>
                            <span className="text-muted small">{fb.college}</span>
                          </div>
                          <span className="badge bg-info">{fb.category}</span>
                        </div>
                        <p className="m-0 mb-2 text-secondary">{fb.message}</p>
                        <div className="d-flex justify-content-between align-items-center text-muted" style={{ fontSize: '0.75rem' }}>
                          <span>Submitted on {fb.date}</span>
                          <span className="text-success fw-semibold"><FiCheck className="me-1" /> {fb.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
