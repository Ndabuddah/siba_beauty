const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY as string | undefined;
const ADMIN_EMAIL = "Sibabeauty27@gmail.com";
const SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send";

export interface ReceiptData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  address: {
    streetAddress: string;
    city: string;
    province: string;
    postalCode: string;
  };
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return `R${amount.toFixed(2)}`;
};

// Helper function to format payment method
const formatPaymentMethod = (method: string): string => {
  const methods: Record<string, string> = {
    card: "Credit/Debit Card",
    eft: "EFT/Bank Transfer",
    cash: "Cash on Delivery",
  };
  return methods[method] || method;
};

// Generate HTML receipt for customer
const generateCustomerReceiptHTML = (data: ReceiptData): string => {
  const itemsHTML = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - ${data.orderId}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin: 0;">Siba Beauty</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Order Confirmation</p>
        </div>
        
        <div style="background-color: #f0f0ff; padding: 15px; border-radius: 6px; margin-bottom: 25px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #666;">Order ID</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; font-family: monospace; color: #333;">${data.orderId}</p>
        </div>

        <p>Dear ${data.customerName},</p>
        <p>Thank you for your order! We've received your order and are preparing it for shipment.</p>

        <h2 style="color: #333; border-bottom: 2px solid #6366f1; padding-bottom: 10px; margin-top: 30px;">Delivery Address</h2>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>${data.customerName}</strong></p>
          <p style="margin: 5px 0;">${data.address.streetAddress}</p>
          <p style="margin: 5px 0;">${data.address.city}, ${data.address.province}</p>
          <p style="margin: 5px 0;">${data.address.postalCode}</p>
          <p style="margin: 5px 0;">Phone: ${data.customerPhone}</p>
          <p style="margin: 5px 0;">Email: ${data.customerEmail}</p>
        </div>

        <h2 style="color: #333; border-bottom: 2px solid #6366f1; padding-bottom: 10px; margin-top: 30px;">Order Items</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span>Subtotal:</span>
            <span>${formatCurrency(data.subtotal)}</span>
          </div>
          ${data.discount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin: 10px 0; color: #10b981;">
            <span>Discount:</span>
            <span>-${formatCurrency(data.discount)}</span>
          </div>
          ` : ""}
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span>Delivery Fee:</span>
            <span>${data.deliveryFee === 0 ? "FREE" : formatCurrency(data.deliveryFee)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 20px 0; padding-top: 15px; border-top: 2px solid #e5e7eb; font-size: 18px; font-weight: bold; color: #6366f1;">
            <span>Total:</span>
            <span>${formatCurrency(data.total)}</span>
          </div>
        </div>

        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 25px 0;">
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${formatPaymentMethod(data.paymentMethod)}</p>
        </div>

        ${data.paymentMethod === "eft" ? `
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0 0 10px 0;"><strong>Banking Details for EFT:</strong></p>
          <p style="margin: 5px 0;">Bank: Standard Bank</p>
          <p style="margin: 5px 0;">Account: 123456789</p>
          <p style="margin: 5px 0;"><strong>Reference: ${data.orderId}</strong></p>
        </div>
        ` : ""}

        <p style="margin-top: 30px;">We'll send you tracking information as soon as your order ships. Estimated delivery: <strong>3-5 business days</strong>.</p>

        <p style="margin-top: 20px;">If you have any questions, please contact us at ${ADMIN_EMAIL}.</p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">Thank you for choosing Siba Beauty!</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate HTML receipt for admin
const generateAdminReceiptHTML = (data: ReceiptData): string => {
  const itemsHTML = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order - ${data.orderId}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; margin: 0;">🔔 New Order Received</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Order Notification</p>
        </div>
        
        <div style="background-color: #fee2e2; padding: 15px; border-radius: 6px; margin-bottom: 25px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #666;">Order ID</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; font-family: monospace; color: #333;">${data.orderId}</p>
        </div>

        <h2 style="color: #333; border-bottom: 2px solid #dc2626; padding-bottom: 10px; margin-top: 20px;">Customer Information</h2>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Name:</strong> ${data.customerName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${data.customerEmail}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${data.customerPhone}</p>
        </div>

        <h2 style="color: #333; border-bottom: 2px solid #dc2626; padding-bottom: 10px; margin-top: 30px;">Delivery Address</h2>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;">${data.address.streetAddress}</p>
          <p style="margin: 5px 0;">${data.address.city}, ${data.address.province}</p>
          <p style="margin: 5px 0;">${data.address.postalCode}</p>
        </div>

        <h2 style="color: #333; border-bottom: 2px solid #dc2626; padding-bottom: 10px; margin-top: 30px;">Order Items</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span>Subtotal:</span>
            <span>${formatCurrency(data.subtotal)}</span>
          </div>
          ${data.discount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin: 10px 0; color: #10b981;">
            <span>Discount:</span>
            <span>-${formatCurrency(data.discount)}</span>
          </div>
          ` : ""}
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span>Delivery Fee:</span>
            <span>${data.deliveryFee === 0 ? "FREE" : formatCurrency(data.deliveryFee)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 20px 0; padding-top: 15px; border-top: 2px solid #e5e7eb; font-size: 18px; font-weight: bold; color: #dc2626;">
            <span>Total:</span>
            <span>${formatCurrency(data.total)}</span>
          </div>
        </div>

        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 25px 0;">
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${formatPaymentMethod(data.paymentMethod)}</p>
        </div>

        <div style="background-color: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold;">Action Required:</p>
          <p style="margin: 5px 0 0 0;">Please process this order and update the status in your admin dashboard.</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">This is an automated notification from Siba Beauty Order System</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send receipt emails to customer and admin using SendGrid
 * Note: For production, this should be moved to Firebase Cloud Functions for security
 */
export const sendReceiptEmails = async (data: ReceiptData): Promise<boolean> => {
  if (!SENDGRID_API_KEY) {
    console.error("SendGrid API key not configured. Please set VITE_SENDGRID_API_KEY");
    return false;
  }

  try {
    const customerMsg = {
      to: data.customerEmail,
      from: ADMIN_EMAIL, // This must be a verified sender in SendGrid
      subject: `Order Confirmation - ${data.orderId} | Siba Beauty`,
      html: generateCustomerReceiptHTML(data),
      text: `Order Confirmation ${data.orderId}\n\nThank you for your order, ${data.customerName}!\n\nOrder Total: ${formatCurrency(data.total)}\n\nPlease check the full details in the email.`,
    };

    const adminMsg = {
      to: ADMIN_EMAIL,
      from: ADMIN_EMAIL,
      subject: `🔔 New Order Received - ${data.orderId}`,
      html: generateAdminReceiptHTML(data),
      text: `New Order ${data.orderId}\n\nCustomer: ${data.customerName}\nEmail: ${data.customerEmail}\nPhone: ${data.customerPhone}\nTotal: ${formatCurrency(data.total)}\n\nPlease check the full details in the email.`,
    };

    // Send both emails in parallel using SendGrid REST API
    const customerResponse = await fetch(SENDGRID_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: data.customerEmail, name: data.customerName }],
            subject: `Order Confirmation - ${data.orderId} | Siba Beauty`,
          },
        ],
        from: { email: ADMIN_EMAIL, name: "Siba Beauty" },
        content: [
          {
            type: "text/html",
            value: generateCustomerReceiptHTML(data),
          },
        ],
      }),
    });

    const adminResponse = await fetch(SENDGRID_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: ADMIN_EMAIL, name: "Siba Beauty" }],
            subject: `🔔 New Order Received - ${data.orderId}`,
          },
        ],
        from: { email: ADMIN_EMAIL, name: "Siba Beauty" },
        content: [
          {
            type: "text/html",
            value: generateAdminReceiptHTML(data),
          },
        ],
      }),
    });

    if (!customerResponse.ok || !adminResponse.ok) {
      const customerError = await customerResponse.text();
      const adminError = await adminResponse.text();
      console.error("SendGrid API errors:", { customerError, adminError });
      return false;
    }

    return true;
  } catch (error: any) {
    console.error("Error sending emails via SendGrid:", error);
    if (error.response) {
      console.error("SendGrid error details:", error.response.body);
    }
    return false;
  }
};
