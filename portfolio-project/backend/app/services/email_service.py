"""
Email Service
SMTP email sending for contact form and notifications
"""
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from loguru import logger

from app.config import settings


class EmailService:
    """Service for sending emails via SMTP"""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None
    ) -> bool:
        """
        Send an email
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Plain text email body
            html_body: Optional HTML email body
            cc: Optional CC recipients
            bcc: Optional BCC recipients
            
        Returns:
            True if email was sent successfully
        """
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["From"] = self.smtp_username
            message["To"] = to_email
            message["Subject"] = subject
            
            if cc:
                message["Cc"] = ", ".join(cc)
            if bcc:
                message["Bcc"] = ", ".join(bcc)
            
            # Add plain text part
            message.attach(MIMEText(body, "plain"))
            
            # Add HTML part if provided
            if html_body:
                message.attach(MIMEText(html_body, "html"))
            
            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_username,
                password=self.smtp_password,
                start_tls=True,
            )
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
        
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False
    
    async def send_contact_form_confirmation(
        self,
        user_email: str,
        user_name: str,
        message_content: str
    ) -> bool:
        """
        Send confirmation email to user who submitted contact form
        
        Args:
            user_email: User's email address
            user_name: User's name
            message_content: Their message content
            
        Returns:
            True if email was sent successfully
        """
        subject = "Thank you for contacting Yiğit Okur"
        
        body = f"""
Hi {user_name},

Thank you for reaching out! I've received your message:

"{message_content}"

I'll get back to you as soon as possible.

Best regards,
Yiğit Okur
Cloud & DevOps Engineer

---
This is an automated confirmation email.
        """.strip()
        
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #3B82F6; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9fafb; }}
        .message {{ background-color: white; padding: 15px; border-left: 4px solid #3B82F6; margin: 20px 0; }}
        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Thank You for Contacting Me!</h2>
        </div>
        <div class="content">
            <p>Hi <strong>{user_name}</strong>,</p>
            <p>Thank you for reaching out! I've received your message:</p>
            <div class="message">
                <em>"{message_content}"</em>
            </div>
            <p>I'll get back to you as soon as possible.</p>
            <p>Best regards,<br>
            <strong>Yiğit Okur</strong><br>
            Cloud & DevOps Engineer</p>
        </div>
        <div class="footer">
            This is an automated confirmation email.
        </div>
    </div>
</body>
</html>
        """
        
        return await self.send_email(user_email, subject, body, html_body)
    
    async def send_admin_notification(
        self,
        user_name: str,
        user_email: str,
        subject: str,
        message_content: str
    ) -> bool:
        """
        Send notification to admin (Yiğit) about new contact form submission
        
        Args:
            user_name: User's name
            user_email: User's email
            subject: Message subject
            message_content: Message content
            
        Returns:
            True if email was sent successfully
        """
        admin_subject = f"New Contact Form Submission: {subject}"
        
        body = f"""
New contact form submission:

From: {user_name} ({user_email})
Subject: {subject}

Message:
{message_content}

---
Portfolio Contact Form Notification
        """.strip()
        
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #1F2937; color: white; padding: 20px; }}
        .content {{ padding: 20px; background-color: #f9fafb; }}
        .info {{ background-color: white; padding: 15px; margin: 10px 0; }}
        .message {{ background-color: #EEF2FF; padding: 15px; border-left: 4px solid #3B82F6; margin: 20px 0; }}
        .label {{ font-weight: bold; color: #6B7280; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>📧 New Contact Form Submission</h2>
        </div>
        <div class="content">
            <div class="info">
                <p><span class="label">From:</span> {user_name}</p>
                <p><span class="label">Email:</span> <a href="mailto:{user_email}">{user_email}</a></p>
                <p><span class="label">Subject:</span> {subject}</p>
            </div>
            <div class="message">
                <p><span class="label">Message:</span></p>
                <p>{message_content}</p>
            </div>
            <p style="text-align: center; margin-top: 20px;">
                <a href="mailto:{user_email}?subject=Re: {subject}" 
                   style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Reply to {user_name}
                </a>
            </p>
        </div>
    </div>
</body>
</html>
        """
        
        return await self.send_email(
            self.smtp_username,  # Send to admin (yourself)
            admin_subject,
            body,
            html_body
        )
