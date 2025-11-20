"""
Email service for sending verification and password reset emails
"""
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class EmailService:
    """Email service for sending transactional emails"""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.use_tls = settings.SMTP_USE_TLS
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
        max_retries: int = 3
    ) -> bool:
        """
        Send an email with retry logic
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_body: HTML email body
            text_body: Optional plain text body
            max_retries: Maximum number of retry attempts
            
        Returns:
            True if sent successfully, False otherwise
        """
        if text_body is None:
            # Simple HTML to text conversion
            text_body = html_body.replace('<br>', '\n').replace('<br/>', '\n')
            # Remove HTML tags (simple approach)
            import re
            text_body = re.sub(r'<[^>]+>', '', text_body)
        
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = self.from_email
        message["To"] = to_email
        
        text_part = MIMEText(text_body, "plain")
        html_part = MIMEText(html_body, "html")
        
        message.attach(text_part)
        message.attach(html_part)
        
        for attempt in range(max_retries):
            try:
                await aiosmtplib.send(
                    message,
                    hostname=self.smtp_host,
                    port=self.smtp_port,
                    username=self.smtp_user,
                    password=self.smtp_password,
                    use_tls=self.use_tls,
                )
                logger.info(f"Email sent successfully to {to_email}")
                return True
            except Exception as e:
                logger.error(f"Email send attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    logger.error(f"Failed to send email to {to_email} after {max_retries} attempts")
                    return False
                # Wait before retry (exponential backoff)
                import asyncio
                await asyncio.sleep(2 ** attempt)
        
        return False
    
    def _render_verification_email(
        self,
        app_name: str,
        verification_url: str
    ) -> tuple[str, str]:
        """
        Render email verification email template
        
        Args:
            app_name: Application name
            verification_url: Email verification URL
            
        Returns:
            Tuple of (subject, html_body)
        """
        subject = f"Verify your email for {app_name}"
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #4A90E2;">Verify Your Email</h1>
                <p>Thank you for signing up for {app_name}!</p>
                <p>Please click the button below to verify your email address:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}" 
                       style="background-color: #4A90E2; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 4px; display: inline-block;">
                        Verify Email
                    </a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">{verification_url}</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    This link will expire in 48 hours. If you didn't create an account, please ignore this email.
                </p>
            </div>
        </body>
        </html>
        """
        return subject, html_body
    
    def _render_password_reset_email(
        self,
        app_name: str,
        reset_url: str
    ) -> tuple[str, str]:
        """
        Render password reset email template
        
        Args:
            app_name: Application name
            reset_url: Password reset URL
            
        Returns:
            Tuple of (subject, html_body)
        """
        subject = f"Reset your password for {app_name}"
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #4A90E2;">Reset Your Password</h1>
                <p>We received a request to reset your password for {app_name}.</p>
                <p>Click the button below to reset your password:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" 
                       style="background-color: #4A90E2; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 4px; display: inline-block;">
                        Reset Password
                    </a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">{reset_url}</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
                </p>
            </div>
        </body>
        </html>
        """
        return subject, html_body
    
    async def send_verification_email(
        self,
        to_email: str,
        app_name: str,
        verification_token: str,
        base_url: Optional[str] = None
    ) -> bool:
        """
        Send email verification email
        
        Args:
            to_email: Recipient email
            app_name: Application name
            verification_token: Verification token
            base_url: Base URL for verification link (defaults to frontend URL)
            
        Returns:
            True if sent successfully
        """
        if base_url is None:
            base_url = "https://app.devauth.dev"  # Default frontend URL
        
        verification_url = f"{base_url}/verify-email?token={verification_token}"
        subject, html_body = self._render_verification_email(app_name, verification_url)
        
        return await self.send_email(to_email, subject, html_body)
    
    async def send_password_reset_email(
        self,
        to_email: str,
        app_name: str,
        reset_token: str,
        base_url: Optional[str] = None
    ) -> bool:
        """
        Send password reset email
        
        Args:
            to_email: Recipient email
            app_name: Application name
            reset_token: Password reset token
            base_url: Base URL for reset link (defaults to frontend URL)
            
        Returns:
            True if sent successfully
        """
        if base_url is None:
            base_url = "https://app.devauth.dev"  # Default frontend URL
        
        reset_url = f"{base_url}/reset-password?token={reset_token}"
        subject, html_body = self._render_password_reset_email(app_name, reset_url)
        
        return await self.send_email(to_email, subject, html_body)


# Global email service instance
email_service = EmailService()

