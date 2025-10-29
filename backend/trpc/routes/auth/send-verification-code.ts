import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db } from '@/backend/db';
import { verificationCodes, users } from '@/backend/db/schema';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';

const RESEND_API_KEY = 're_Hms97Gxb_Bq6YbsvhJC1DdfpETDbfRUti';

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendVerificationCodeProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      name: z.string(),
      password: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('📧 [VERIFICATION] Iniciando envio de código de verificação');
    console.log('📧 [VERIFICATION] Email:', input.email);

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('Este email já está registado');
    }

    const code = generateVerificationCode();
    const id = `ver-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await db.insert(verificationCodes).values({
      id,
      email: input.email,
      code,
      name: input.name,
      password: input.password,
      expiresAt,
      isUsed: false,
    });

    console.log('🔑 [VERIFICATION] Código gerado:', code);
    console.log('⏰ [VERIFICATION] Expira em:', expiresAt);

    try {
      const resend = new Resend(RESEND_API_KEY);
      
      await resend.emails.send({
        from: 'Lyven <noreply@lyven.pt>',
        to: input.email,
        subject: 'Código de Verificação - Lyven',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366F1; margin: 0;">Lyven</h1>
            </div>
            
            <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; text-align: center;">
              <h2 style="color: #333; margin-top: 0;">Código de Verificação</h2>
              <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
                Olá ${input.name}, bem-vindo(a) ao Lyven! Use o código abaixo para verificar o seu email:
              </p>
              
              <div style="background-color: #fff; border: 2px solid #6366F1; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #6366F1; letter-spacing: 5px;">
                  ${code}
                </span>
              </div>
              
              <p style="color: #999; font-size: 14px; margin-top: 20px;">
                Este código é válido por 15 minutos.
              </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
              <p>Se não solicitou este código, pode ignorar este email.</p>
              <p style="margin-top: 20px;">© 2025 Lyven. Todos os direitos reservados.</p>
            </div>
          </div>
        `,
      });
      
      console.log('✅ [VERIFICATION] Email enviado com sucesso');
    } catch (error) {
      console.error('❌ [VERIFICATION] Erro ao enviar email:', error);
      throw new Error('Erro ao enviar código de verificação. Por favor, tente novamente.');
    }

    return {
      success: true,
      message: 'Código de verificação enviado para o seu email',
    };
  });
