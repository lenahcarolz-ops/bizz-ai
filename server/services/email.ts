import nodemailer from 'nodemailer';
import { AiStack, AiRecommendation } from '@shared/schema';

const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@bizzai.com',
    pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD || 'default_password',
  },
});

export async function sendStackEmail(
  userEmail: string,
  userName: string,
  stack: AiStack,
  recommendations: AiRecommendation[]
): Promise<void> {
  try {
    const recommendationsHtml = recommendations
      .map(rec => `
        <div style="border: 1px solid #E8E3D3; border-radius: 12px; padding: 20px; margin-bottom: 16px; background-color: #FEFDFB;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
            <h3 style="color: #3D2C00; margin: 0; font-size: 18px;">${rec.toolName}</h3>
            <span style="background-color: ${rec.automationLevel === 'Alto' ? '#10B981' : rec.automationLevel === 'Médio' ? '#F59E0B' : '#6B7280'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">
              ${rec.automationLevel}
            </span>
          </div>
          <p style="color: #B8860B; margin: 0 0 8px 0; font-weight: 500;">${rec.category}</p>
          <p style="color: #5C4300; margin: 0 0 12px 0;">${rec.description}</p>
          <div style="margin-bottom: 12px;">
            ${rec.features?.map(feature => `
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="color: #10B981; margin-right: 8px;">✓</span>
                <span style="color: #7A5900; font-size: 14px;">${feature}</span>
              </div>
            `).join('')}
          </div>
          ${rec.link ? `
            <a href="${rec.link}" style="background-color: #B8860B; color: white; padding: 8px 16px; text-decoration: none; border-radius: 8px; font-weight: 500;">
              Ver Ferramenta
            </a>
          ` : ''}
        </div>
      `)
      .join('');

    const implementationTipsHtml = stack.implementationTips
      ? stack.implementationTips
          .map(tip => `
            <li style="color: #5C4300; margin-bottom: 8px;">${tip}</li>
          `)
          .join('')
      : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Sua Stack de IA Personalizada - Bizz AI</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #3D2C00; }
          .container { max-width: 600px; margin: 0 auto; background-color: #FEFDFB; }
          .header { background: linear-gradient(135deg, #FEFDFB 0%, #F8F6F1 50%, #F0ECE3 100%); padding: 32px; text-align: center; }
          .content { padding: 24px; }
          .footer { background-color: #F0ECE3; padding: 24px; text-align: center; color: #7A5900; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #3D2C00; margin-bottom: 8px; font-size: 28px;">🧠 Bizz AI</h1>
            <h2 style="color: #B8860B; margin: 0; font-size: 20px;">${stack.title}</h2>
          </div>
          
          <div class="content">
            <p style="color: #3D2C00; font-size: 16px;">Olá ${userName}!</p>
            
            <p style="color: #5C4300; font-size: 16px;">${stack.description}</p>
            
            <h3 style="color: #3D2C00; border-bottom: 2px solid #D4C4A8; padding-bottom: 8px;">📊 Análise do Seu Negócio</h3>
            <p style="color: #5C4300;">${stack.overallAnalysis}</p>
            
            <h3 style="color: #3D2C00; border-bottom: 2px solid #D4C4A8; padding-bottom: 8px;">🚀 Suas Ferramentas Recomendadas</h3>
            ${recommendationsHtml}
            
            ${implementationTipsHtml ? `
              <h3 style="color: #3D2C00; border-bottom: 2px solid #D4C4A8; padding-bottom: 8px;">💡 Dicas de Implementação</h3>
              <ul style="color: #5C4300; padding-left: 20px;">
                ${implementationTipsHtml}
              </ul>
            ` : ''}
            
            ${stack.estimatedSavings ? `
              <div style="background-color: #F8F6F1; border-left: 4px solid #B8860B; padding: 16px; margin: 24px 0;">
                <h4 style="color: #3D2C00; margin: 0 0 8px 0;">💰 Economia Estimada</h4>
                <p style="color: #5C4300; margin: 0;">${stack.estimatedSavings}</p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #7A5900; margin-bottom: 16px;">Quer implementar sua Stack com nossa ajuda?</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/checkout" 
                 style="background: linear-gradient(135deg, #B8860B, #996F00); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Agendar Estratégia - R$ 197
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>Esta Stack foi gerada especialmente para você pela Bizz AI</p>
            <p>© 2024 Bizz AI. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Bizz AI" <${process.env.EMAIL_USER || 'noreply@bizzai.com'}>`,
      to: userEmail,
      subject: `🚀 ${stack.title} - Sua Stack de IA Personalizada`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email: ' + (error as Error).message);
  }
}
