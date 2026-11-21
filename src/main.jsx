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
} from 'react-icons/fi';
import { BsMegaphone } from 'react-icons/bs';
import './styles.css';
import studentImage from '../asset/homepage1.png';
import ApplicationForm from './ApplicationForm';

const navLinks = [
  { label: 'Home', href: '#home', targetId: 'home' },
  { label: 'About the Program', href: '#about', targetId: 'about' },
  { label: 'How It Works', href: '#how-it-works', targetId: 'how-it-works' },
  { label: 'FAQs', href: '#faqs', targetId: 'faqs' },
];

function Brand() {
  return (
    <a className="brand" href="#home" aria-label="Niyo Campus home">
      <span className="brand-mark" aria-hidden="true">
        <i></i><i></i><i></i>
      </span>
      <span>Niyo <b>Campus</b></span>
    </a>
  );
}

function Header({ onNavigateApply }) {
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
        <button
          type="button"
          className="button button-primary header-apply"
          onClick={onNavigateApply}
        >
          Apply Now <FiArrowUpRight aria-hidden="true" />
        </button>
        <button
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="primary-navigation"
        >
          {open ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
        </button>
      </div>
      {open && <div className="menu-backdrop" onClick={close} aria-hidden="true"></div>}
    </header>
  );
}

function Hero({ onNavigateApply }) {
  return (
    <section id="home" className="hero-section" aria-label="Hero Introduction">
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
          <div className="about-visual" aria-hidden="true">
            <div className="visual-card card-back"></div>
            <div className="visual-card card-front">
              <span className="mini-logo">
                <i></i><i></i><i></i>
              </span>
              <div className="visual-lines">
                <b></b><b></b><b></b>
              </div>
              <div className="visual-people">
                <span></span><span></span><span></span>
              </div>
            </div>
            <div className="spark spark-a">+</div>
            <div className="spark spark-b">✦</div>
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
    a: 'It is a program that allows students to represent Niyo within their university communities.',
  },
  {
    q: 'What does a student ambassador do?',
    a: 'Student ambassadors represent Niyo, engage with fellow students, and participate in ambassador campaigns.',
  },
  {
    q: 'How do I apply?',
    a: 'Click the Apply Now button to begin the application process.',
  },
  {
    q: 'What happens after I submit my application?',
    a: 'Your application will be reviewed by the Niyo team.',
  },
  {
    q: 'How will I know the status of my application?',
    a: 'Application status information will be available through the ambassador application process.',
  },
  {
    q: 'Where can I learn more about the program?',
    a: 'Explore the information available on this page to understand the program and its application process.',
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

function Footer() {
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

function HomePage({ onNavigateApply }) {
  return (
    <>
      <Header onNavigateApply={onNavigateApply} />
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

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#apply-form' || hash === '#application') {
        setCurrentPage('apply');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setCurrentPage('home');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateToApply = () => {
    window.location.hash = '#apply-form';
    setCurrentPage('apply');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    window.location.hash = '#home';
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {currentPage === 'apply' ? (
        <ApplicationForm onNavigateHome={navigateToHome} />
      ) : (
        <HomePage onNavigateApply={navigateToApply} />
      )}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
