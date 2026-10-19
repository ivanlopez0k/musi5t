import { Resend } from "resend";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) return null;
  return new Resend(apiKey.trim());
}

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === "production" ? "https://musi5t.com" : "http://localhost:3000")
  );
}

function getEmailFrom(): string {
  return process.env.EMAIL_FROM || "musi5t <onboarding@resend.dev>";
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  devLink?: string;
  actionName: string;
}

async function dispatchEmail({ to, subject, html, devLink, actionName }: EmailPayload): Promise<{ success: boolean; id?: string }> {
  const resend = getResendClient();
  const emailFrom = getEmailFrom();

  // If no Resend API key is provided, log to console in development
  if (!resend) {
    console.log("\n=======================================================");
    console.log(`[musi5t EMAIL DISPATCHER - DEV FALLBACK]`);
    console.log(`Action:  ${actionName}`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    if (devLink) {
      console.log(`Link:    \x1b[36m${devLink}\x1b[0m`);
    }
    console.log("Tip: Add RESEND_API_KEY to .env.local to send live emails.");
    console.log("=======================================================\n");
    return { success: true, id: "dev-simulated-id" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[resend error]:", error);
      if (devLink) {
        console.log(`[dev fallback link due to email error]: ${devLink}`);
      }
      return { success: false };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[email delivery error]:", err);
    if (devLink) {
      console.log(`[dev fallback link due to email exception]: ${devLink}`);
    }
    return { success: false };
  }
}

export async function sendVerificationEmail({
  to,
  username,
  token,
}: {
  to: string;
  username: string;
  token: string;
}): Promise<{ success: boolean; verifyUrl: string }> {
  const appUrl = getAppUrl();
  const verifyUrl = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Verifica tu cuenta en musi5t</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F7F7F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0E0E0E;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F7F7F7; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #0E0E0E; color: #F7F7F7; border-radius: 8px; overflow: hidden; padding: 40px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.12);">
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; margin-bottom: 24px;">
                      <span style="display: inline-block; width: 14px; height: 14px; background-color: #B6E02E; border-radius: 2px; margin-right: 10px;"></span>
                      <span style="font-size: 20px; font-weight: 700; letter-spacing: -0.03em; color: #F7F7F7;">musi5t</span>
                    </div>
                    
                    <h1 style="font-size: 26px; font-weight: 400; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #FFFFFF;">
                      ¡Hola, @${username}!
                    </h1>
                    
                    <p style="font-size: 15px; line-height: 1.6; color: #A0A0A0; margin: 0 0 28px 0;">
                      Gracias por sumarte a <strong>musi5t</strong>, la red social centrada en álbumes y coleccionismo musical. Por favor confirma tu dirección de correo para verificar tu cuenta y participar plenamente en las discusiones y rankings.
                    </p>

                    <div style="margin-bottom: 32px;">
                      <a href="${verifyUrl}" style="display: inline-block; background-color: #B6E02E; color: #0E0E0E; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 4px; letter-spacing: -0.01em;">
                        Confirmar mi email →
                      </a>
                    </div>

                    <p style="font-size: 12px; line-height: 1.5; color: #666666; margin: 0 0 12px 0;">
                      Si el botón no funciona, podés copiar y pegar este enlace en tu navegador:
                    </p>
                    <p style="font-size: 12px; line-height: 1.4; color: #B6E02E; word-break: break-all; margin: 0 0 28px 0;">
                      ${verifyUrl}
                    </p>

                    <hr style="border: 0; border-top: 1px solid #222222; margin: 24px 0;" />

                    <p style="font-size: 11px; color: #555555; margin: 0;">
                      Este enlace expirará en 24 horas. Si no creaste una cuenta en musi5t, podés ignorar este mensaje con total tranquilidad.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const result = await dispatchEmail({
    to,
    subject: "Verifica tu cuenta en musi5t",
    html,
    devLink: verifyUrl,
    actionName: "Email Verification",
  });

  return { success: result.success, verifyUrl };
}

export async function sendPasswordResetEmail({
  to,
  username,
  token,
}: {
  to: string;
  username: string;
  token: string;
}): Promise<{ success: boolean; resetUrl: string }> {
  const appUrl = getAppUrl();
  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Restablece tu contraseña en musi5t</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F7F7F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0E0E0E;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F7F7F7; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #0E0E0E; color: #F7F7F7; border-radius: 8px; overflow: hidden; padding: 40px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.12);">
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; margin-bottom: 24px;">
                      <span style="display: inline-block; width: 14px; height: 14px; background-color: #FF5A3C; border-radius: 2px; margin-right: 10px;"></span>
                      <span style="font-size: 20px; font-weight: 700; letter-spacing: -0.03em; color: #F7F7F7;">musi5t</span>
                    </div>
                    
                    <h1 style="font-size: 26px; font-weight: 400; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #FFFFFF;">
                      Recuperación de contraseña
                    </h1>
                    
                    <p style="font-size: 15px; line-height: 1.6; color: #A0A0A0; margin: 0 0 28px 0;">
                      Recibimos una solicitud para restablecer la contraseña de tu cuenta <strong>@${username}</strong> en musi5t. Si fuiste vos, hacé clic en el botón a continuación para elegir una nueva clave.
                    </p>

                    <div style="margin-bottom: 32px;">
                      <a href="${resetUrl}" style="display: inline-block; background-color: #FF5A3C; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 4px; letter-spacing: -0.01em;">
                        Elegir nueva contraseña →
                      </a>
                    </div>

                    <p style="font-size: 12px; line-height: 1.5; color: #666666; margin: 0 0 12px 0;">
                      Si el botón no funciona, copia y pega este enlace en tu navegador:
                    </p>
                    <p style="font-size: 12px; line-height: 1.4; color: #FF8E72; word-break: break-all; margin: 0 0 28px 0;">
                      ${resetUrl}
                    </p>

                    <hr style="border: 0; border-top: 1px solid #222222; margin: 24px 0;" />

                    <p style="font-size: 11px; color: #555555; margin: 0;">
                      Por seguridad, este enlace expirará en 1 hora y solo puede ser utilizado una sola vez. Si no solicitaste este cambio, podés ignorar este correo; tu contraseña actual continuará siendo segura.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const result = await dispatchEmail({
    to,
    subject: "Restablece tu contraseña en musi5t",
    html,
    devLink: resetUrl,
    actionName: "Password Reset",
  });

  return { success: result.success, resetUrl };
}
