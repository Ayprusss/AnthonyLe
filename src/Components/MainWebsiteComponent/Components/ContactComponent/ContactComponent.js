import React, { useRef, useState } from "react";
import "./ContactComponent.css";
import emailjs from "@emailjs/browser";

function ContactComponent({ shouldAnimate = false }) {
    const contactSectionRef = useRef(null);
    const form = useRef();
    
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sendEmail = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        emailjs.sendForm('ayprusss_email_service', 'template_30qbmwr', form.current, 'ajgDW7hgrON568ajG')
        .then((result) => {
            console.log('Email sent successfully: ', result.text);
            setResponseMessage("Message sent successfully! I'll get back to you soon.");
            setIsSuccess(true);
            setNotificationVisible(true);
            setIsSubmitting(false);
            
            // Reset form
            form.current.reset();
            
            // Hide notification after 5 seconds
            setTimeout(() => {
                setNotificationVisible(false);
            }, 5000);
        }, (error) => {
            console.log('Failed to send email: ', error.text);
            setResponseMessage("Failed to send message. Please try again or contact me directly.");
            setIsSuccess(false);
            setNotificationVisible(true);
            setIsSubmitting(false);
            
            // Hide notification after 5 seconds
            setTimeout(() => {
                setNotificationVisible(false);
            }, 5000);
        });
    };

    const handleInputFocus = (e) => {
        const element = e.currentTarget;
        element.style.borderColor = 'rgba(100, 151, 188, 0.8)';
        element.style.boxShadow = '0 0 0 2px rgba(100, 151, 188, 0.2)';
    };

    const handleInputBlur = (e) => {
        const element = e.currentTarget;
        element.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        element.style.boxShadow = 'none';
    };

    return (
        <div className="contact-section" ref={contactSectionRef}>
            <h1 className="contact-header">Get In Touch</h1>
            
            <div className="contact-container">
                <div className="contact-intro">
                    <p className="contact-description">
                        I'm always open to discussing new opportunities, collaborations, or just having a conversation about technology and development. Feel free to reach out!
                    </p>
                    
                    <div className="contact-info">
                        <div className="contact-info-item">
                            <span className="contact-icon">📧</span>
                            <span className="contact-text">Available for freelance projects</span>
                        </div>
                        <div className="contact-info-item">
                            <span className="contact-icon">💼</span>
                            <span className="contact-text">Open to full-time opportunities</span>
                        </div>
                        <div className="contact-info-item">
                            <span className="contact-icon">🚀</span>
                            <span className="contact-text">Let's build something amazing together</span>
                        </div>
                    </div>
                </div>

                <div className="contact-form-container">
                    {notificationVisible && (
                        <div className={`contact-notification ${isSuccess ? 'success' : 'error'}`}>
                            <span className="notification-icon">
                                {isSuccess ? '✅' : '❌'}
                            </span>
                            <span className="notification-message">{responseMessage}</span>
                        </div>
                    )}

                    <form ref={form} onSubmit={sendEmail} className="contact-form">
                        <div className="form-group">
                            <label htmlFor="contact-name" className="form-label">Your Name</label>
                            <input 
                                id="contact-name" 
                                type="text" 
                                name="name" 
                                className="form-input"
                                placeholder="Enter your full name"
                                required
                                disabled={isSubmitting}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contact-email" className="form-label">Email Address</label>
                            <input 
                                id="contact-email" 
                                type="email" 
                                name="email" 
                                className="form-input"
                                placeholder="your.email@example.com"
                                required
                                disabled={isSubmitting}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contact-subject" className="form-label">Subject</label>
                            <input 
                                id="contact-subject" 
                                type="text" 
                                name="subject" 
                                className="form-input"
                                placeholder="What's this about?"
                                required
                                disabled={isSubmitting}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contact-message" className="form-label">Message</label>
                            <textarea 
                                id="contact-message" 
                                name="message" 
                                className="form-textarea"
                                placeholder="Tell me about your project, idea, or just say hello!"
                                rows="6"
                                required
                                disabled={isSubmitting}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <span className="button-icon">🚀</span>
                                    Send Message
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <div className="contact-footer">
                <div className="social-links">
                    <p className="social-text">You can also find me on:</p>
                    <div className="social-icons">
                        <a 
                            href="https://github.com/yourusername" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="social-link github"
                            aria-label="GitHub Profile"
                        >
                            <span className="social-icon">💻</span>
                            <span className="social-label">GitHub</span>
                        </a>
                        <a 
                            href="https://linkedin.com/in/yourusername" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="social-link linkedin"
                            aria-label="LinkedIn Profile"
                        >
                            <span className="social-icon">💼</span>
                            <span className="social-label">LinkedIn</span>
                        </a>
                        <a 
                            href="mailto:your.email@example.com" 
                            className="social-link email"
                            aria-label="Send Email"
                        >
                            <span className="social-icon">📧</span>
                            <span className="social-label">Email</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactComponent;