import React, { useState, useEffect } from 'react';
import {
  FiUser,
  FiPhone,
  FiBook,
  FiLayers,
  FiCalendar,
  FiMapPin,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiInfo,
  FiLogOut,
} from 'react-icons/fi';
import { saveUserProfile, isProfileComplete, getUserProfile } from './supabaseClient';

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

export default function ProfileCompletion({
  user,
  onComplete,
  onNavigateHome,
  onLogout,
}) {
  // Pre-fill initial name and email from Google OAuth user
  const initialName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.fullName ||
    '';

  const userEmail = user?.email || user?.user_metadata?.email || '';

  // Check if there is an existing profile to resume
  const existingProfile = user?.id ? getUserProfile(user.id) : null;

  const [formData, setFormData] = useState({
    fullName: existingProfile?.fullName || initialName,
    email: userEmail,
    phone: existingProfile?.phone || '',
    collegeName: existingProfile?.collegeName || '',
    department: existingProfile?.department || '',
    yearOfStudy: existingProfile?.yearOfStudy || '',
    city: existingProfile?.city || '',
    state: existingProfile?.state || '',
    graduationYear: existingProfile?.graduationYear || '',
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (initialName && !formData.fullName) {
      setFormData((prev) => ({ ...prev, fullName: initialName }));
    }
    if (userEmail && !formData.email) {
      setFormData((prev) => ({ ...prev, email: userEmail }));
    }
  }, [initialName, userEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^[0-9+\s\-()]{8,18}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number.';
    }

    if (!formData.collegeName.trim()) {
      newErrors.collegeName = 'College or University name is required.';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department / Major is required.';
    }

    if (!formData.yearOfStudy) {
      newErrors.yearOfStudy = 'Please select your current year of study.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State / Region is required.';
    }

    if (!formData.graduationYear) {
      newErrors.graduationYear = 'Please select your expected graduation year.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const profilePayload = {
        ...formData,
        email: userEmail,
        authProvider: 'google',
      };

      const result = saveUserProfile(user?.id || 'demo_user', profilePayload);

      setIsSaving(false);
      setSaveSuccess(true);

      setTimeout(() => {
        if (onComplete) {
          onComplete(result.profile || profilePayload);
        }
      }, 700);
    }, 600);
  };

  return (
    <div className="profile-completion-page">
      <header className="site-header" role="banner">
        <div className="page-shell header-inner">
          <Brand onNavigateHome={onNavigateHome} />
          <div className="d-flex align-items-center gap-3">
            {onLogout && (
              <button
                type="button"
                className="button button-secondary compact-btn"
                onClick={onLogout}
              >
                <FiLogOut aria-hidden="true" /> Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="profile-completion-main">
        <div className="page-shell">
          <div className="profile-completion-wrapper">
            <div className="profile-card">
              {/* Header */}
              <div className="profile-header text-center mb-4">
                <span className="profile-step-pill mb-2 d-inline-block">
                  Step 2 of 2: Profile Setup
                </span>
                <h1 className="profile-title">Complete Your Student Profile</h1>
                <p className="profile-subtitle text-muted">
                  You’ve successfully connected with Google. Fill in your academic and location details to finalize your ambassador profile.
                </p>
              </div>

              {/* Google Account Connected Bar */}
              <div className="google-connected-pill d-flex align-items-center justify-content-between p-3 rounded mb-4">
                <div className="d-flex align-items-center gap-2">
                  <div className="google-icon-circle">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="small text-muted d-block">Authenticated Google Account</span>
                    <strong className="text-dark">{userEmail || 'Google User'}</strong>
                  </div>
                </div>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small">
                  <FiCheckCircle className="me-1" /> Verified Session
                </span>
              </div>

              {/* Temporary Storage Notice */}
              <div className="preview-storage-banner p-3 rounded mb-4">
                <div className="d-flex align-items-start gap-2">
                  <FiInfo className="text-primary mt-1 flex-shrink-0" size={18} />
                  <div className="small text-muted">
                    <strong className="text-dark">Temporary Local Preview: </strong>
                    Profile information is stored in local browser state for development preview. Once the Supabase backend <code>profiles</code> table is created, this form will seamlessly sync with the Supabase database.
                  </div>
                </div>
              </div>

              {/* Success Alert */}
              {saveSuccess && (
                <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
                  <FiCheckCircle size={20} />
                  <div>
                    <strong>Profile completed!</strong> Redirecting you to your Student Dashboard...
                  </div>
                </div>
              )}

              {/* Profile Form */}
              <form onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div className="form-field mb-3">
                  <label htmlFor="profile-fullName" className="fw-semibold small mb-1">
                    Full Name *
                  </label>
                  <div className="input-with-icon">
                    <FiUser className="input-icon" aria-hidden="true" />
                    <input
                      type="text"
                      id="profile-fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Priya Sharma"
                      className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                    />
                  </div>
                  {errors.fullName && (
                    <div className="invalid-feedback d-block small mt-1">
                      <FiAlertCircle className="me-1" /> {errors.fullName}
                    </div>
                  )}
                  <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                    Initial value fetched from your Google profile. You may modify your display name.
                  </span>
                </div>

                {/* Phone & College Row */}
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <div className="form-field">
                      <label htmlFor="profile-phone" className="fw-semibold small mb-1">
                        Phone Number *
                      </label>
                      <div className="input-with-icon">
                        <FiPhone className="input-icon" aria-hidden="true" />
                        <input
                          type="tel"
                          id="profile-phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        />
                      </div>
                      {errors.phone && (
                        <div className="invalid-feedback d-block small mt-1">
                          <FiAlertCircle className="me-1" /> {errors.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="form-field">
                      <label htmlFor="profile-collegeName" className="fw-semibold small mb-1">
                        College / University Name *
                      </label>
                      <div className="input-with-icon">
                        <FiBook className="input-icon" aria-hidden="true" />
                        <input
                          type="text"
                          id="profile-collegeName"
                          name="collegeName"
                          value={formData.collegeName}
                          onChange={handleChange}
                          placeholder="e.g. IIT Delhi, BITS Pilani"
                          className={`form-control ${errors.collegeName ? 'is-invalid' : ''}`}
                        />
                      </div>
                      {errors.collegeName && (
                        <div className="invalid-feedback d-block small mt-1">
                          <FiAlertCircle className="me-1" /> {errors.collegeName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Department & Year of Study Row */}
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <div className="form-field">
                      <label htmlFor="profile-department" className="fw-semibold small mb-1">
                        Department / Major *
                      </label>
                      <div className="input-with-icon">
                        <FiLayers className="input-icon" aria-hidden="true" />
                        <input
                          type="text"
                          id="profile-department"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          placeholder="e.g. Computer Science, Economics"
                          className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                        />
                      </div>
                      {errors.department && (
                        <div className="invalid-feedback d-block small mt-1">
                          <FiAlertCircle className="me-1" /> {errors.department}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="form-field">
                      <label htmlFor="profile-yearOfStudy" className="fw-semibold small mb-1">
                        Current Year of Study *
                      </label>
                      <select
                        id="profile-yearOfStudy"
                        name="yearOfStudy"
                        value={formData.yearOfStudy}
                        onChange={handleChange}
                        className={`form-select ${errors.yearOfStudy ? 'is-invalid' : ''}`}
                      >
                        <option value="">Select current year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="5th Year / Integrated">5th Year / Integrated</option>
                        <option value="Post Graduate">Post Graduate</option>
                      </select>
                      {errors.yearOfStudy && (
                        <div className="invalid-feedback d-block small mt-1">
                          <FiAlertCircle className="me-1" /> {errors.yearOfStudy}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* City, State, Graduation Year Row */}
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-4">
                    <div className="form-field">
                      <label htmlFor="profile-city" className="fw-semibold small mb-1">
                        City *
                      </label>
                      <div className="input-with-icon">
                        <FiMapPin className="input-icon" aria-hidden="true" />
                        <input
                          type="text"
                          id="profile-city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="e.g. Bengaluru"
                          className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                        />
                      </div>
                      {errors.city && (
                        <div className="invalid-feedback d-block small mt-1">
                          <FiAlertCircle className="me-1" /> {errors.city}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="form-field">
                      <label htmlFor="profile-state" className="fw-semibold small mb-1">
                        State / Region *
                      </label>
                      <input
                        type="text"
                        id="profile-state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="e.g. Karnataka"
                        className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                      />
                      {errors.state && (
                        <div className="invalid-feedback d-block small mt-1">
                          <FiAlertCircle className="me-1" /> {errors.state}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="form-field">
                      <label htmlFor="profile-graduationYear" className="fw-semibold small mb-1">
                        Graduation Year *
                      </label>
                      <select
                        id="profile-graduationYear"
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleChange}
                        className={`form-select ${errors.graduationYear ? 'is-invalid' : ''}`}
                      >
                        <option value="">Select year</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                        <option value="2029">2029</option>
                        <option value="2030">2030</option>
                      </select>
                      {errors.graduationYear && (
                        <div className="invalid-feedback d-block small mt-1">
                          <FiAlertCircle className="me-1" /> {errors.graduationYear}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="button button-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                  disabled={isSaving || saveSuccess}
                >
                  {isSaving ? (
                    <>Saving Profile...</>
                  ) : saveSuccess ? (
                    <>Saved! Redirecting...</>
                  ) : (
                    <>
                      Save Profile & Go to Dashboard <FiArrowRight aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            </div>
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
