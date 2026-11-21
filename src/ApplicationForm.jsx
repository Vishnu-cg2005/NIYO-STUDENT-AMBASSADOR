import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FiArrowRight,
  FiArrowLeft,
  FiArrowUpRight,
  FiCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiHome,
  FiSearch,
  FiChevronDown,
  FiX,
} from 'react-icons/fi';
import countryData from '../countries.json';

const yearOptions = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Other',
];

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

function ApplicationHeader({ onNavigateHome }) {
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
          <span className="app-status-badge">Application Status</span>
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

/**
 * SearchableCountrySelect
 * Uses countries.json to provide live search and instant selection.
 */
function SearchableCountrySelect({
  id,
  name,
  value,
  onChange,
  placeholder = 'Select your country',
  error,
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Filter countries using countries.json
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countryData;
    const q = searchQuery.toLowerCase().trim();
    return countryData.filter((item) =>
      item.country.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelect = (countryName) => {
    onChange({ target: { name, value: countryName } });
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { name, value: '' } });
  };

  return (
    <div
      className={`searchable-select-wrap ${isOpen ? 'is-open' : ''} ${error ? 'has-error' : ''}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        id={id}
        className="searchable-select-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-required={required}
      >
        <span className={value ? 'select-value' : 'select-placeholder'}>
          {value || placeholder}
        </span>
        <div className="trigger-icons">
          {value && (
            <span
              className="clear-icon"
              onClick={handleClear}
              title="Clear selection"
              aria-label="Clear selection"
            >
              <FiX aria-hidden="true" />
            </span>
          )}
          <FiChevronDown className={`chevron-icon ${isOpen ? 'rotated' : ''}`} aria-hidden="true" />
        </div>
      </button>

      {isOpen && (
        <div className="searchable-dropdown-panel" role="listbox">
          <div className="dropdown-search-box">
            <FiSearch className="search-icon" aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="text"
              className="dropdown-search-input"
              placeholder="Search country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              aria-label="Search country"
            />
          </div>
          <ul className="dropdown-options-list">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => (
                <li
                  key={c.id || c.country}
                  role="option"
                  aria-selected={value === c.country}
                  className={`dropdown-option-item ${value === c.country ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(c.country)}
                >
                  <span>{c.country}</span>
                  {value === c.country && <FiCheck className="option-check" aria-hidden="true" />}
                </li>
              ))
            ) : (
              <li className="dropdown-no-results">No countries found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ApplicationForm({ onNavigateHome }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Controlled form state preserved across steps
  const [formData, setFormData] = useState({
    // Step 1: Personal
    fullName: '',
    email: '',
    phone: '',
    country: '',

    // Step 2: Academic
    universityName: '',
    countryOfStudy: '',
    degreeCourse: '',
    currentYear: '',
    graduationYear: '',

    // Step 3: Community
    linkedin: '',
    socialMedia: '',
    whyAmbassador: '',
    howEngage: '',
    declaration: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for field when modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required.';
      }
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
      if (!formData.country) {
        newErrors.country = 'Please select your country.';
      }
    } else if (step === 2) {
      if (!formData.universityName.trim()) {
        newErrors.universityName = 'University name is required.';
      }
      if (!formData.countryOfStudy) {
        newErrors.countryOfStudy = 'Please select your country of study.';
      }
      if (!formData.degreeCourse.trim()) {
        newErrors.degreeCourse = 'Degree or course name is required.';
      }
      if (!formData.currentYear) {
        newErrors.currentYear = 'Please select your current year of study.';
      }
      if (formData.graduationYear) {
        const year = parseInt(formData.graduationYear, 10);
        if (isNaN(year) || year < 2020 || year > 2040) {
          newErrors.graduationYear = 'Please enter a valid 4-digit graduation year.';
        }
      }
    } else if (step === 3) {
      if (!formData.whyAmbassador.trim()) {
        newErrors.whyAmbassador = 'Please explain why you want to become a Niyo Student Ambassador.';
      }
      if (!formData.howEngage.trim()) {
        newErrors.howEngage = 'Please describe how you plan to engage with students.';
      }
      if (formData.linkedin.trim() && !/^https?:\/\/.+/i.test(formData.linkedin.trim())) {
        newErrors.linkedin = 'Please enter a valid URL (starting with http:// or https://).';
      }
      if (formData.socialMedia.trim() && !/^https?:\/\/.+/i.test(formData.socialMedia.trim())) {
        newErrors.socialMedia = 'Please enter a valid URL (starting with http:// or https://).';
      }
      if (!formData.declaration) {
        newErrors.declaration = 'You must confirm that the provided information is accurate.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
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
        setIsSubmitted(true);
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
      <ApplicationHeader onNavigateHome={onNavigateHome} />

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
            {!isSubmitted ? (
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
                      style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
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
                        <h2>Personal Details</h2>
                        <p>Provide your basic contact information so we can reach you.</p>
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
                            aria-describedby={errors.fullName ? 'error-fullName' : undefined}
                          />
                          {errors.fullName && (
                            <span id="error-fullName" className="field-error" role="alert">
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
                            aria-describedby={errors.email ? 'error-email' : undefined}
                          />
                          {errors.email && (
                            <span id="error-email" className="field-error" role="alert">
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
                            placeholder="Enter your phone number"
                            className={errors.phone ? 'has-error' : ''}
                            aria-required="true"
                            aria-invalid={errors.phone ? 'true' : 'false'}
                            aria-describedby={errors.phone ? 'error-phone' : undefined}
                          />
                          {errors.phone && (
                            <span id="error-phone" className="field-error" role="alert">
                              <FiAlertCircle aria-hidden="true" /> {errors.phone}
                            </span>
                          )}
                        </div>

                        <div className="form-field">
                          <label htmlFor="country">
                            Country <span className="req-star" aria-hidden="true">*</span>
                          </label>
                          <SearchableCountrySelect
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="Select your country"
                            error={Boolean(errors.country)}
                            required
                          />
                          {errors.country && (
                            <span id="error-country" className="field-error" role="alert">
                              <FiAlertCircle aria-hidden="true" /> {errors.country}
                            </span>
                          )}
                        </div>
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
                          onClick={handleNext}
                        >
                          Next Step <FiArrowRight aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Academic Details */}
                  {currentStep === 2 && (
                    <div className="form-step-panel">
                      <div className="step-panel-header">
                        <h2>Academic Details</h2>
                        <p>Tell us about your university, course, and educational progress.</p>
                      </div>

                      <div className="form-grid-two">
                        <div className="form-field">
                          <label htmlFor="universityName">
                            University Name <span className="req-star" aria-hidden="true">*</span>
                          </label>
                          <input
                            type="text"
                            id="universityName"
                            name="universityName"
                            value={formData.universityName}
                            onChange={handleChange}
                            placeholder="Enter your university name"
                            className={errors.universityName ? 'has-error' : ''}
                            aria-required="true"
                            aria-invalid={errors.universityName ? 'true' : 'false'}
                            aria-describedby={errors.universityName ? 'error-universityName' : undefined}
                          />
                          {errors.universityName && (
                            <span id="error-universityName" className="field-error" role="alert">
                              <FiAlertCircle aria-hidden="true" /> {errors.universityName}
                            </span>
                          )}
                        </div>

                        <div className="form-field">
                          <label htmlFor="countryOfStudy">
                            Country of Study <span className="req-star" aria-hidden="true">*</span>
                          </label>
                          <SearchableCountrySelect
                            id="countryOfStudy"
                            name="countryOfStudy"
                            value={formData.countryOfStudy}
                            onChange={handleChange}
                            placeholder="Select your country of study"
                            error={Boolean(errors.countryOfStudy)}
                            required
                          />
                          {errors.countryOfStudy && (
                            <span id="error-countryOfStudy" className="field-error" role="alert">
                              <FiAlertCircle aria-hidden="true" /> {errors.countryOfStudy}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="form-field">
                        <label htmlFor="degreeCourse">
                          Degree / Course <span className="req-star" aria-hidden="true">*</span>
                        </label>
                        <input
                          type="text"
                          id="degreeCourse"
                          name="degreeCourse"
                          value={formData.degreeCourse}
                          onChange={handleChange}
                          placeholder="Enter your degree or course"
                          className={errors.degreeCourse ? 'has-error' : ''}
                          aria-required="true"
                          aria-invalid={errors.degreeCourse ? 'true' : 'false'}
                          aria-describedby={errors.degreeCourse ? 'error-degreeCourse' : undefined}
                        />
                        {errors.degreeCourse && (
                          <span id="error-degreeCourse" className="field-error" role="alert">
                            <FiAlertCircle aria-hidden="true" /> {errors.degreeCourse}
                          </span>
                        )}
                      </div>

                      <div className="form-grid-two">
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
                            aria-describedby={errors.currentYear ? 'error-currentYear' : undefined}
                          >
                            <option value="">Select year of study</option>
                            {yearOptions.map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>
                          {errors.currentYear && (
                            <span id="error-currentYear" className="field-error" role="alert">
                              <FiAlertCircle aria-hidden="true" /> {errors.currentYear}
                            </span>
                          )}
                        </div>

                        <div className="form-field">
                          <label htmlFor="graduationYear">Expected Graduation Year</label>
                          <input
                            type="number"
                            id="graduationYear"
                            name="graduationYear"
                            value={formData.graduationYear}
                            onChange={handleChange}
                            placeholder="Enter your expected graduation year"
                            min="2020"
                            max="2040"
                            className={errors.graduationYear ? 'has-error' : ''}
                            aria-describedby={errors.graduationYear ? 'error-graduationYear' : undefined}
                          />
                          {errors.graduationYear && (
                            <span id="error-graduationYear" className="field-error" role="alert">
                              <FiAlertCircle aria-hidden="true" /> {errors.graduationYear}
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
                          onClick={handleNext}
                        >
                          Next Step <FiArrowRight aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Community & Submission */}
                  {currentStep === 3 && (
                    <div className="form-step-panel">
                      <div className="step-panel-header">
                        <h2>Community & Submission</h2>
                        <p>Share your motivation and how you plan to connect with students.</p>
                      </div>

                      <div className="form-grid-two">
                        <div className="form-field">
                          <label htmlFor="linkedin">LinkedIn Profile</label>
                          <input
                            type="url"
                            id="linkedin"
                            name="linkedin"
                            value={formData.linkedin}
                            onChange={handleChange}
                            placeholder="Enter your LinkedIn profile URL"
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
                          <label htmlFor="socialMedia">Social Media Profile</label>
                          <input
                            type="url"
                            id="socialMedia"
                            name="socialMedia"
                            value={formData.socialMedia}
                            onChange={handleChange}
                            placeholder="Enter your social media profile URL"
                            className={errors.socialMedia ? 'has-error' : ''}
                            aria-describedby={errors.socialMedia ? 'error-socialMedia' : undefined}
                          />
                          {errors.socialMedia && (
                            <span id="error-socialMedia" className="field-error" role="alert">
                              <FiAlertCircle aria-hidden="true" /> {errors.socialMedia}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="form-field">
                        <label htmlFor="whyAmbassador">
                          Why do you want to become a Niyo Student Ambassador?{' '}
                          <span className="req-star" aria-hidden="true">*</span>
                        </label>
                        <textarea
                          id="whyAmbassador"
                          name="whyAmbassador"
                          rows="4"
                          value={formData.whyAmbassador}
                          onChange={handleChange}
                          placeholder="Tell us why you are interested in representing Niyo within your university community."
                          className={errors.whyAmbassador ? 'has-error' : ''}
                          aria-required="true"
                          aria-invalid={errors.whyAmbassador ? 'true' : 'false'}
                          aria-describedby={errors.whyAmbassador ? 'error-whyAmbassador' : undefined}
                        />
                        {errors.whyAmbassador && (
                          <span id="error-whyAmbassador" className="field-error" role="alert">
                            <FiAlertCircle aria-hidden="true" /> {errors.whyAmbassador}
                          </span>
                        )}
                      </div>

                      <div className="form-field">
                        <label htmlFor="howEngage">
                          How would you engage with students at your university?{' '}
                          <span className="req-star" aria-hidden="true">*</span>
                        </label>
                        <textarea
                          id="howEngage"
                          name="howEngage"
                          rows="4"
                          value={formData.howEngage}
                          onChange={handleChange}
                          placeholder="Describe how you would connect with fellow students and introduce them to Niyo."
                          className={errors.howEngage ? 'has-error' : ''}
                          aria-required="true"
                          aria-invalid={errors.howEngage ? 'true' : 'false'}
                          aria-describedby={errors.howEngage ? 'error-howEngage' : undefined}
                        />
                        {errors.howEngage && (
                          <span id="error-howEngage" className="field-error" role="alert">
                            <FiAlertCircle aria-hidden="true" /> {errors.howEngage}
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
                            aria-describedby={errors.declaration ? 'error-declaration' : undefined}
                          />
                          <span>
                            I confirm that the information provided in this application is accurate.{' '}
                            <span className="req-star" aria-hidden="true">*</span>
                          </span>
                        </label>
                        {errors.declaration && (
                          <span id="error-declaration" className="field-error" role="alert">
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
                            <span className="submitting-spinner">Submitting...</span>
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
              /* Success Confirmation Box */
              <div className="submission-success-card" role="status" aria-live="polite">
                <div className="success-icon-wrap" aria-hidden="true">
                  <FiCheckCircle />
                </div>
                <h2>Application Submitted Successfully</h2>
                <p className="success-desc">
                  Your application has been submitted for review.
                </p>
                <div className="success-actions">
                  <button
                    type="button"
                    className="button button-primary"
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
          <div className="footer-top">
            <div className="footer-col brand-col">
              <Brand onNavigateHome={onNavigateHome} />
              <p>Student Ambassador Program</p>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <nav aria-label="Footer navigation">
                <a
                  href="#home"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateHome();
                  }}
                >
                  Home
                </a>
                <span className="footer-nav-text">Application Form</span>
              </nav>
            </div>
            <div className="footer-col">
              <h4>Program Information</h4>
              <ul className="footer-info-list">
                <li>Student Ambassador Program</li>
                <li>Application Process</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© Niyo Campus. Student Ambassador Program.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
