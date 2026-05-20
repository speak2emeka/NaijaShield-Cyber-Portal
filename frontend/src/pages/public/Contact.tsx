import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { Send } from 'lucide-react';

export function Contact() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      await api.post('/public/contact', Object.fromEntries(form.entries()));
      toast.success('Message sent to NaijaShield!');
      event.currentTarget.reset();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      toast.error('Unable to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <div className="mb-12">
        <p className="mb-2 text-sm font-black uppercase tracking-widest text-shield-glow">Get in touch</p>
        <h1 className="text-4xl md:text-5xl font-black">Contact NaijaShield</h1>
        <p className="mt-4 text-lg text-slate-300 max-w-2xl">Request a consultation, assessment, incident response support, or ask any questions about our services.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 mb-12">
        <div className="glass-card p-6">
          <h3 className="font-bold text-lg mb-4">Quick Response</h3>
          <p className="text-slate-300 text-sm leading-relaxed">Our team typically responds to inquiries within 24 hours during business days.</p>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-bold text-lg mb-4">Secure Communication</h3>
          <p className="text-slate-300 text-sm leading-relaxed">All submissions are encrypted and handled with confidentiality.</p>
        </div>
      </div>

      <form onSubmit={submit} className="glass-card p-8 md:p-10" noValidate>
        <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
        
        {submitted && (
          <div className="mb-6 rounded-lg bg-shield-green/10 border border-shield-green/20 p-4 flex items-start gap-3">
            <div className="text-shield-green mt-0.5">✓</div>
            <div>
              <p className="font-bold text-shield-green text-sm">Message sent successfully!</p>
              <p className="text-xs text-slate-300 mt-1">We'll be in touch shortly.</p>
            </div>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="label">Full Name</label>
            <input 
              id="name"
              className="input" 
              name="name" 
              placeholder="Your name" 
              required 
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="email" className="label">Email Address</label>
            <input 
              id="email"
              className="input" 
              name="email" 
              type="email" 
              placeholder="your.email@example.com" 
              required 
              aria-required="true"
            />
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="subject" className="label">Subject</label>
          <input 
            id="subject"
            className="input" 
            name="subject" 
            placeholder="How can we help?" 
            required 
            aria-required="true"
          />
        </div>

        {/* Honeypot field */}
        <input className="hidden" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

        <div className="mt-5">
          <label htmlFor="message" className="label">Message</label>
          <textarea 
            id="message"
            className="input min-h-40 resize-none" 
            name="message" 
            placeholder="Tell us more about your inquiry..." 
            required 
            aria-required="true"
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary mt-6 w-full md:w-auto" 
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <><span className="loading-spinner">⏳</span>Sending...</>
          ) : (
            <><Send size={18} aria-hidden="true" />Send message</>
          )}
        </button>

        <p className="text-xs text-slate-500 mt-4">We respect your privacy. We'll never share your information.</p>
      </form>
    </main>
  );
}
