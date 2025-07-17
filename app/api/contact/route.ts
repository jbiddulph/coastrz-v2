import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Check for environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.error('Email configuration missing:', {
      hasUser: !!process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_APP_PASSWORD
    });
    return NextResponse.json(
      { error: 'Server email configuration is missing' },
      { status: 500 }
    );
  }

  try {
    const { name, email, subject, message } = await req.json();

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    console.log('Creating Gmail transport');

    // Create a transporter using Gmail service
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    // Verify connection
    try {
      await transporter.verify();
      console.log('Gmail connection verified successfully');
    } catch (verifyError: any) {
      console.error('Gmail verification failed:', {
        message: verifyError.message,
        code: verifyError.code,
        response: verifyError.response
      });
      return NextResponse.json(
        { error: 'Email service connection failed: ' + verifyError.message },
        { status: 500 }
      );
    }

    // Email content
    const mailOptions = {
      from: {
        name: 'CEF Store Contact Form',
        address: process.env.EMAIL_USER
      },
      replyTo: email,
      to: 'john.mbiddulph@gmail.com',
      subject: `Contact Form: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    // Send email
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return NextResponse.json(
        { message: 'Email sent successfully' },
        { status: 200 }
      );
    } catch (sendError: any) {
      console.error('Failed to send email:', {
        error: sendError.message,
        code: sendError.code,
        response: sendError.response
      });
      throw sendError;
    }
  } catch (error: any) {
    console.error('Error in contact form handler:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    
    let errorMessage = 'Failed to send email. Please try again later.';
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check your email configuration.';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 