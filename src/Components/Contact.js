import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin } from 'lucide-react';
import emailjs from '@emailjs/browser';
import './Contact.css';

const Contact = () => {
    const formRef = useRef();
    const [isSending, setIsSending] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const sendEmail = (e) => {
        e.preventDefault();
        setIsSending(true);
        setResponseMessage("");

        emailjs.sendForm('ayprusss_email_service', 'template_30qbmwr', formRef.current, 'ajgDW7hgrON568ajG')
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
                <h2 className="section-title">Contact.</h2>
                <div className="section-divider"></div>
                <p className="section-subtitle">
                    I'm currently open to new opportunities. Send a message and I will get back to you ASAP.
                </p>

                <form ref={formRef} onSubmit={sendEmail} className="contact-form">
                    <div className="form-group">
                        <input type="email" name="user_email" placeholder="Your Email" required className="form-input" defaultValue="anthonykhle@gmail.com" />
                    </div>
                    <div className="form-group">
                        <input type="text" name="subject" placeholder="Subject" required className="form-input" />
                    </div>
                    <div className="form-group">
                        <textarea name="message" placeholder="Your Message" required className="form-textarea" rows="5"></textarea>
                    </div>
                    <button type="submit" className="btn-primary" disabled={isSending}>
                        {isSending ? 'Sending...' : 'Send Message'}
                    </button>
                    {responseMessage && (
                        <p className={`form-message ${isSuccess ? 'success' : 'error'}`}>
                            {responseMessage}
                        </p>
                    )}
                </form>

                <div className="social-links">
                    <a href="https://github.com/Ayprusss" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={24} /></a>
                    <a href="https://www.linkedin.com/in/anthonykhle/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={24} /></a>
                </div>
            </motion.div>

            <footer className="footer">
                <p>Built by Anthony Le.</p>
            </footer>
        </section>
    );
};

export default Contact;
