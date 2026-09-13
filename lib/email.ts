import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function sendVipWelcomeEmail(toEmail: string) {
  if (!resend) {
    console.warn("Resend is not configured. Skipping email dispatch.");
    return { success: false, reason: "Missing API Key" };
  }

  try {
    const data = await resend.emails.send({
      from: `CTRL + STYLE <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: "CTRL + STYLE® // VIP Drop Access Confirmed",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                background-color: #0d0d0d;
                color: #f2efe9;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                margin: 0;
                padding: 40px 20px;
              }
              .container {
                max-width: 560px;
                margin: 0 auto;
                background-color: #141414;
                border: 1px solid rgba(255, 255, 255, 0.12);
                padding: 40px;
              }
              .brand {
                font-size: 14px;
                font-weight: 900;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                color: #ffffff;
                margin-bottom: 30px;
              }
              .tag {
                display: inline-block;
                padding: 4px 10px;
                background-color: #221212;
                border: 1px solid #ef4444;
                color: #ef4444;
                font-size: 10px;
                font-family: monospace;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                margin-bottom: 20px;
              }
              h1 {
                font-size: 28px;
                font-weight: 900;
                letter-spacing: -0.04em;
                line-height: 1.1;
                margin: 0 0 20px 0;
                color: #ffffff;
                text-transform: uppercase;
              }
              p {
                font-size: 14px;
                line-height: 1.6;
                color: rgba(255, 255, 255, 0.7);
                margin: 0 0 20px 0;
              }
              .highlight {
                color: #ffffff;
                font-weight: 600;
              }
              .divider {
                height: 1px;
                background-color: rgba(255, 255, 255, 0.1);
                margin: 30px 0;
              }
              .footer {
                font-size: 11px;
                font-family: monospace;
                color: rgba(255, 255, 255, 0.4);
                line-height: 1.5;
              }
              .cta-button {
                display: inline-block;
                background-color: #ffffff;
                color: #000000;
                font-size: 11px;
                font-family: monospace;
                font-weight: 700;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                padding: 14px 28px;
                text-decoration: none;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="brand">CTRL + STYLE®</div>
              <div class="tag">● VIP ACCESS CONFIRMED</div>
              <h1>You Are On The Drop List.</h1>
              <p>Your email <span class="highlight">${toEmail}</span> has been added to our private archival &amp; capsule release register.</p>
              <p>When our next limited edition collection or secret drops occur, your private access code will arrive in this inbox <span class="highlight">24 hours ahead</span> of public availability.</p>
              
              <div style="margin: 25px 0;">
                <a href="https://github.com/gourabsen21s/ctrl-store" class="cta-button">EXPLORE THE CATALOGUE →</a>
              </div>

              <div class="divider"></div>
              <div class="footer">
                CTRL + STYLE ARCHIVE &amp; GOODS<br>
                Bengaluru, India<br>
                You received this because you signed up on our storefront.
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true, data };
  } catch (error: unknown) {
    console.error("Resend send email error:", error);
    const message = error instanceof Error ? error.message : "Failed to send email";
    return { success: false, error: message };
  }
}
