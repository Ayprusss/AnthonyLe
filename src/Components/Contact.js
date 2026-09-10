import React, { useRef, useState } from 'react';
import { Section } from './ui/Section';
import emailjs from '@emailjs/browser';
import './Contact.css';

const EMAIL = 'anthonykhle@gmail.com';

const Contact = () => {
    const formRef = useRef();
    const [isSending, setIsSending] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(EMAIL);
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
            .then(() => {
                setResponseMessage("Message submitted. Thanks!");
                setIsSuccess(true);
                setIsSending(false);
                formRef.current.reset();
            }, () => {
                setResponseMessage("Error occurred. Please try again.");
                setIsSuccess(false);
                setIsSending(false);
            });
    };

    return (
        <>
            <Section
                title="Contact."
                lead="Open to new-grad roles and happy to talk about anything above."
            />

            {/* The address itself first. A form is a favour you ask of
                the reader; some people would rather just have the email. */}
            <div className="contact-email">
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                <button
                    type="button"
                    className="contact-copy"
                    onClick={handleCopyEmail}
                >
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>

            <form ref={formRef} onSubmit={sendEmail} className="contact-form">
                <div className="field">
                    <label htmlFor="contact-email-input" className="pair-label">Your email</label>
                    <input
                        id="contact-email-input"
                        type="email"
                        name="user_email"
                        placeholder="Your Email"
                        required
                        className="input"
                    />
                </div>
                <div className="field">
                    <label htmlFor="contact-subject" className="pair-label">Subject</label>
                    <input
                        id="contact-subject"
                        type="text"
                        name="subject"
                        placeholder="Subject"
                        required
                        className="input"
                    />
                </div>
                <div className="field">
                    <label htmlFor="contact-message" className="pair-label">Message</label>
                    <textarea
                        id="contact-message"
                        name="message"
                        placeholder="Your Message"
                        required
                        rows="6"
                        className="input"
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSending}>
                    {isSending ? 'Sending...' : 'Send Message'}
                </button>

                {responseMessage && (
                    <p role="status" className={`form-message${isSuccess ? ' is-success' : ' is-error'}`}>
                        {responseMessage}
                    </p>
                )}
            </form>

            <footer className="footer">
                <p className="micro">Anthony Le — Ottawa, Canada — © {new Date().getFullYear()}</p>
                <ul className="footer-links">
                    <li>
                        <a href="https://github.com/Ayprusss" target="_blank" rel="noopener noreferrer">
                            GitHub
                        </a>
                    </li>
                    <li>
                        <a href="https://www.linkedin.com/in/anthonykhle/" target="_blank" rel="noopener noreferrer">
                            LinkedIn
                        </a>
                    </li>
                </ul>
            </footer>
        </>
    );
};

export default Contact;
