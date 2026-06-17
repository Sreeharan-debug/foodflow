import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendWelcomeEmail(fullName: string, email: string) {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'FOODFLOW <onboarding@resend.dev>';
    const subject = 'Welcome to FOODFLOW 🍽️';

    // Warm, premium food-delivery style email design
    const html = `
      <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 550px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; tracking-tight: -0.025em;">FOODFLOW</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 4px 0 0 0; font-size: 14px; font-weight: 500;">Premium Real-Time Food Delivery</p>
        </div>
        
        <!-- Body Content -->
        <div style="padding: 32px 24px; background-color: #ffffff;">
          <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Hello ${fullName},</h2>
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 24px; leading-relaxed: 1.6;">
            Welcome to <strong>FOODFLOW</strong>! Your account has been successfully created using Google Sign-In. We are absolutely thrilled to have you join our premium dining community.
          </p>
          
          <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 14px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">What you can do now:</h3>
            <ul style="margin: 0; padding: 0; list-style: none; font-size: 14.5px; color: #374151;">
              <li style="margin-bottom: 10px; display: flex; align-items: center;">
                <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span> Browse delicious master-crafted Indian dishes
              </li>
              <li style="margin-bottom: 10px; display: flex; align-items: center;">
                <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span> Place orders instantly with secure checkouts
              </li>
              <li style="margin-bottom: 10px; display: flex; align-items: center;">
                <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span> Track deliveries live with real-time WebSockets
              </li>
              <li style="margin-bottom: 10px; display: flex; align-items: center;">
                <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span> Save your favorite meals and shipping locations
              </li>
              <li style="margin-bottom: 0; display: flex; align-items: center;">
                <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span> Enjoy a completely seamless ordering experience
              </li>
            </ul>
          </div>
          
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 24px;">
            Ready to explore? Head over to our menu and order your first culinary masterwork!
          </p>
          
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="http://localhost:3000/customer/menu" style="background: #ea580c; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.15);">Order Delicious Food</a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0 0; border-top: 1px solid #f3f4f6; padding-top: 16px;">
            Happy Ordering!<br />
            <strong>The FOODFLOW Team</strong>
          </p>
        </div>
      </div>
    `;

    await this.sendMail(email, subject, html);
  }

  async sendOrderConfirmationEmail(fullName: string, email: string, orderId: string, total: string) {
    const firstName = fullName.split(' ')[0];
    const subject = `Order Confirmed: #${orderId.substring(0, 8).toUpperCase()} 🍽️`;

    const html = `
      <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 550px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; tracking-tight: -0.025em;">Order Confirmed!</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 4px 0 0 0; font-size: 14px; font-weight: 500;">Order ID: #${orderId.toUpperCase()}</p>
        </div>
        
        <!-- Body Content -->
        <div style="padding: 32px 24px; background-color: #ffffff;">
          <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">Hi ${firstName},</h2>
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 20px; leading-relaxed: 1.6;">
            Your order <strong>#${orderId.substring(0, 8).toUpperCase()}</strong> has been confirmed! Our culinary team has started preparing your fresh Indian meal.
          </p>
          
          <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 14px; color: #6b7280;">Order Reference:</span>
              <span style="font-size: 14px; font-weight: bold; color: #111827;">#${orderId.substring(0, 8).toUpperCase()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 14px; color: #6b7280;">Total Payment:</span>
              <span style="font-size: 14px; font-weight: 800; color: #10b981;">₹${parseFloat(total).toFixed(2)}</span>
            </div>
          </div>
          
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 24px;">
            You can track your order status live right from your dashboard.
          </p>
          
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="http://localhost:3000/customer/orders" style="background: #10b981; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.15);">Track Delivery Live</a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0 0; border-top: 1px solid #f3f4f6; padding-top: 16px;">
            Enjoy your meal!<br />
            <strong>The FOODFLOW Team</strong>
          </p>
        </div>
      </div>
    `;

    await this.sendMail(email, subject, html);
  }

  private async sendMail(to: string, subject: string, html: string) {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'FOODFLOW <onboarding@resend.dev>';

    if (resendApiKey && resendApiKey !== 'mock_key' && resendApiKey !== '') {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [to],
            subject,
            html,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[EmailService] Resend API failed: ${errText}`);
        } else {
          console.log(`[EmailService] Resend successfully sent email to ${to}`);
        }
      } catch (err) {
        console.error('[EmailService] Resend transmission failed:', err);
      }
    } else {
      // Mock log to stdout for testing
      console.log('\n=======================================');
      console.log('📬  [MOCK EMAIL SENT]  📬');
      console.log(`To:      ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('---------------------------------------');
      // Format text body preview
      const bodyPreview = html
        .replace(/<[^>]*>/g, '') // strip html
        .replace(/\s+/g, ' ') // normalize space
        .substring(0, 300) + '...';
      console.log(`Body:    ${bodyPreview}`);
      console.log('=======================================\n');
    }
  }
}
