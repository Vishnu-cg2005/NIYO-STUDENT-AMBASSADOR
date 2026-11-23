import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  FiArrowRight,
  FiArrowUpRight,
  FiChevronDown,
  FiMenu,
  FiX,
  FiUsers,
  FiSend,
  FiFileText,
  FiSearch,
  FiGlobe,
  FiMessageCircle,
  FiAward,
  FiFlag,
  FiUser,
  FiLogIn,
  FiTrendingUp,
  FiStar,
  FiBriefcase,
  FiBookOpen,
  FiHome,
} from 'react-icons/fi';
import { BsMegaphone } from 'react-icons/bs';
import './styles.css';
import studentImage from '../asset/homepage2.png';
import aboutImage from '../asset/homepage1.png';
import ApplicationForm from './ApplicationForm';
import Auth from './Auth';
import StudentDashboard from './StudentDashboard';
import AdminPortal from './AdminPortal';
import ProfileCompletion from './ProfileCompletion';
import AmbassadorPortal from './AmbassadorPortal';
import { getStudentApplication } from './adminService';
import {
  supabase,
  isProfileComplete,
  getUserProfile,
  signOutUser,
} from './supabaseClient';

const navLinks = [
  { label: 'Home', href: '#home', targetId: 'home' },
  { label: 'About the Program', href: '#about', targetId: 'about' },
  { label: 'How It Works', href: '#how-it-works', targetId: 'how-it-works' },
  { label: 'FAQs', href: '#faqs', targetId: 'faqs' },
];

function Brand({ onNavigateHome }) {
  return (
    <a
      className="brand"
      href="#home"
      onClick={(e) => {
        if (onNavigateHome) {
          e.preventDefault();
          onNavigateHome();
        }
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

function Header({ onNavigateApply, onNavigateLogin, onNavigateDashboard, currentUser }) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sectionIds = ['home', 'program-overview', 'about', 'how-it-works', 'ambassador-role', 'highlights', 'journey', 'faqs', 'apply'];
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.id === 'program-overview' || entry.target.id === 'about') {
            setActiveSection('about');
          } else if (entry.target.id === 'ambassador-role' || entry.target.id === 'highlights' || entry.target.id === 'how-it-works') {
            setActiveSection('how-it-works');
          } else if (entry.target.id === 'faqs') {
            setActiveSection('faqs');
          } else if (entry.target.id === 'home') {
            setActiveSection('home');
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-20% 0px -70% 0px',
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`} role="banner">
      <div className="page-shell header-inner">
        <Brand />
        <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Primary navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              className={activeSection === link.targetId ? 'active' : ''}
              aria-current={activeSection === link.targetId ? 'true' : undefined}
            >
              {link.label}
            </a>
          ))}
          {currentUser ? (
            <a
              href="#dashboard"
              className="mobile-portal-link"
              onClick={(e) => {
                e.preventDefault();
                close();
                onNavigateDashboard();
              }}
            >
              <FiUser aria-hidden="true" /> Dashboard
            </a>
          ) : (
            <a
              href="#login"
              className="mobile-portal-link"
              onClick={(e) => {
                e.preventDefault();
                close();
                onNavigateLogin();
              }}
            >
              <FiLogIn aria-hidden="true" /> Sign In
            </a>
          )}
          <a
            className="mobile-apply"
            href="#apply-form"
            onClick={(e) => {
              e.preventDefault();
              close();
              onNavigateApply();
            }}
          >
            Apply Now <FiArrowRight aria-hidden="true" />
          </a>
        </nav>

        <div className="header-actions-group">
          {currentUser ? (
            <button
              type="button"
              className="button button-secondary header-user-btn"
              onClick={onNavigateDashboard}
              title={`Logged in as ${currentUser.fullName}`}
            >
              <FiUser aria-hidden="true" /> Dashboard
            </button>
          ) : (
            <button
              type="button"
              className="button button-secondary header-user-btn"
              onClick={onNavigateLogin}
            >
              <FiLogIn aria-hidden="true" /> Sign In
            </button>
          )}

          <button
            type="button"
            className="button button-primary header-apply"
            onClick={onNavigateApply}
          >
            Apply Now <FiArrowUpRight aria-hidden="true" />
          </button>
        </div>

        <button
          className={`menu-toggle ${open ? 'is-active' : ''}`}
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="primary-navigation"
        >
          <span className="hamburger-bar bar-top" aria-hidden="true"></span>
          <span className="hamburger-bar bar-mid" aria-hidden="true"></span>
          <span className="hamburger-bar bar-bot" aria-hidden="true"></span>
        </button>
      </div>
      {open && <div className="menu-backdrop" onClick={close} aria-hidden="true"></div>}
    </header>
  );
}

function Hero({ onNavigateApply }) {
  return (
    <section id="home" className="hero-section" aria-label="Hero Introduction">
      {/* 1. Slim Announcement Banner below navbar */}
      <div className="hero-announcement-wrap">
        <div className="page-shell">
          <div className="hero-announcement" role="status">
            <span className="announcement-badge">Campus Initiative</span>
            <span className="announcement-text">
              Niyo Campus Student Ambassador Program — Empowering students across universities to lead, connect, and grow.
            </span>
            <a href="#about" className="announcement-link">
              Learn More <FiArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Hero Two-Column Grid */}
      <div className="page-shell hero-grid">
        <div className="hero-copy">
          <div className="eyebrow">
            <span aria-hidden="true"></span> NIYO CAMPUS
          </div>
          <h1>
            Become a Niyo<br />
            <em>Student Ambassador</em>
          </h1>
          <p>
            Represent Niyo at your university and help fellow students manage their global finances.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={onNavigateApply}
            >
              Apply Now <FiArrowUpRight aria-hidden="true" />
            </button>
            <a className="button button-secondary" href="#about">
              Learn More <FiArrowRight aria-hidden="true" />
            </a>
          </div>

          {/* 2. Compact row of three program highlights under CTA buttons */}
          <div className="hero-highlights" aria-label="Program Highlights">
            <div className="hero-highlight-item">
              <span className="highlight-icon" aria-hidden="true">
                <FiAward />
              </span>
              <span className="highlight-label">Campus Representation</span>
            </div>
            <div className="hero-highlight-item">
              <span className="highlight-icon" aria-hidden="true">
                <FiUsers />
              </span>
              <span className="highlight-label">Peer Engagement</span>
            </div>
            <div className="hero-highlight-item">
              <span className="highlight-icon" aria-hidden="true">
                <FiTrendingUp />
              </span>
              <span className="highlight-label">Real Impact</span>
            </div>
          </div>
        </div>

        <div className="hero-art" aria-label="Niyo Campus student ambassador">
          <div className="art-orb orb-one" aria-hidden="true"></div>
          <div className="art-orb orb-two" aria-hidden="true"></div>
          <div className="art-grid" aria-hidden="true"></div>
          <img
            src={studentImage}
            alt="Niyo Student Ambassador holding a laptop on campus"
            width="530"
            height="500"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      {/* 3. Neat bottom highlight strip with four short items */}
      <div className="hero-bottom-strip" aria-label="Key Program Pillars">
        <div className="page-shell">
          <div className="hero-strip-grid">
            <div className="hero-strip-item">
              <span className="strip-item-icon" aria-hidden="true">
                <FiGlobe />
              </span>
              <div className="strip-item-copy">
                <strong>Campus Network</strong>
                <span>Connect across universities</span>
              </div>
            </div>
            <div className="hero-strip-item">
              <span className="strip-item-icon" aria-hidden="true">
                <FiStar />
              </span>
              <div className="strip-item-copy">
                <strong>Exclusive Opportunities</strong>
                <span>Lead official Niyo activities</span>
              </div>
            </div>
            <div className="hero-strip-item">
              <span className="strip-item-icon" aria-hidden="true">
                <FiBriefcase />
              </span>
              <div className="strip-item-copy">
                <strong>Build Real Skills</strong>
                <span>Leadership & communication</span>
              </div>
            </div>
            <div className="hero-strip-item">
              <span className="strip-item-icon" aria-hidden="true">
                <FiBookOpen />
              </span>
              <div className="strip-item-copy">
                <strong>Global Finance Literacy</strong>
                <span>Empower student peers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const overviewCards = [
  {
    icon: <BsMegaphone aria-hidden="true" />,
    title: 'Represent Niyo',
    description: 'Introduce Niyo to students within your university community.',
  },
  {
    icon: <FiUsers aria-hidden="true" />,
    title: 'Connect with Students',
    description: 'Engage with fellow students through the ambassador community.',
  },
  {
    icon: <FiFlag aria-hidden="true" />,
    title: 'Participate in Campaigns',
    description: "Take part in Niyo's student ambassador campaigns.",
  },
];

function ProgramOverview() {
  return (
    <section id="program-overview" className="overview-section" aria-labelledby="overview-heading">
      <div className="page-shell">
        <div className="section-heading center">
          <p className="section-kicker">THE PROGRAM</p>
          <h2 id="overview-heading">A Campus Community Built Around Niyo</h2>
          <p className="section-subtitle">
            The Niyo Student Ambassador Program connects students with an opportunity to represent Niyo, engage with fellow students, and participate in ambassador campaigns.
          </p>
        </div>
        <div className="three-card-grid">
          {overviewCards.map((card) => (
            <article className="overview-card" key={card.title}>
              <div className="icon-wrap">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="about-section" aria-labelledby="about-heading">
      <div className="page-shell">
        <div className="about-grid">
          <div className="about-copy">
            <p className="section-kicker">THE PROGRAM</p>
            <h2 id="about-heading">
              About the Niyo Student<br className="desktop-break" /> Ambassador Program
            </h2>
            <p className="section-text">
              The Niyo Student Ambassador Program connects students with an opportunity to represent Niyo within their university communities.
            </p>
            <p className="section-text secondary-text">
              Students represent Niyo, engage with their university communities, and participate in ambassador campaigns. The program connects students through a collaborative community focused on student engagement.
            </p>
          </div>
          <div className="about-visual" aria-label="Niyo Campus student ambassador">
            <img
              src={aboutImage}
              alt="Niyo Student Ambassador"
              className="about-image"
              width="440"
              height="380"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className="about-strip">
          <article className="about-strip-card">
            <div className="strip-icon"><FiSend aria-hidden="true" /></div>
            <div className="strip-text">
              <h3>Represent Niyo</h3>
              <p>Introduce Niyo to fellow students at your university and share program updates.</p>
            </div>
          </article>
          <article className="about-strip-card">
            <div className="strip-icon"><FiUsers aria-hidden="true" /></div>
            <div className="strip-text">
              <h3>Engage with Students</h3>
              <p>Connect and collaborate with peers across campus and build community.</p>
            </div>
          </article>
          <article className="about-strip-card">
            <div className="strip-icon"><FiMessageCircle aria-hidden="true" /></div>
            <div className="strip-text">
              <h3>Participate in Campaigns</h3>
              <p>Take an active part in official student ambassador campaigns and initiatives.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    num: '01',
    title: 'Apply',
    description: 'Submit your application to join the Niyo Student Ambassador Program.',
    supporting: 'Provide the information requested in the application.',
    icon: <FiFileText aria-hidden="true" />,
  },
  {
    num: '02',
    title: 'Get Reviewed',
    description: 'Your application will be reviewed by the Niyo team.',
    supporting: 'Application review is part of the selection process.',
    icon: <FiSearch aria-hidden="true" />,
  },
  {
    num: '03',
    title: 'Represent Niyo',
    description: 'Represent Niyo within your university community.',
    supporting: 'Engage with students and participate in ambassador campaigns.',
    icon: <FiGlobe aria-hidden="true" />,
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="process-section" aria-labelledby="hiw-heading">
      <div className="page-shell">
        <div className="section-heading center">
          <p className="section-kicker">THE JOURNEY</p>
          <h2 id="hiw-heading">How It Works</h2>
          <p className="section-subtitle">
            Understand the basic journey from application to representing Niyo within your university community.
          </p>
        </div>
        <div className="steps-row">
          {steps.map((step, i) => (
            <React.Fragment key={step.num}>
              <article className="step-card">
                <div className="step-header">
                  <div className="step-icon">
                    <span>{step.icon}</span>
                  </div>
                  <span className="step-badge">{step.num}</span>
                </div>
                <h3>{step.title}</h3>
                <p className="step-desc">{step.description}</p>
                <p className="step-support">{step.supporting}</p>
              </article>
              {i < steps.length - 1 && (
                <div className="step-connector" aria-hidden="true">
                  <span></span>
                  <FiArrowRight />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

const roleCards = [
  {
    icon: <FiSend aria-hidden="true" />,
    title: 'Represent Niyo',
    description: 'Introduce Niyo to students within your university community.',
  },
  {
    icon: <FiUsers aria-hidden="true" />,
    title: 'Connect with Students',
    description: 'Connect with fellow students and participate in the ambassador community.',
  },
  {
    icon: <FiMessageCircle aria-hidden="true" />,
    title: 'Participate in Campaigns',
    description: 'Take part in student ambassador campaigns and related activities.',
  },
];

function AmbassadorRole() {
  return (
    <section id="ambassador-role" className="role-section" aria-labelledby="role-heading">
      <div className="page-shell">
        <div className="section-heading center">
          <p className="section-kicker">THE ROLE</p>
          <h2 id="role-heading">What Does a Student Ambassador Do?</h2>
          <p className="section-subtitle">
            Student ambassadors represent Niyo within their university communities and participate in activities related to the program.
          </p>
        </div>
        <div className="three-card-grid">
          {roleCards.map((card) => (
            <article className="role-card" key={card.title}>
              <div className="icon-wrap">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const highlights = [
  {
    icon: <FiAward aria-hidden="true" />,
    title: 'Represent Niyo',
    description: 'Represent Niyo within your university community and introduce fellow students to the program.',
  },
  {
    icon: <FiUsers aria-hidden="true" />,
    title: 'Connect with Students',
    description: 'Engage with fellow students through the ambassador community.',
  },
  {
    icon: <FiMessageCircle aria-hidden="true" />,
    title: 'Participate in Campaigns',
    description: "Take part in Niyo's student ambassador campaigns.",
  },
];

function Highlights() {
  return (
    <section id="highlights" className="highlights-section" aria-labelledby="highlights-heading">
      <div className="page-shell">
        <div className="section-heading center">
          <p className="section-kicker">NIYO CAMPUS</p>
          <h2 id="highlights-heading">Why Join the Niyo Campus Program?</h2>
        </div>
        <div className="three-card-grid">
          {highlights.map((item) => (
            <article className="highlight-card" key={item.title}>
              <div className="icon-wrap">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="card-arrow" aria-hidden="true">
                <FiArrowUpRight />
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const journeyStages = [
  {
    num: '01',
    title: 'Explore the Program',
    description: 'Learn about the Niyo Student Ambassador Program.',
  },
  {
    num: '02',
    title: 'Submit Your Application',
    description: 'Provide the requested information through the application process.',
  },
  {
    num: '03',
    title: 'Application Review',
    description: 'The Niyo team reviews submitted applications.',
  },
  {
    num: '04',
    title: 'Represent Niyo',
    description: 'Approved ambassadors can represent Niyo within their university communities.',
  },
];

function ProgramJourney() {
  return (
    <section id="journey" className="journey-section" aria-labelledby="journey-heading">
      <div className="page-shell">
        <div className="section-heading center">
          <p className="section-kicker">YOUR JOURNEY</p>
          <h2 id="journey-heading">Your Journey with Niyo Campus</h2>
        </div>
        <div className="timeline-container">
          <div className="timeline-track" aria-hidden="true"></div>
          <div className="timeline-grid">
            {journeyStages.map((stage) => (
              <article className="timeline-step" key={stage.num}>
                <div className="timeline-node">
                  <span>{stage.num}</span>
                </div>
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: 'What is the Niyo Student Ambassador Program?',
    a: 'The Niyo Student Ambassador Program gives enthusiastic students the opportunity to represent Niyo on their campuses, introduce fellow students to the program, and help build a stronger student community.',
  },
  {
    q: 'What does a student ambassador do?',
    a: 'Student ambassadors act as campus representatives for Niyo. They connect with fellow students, share program updates, participate in campaigns, and help create awareness about Niyo within their university communities.',
  },
  {
    q: 'How can I apply to become a student ambassador?',
    a: 'Click the Apply Now button and complete the application form with your personal, academic, and community-related details. Review your information before submitting your application.',
  },
  {
    q: 'What happens after I submit my application?',
    a: 'Once you submit your application, the Niyo team will review the information you provided. You can check your application dashboard for status updates as your application moves through the review process.',
  },
  {
    q: 'How can I check my application status?',
    a: 'Sign in to your account and visit your student dashboard to view your application status. You can check there for updates as your application is reviewed and a selection decision is made.',
  },
  {
    q: 'Where can I learn more about the program?',
    a: 'Explore the sections on this website to learn about the program, ambassador activities, and application process. You can also review the FAQs here for answers to common questions before applying.',
  },
];

function FAQ() {
  const [active, setActive] = useState(0);

  return (
    <section id="faqs" className="faq-section" aria-labelledby="faqs-heading">
      <div className="page-shell faq-layout">
        <div className="faq-intro">
          <p className="section-kicker">NEED TO KNOW</p>
          <h2 id="faqs-heading">
            Frequently Asked<br />Questions
          </h2>
          <p>
            Find answers to common questions about the Niyo Student Ambassador Program.
          </p>
        </div>
        <div className="faq-list">
          {faqs.map((item, index) => {
            const isOpen = active === index;
            const btnId = `faq-btn-${index}`;
            const panelId = `faq-panel-${index}`;

            return (
              <div className={`faq-item ${isOpen ? 'active' : ''}`} key={item.q}>
                <button
                  id={btnId}
                  onClick={() => setActive(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span>{item.q}</span>
                  <FiChevronDown aria-hidden="true" />
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className="faq-answer"
                >
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTA({ onNavigateApply }) {
  return (
    <section id="apply" className="cta-section" aria-labelledby="cta-heading">
      <div className="page-shell">
        <div className="cta-box">
          <div className="cta-shape one" aria-hidden="true"></div>
          <div className="cta-shape two" aria-hidden="true"></div>
          <div className="cta-content">
            <p className="section-kicker">YOUR CAMPUS, YOUR IMPACT</p>
            <h2 id="cta-heading">Ready to Represent Niyo?</h2>
            <p className="cta-desc">
              Explore the Niyo Student Ambassador Program and take the first step toward becoming a student ambassador.
            </p>
            <p className="cta-support">
              Learn about the program and begin your application.
            </p>
            <button
              type="button"
              className="button button-primary cta-button"
              onClick={onNavigateApply}
            >
              Apply Now <FiArrowUpRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ onNavigateAdmin }) {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="page-shell">
        <div className="footer-top">
          <div className="footer-col brand-col">
            <Brand />
            <p>Student Ambassador Program</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <nav aria-label="Footer navigation">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
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
  );
}

function HomePage({ onNavigateApply, onNavigateLogin, onNavigateDashboard, currentUser }) {
  return (
    <>
      <Header
        onNavigateApply={onNavigateApply}
        onNavigateLogin={onNavigateLogin}
        onNavigateDashboard={onNavigateDashboard}
        currentUser={currentUser}
      />
      <main id="main-content">
        <Hero onNavigateApply={onNavigateApply} />
        <ProgramOverview />
        <About />
        <HowItWorks />
        <AmbassadorRole />
        <Highlights />
        <ProgramJourney />
        <FAQ />
        <CTA onNavigateApply={onNavigateApply} />
      </main>
      <Footer />
    </>
  );
}

function MobileBottomNav({
  currentPage,
  onNavigateHome,
  onNavigateApply,
  onNavigateDashboard,
  onNavigateLogin,
  currentUser,
}) {
  if (['apply', 'admin'].includes(currentPage)) return null;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <a
        href="#home"
        className={`mobile-tab-item ${currentPage === 'home' ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          onNavigateHome();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <FiHome className="tab-icon" aria-hidden="true" />
        <span>Home</span>
      </a>

      <a
        href="#about"
        className="mobile-tab-item"
        onClick={(e) => {
          if (currentPage !== 'home') {
            e.preventDefault();
            onNavigateHome();
            setTimeout(() => {
              const el = document.getElementById('about');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }}
      >
        <FiBookOpen className="tab-icon" aria-hidden="true" />
        <span>About</span>
      </a>

      <button
        type="button"
        className="mobile-tab-apply-btn"
        onClick={onNavigateApply}
        aria-label="Apply to Niyo Ambassador Program"
      >
        <div className="apply-btn-bubble">
          <FiArrowUpRight className="apply-icon" aria-hidden="true" />
        </div>
        <span>Apply</span>
      </button>

      <a
        href="#faqs"
        className="mobile-tab-item"
        onClick={(e) => {
          if (currentPage !== 'home') {
            e.preventDefault();
            onNavigateHome();
            setTimeout(() => {
              const el = document.getElementById('faqs');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }}
      >
        <FiMessageCircle className="tab-icon" aria-hidden="true" />
        <span>FAQs</span>
      </a>

      {currentUser ? (
        <a
          href="#dashboard"
          className={`mobile-tab-item ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onNavigateDashboard();
          }}
        >
          <FiUser className="tab-icon" aria-hidden="true" />
          <span>Profile</span>
        </a>
      ) : (
        <a
          href="#login"
          className={`mobile-tab-item ${currentPage === 'login' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onNavigateLogin();
          }}
        >
          <FiLogIn className="tab-icon" aria-hidden="true" />
          <span>Sign In</span>
        </a>
      )}
    </nav>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('niyo_student_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Supabase Auth listener to manage live sessions & handle OAuth redirects
  useEffect(() => {
    // 1. Initial session check on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user = session.user;
        const profile = getUserProfile(user.id);
        const complete = isProfileComplete(profile);
        const activeUser = {
          id: user.id,
          email: user.email,
          fullName: profile?.fullName || user.user_metadata?.full_name || user.user_metadata?.name || 'Student Ambassador',
          collegeName: profile?.collegeName || 'University Campus',
          phone: profile?.phone || '',
          department: profile?.department || '',
          city: profile?.city || '',
          yearOfStudy: profile?.yearOfStudy || '',
          graduationYear: profile?.graduationYear || '',
          authProvider: user.app_metadata?.provider || 'google',
          isProfileComplete: complete,
        };
        setCurrentUser(activeUser);
        try {
          localStorage.setItem('niyo_student_user', JSON.stringify(activeUser));
        } catch {
          // ignore
        }

        const hash = window.location.hash || '';
        if (!complete) {
          setCurrentPage('profile-completion');
          window.location.hash = '#profile-completion';
        } else if (hash === '#login' || hash === '#signup' || hash.includes('access_token')) {
          setCurrentPage('dashboard');
          window.location.hash = '#dashboard';
        }
      }
    });

    // 2. Subscribe to auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = session.user;
        const profile = getUserProfile(user.id);
        const complete = isProfileComplete(profile);
        const activeUser = {
          id: user.id,
          email: user.email,
          fullName: profile?.fullName || user.user_metadata?.full_name || user.user_metadata?.name || 'Student Ambassador',
          collegeName: profile?.collegeName || 'University Campus',
          phone: profile?.phone || '',
          department: profile?.department || '',
          city: profile?.city || '',
          yearOfStudy: profile?.yearOfStudy || '',
          graduationYear: profile?.graduationYear || '',
          authProvider: user.app_metadata?.provider || 'google',
          isProfileComplete: complete,
        };
        setCurrentUser(activeUser);
        try {
          localStorage.setItem('niyo_student_user', JSON.stringify(activeUser));
        } catch {
          // ignore
        }

        const hash = window.location.hash || '';
        if (!complete) {
          setCurrentPage('profile-completion');
          window.location.hash = '#profile-completion';
        } else if (hash === '#login' || hash === '#signup' || hash.includes('access_token')) {
          setCurrentPage('dashboard');
          window.location.hash = '#dashboard';
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        try {
          localStorage.removeItem('niyo_student_user');
          localStorage.removeItem('niyo_active_profile');
        } catch {
          // ignore
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Browser hash routing handler
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;

      // Allow Supabase OAuth callback to parse tokens
      if (hash.includes('access_token=') || hash.includes('refresh_token=')) {
        return;
      }

      if (hash === '#apply-form' || hash === '#apply' || hash === '#application') {
        setCurrentPage('apply');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#login') {
        setCurrentPage('login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#signup') {
        setCurrentPage('signup');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#profile-completion') {
        setCurrentPage('profile-completion');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#dashboard') {
        const storedUser = localStorage.getItem('niyo_student_user');
        const userObj = storedUser ? JSON.parse(storedUser) : currentUser;
        if (!userObj) {
          setCurrentPage('login');
          window.location.hash = '#login';
        } else {
          const profile = userObj.id ? getUserProfile(userObj.id) : null;
          if (userObj.authProvider === 'google' && !isProfileComplete(profile)) {
            setCurrentPage('profile-completion');
            window.location.hash = '#profile-completion';
          } else {
            setCurrentPage('dashboard');
          }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#admin') {
        setCurrentPage('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#ambassador') {
        const storedUser = localStorage.getItem('niyo_student_user');
        const userObj = storedUser ? JSON.parse(storedUser) : currentUser;
        if (!userObj) {
          setCurrentPage('login');
          window.location.hash = '#login';
        } else {
          const app = getStudentApplication(userObj.email || userObj.id);
          if (!app || app.status?.toLowerCase() !== 'approved') {
            alert('The Ambassador Portal is exclusively available for Approved Ambassadors. Track your status on the student dashboard.');
            setCurrentPage('dashboard');
            window.location.hash = '#dashboard';
          } else {
            setCurrentPage('ambassador');
          }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setCurrentPage('home');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [currentUser]);

  const navigateTo = (page) => {
    setCurrentPage(page);
    if (page === 'apply') window.location.hash = '#apply-form';
    else if (page === 'login') window.location.hash = '#login';
    else if (page === 'signup') window.location.hash = '#signup';
    else if (page === 'profile-completion') window.location.hash = '#profile-completion';
    else if (page === 'dashboard') window.location.hash = '#dashboard';
    else if (page === 'ambassador') window.location.hash = '#ambassador';
    else if (page === 'admin') window.location.hash = '#admin';
    else window.location.hash = '#home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    const profile = user.id ? getUserProfile(user.id) : null;
    if (user.authProvider === 'google' && !isProfileComplete(profile)) {
      navigateTo('profile-completion');
    } else {
      navigateTo('dashboard');
    }
  };

  const handleProfileComplete = (savedProfile) => {
    const updated = {
      ...currentUser,
      fullName: savedProfile.fullName,
      collegeName: savedProfile.collegeName,
      phone: savedProfile.phone,
      department: savedProfile.department,
      yearOfStudy: savedProfile.yearOfStudy,
      city: savedProfile.city,
      state: savedProfile.state,
      graduationYear: savedProfile.graduationYear,
      isProfileComplete: true,
    };
    setCurrentUser(updated);
    navigateTo('dashboard');
  };

  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
    navigateTo('home');
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {currentPage === 'admin' && (
        <AdminPortal onNavigateHome={() => navigateTo('home')} />
      )}

      {currentPage === 'ambassador' && (
        <AmbassadorPortal
          currentUser={currentUser}
          onNavigateHome={() => navigateTo('home')}
          onNavigateDashboard={() => navigateTo('dashboard')}
        />
      )}

      {currentPage === 'apply' && (
        <ApplicationForm
          onNavigateHome={() => navigateTo('home')}
          onNavigateDashboard={() => navigateTo('dashboard')}
        />
      )}

      {currentPage === 'login' && (
        <Auth
          initialMode="login"
          onNavigateHome={() => navigateTo('home')}
          onAuthSuccess={handleAuthSuccess}
          onSwitchMode={(mode) => navigateTo(mode)}
        />
      )}

      {currentPage === 'signup' && (
        <Auth
          initialMode="signup"
          onNavigateHome={() => navigateTo('home')}
          onAuthSuccess={handleAuthSuccess}
          onSwitchMode={(mode) => navigateTo(mode)}
        />
      )}

      {currentPage === 'profile-completion' && (
        <ProfileCompletion
          user={currentUser}
          onComplete={handleProfileComplete}
          onNavigateHome={() => navigateTo('home')}
          onLogout={handleLogout}
        />
      )}

      {currentPage === 'dashboard' && (
        <StudentDashboard
          currentUser={currentUser}
          onNavigateHome={() => navigateTo('home')}
          onNavigateApply={() => navigateTo('apply')}
          onNavigateAmbassador={() => navigateTo('ambassador')}
          onLogout={handleLogout}
        />
      )}

      {currentPage === 'home' && (
        <HomePage
          onNavigateApply={() => navigateTo('apply')}
          onNavigateLogin={() => navigateTo('login')}
          onNavigateDashboard={() => navigateTo('dashboard')}
          currentUser={currentUser}
        />
      )}

      {/* Mobile-Only Dedicated App Bottom Navigation Bar (Hidden on desktop) */}
      <MobileBottomNav
        currentPage={currentPage}
        onNavigateHome={() => navigateTo('home')}
        onNavigateApply={() => navigateTo('apply')}
        onNavigateDashboard={() => navigateTo('dashboard')}
        onNavigateLogin={() => navigateTo('login')}
        currentUser={currentUser}
      />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
