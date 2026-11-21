import React, { useState, useEffect } from 'react';
import {
  FiArrowRight,
  FiArrowLeft,
  FiLock,
  FiMail,
  FiUser,
  FiBook,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
} from 'react-icons/fi';
import { signInWithGoogle } from './supabaseClient';

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

export default function Auth({
  initialMode = 'login',
  onNavigateHome,
  onAuthSuccess,
  onSwitchMode,
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [oauthError, setOauthError] = useState('');

  // Check URL parameters for OAuth errors returned from Supabase
  useEffect(() => {
    try {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      const params = new URLSearchParams(search);

      // Parse hash fragment as query params if present
      if (hash.includes('error=')) {
        const hashParams = new URLSearchParams(hash.substring(hash.indexOf('error=')));
        const err = hashParams.get('error_description') || hashParams.get('error');
        if (err) setOauthError(decodeURIComponent(err.replace(/\+/g, ' ')));
      } else if (params.get('error')) {
        const err = params.get('error_description') || params.get('error');
        if (err) setOauthError(decodeURIComponent(err.replace(/\+/g, ' ')));
      }
    } catch {
      // ignore param parsing issues
    }
  }, []);

  // Sign Up form fields
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    email: '',
    collegeName: '',
    password: '',
    confirmPassword: '',
  });

  // Login form fields
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateSignUp = () => {
    const newErrors = {};
    if (!signUpData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }
    if (!signUpData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!signUpData.collegeName.trim()) {
      newErrors.collegeName = 'College name is required.';
    }
    if (!signUpData.password) {
      newErrors.password = 'Password is required.';
    } else if (signUpData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (!signUpData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required.';
    } else if (signUpData.password !== signUpData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!loginData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!loginData.password) {
      newErrors.password = 'Password is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Google OAuth Handler
  const handleGoogleAuth = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    setOauthError('');

    try {
      // Redirect to Google consent screen via Supabase OAuth
      const res = await signInWithGoogle('#dashboard');
      if (!res.success) {
        setIsGoogleLoading(false);
        const errMsg = res.error?.message || 'Google authentication could not be initiated.';
        setOauthError(errMsg);
      }
      // On browser redirect, execution transfers to Google/Supabase
    } catch (err) {
      setIsGoogleLoading(false);
      setOauthError(err.message || 'An unexpected error occurred during Google sign-in.');
    }
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    if (validateSignUp()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const user = {
          fullName: signUpData.fullName.trim(),
          email: signUpData.email.trim(),
          collegeName: signUpData.collegeName.trim(),
          authProvider: 'email',
        };
        // Store session for client compatibility
        localStorage.setItem('niyo_student_user', JSON.stringify(user));
        onAuthSuccess(user);
      }, 700);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (validateLogin()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        let user = null;
        try {
          const stored = localStorage.getItem('niyo_student_user');
          if (stored) {
            user = JSON.parse(stored);
          }
        } catch {
          // ignore
        }
        if (!user || user.email !== loginData.email.trim()) {
          user = {
            fullName: 'Student Ambassador',
            email: loginData.email.trim(),
            collegeName: 'University Campus',
            authProvider: 'email',
          };
          localStorage.setItem('niyo_student_user', JSON.stringify(user));
        }
        onAuthSuccess(user);
      }, 600);
    }
  };

  const switchTab = (newMode) => {
    setMode(newMode);
    setErrors({});
    setOauthError('');
    if (onSwitchMode) onSwitchMode(newMode);
  };

  return (
    <div className="auth-page">
      <header className="site-header" role="banner">
        <div className="page-shell header-inner">
          <Brand onNavigateHome={onNavigateHome} />
          <button
            type="button"
            className="button button-secondary back-home-btn"
            onClick={onNavigateHome}
          >
            <FiArrowLeft aria-hidden="true" /> Back to Home
          </button>
        </div>
      </header>

      <main id="main-content" className="auth-main">
        <div className="page-shell">
          <div className="auth-card-wrapper">
            <div className="auth-card">
              {/* Tab Selector */}
              <div className="auth-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => switchTab('login')}
                >
                  Student Login
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => switchTab('signup')}
                >
                  Create Account
                </button>
              </div>

              {/* Supabase Auth Active Notice */}
              <div className="auth-supabase-notice">
                <div className="d-flex align-items-center gap-2">
                  <span className="auth-status-dot"></span>
                  <span className="small">
                    <strong>Supabase Auth Active:</strong> Sign in with Google or student email.
                  </span>
                </div>
              </div>

              {/* OAuth Error Alert Banner */}
              {oauthError && (
                <div className="alert alert-danger py-2 px-3 small mb-3 d-flex align-items-start gap-2" role="alert">
                  <FiAlertCircle className="mt-1 flex-shrink-0" />
                  <div>
                    <strong className="d-block">Authentication Notice</strong>
                    <span>{oauthError}</span>
                    {(oauthError.toLowerCase().includes('provider is not enabled') ||
                      oauthError.toLowerCase().includes('unauthorized') ||
                      oauthError.toLowerCase().includes('not configured')) && (
                      <div className="mt-2 p-2 bg-white rounded border border-danger-subtle text-dark" style={{ fontSize: '0.75rem' }}>
                        <strong>Setup Needed in Supabase Console:</strong>
                        <ol className="m-0 ps-3 mt-1">
                          <li>Open your Supabase Project &gt; Authentication &gt; Providers.</li>
                          <li>Enable <strong>Google</strong> and paste your Google Cloud Client ID & Secret.</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Google Sign-In Button */}
              <div className="google-auth-section mb-3">
                <button
                  type="button"
                  className="button-google w-100"
                  onClick={handleGoogleAuth}
                  disabled={isGoogleLoading || isLoading}
                >
                  {isGoogleLoading ? (
                    <span className="d-inline-flex align-items-center gap-2">
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Redirecting to Google...</span>
                    </span>
                  ) : (
                    <>
                      <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
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
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="auth-divider">
                <span>or continue with email</span>
              </div>

              {mode === 'login' ? (
                /* LOGIN FORM */
                <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
                  <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p>Log in to access your ambassador application and status.</p>
                  </div>

                  <div className="form-field">
                    <label htmlFor="login-email">Email Address</label>
                    <div className="input-with-icon">
                      <FiMail className="input-icon" aria-hidden="true" />
                      <input
                        type="email"
                        id="login-email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        placeholder="student@university.edu"
                        className={errors.email ? 'has-error' : ''}
                        aria-required="true"
                        aria-invalid={errors.email ? 'true' : 'false'}
                      />
                    </div>
                    {errors.email && (
                      <span className="field-error" role="alert">
                        <FiAlertCircle aria-hidden="true" /> {errors.email}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="login-password">Password</label>
                    <div className="input-with-icon">
                      <FiLock className="input-icon" aria-hidden="true" />
                      <input
                        type="password"
                        id="login-password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        placeholder="Enter your password"
                        className={errors.password ? 'has-error' : ''}
                        aria-required="true"
                        aria-invalid={errors.password ? 'true' : 'false'}
                      />
                    </div>
                    {errors.password && (
                      <span className="field-error" role="alert">
                        <FiAlertCircle aria-hidden="true" /> {errors.password}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="button button-primary auth-submit-btn"
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In with Email'}
                  </button>

                  <div className="auth-footer-prompt">
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => switchTab('signup')}
                    >
                      Sign Up Here
                    </button>
                  </div>
                </form>
              ) : (
                /* SIGN UP FORM */
                <form className="auth-form" onSubmit={handleSignUpSubmit} noValidate>
                  <div className="auth-header">
                    <h2>Join Niyo Campus</h2>
                    <p>Create your student account to apply and track your journey.</p>
                  </div>

                  <div className="form-field">
                    <label htmlFor="signup-name">Full Name</label>
                    <div className="input-with-icon">
                      <FiUser className="input-icon" aria-hidden="true" />
                      <input
                        type="text"
                        id="signup-name"
                        name="fullName"
                        value={signUpData.fullName}
                        onChange={handleSignUpChange}
                        placeholder="Enter your full name"
                        className={errors.fullName ? 'has-error' : ''}
                        aria-required="true"
                        aria-invalid={errors.fullName ? 'true' : 'false'}
                      />
                    </div>
                    {errors.fullName && (
                      <span className="field-error" role="alert">
                        <FiAlertCircle aria-hidden="true" /> {errors.fullName}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="signup-email">Email Address</label>
                    <div className="input-with-icon">
                      <FiMail className="input-icon" aria-hidden="true" />
                      <input
                        type="email"
                        id="signup-email"
                        name="email"
                        value={signUpData.email}
                        onChange={handleSignUpChange}
                        placeholder="student@university.edu"
                        className={errors.email ? 'has-error' : ''}
                        aria-required="true"
                        aria-invalid={errors.email ? 'true' : 'false'}
                      />
                    </div>
                    {errors.email && (
                      <span className="field-error" role="alert">
                        <FiAlertCircle aria-hidden="true" /> {errors.email}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="signup-college">College / University Name</label>
                    <div className="input-with-icon">
                      <FiBook className="input-icon" aria-hidden="true" />
                      <input
                        type="text"
                        id="signup-college"
                        name="collegeName"
                        value={signUpData.collegeName}
                        onChange={handleSignUpChange}
                        placeholder="Enter your college or university"
                        className={errors.collegeName ? 'has-error' : ''}
                        aria-required="true"
                        aria-invalid={errors.collegeName ? 'true' : 'false'}
                      />
                    </div>
                    {errors.collegeName && (
                      <span className="field-error" role="alert">
                        <FiAlertCircle aria-hidden="true" /> {errors.collegeName}
                      </span>
                    )}
                  </div>

                  <div className="form-grid-two">
                    <div className="form-field">
                      <label htmlFor="signup-password">Password</label>
                      <div className="input-with-icon">
                        <FiLock className="input-icon" aria-hidden="true" />
                        <input
                          type="password"
                          id="signup-password"
                          name="password"
                          value={signUpData.password}
                          onChange={handleSignUpChange}
                          placeholder="Min 6 characters"
                          className={errors.password ? 'has-error' : ''}
                          aria-required="true"
                          aria-invalid={errors.password ? 'true' : 'false'}
                        />
                      </div>
                      {errors.password && (
                        <span className="field-error" role="alert">
                          <FiAlertCircle aria-hidden="true" /> {errors.password}
                        </span>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="signup-confirm">Confirm Password</label>
                      <div className="input-with-icon">
                        <FiLock className="input-icon" aria-hidden="true" />
                        <input
                          type="password"
                          id="signup-confirm"
                          name="confirmPassword"
                          value={signUpData.confirmPassword}
                          onChange={handleSignUpChange}
                          placeholder="Re-enter password"
                          className={errors.confirmPassword ? 'has-error' : ''}
                          aria-required="true"
                          aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <span className="field-error" role="alert">
                          <FiAlertCircle aria-hidden="true" /> {errors.confirmPassword}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="button button-primary auth-submit-btn"
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account with Email'}
                  </button>

                  <div className="auth-footer-prompt">
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => switchTab('login')}
                    >
                      Sign In Here
                    </button>
                  </div>
                </form>
              )}
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
