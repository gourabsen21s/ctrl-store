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

export async function sendOrderConfirmationEmail(order: any) {
  if (!resend) {
    console.warn("Resend is not configured. Skipping email dispatch.");
    return { success: false, reason: "Missing API Key" };
  }

  try {
    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="font-weight: 600;">${item.productTitle}</div>
          <div style="font-size: 11px; opacity: 0.6; text-transform: uppercase;">${item.color} / ${item.size} / Qty: ${item.qty}</div>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); text-align: right;">
          ₹${item.price * item.qty}
        </td>
      </tr>
    `).join('');

    const data = await resend.emails.send({
      from: `CTRL + STYLE <${FROM_EMAIL}>`,
      to: [order.customer.email],
      subject: `CTRL + STYLE® // Order Confirmed #[id:${order.orderId}]`,
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
                background-color: #122212;
                border: 1px solid #10b981;
                color: #10b981;
                font-size: 10px;
                font-family: monospace;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                margin-bottom: 20px;
              }
              h1 {
                font-size: 24px;
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
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="brand">CTRL + STYLE®</div>
              <div class="tag">● ORDER CONFIRMED</div>
              <h1>Thank you, ${order.customer.name}.</h1>
              <p>We've received your order and are preparing it for dispatch.</p>
              
              <div class="divider"></div>
              
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6; margin-bottom: 10px;">Order #[id:${order.orderId}]</div>
              
              <table>
                ${itemsHtml}
                <tr>
                  <td style="padding: 20px 0 10px 0; font-size: 12px; text-transform: uppercase; opacity: 0.6;">Subtotal</td>
                  <td style="padding: 20px 0 10px 0; text-align: right;">₹${order.pricing.subtotal}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 12px; text-transform: uppercase; opacity: 0.6;">Shipping</td>
                  <td style="padding: 10px 0; text-align: right;">${order.pricing.shippingFee === 0 ? 'FREE' : '₹' + order.pricing.shippingFee}</td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; font-weight: 900; font-size: 16px;">TOTAL</td>
                  <td style="padding: 15px 0; font-weight: 900; font-size: 16px; text-align: right;">₹${order.pricing.total}</td>
                </tr>
              </table>

              <div class="divider"></div>

              <div style="font-size: 12px;">
                <strong style="color: #ffffff; text-transform: uppercase;">Shipping To:</strong><br>
                <div style="opacity: 0.7; margin-top: 5px; line-height: 1.5;">
                  ${order.customer.name}<br>
                  ${order.shippingAddress.street}<br>
                  ${order.shippingAddress.landmark ? order.shippingAddress.landmark + '<br>' : ''}
                  ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
                  ${order.shippingAddress.country}
                </div>
              </div>

              <div class="divider"></div>
              <div class="footer">
                CTRL + STYLE ARCHIVE &amp; GOODS<br>
                Bengaluru, India<br>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true, data };
  } catch (error: unknown) {
    console.error("Resend send order confirmation error:", error);
    const message = error instanceof Error ? error.message : "Failed to send order email";
    return { success: false, error: message };
  }
}

export async function sendOrderDispatchedEmail(order: any) {
  if (!resend) {
    console.warn("Resend is not configured. Skipping email dispatch.");
    return { success: false, reason: "Missing API Key" };
  }

  try {
    const data = await resend.emails.send({
      from: `CTRL + STYLE <${FROM_EMAIL}>`,
      to: [order.customer.email],
      subject: `CTRL + STYLE® // Order Dispatched #[id:${order.orderId}]`,
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
                background-color: #121222;
                border: 1px solid #3b82f6;
                color: #3b82f6;
                font-size: 10px;
                font-family: monospace;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                margin-bottom: 20px;
              }
              h1 {
                font-size: 24px;
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
              .divider {
                height: 1px;
                background-color: rgba(255, 255, 255, 0.1);
                margin: 30px 0;
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
              .footer {
                font-size: 11px;
                font-family: monospace;
                color: rgba(255, 255, 255, 0.4);
                line-height: 1.5;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="brand">CTRL + STYLE®</div>
              <div class="tag">● DISPATCHED</div>
              <h1>On Its Way, ${order.customer.name}.</h1>
              <p>Your order <strong>#${order.orderId}</strong> has been handed over to our delivery partners and is currently in transit.</p>
              
              <div class="divider"></div>
              
              <div style="font-size: 12px; margin-bottom: 20px;">
                <strong style="color: #ffffff; text-transform: uppercase;">Tracking Details:</strong><br>
                <div style="opacity: 0.7; margin-top: 5px; line-height: 1.5;">
                  Courier: ${order.fulfillment.courierName || 'Standard Delivery'}<br>
                  Tracking ID: ${order.fulfillment.trackingNumber || 'N/A'}<br>
                </div>
              </div>

              ${order.fulfillment.trackingUrl ? `
              <div style="margin: 25px 0;">
                <a href="${order.fulfillment.trackingUrl}" class="cta-button">TRACK PACKAGE →</a>
              </div>
              ` : ''}

              <div class="divider"></div>

              <div style="font-size: 12px;">
                <strong style="color: #ffffff; text-transform: uppercase;">Shipping To:</strong><br>
                <div style="opacity: 0.7; margin-top: 5px; line-height: 1.5;">
                  ${order.shippingAddress.street}<br>
                  ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
                </div>
              </div>

              <div class="divider"></div>
              <div class="footer">
                CTRL + STYLE ARCHIVE &amp; GOODS<br>
                Bengaluru, India<br>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true, data };
  } catch (error: unknown) {
    console.error("Resend send order dispatched error:", error);
    const message = error instanceof Error ? error.message : "Failed to send dispatch email";
    return { success: false, error: message };
  }
}

export async function sendReferralRewardEmail(
  toEmail: string,
  referrerName: string,
  friendName: string,
  rewardCoins: number
) {
  if (!resend) {
    console.warn("Resend is not configured. Skipping email dispatch.");
    return { success: false, reason: "Missing API Key" };
  }

  try {
    const data = await resend.emails.send({
      from: `CTRL + STYLE <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: `CTRL + STYLE® // You've Earned ${rewardCoins} CTRL+ Coins!`,
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
                background-color: #1a2e1a;
                border: 1px solid #10b981;
                color: #10b981;
                font-size: 10px;
                font-family: monospace;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                margin-bottom: 20px;
              }
              h1 {
                font-size: 26px;
                font-weight: 900;
                letter-spacing: -0.02em;
                margin: 0 0 15px 0;
                text-transform: uppercase;
                line-height: 1.1;
              }
              p {
                font-size: 14px;
                line-height: 1.6;
                color: #a3a3a3;
                margin: 0 0 20px 0;
              }
              .divider {
                height: 1px;
                background-color: rgba(255, 255, 255, 0.1);
                margin: 25px 0;
              }
              .coin-box {
                background: rgba(245, 158, 11, 0.1);
                border: 1px solid rgba(245, 158, 11, 0.3);
                padding: 20px;
                text-align: center;
                margin: 20px 0;
              }
              .coin-val {
                font-size: 36px;
                font-weight: 900;
                color: #f59e0b;
                font-family: monospace;
              }
              .cta-button {
                display: inline-block;
                background-color: #ffffff;
                color: #000000;
                text-decoration: none;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                padding: 14px 28px;
                margin-top: 10px;
              }
              .footer {
                font-size: 11px;
                font-family: monospace;
                color: #555555;
                margin-top: 30px;
                line-height: 1.5;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="brand">CTRL + STYLE®</div>
              <div class="tag">● REFERRAL REWARD CREDITED</div>
              <h1>Coins Added to Your Wallet, ${referrerName}.</h1>
              <p>Your friend <strong>${friendName}</strong> just joined and completed an order using your invitation link!</p>
              
              <div class="coin-box">
                <div class="coin-val">+${rewardCoins} COINS</div>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #f59e0b; font-family: monospace;">
                  1 COIN = ₹1 OFF YOUR NEXT ORDER
                </p>
              </div>

              <div style="margin: 25px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account" class="cta-button">VIEW WALLET &amp; SHOP →</a>
              </div>

              <div class="divider"></div>
              <div class="footer">
                CTRL + STYLE ARCHIVE &amp; GOODS<br>
                Bengaluru, India<br>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true, data };
  } catch (error: unknown) {
    console.error("Resend send referral reward error:", error);
    const message = error instanceof Error ? error.message : "Failed to send referral reward email";
    return { success: false, error: message };
  }
}
