import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  UploadCloud, ListChecks, MessagesSquare, Gauge,
  Mic, Sparkles, ArrowRight, CheckCircle2, Quote,
  Send, Info, Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Footer from '../components/Footer';
import Waveform from '../components/Waveform';

const STEPS = [
  {
    cue: 'Signal 01',
    icon: UploadCloud,
    title: 'Drop in your resume',
    body: 'PDF or DOCX — Podium reads your experience so the questions are built around your actual background, not generic trivia.',
  },
  {
    cue: 'Signal 02',
    icon: ListChecks,
    title: 'Pick the role you\u2019re chasing',
    body: 'Choose from curated roles or type your own. The interview adapts its questions and difficulty to that specific job.',
  },
  {
    cue: 'Signal 03',
    icon: MessagesSquare,
    title: 'Rehearse, out loud or typed',
    body: 'Answer follow-up questions in a live chat, by typing or speaking. Podium reacts the way a real interviewer would.',
  },
  {
    cue: 'Signal 04',
    icon: Gauge,
    title: 'Get scored, not just praised',
    body: 'Walk away with a real score, concrete strengths, and the specific gaps to close before the real thing.',
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Questions built from your resume',
    body: 'No question banks. Every prompt is generated from the role and the experience you actually have.',
  },
  {
    icon: Mic,
    title: 'Type it or say it',
    body: 'Built-in voice input lets you rehearse the way you\u2019ll actually sit in the room \u2014 speaking, not typing.',
  },
  {
    icon: Gauge,
    title: 'A score with substance',
    body: 'Structured feedback \u2014 strengths, gaps, and a number \u2014 so you know exactly what to fix before the real interview.',
  },
];

function useOnScreen(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const visible = useOnScreen(ref);
  return (
    <div
      ref={ref}
      className={`${className} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700 ease-out`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const MARQUEE_ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Data Scientist',
  'Product Manager', 'DevOps Engineer', 'UI/UX Designer', 'ML Engineer', 'QA Engineer', 'Cloud Engineer',
];

export default function Landing() {
  const { user } = useAuth();
  const heroRef = useRef(null);

  const handleHeroMouseMove = (e) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'query',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      // 1. Submit email via Web3Forms client-side API (allowed on Free tier)
      const emailPromise = fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '1e572bee-4d56-4281-9f58-82d65653d575',
          name: formData.name,
          email: formData.email,
          subject: `[Podium Contact Form] New ${formData.type.toUpperCase()}: ${formData.name}`,
          message: `Name: ${formData.name}\nEmail: ${formData.email}\nType: ${formData.type.toUpperCase()}\n\nMessage:\n${formData.message}`,
          from_name: 'Podium App'
        })
      });

      // 2. Submit to local backend to persist in MongoDB database
      const dbPromise = api.post('/contact', formData);

      // Await both promises in parallel
      const [emailResponse, dbResponse] = await Promise.all([emailPromise, dbPromise]);
      const emailData = await emailResponse.json();

      if (emailData.success) {
        setSuccess('Thank you! Your message has been received.');
        setFormData(prev => ({ ...prev, message: '' }));
      } else {
        setError(emailData.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-porcelain overflow-x-hidden">
      {/* ================= HERO ================= */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="cursor-spotlight relative overflow-hidden bg-ink signal-grid min-h-[92vh] flex flex-col"
      >
        {/* ambient morphing blobs */}
        <div className="blob pointer-events-none absolute -left-32 top-10 w-[420px] h-[420px] bg-gold/25 blur-[110px]" />
        <div className="blob pointer-events-none absolute -right-24 top-1/3 w-[380px] h-[380px] bg-coral/20 blur-[110px]" style={{ animationDelay: '-5s' }} />
        <div className="pointer-events-none absolute inset-0" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(91,61,245,0.18), transparent 70%)'
        }} />

        <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6">
          <span className="group font-display text-2xl font-bold text-porcelain tracking-tight flex items-center gap-2.5 cursor-default">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-gold-soft">
              <Waveform bars={4} className="h-3.5" />
            </span>
            Podium
          </span>
          <div className="flex items-center gap-3">
            <a href="#contact" className="link-underline px-4 py-2 text-sm text-porcelain/80 hover:text-porcelain transition-colors">Contact</a>
            {user ? (
              <Link to="/dashboard" className="btn-sheen px-4 py-2 text-sm rounded-full bg-gold text-white font-semibold hover:-translate-y-0.5 transition-all duration-300 shadow-glow">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="link-underline px-4 py-2 text-sm text-porcelain/80 hover:text-porcelain transition-colors">Log in</Link>
                <Link to="/register" className="btn-sheen px-4 py-2 text-sm rounded-full bg-gold text-white font-semibold hover:-translate-y-0.5 transition-all duration-300 shadow-glow">
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-6 -mt-6">
          <span className="inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.25em] text-gold-soft mb-7 animate-fade-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
            <Radio size={14} /> Live AI interview coach <Waveform bars={4} className="h-3 text-coral" />
          </span>
          <h1 className="font-display font-bold text-porcelain text-5xl md:text-7xl leading-[1.05] max-w-4xl animate-fade-up" style={{ animationDelay: '0.35s', opacity: 0 }}>
            Say it out loud
            <br />
            <span className="text-gradient-gold">before it counts.</span>
          </h1>
          <p className="mt-6 max-w-xl text-slate text-lg animate-fade-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
            Upload your resume, choose your target role, and rehearse realistic
            AI interviews &mdash; typed or spoken &mdash; with instant scoring and
            feedback built to sound like a real interviewer.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: '0.65s', opacity: 0 }}>
            <Link to="/register" className="btn-sheen group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gold text-white font-semibold shadow-glow hover:-translate-y-0.5 transition-all duration-300">
              Start your first mock interview
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-porcelain/20 text-porcelain hover:bg-porcelain/5 hover:border-porcelain/40 hover:-translate-y-0.5 transition-all duration-300">
              I already have an account
            </Link>
          </div>
        </div>

        {/* big ambient waveform along the floor of the hero */}
        <div className="relative z-20 h-28 md:h-36 flex items-end justify-center pb-6 gap-1.5 px-6">
          {[...Array(38)].map((_, i) => {
            const h = 14 + Math.abs(19 - i) * -1.6 + Math.sin(i) * 10;
            return (
              <span
                key={i}
                className="w-1.5 md:w-2 rounded-full bg-gradient-to-t from-gold/70 to-coral/60 animate-wave-bar"
                style={{
                  height: `${Math.max(10, 16 + h)}px`,
                  animationDelay: `${i * 0.05}s`,
                  animationDuration: `${0.9 + (i % 5) * 0.15}s`,
                }}
              />
            );
          })}
        </div>
      </section>

      {/* ================= ROLE MARQUEE ================= */}
      <div className="bg-ink-soft border-y border-ink-line/60 py-4 marquee-mask overflow-hidden">
        <div className="marquee-track gap-10">
          {[...MARQUEE_ROLES, ...MARQUEE_ROLES].map((role, i) => (
            <span key={i} className="flex items-center gap-2 text-slate/70 text-sm whitespace-nowrap">
              <span className="w-1 h-1 rounded-full bg-gold/60" /> {role}
            </span>
          ))}
        </div>
      </div>

      {/* ================= STEPS ================= */}
      <section id="how-it-works" className="bg-ink-soft py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-soft mb-3 text-center">How it works</p>
            <h2 className="font-display font-bold text-porcelain text-3xl md:text-4xl text-center mb-16">Four signals, one confident interview</h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <div className="tilt-card relative h-full rounded-2xl card-glass p-7 hover:border-gold/40 hover:shadow-glow transition-colors group">
                  <div className="flex items-start justify-between mb-5">
                    <span className="font-mono text-xs text-gold-soft tracking-widest border border-gold/30 rounded-full px-3 py-1 group-hover:bg-gold/10 transition-colors">{s.cue}</span>
                    <s.icon className="text-gold-soft group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" size={26} />
                  </div>
                  <h3 className="font-display font-semibold text-xl text-porcelain mb-2">{s.title}</h3>
                  <p className="text-slate text-sm leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="bg-porcelain py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.25em] text-gold mb-3 text-center">What you get</p>
            <h2 className="font-display font-bold text-ink text-3xl md:text-4xl text-center mb-16">Practice that behaves like the real thing</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <div className="tilt-card group h-full bg-white rounded-2xl p-7 shadow-card border border-ink/5 hover:-translate-y-1.5 hover:border-gold/30 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-ink flex items-center justify-center mb-5 shadow-glow group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <f.icon size={22} className="text-gold-soft" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-ink mb-2">{f.title}</h3>
                  <p className="text-sm text-ink/60 leading-relaxed">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= QUOTE / CTA ================= */}
      <section className="relative bg-ink py-24 px-6 overflow-hidden signal-grid">
        <div className="blob pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-coral/10 blur-[130px]" />
        <div className="relative max-w-2xl mx-auto text-center">
          <Reveal>
            <Quote className="mx-auto text-gold-soft mb-6" size={32} />
            <p className="font-display font-semibold text-porcelain text-2xl md:text-3xl leading-snug mb-10">
              &ldquo;The best time to make your mistakes is in rehearsal &mdash;
              not on the call.&rdquo;
            </p>
            <div className="flex flex-col items-center gap-6">
              <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate">
                <li className="flex items-center gap-2 hover:text-porcelain transition-colors"><CheckCircle2 size={16} className="text-teal" /> No card required</li>
                <li className="flex items-center gap-2 hover:text-porcelain transition-colors"><CheckCircle2 size={16} className="text-teal" /> Resume-aware questions</li>
                <li className="flex items-center gap-2 hover:text-porcelain transition-colors"><CheckCircle2 size={16} className="text-teal" /> Score after every session</li>
              </ul>
              <Link to="/register" className="btn-sheen group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gold text-white font-semibold shadow-glow hover:-translate-y-0.5 hover:shadow-[0_0_50px_-6px_rgba(91,61,245,0.6)] transition-all duration-300">
                Start rehearsing <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section id="contact" className="relative bg-ink-soft py-24 px-6 overflow-hidden">
        <div className="blob pointer-events-none absolute right-1/2 bottom-0 translate-x-1/2 w-[800px] h-[400px] bg-gold/10 blur-[120px]" />

        <div className="relative max-w-5xl mx-auto">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-soft mb-3 text-center">Get in touch</p>
            <h2 className="font-display font-bold text-porcelain text-3xl md:text-4xl text-center mb-4">Questions or suggestions?</h2>
            <p className="text-slate text-center max-w-xl mx-auto mb-16 text-sm">
              Have a question about Podium or feedback on how to improve your interview rehearsals? Drop us a line below.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-5 gap-12 items-start">
            {/* contact details */}
            <div className="md:col-span-2 space-y-6">
              <Reveal delay={50}>
                <div className="tilt-card card-glass rounded-2xl p-6 space-y-4 hover:border-gold/30 transition-colors">
                  <h3 className="font-display font-semibold text-lg text-porcelain mb-2">Rehearse with intent</h3>
                  <p className="text-sm text-slate leading-relaxed">
                    Podium is built to help you master mock interviews. We actively review all submissions to guide our feature roadmap and fix issue reports.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={150}>
                <div className="tilt-card card-glass rounded-2xl p-6 flex items-start gap-4 hover:border-teal/30 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center shrink-0 border border-teal/20 group-hover:scale-110 group-hover:bg-teal/20 transition-all duration-300">
                    <Info className="text-teal" size={18} />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-sm text-porcelain">Response time</h4>
                    <p className="text-xs text-slate mt-1">Usually under 24 hours on weekdays.</p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* form */}
            <div className="md:col-span-3">
              <Reveal delay={100}>
                <form onSubmit={handleSubmit} className="card-glass rounded-2xl p-8 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-mono text-slate uppercase tracking-wider mb-2">Name</label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-ink/40 border border-white/10 hover:border-gold/30 focus:border-gold rounded-lg px-4 py-2.5 text-sm text-porcelain placeholder-slate/50 transition-all duration-300 focus:ring-1 focus:ring-gold focus:outline-none focus:shadow-glow"
                        placeholder="Jordan Lee"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-mono text-slate uppercase tracking-wider mb-2">Email</label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-ink/40 border border-white/10 hover:border-gold/30 focus:border-gold rounded-lg px-4 py-2.5 text-sm text-porcelain placeholder-slate/50 transition-all duration-300 focus:ring-1 focus:ring-gold focus:outline-none focus:shadow-glow"
                        placeholder="jordan@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-type" className="block text-xs font-mono text-slate uppercase tracking-wider mb-2">Inquiry type</label>
                    <select
                      id="contact-type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full bg-ink-soft border border-white/10 hover:border-gold/30 focus:border-gold rounded-lg px-4 py-2.5 text-sm text-porcelain focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
                    >
                      <option value="query" className="bg-ink-soft">General query</option>
                      <option value="suggestion" className="bg-ink-soft">Suggestion / feedback</option>
                      <option value="bug" className="bg-ink-soft">Bug report</option>
                      <option value="other" className="bg-ink-soft">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-mono text-slate uppercase tracking-wider mb-2">Message</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows="4"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full bg-ink/40 border border-white/10 hover:border-gold/30 focus:border-gold rounded-lg px-4 py-2.5 text-sm text-porcelain placeholder-slate/50 transition-all duration-300 focus:ring-1 focus:ring-gold focus:outline-none focus:shadow-glow resize-none"
                      placeholder="Your suggestions or details about your query..."
                    />
                  </div>

                  {success && (
                    <div className="flex items-center gap-2 p-3.5 rounded-lg bg-teal/10 border border-teal/20 text-teal text-xs animate-pop-in">
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 p-3.5 rounded-lg bg-coral/10 border border-coral/20 text-coral-soft text-xs animate-pop-in">
                      <Info size={16} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-sheen group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gold text-white font-semibold shadow-glow hover:-translate-y-0.5 transition-all duration-300 w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Send message
                        <Send size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
