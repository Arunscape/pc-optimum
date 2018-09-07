import nodemailer = require('nodemailer');
import { MailOptions } from "nodemailer/lib/smtp-pool";


export const sendEmail = async (pdfPath: string): Promise<string> => {

    // nodemailer constants
    const transporter = nodemailer.createTransport({
        host: process.env.E_HOST,
        port: 465,
        secure: true,
        auth: {
            user: process.env.E_USERNAME,
            pass: process.env.E_PASSWORD
        }
    });


    const mailOptions: MailOptions = {
        from: process.env.E_FROM,
        to: process.env.E_TO,
        subject: process.env.E_Subject,
        text: process.env.E_Subject,
        attachments: [{ path: pdfPath }]
    }


    // send email
    console.info('sending mail using');
    try {
        const mail = await transporter.sendMail(mailOptions);
        console.info('Message sent: %s to %s', mail.messageId, process.env.E_TO);
        return mail.messageId;
    }
    catch (err) { console.log(err) }

}