import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER || 'ethereal_user',
    pass: process.env.SMTP_PASS || 'ethereal_pass'
  }
});

export const sendInvoiceEmail = async (toEmail: string, invoiceNo: string, amount: number) => {
  try {
    await transporter.sendMail({
      from: '"VisionCare Billing" <billing@visioncare.com>',
      to: toEmail,
      subject: `Invoice Generated: ${invoiceNo}`,
      html: `
        <h2>Thank you for your purchase!</h2>
        <p>Your official VisionCare invoice <strong>${invoiceNo}</strong> has been successfully generated.</p>
        <p>Total Paid: <strong>₹ ${amount.toLocaleString()}</strong></p>
        <p>We will notify you once your order is ready for pickup/delivery.</p>
      `
    });
    console.log(`Invoice email sent to ${toEmail}`);
  } catch (error) {
    console.error('Failed to send invoice email:', error);
  }
};
