import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, text, html) {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'VibeFit <onboarding@resend.dev>',
            to: Array.isArray(to) ? to : [to],
            subject,
            text,
            html,
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, messageId: data.id };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
}

export { sendEmail };
