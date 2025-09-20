import nodemailer from "nodemailer";

const { UKRNET_USER, UKRNET_PASS } = process.env;

const transport = nodemailer.createTransport({
  host: "smtp.ukr.net",
  port: 465,
  secure: true,
  auth: { user: UKRNET_USER, pass: UKRNET_PASS },
});

export async function sendEmail({ to, subject, html }) {
  await transport.sendMail({
    from: `"Contacts API" <${UKRNET_USER}>`,
    to,
    subject,
    html,
  });
}
