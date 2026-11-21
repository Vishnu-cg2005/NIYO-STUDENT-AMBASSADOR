import React, { useState, useEffect } from 'react';
import {
  FiArrowRight,
  FiArrowLeft,
  FiArrowUpRight,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiHome,
  FiEdit3,
  FiFileText,
  FiUser,
  FiBook,
  FiAward,
} from 'react-icons/fi';
import { submitStudentApplication, getStudentApplication } from './adminService';

const yearOptions = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Post Graduate',
  'Other',
];

const initialFormState = {
  // Step 1: Personal Details
  fullName: '',
  email: '',
  phone: '',
  collegeName: '',
  department: '',
  currentYear: '',
  cityState: '',

  // Step 2: Academic Details
  registerNumber: '',
  graduationYear: '',
  cgpaPercentage: '',
  linkedin: '',
  resumeUrl: '',

  // Step 3: Community & Submit
  whyAmbassador: '',
  communityEventDetails: '',
  declaration: false,
};

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

function ApplicationHeader({ onNavigateHome, onNavigateDashboard }) {
  return (
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
          <button
            type="button"
            className="app-nav-link btn-link"
            onClick={onNavigateDashboard}
          >
            Dashboard
          </button>
          <button
            type="button"
            className="button button-secondary back-home-btn"
            onClick={onNavigateHome}
          >
            <FiArrowLeft aria-hidden="true" /> Back to Home
          </button>
        </div>
      </div>
    </header>
  );
}

export default function ApplicationForm({ onNavigateHome, onNavigateDashboard }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);
  const [showDraftNotice, setShowDraftNotice] = useState(false);

  // Check if student already has an active application to prevent duplicate submissions
  const [existingActiveApp, setExistingActiveApp] = useState(() => {
    try {
      const userStr = localStorage.getItem('niyo_student_user');
      const email = userStr ? JSON.parse(userStr).email : null;
      const found = getStudentApplication(email);
      if (found && ['Pending', 'Under Review', 'Approved'].includes(found.status)) {
        return found;
      }
    } catch {
      // fallback
    }
    return null;
  });

  // Initialize from localStorage draft or default
  const [formData, setFormData] = useState(() => {
    try {
      const savedDraft = localStorage.getItem('niyo_application_draft');
      if (savedDraft) {
        return JSON.parse(savedDraft);
      }
      const userStr = localStorage.getItem('niyo_student_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          ...initialFormState,
          fullName: user.fullName || '',
          email: user.email || '',
          collegeName: user.collegeName || '',
        };
      }
    } catch {
      // fallback
    }
    return initialFormState;
  });

  const [errors, setErrors] = useState({});

  // Auto-save draft to localStorage whenever fields change to prevent accidental loss
  useEffect(() => {
    if (!isSubmitted) {
      try {
        localStorage.setItem('niyo_application_draft', JSON.stringify(formData));
      } catch {
        // ignore
      }
    }
  }, [formData, isSubmitted]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required.';
      if (!formData.email.trim()) {
        newErrors.email = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required.';
      } else if (!/^[+0-9\s-()]{7,18}$/.test(formData.phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number.';
      }
      if (!formData.collegeName.trim()) newErrors.collegeName = 'College name is required.';
      if (!formData.department.trim()) newErrors.department = 'Department is required.';
      if (!formData.currentYear) newErrors.currentYear = 'Please select current year of study.';
      if (!formData.cityState.trim()) newErrors.cityState = 'City and State are required.';
    } else if (step === 2) {
      if (!formData.registerNumber.trim()) newErrors.registerNumber = 'Register / Roll number is required.';
      if (!formData.graduationYear) {
        newErrors.graduationYear = 'Graduation year is required.';
      } else {
        const year = parseInt(formData.graduationYear, 10);
        if (isNaN(year) || year < 2020 || year > 2040) {
          newErrors.graduationYear = 'Please enter a valid 4-digit graduation year.';
        }
      }
      if (!formData.cgpaPercentage.trim()) newErrors.cgpaPercentage = 'CGPA or percentage is required.';
      if (formData.linkedin.trim() && !/^https?:\/\/.+/i.test(formData.linkedin.trim())) {
        newErrors.linkedin = 'Please enter a valid URL (e.g. https://linkedin.com/in/...).';
      }
      if (formData.resumeUrl.trim() && !/^https?:\/\/.+/i.test(formData.resumeUrl.trim())) {
        newErrors.resumeUrl = 'Please enter a valid link (e.g. Google Drive, OneDrive, or portfolio link).';
      }
    } else if (step === 3) {
      if (!formData.whyAmbassador.trim()) {
        newErrors.whyAmbassador = 'Please tell us why you want to become a Niyo Campus Student Ambassador.';
      }
      if (!formData.communityEventDetails.trim()) {
        newErrors.communityEventDetails = 'Please provide details of your community/event experience or write None.';
      }
      if (!formData.declaration) {
        newErrors.declaration = 'You must confirm that the provided information is correct.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(3)) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);

        // Store submitted application in single source of truth with status: 'Pending'
        const result = submitStudentApplication(formData);
        setSubmittedApp(result.application);
        setIsSubmitted(true);

        try {
          localStorage.removeItem('niyo_application_draft');
        } catch {
          // ignore
        }

        window.scrollTo({ top: 120, behavior: 'smooth' });
      }, 700);
    }
  };

  const stepsMeta = [
    { num: 1, title: 'Personal Details' },
    { num: 2, title: 'Academic Details' },
    { num: 3, title: 'Community & Submit' },
  ];

  return (
    <div className="application-page">
      <ApplicationHeader
        onNavigateHome={onNavigateHome}
        onNavigateDashboard={onNavigateDashboard}
      />

      <main id="main-content" className="application-main">
        {/* Page Introduction */}
        <div className="page-shell application-intro">
          <div className="eyebrow center-eyebrow">
            <span aria-hidden="true"></span> NIYO CAMPUS
          </div>
          <h1>Become a Niyo Student Ambassador</h1>
          <p className="intro-text">
            Complete the application form below to express your interest in representing Niyo within your university community.
          </p>
        </div>

        {/* Form Container */}
        <div className="page-shell">
          <div className="form-wrapper">
            {existingActiveApp && !isSubmitted ? (
              /* Active Application Already in Progress Notice */
              <div className="form-card text-center p-4 p-md-5">
                <div className="active-icon-circle mx-auto mb-3" style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiClock size={32} color="#d97706" />
                </div>
                <span className={`badge ${existingActiveApp.status === 'Approved' ? 'bg-success' : existingActiveApp.status === 'Under Review' ? 'bg-primary' : 'bg-warning text-dark'} px-3 py-2 rounded-pill mb-2 fw-bold`}>
                  Status: {existingActiveApp.status}
                </span>
                <h2 className="fw-bold mb-2">Active Application in Progress</h2>
                <p className="text-muted mb-3" style={{ maxWidth: '500px', margin: '0 auto 16px' }}>
                  You already have an active student ambassador application (<strong>#{existingActiveApp.id}</strong>) submitted on <strong>{existingActiveApp.submittedAt}</strong>.
                </p>
                <div className="p-3 bg-light rounded small text-secondary mb-4 text-start" style={{ maxWidth: '520px', margin: '0 auto 20px' }}>
                  <strong className="text-dark">Duplicate Submission Protection:</strong> To ensure fair and orderly evaluation, new submissions are locked while your application is active. You can track real-time reviewer decisions on your Student Dashboard.
                </div>
                <div className="d-flex justify-content-center flex-wrap gap-2">
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={onNavigateDashboard}
                  >
                    View Status on Dashboard <FiArrowRight aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={onNavigateHome}
                  >
                    <FiHome aria-hidden="true" /> Back to Home
                  </button>
                </div>
              </div>
            ) : !isSubmitted ? (
              <>
                {/* 3-Step Progress Indicator */}
                <div
                  className="step-progress-indicator"
                  role="progressbar"
                  aria-valuenow={currentStep}
                  aria-valuemin="1"
                  aria-valuemax="3"
                  aria-label="Application Progress"
                >
                  <div className="progress-track" aria-hidden="true">
                    <div
                      className="progress-fill"
                      style={{
                        width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
                      }}
                    ></div>
                  </div>

                  <div className="progress-steps-row">
                    {stepsMeta.map((s) => {
                      const isCompleted = currentStep > s.num;
                      const isActive = currentStep === s.num;
                      return (
                        <div
                          key={s.num}
                          className={`progress-step-item ${isActive ? 'active' : ''} ${
                            isCompleted ? 'completed' : ''
                          }`}
                        >
                          <div className="progress-node">
                            {isCompleted ? <FiCheck aria-hidden="true" /> : s.num}
                          </div>
                          <span className="progress-title">{s.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form Card */}
                <form className="form-card" onSubmit={handleSubmit} noValidate>
                  {/* STEP 1: Personal Details */}
                  {currentStep === 1 && (
                    <div className="form-step-panel">
                      <div className="step-panel-header">
                        <h2>Step 1 — Personal Details</h2>
                        <p>Provide your basic contact and university affiliation details.</p>
                      </div>

                      <div className="form-grid-two">
                        <div className="form-field">
                          <label htmlFor="fullName">
                            Full Name <span className="req-star" aria-hidden="true">*</span>
                          </label>
                          <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className={errors.fullName ? 'has-error' : ''}
                            aria-required="true"
                            aria-invalid={errors.fullName ? 'true' : 'false'}
                          />
                          {errors.fullName && (
                            <span className="field-error" role="alert">
                              <FiAlertCircle aria-hidden="true" /> {errors.fullName}
                            </span>
                          )}
                        </div>

                        <div className="form-field">
                          <label htmlFor="email">
                            Email Address <span className="req-star" aria-hidden="true">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                            className={errors.email ? 'has-error' : ''}
                            aria-required="true"
                            aria-invalid={errors.email ? 'true' : 'false'}
                          />
                          {errors.email && (
                            <span className="field-error" role="alert">
                              <FiAlertCircle aria-hidden="true" /> {errors.email}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="form-grid-two">
                        <div className="form-field">
                          <label htmlFor="phone">
                            Phone Number <span className="req-star" aria-hidden="true">*</span>
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            className={errors.phone ? 'has-error' : ''}
                            aria-required="true"
                            aria-invalid={errors.phone ? 'true' : 'false'}
                          />
                          {errors.phone && (
                            <span className="field-error" role="alert">
                              <FiAlertCircle aria-hidden="true" /> {errors.phone}
                            </span>
                          )}
                        </div>

                        <div className="form-field">
                          <label htmlFor="collegeName">
                            College Name <span className="req-star" aria-hidden="true">*</span>
                          </label>
                          <input
                            type="text"
                            id="collegeName"
                            name="collegeName"
                            value={formData.collegeName}
                            onChange={handleChange}
                            placeholder="Enter your college or university"
                            className={errors.collegeName ? 'has-error' : ''}
                            aria-required="true"
                            aria-invalid={errors.collegeName ? 'true' : 'false'}
                          />
                          {errors.collegeName && (
                            <span className="field-error" role="alert">
                              <FiAlertCircle aria-hidden="true" /> {errors.collegeName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="form-grid-two">
                        <div className="form-field">
                          <label htmlFor="department">
                            Department <span className="req-star" aria-hidden="true">*</span>
                          </label>
                          <input
                            type="text"
                            id="department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            placeholder="e.g. Computer Science, Finance, Commerce"
                            className={errors.department ? 'has-error' : ''}
                            aria-required="true"
                            aria-invalid={errors.department ? 'true' : 'false'}
                          />
                          {errors.department && (
                            <span className="field-error" role="alert">
                              <FiAlertCircle aria-hidden="true" /> {errors.department}
                            </span>
                          )}
                        </div>

                        <div className="form-field">
                          <label htmlFor="currentYear">
                            Current Year of Study <span className="req-star" aria-hidden="true">*</span>
                          </label>
                          <select
                            id="currentYear"
                            name="currentYear"
                            value={formData.currentYear}
                            onChange={handleChange}
                            className={errors.currentYear ? 'has-error' : ''}
                            aria-required="true"
                            aria-invalid={errors.currentYear ? 'true' : 'false'}
                          >
                            <option value="">Select current year</option>
                            {yearOptions.map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>
                          {errors.currentYear && (
                            <span className="field-error" role="alert">
                              <FiAlertCircle aria-hidden="true" /> {errors.currentYear}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="form-field">
                        <label htmlFor="cityState">
                          City and State <span className="req-star" aria-hidden="true">*</span>
                        </label>
                        <input
                          type="text"
                          id="cityState"
                          name="cityState"
                          value={formData.cityState}
                          onChange={handleChange}
                          placeholder="e.g. Bengaluru, Karnataka"
                          className={errors.cityState ? 'has-error' : ''}
                          aria-required="true"
                          aria-invalid={errors.cityState ? 'true' : 'false'}
                        />
                        {errors.cityState && (
                          <span className="field-error" role="alert">
                            <FiAlertCircle aria-hidden="true" /> {errors.cityState}
                          </span>
                        )}
                      </div>

                      <div className="form-actions-row">
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={onNavigateHome}
                        >
                          <FiHome aria-hidden="true" /> Back to Home
                        </button>
                        <button
                          type="button"
                          className="button button-primary"
                          onClick={handleContinue}
                        >
                          Continue <FiArrowRight aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Academic Details */}
                  {currentStep === 2 && (
                    <div className="form-step-panel">
                      <div className="step-panel-header">
                        <h2>Step 2 — Academic Details</h2>
                        <p>Share your academic credentials and professional links.</p>
                      </div>

                      <div className="form-grid-two">
                        <div className="form-field">
                          <label htmlFor="registerNumber">
                            Register Number <span className="req-star" aria-hidden="true">*</span>
                          </label>
                          <input
                            type="text"
                            id="registerNumber"
                            name="registerNumber"
                            value={formData.registerNumber}
                            onChange={handleChange}
                            placeholder="Enter your student roll/register number"
                            className={errors.registerNumber ? 'has-error' : ''}
                            aria-required="true"
                            aria-invalid={errors.registerNumber ? 'true' : 'false'}
                          />
                          {errors.registerNumber && (
                            <span className="field-error" role="alert">
                              <FiAlertCircle aria-hidden="true" /> {errors.registerNumber}
                            </span>
                          )}
                        </div>

                        <div className="form-field">
                          <label htmlFor="graduationYear">
                            Graduation Year <span className="req-star" aria-hidden="true">*</span>
                          </label>
                          <input
                            type="number"
                            id="graduationYear"
                            name="graduationYear"
                            value={formData.graduationYear}
                            onChange={handleChange}
                            placeholder="e.g. 2026"
                            min="2020"
                            max="2040"
                            className={errors.graduationYear ? 'has-error' : ''}
                            aria-required="true"
                            aria-invalid={errors.graduationYear ? 'true' : 'false'}
                          />
                          {errors.graduationYear && (
                            <span className="field-error" role="alert">
                              <FiAlertCircle aria-hidden="true" /> {errors.graduationYear}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="form-field">
                        <label htmlFor="cgpaPercentage">
                          CGPA or Percentage <span className="req-star" aria-hidden="true">*</span>
                        </label>
                        <input
                          type="text"
                          id="cgpaPercentage"
                          name="cgpaPercentage"
                          value={formData.cgpaPercentage}
                          onChange={handleChange}
                          placeholder="e.g. 8.5 CGPA or 82%"
                          className={errors.cgpaPercentage ? 'has-error' : ''}
                          aria-required="true"
                          aria-invalid={errors.cgpaPercentage ? 'true' : 'false'}
                        />
                        {errors.cgpaPercentage && (
                          <span className="field-error" role="alert">
                            <FiAlertCircle aria-hidden="true" /> {errors.cgpaPercentage}
                          </span>
                        )}
                      </div>

                      <div className="form-grid-two">
                        <div className="form-field">
                          <label htmlFor="linkedin">LinkedIn Profile URL</label>
                          <input
                            type="url"
                            id="linkedin"
                            name="linkedin"
                            value={formData.linkedin}
                            onChange={handleChange}
                            placeholder="https://linkedin.com/in/username"
                            className={errors.linkedin ? 'has-error' : ''}
                            aria-describedby={errors.linkedin ? 'error-linkedin' : undefined}
                          />
                          {errors.linkedin && (
                            <span id="error-linkedin" className="field-error" role="alert">
                              <FiAlertCircle aria-hidden="true" /> {errors.linkedin}
                            </span>
                          )}
                        </div>

                        <div className="form-field">
                          <label htmlFor="resumeUrl">Resume URL (Drive / Portfolio Link)</label>
                          <input
                            type="url"
                            id="resumeUrl"
                            name="resumeUrl"
                            value={formData.resumeUrl}
                            onChange={handleChange}
                            placeholder="https://drive.google.com/..."
                            className={errors.resumeUrl ? 'has-error' : ''}
                            aria-describedby={errors.resumeUrl ? 'error-resumeUrl' : undefined}
                          />
                          {errors.resumeUrl && (
                            <span id="error-resumeUrl" className="field-error" role="alert">
                              <FiAlertCircle aria-hidden="true" /> {errors.resumeUrl}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="form-actions-row">
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={handlePrevious}
                        >
                          <FiArrowLeft aria-hidden="true" /> Previous
                        </button>
                        <button
                          type="button"
                          className="button button-primary"
                          onClick={handleContinue}
                        >
                          Continue <FiArrowRight aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Community & Submit + Final Review */}
                  {currentStep === 3 && (
                    <div className="form-step-panel">
                      <div className="step-panel-header">
                        <h2>Step 3 — Community & Submit</h2>
                        <p>Review your information and share your campus community motivation.</p>
                      </div>

                      {/* Final Review of Application */}
                      <div className="application-review-box">
                        <div className="review-box-header">
                          <h3>
                            <FiFileText aria-hidden="true" /> Application Summary Review
                          </h3>
                          <button
                            type="button"
                            className="edit-step-btn"
                            onClick={() => setCurrentStep(1)}
                          >
                            <FiEdit3 aria-hidden="true" /> Edit Details
                          </button>
                        </div>
                        <div className="review-grid">
                          <div>
                            <strong>Full Name:</strong> <span>{formData.fullName || '—'}</span>
                          </div>
                          <div>
                            <strong>Email:</strong> <span>{formData.email || '—'}</span>
                          </div>
                          <div>
                            <strong>Phone:</strong> <span>{formData.phone || '—'}</span>
                          </div>
                          <div>
                            <strong>College:</strong> <span>{formData.collegeName || '—'}</span>
                          </div>
                          <div>
                            <strong>Department:</strong> <span>{formData.department || '—'}</span>
                          </div>
                          <div>
                            <strong>Year of Study:</strong> <span>{formData.currentYear || '—'}</span>
                          </div>
                          <div>
                            <strong>City & State:</strong> <span>{formData.cityState || '—'}</span>
                          </div>
                          <div>
                            <strong>Register No:</strong> <span>{formData.registerNumber || '—'}</span>
                          </div>
                          <div>
                            <strong>Graduation:</strong> <span>{formData.graduationYear || '—'}</span>
                          </div>
                          <div>
                            <strong>CGPA / %:</strong> <span>{formData.cgpaPercentage || '—'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="form-field">
                        <label htmlFor="whyAmbassador">
                          Why do you want to become a Niyo Campus Student Ambassador?{' '}
                          <span className="req-star" aria-hidden="true">*</span>
                        </label>
                        <textarea
                          id="whyAmbassador"
                          name="whyAmbassador"
                          rows="4"
                          value={formData.whyAmbassador}
                          onChange={handleChange}
                          placeholder="Describe what motivates you to represent Niyo on campus and help fellow students."
                          className={errors.whyAmbassador ? 'has-error' : ''}
                          aria-required="true"
                          aria-invalid={errors.whyAmbassador ? 'true' : 'false'}
                        />
                        {errors.whyAmbassador && (
                          <span className="field-error" role="alert">
                            <FiAlertCircle aria-hidden="true" /> {errors.whyAmbassador}
                          </span>
                        )}
                      </div>

                      <div className="form-field">
                        <label htmlFor="communityEventDetails">
                          Have you participated in any student community or event? If yes, provide details.{' '}
                          <span className="req-star" aria-hidden="true">*</span>
                        </label>
                        <textarea
                          id="communityEventDetails"
                          name="communityEventDetails"
                          rows="4"
                          value={formData.communityEventDetails}
                          onChange={handleChange}
                          placeholder="Mention clubs, fests, student communities, or events you have organized or attended (or write 'None')."
                          className={errors.communityEventDetails ? 'has-error' : ''}
                          aria-required="true"
                          aria-invalid={errors.communityEventDetails ? 'true' : 'false'}
                        />
                        {errors.communityEventDetails && (
                          <span className="field-error" role="alert">
                            <FiAlertCircle aria-hidden="true" /> {errors.communityEventDetails}
                          </span>
                        )}
                      </div>

                      <div className="declaration-box">
                        <label className="checkbox-label" htmlFor="declaration">
                          <input
                            type="checkbox"
                            id="declaration"
                            name="declaration"
                            checked={formData.declaration}
                            onChange={handleChange}
                            aria-required="true"
                            aria-invalid={errors.declaration ? 'true' : 'false'}
                          />
                          <span>
                            I confirm that the provided information is correct.{' '}
                            <span className="req-star" aria-hidden="true">*</span>
                          </span>
                        </label>
                        {errors.declaration && (
                          <span className="field-error" role="alert">
                            <FiAlertCircle aria-hidden="true" /> {errors.declaration}
                          </span>
                        )}
                      </div>

                      <div className="form-actions-row">
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={handlePrevious}
                          disabled={isSubmitting}
                        >
                          <FiArrowLeft aria-hidden="true" /> Previous
                        </button>
                        <button
                          type="submit"
                          className="button button-primary submit-btn"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="submitting-spinner">Submitting Application...</span>
                          ) : (
                            <>
                              Submit Application <FiArrowUpRight aria-hidden="true" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </>
            ) : (
              /* Success Confirmation Card */
              <div className="submission-success-card" role="status" aria-live="polite">
                <div className="success-icon-wrap" aria-hidden="true">
                  <FiCheckCircle />
                </div>
                <div className="mb-2">
                  <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
                    Status: Pending Admin Review
                  </span>
                </div>
                <h2>Application Submitted Successfully</h2>
                <p className="success-desc">
                  Your application <strong>#{submittedApp?.id || 'APP-2026'}</strong> was submitted on <strong>{submittedApp?.submittedAt || 'Today'}</strong> and is now in the <strong>Pending</strong> review queue.
                </p>
                <div className="p-3 bg-light rounded small text-secondary mb-4 text-start" style={{ maxWidth: '520px', margin: '0 auto 20px' }}>
                  <strong className="text-dark">Next Steps:</strong> Niyo Campus administrators review submissions on a rolling basis. You can monitor your review timeline, application details, and reviewer remarks on your Student Dashboard.
                </div>
                <div className="success-actions">
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={onNavigateDashboard}
                  >
                    View Student Dashboard <FiArrowRight aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={onNavigateHome}
                  >
                    <FiHome aria-hidden="true" /> Back to Home
                  </button>
                </div>
              </div>
            )}
          </div>
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
