import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from './ui/SectionHeader';
import { Github, Linkedin, Copy, Check, ArrowUp } from 'lucide-react';
import emailjs from '@emailjs/browser';
import './Contact.css';

// Transmittal sheet: the form that accompanies every drawing set.
const Contact = () => {
    const formRef = useRef();
    const [isSending, setIsSending] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText('anthonykhle@gmail.com');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy email:', err);
        }
    };

    const sendEmail = (e) => {
        e.preventDefault();
        setIsSending(true);
        setResponseMessage("");

        emailjs.sendForm(
            process.env.REACT_APP_EMAILJS_SERVICE_ID,
            process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
            formRef.current,
            process.env.REACT_APP_EMAILJS_PUBLIC_KEY
        )
            .then((result) => {
                console.log('Email sent successfully: ', result.text);
                setResponseMessage("Message submitted. Thanks!");
                setIsSuccess(true);
                setIsSending(false);
                formRef.current.reset();
            }, (error) => {
                console.log('Failed to send email: ', error.text);
                setResponseMessage("Error occurred. Please try again.");
                setIsSuccess(false);
                setIsSending(false);
            });
    };

    return (
        <section className="section-container">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
            >
                <SectionHeader
                    title="Contact."
                    meta="message relay · reply requested"
                    subtitle="I'm currently open to new opportunities. Send a message and I will get back to you ASAP."
                />

                <div className="email-card">
                    <span className="email-card-label">CORRESPONDENCE</span>
                    <a href="mailto:anthonykhle@gmail.com" className="email-card-address">
                        anthonykhle@gmail.com
                    </a>
                    <button
                        className="email-copy-btn"
                        onClick={handleCopyEmail}
                        aria-label={copied ? 'Copied!' : 'Copy email address'}
                        title={copied ? 'Copied!' : 'Copy email'}
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </div>

                <form ref={formRef} onSubmit={sendEmail} className="contact-form">
                    <p className="contact-form-caption">MESSAGE RELAY</p>
                    <div className="form-group">
                        <label htmlFor="contact-email" className="form-label">From</label>
                        <input id="contact-email" type="email" name="user_email" placeholder="Your Email" required className="form-input" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="contact-subject" className="form-label">Re</label>
                        <input id="contact-subject" type="text" name="subject" placeholder="Subject" required className="form-input" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="contact-message" className="form-label">Remarks</label>
                        <textarea id="contact-message" name="message" placeholder="Your Message" required className="form-textarea" rows="5"></textarea>
                    </div>
                    <button type="submit" className="btn-primary" disabled={isSending}>
                        {isSending ? 'Sending...' : 'Send Message'}
                    </button>
                    {responseMessage && (
                        <p role="status" className={`form-message ${isSuccess ? 'success' : 'error'}`}>
                            {responseMessage}
                        </p>
                    )}
                </form>

                <div className="social-links">
                    <a href="https://github.com/Ayprusss" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={20} /></a>
                    <a href="https://www.linkedin.com/in/anthonykhle/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={20} /></a>
                </div>
            </motion.div>

            {/* Sign-off — the terminal closes the session here */}
            <footer className="footer">
                <div className="footer-cell">
                    <span className="footer-label">Terminal user</span>
                    <span className="footer-value">ANTHONY LE · © {new Date().getFullYear()}</span>
                </div>
                <div className="footer-cell">
                    <span className="footer-label">Station</span>
                    <span className="footer-value">45.4215° N · 75.6972° W — OTTAWA, CA</span>
                </div>
                <div className="footer-cell footer-cell-sht">
                    <span className="footer-label">Session</span>
                    <span className="footer-value">EOF · SESSION TERMINATED</span>
                </div>
                <button
                    type="button"
                    className="footer-top"
                    onClick={() => {
                        const reduce = window.matchMedia &&
                            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
                    }}
                >
                    Back to top <ArrowUp size={13} />
                </button>
            </footer>
        </section>
    );
};

export default Contact;
