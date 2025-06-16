import React, {useRef} from 'react';
import "98.css";
import "./ContactComponent.css";
import { Rnd } from "react-rnd";
import { useState } from "react";
import emailjs from "@emailjs/browser";

function ContactComponent({ onClose }) {
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(true);
    
    const form = useRef();
    
    const sendEmail = (e) => {
        e.preventDefault();
        
        emailjs.sendForm('ayprusss_email_service', 'template_30qbmwr', form.current, 'ajgDW7hgrON568ajG')
        .then((result) => {
            console.log('Email sent successfully: ', result.text);
            setResponseMessage("Message submitted. Thanks!");
            setIsSuccess(true);
            setNotificationVisible(true);
            
            setTimeout(() => {
                onClose(); // Close the window after 1.5 seconds
            }, 1500);
        }, (error) => {
            console.log('Failed to send email: ', error.text);
            setResponseMessage("Error occurred. Please try again.");
            setIsSuccess(false);
            setNotificationVisible(true);
        });
    };

    return(
        <Rnd dragHandleClassName='title-bar'>
            <div className="window contact-window">
                <div className="title-bar">Contact Me
                    <div className="title-bar-controls">
                        <button aria-label="Minimize"></button>
                        <button aria-label="Maximize"></button>
                        <button aria-label="Close" onClick={onClose}></button>
                    </div>
                </div>
                <div className="window-body contact-body">
                    <p>Looking to contact me? Please fill out the form and I will get back to you ASAP.</p>
                    
                    {notificationVisible && (
                        <p className="form-response" style={{
                            color: isSuccess ? "lightgreen" : "red",
                            fontWeight: "bold"
                        }}>
                            {responseMessage}
                        </p>
                    )}
                    
                    <form ref={form} onSubmit={sendEmail} className="contact-form">
                        <fieldset>
                            <div className="field-row-stacked">
                                <label className="contact-label" htmlFor="contact-name">Name:</label>
                                <input id="contact-name" type="text" name="name" required/>
                                <label className="contact-label" htmlFor="contact-email">Email:</label>
                                <input id="contact-email" type="email" name="email" required />
                                <label className="contact-label" htmlFor="contact-message">Message:</label>
                                <textarea id="contact-message" name="message" rows="10" required />
                                <button type="submit" className="default">Send</button>
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        </Rnd>
    );
}

export default ContactComponent;