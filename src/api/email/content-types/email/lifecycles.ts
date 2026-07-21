type EmailRecordPrimitive = string | number | boolean | null | undefined | Date;
type EmailRecordValue =
  | EmailRecordPrimitive
  | EmailRecordValue[]
  | { [key: string]: EmailRecordValue };

export interface EmailRecordData {
  id?: number;
  documentId?: string;
  nome?: string | null;
  email?: string | null;
  assunto?: string | null;
  mensagem?: string | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  locale?: string;
  [field: string]: EmailRecordValue;
}

interface LifecycleEvent<T> {
  result: T;
  params: {
    data?: Partial<T>;
    [key: string]: unknown;
  };
}

const DESTINATARIO = 'webdevcv.cv@gmail.com';
const CONTENT_TYPE_UID = 'api::email.email';
const EMAIL_SEND_TIMEOUT_MS = Number(process.env.EMAIL_SEND_TIMEOUT_MS ?? 20000);

export default {
  async afterCreate(event: LifecycleEvent<EmailRecordData>): Promise<void> {
    const { result } = event;
    const identificador = obterIdentificador(result);

    strapi.log.info(`[Email lifecycle] afterCreate iniciado para ${CONTENT_TYPE_UID}: ${identificador}`);
    strapi.log.info(
      `[Email lifecycle] Estado do registo ${identificador}: publishedAt=${formatarValor(result.publishedAt)}`
    );
    strapi.log.info(
      `[Email lifecycle] Campos recebidos no registo ${identificador}: ${Object.keys(result).join(', ')}`
    );

    if ('publishedAt' in result && !result.publishedAt) {
      strapi.log.info(
        `[Email lifecycle] Email nao enviado: registo ${identificador} ainda esta em rascunho.`
      );
      return;
    }

    strapi.log.info(
      `[Email lifecycle] Registo ${identificador} esta publicado ou sem Draft & Publish. A preparar envio.`
    );

    await executarCodigoDepoisDaCriacao(result);
  },
};

async function executarCodigoDepoisDaCriacao(dados: EmailRecordData): Promise<void> {
  const enviadoEm = new Date();
  const identificador = obterIdentificador(dados);

  try {
    strapi.log.info(`[Email lifecycle] Validando configuracao SMTP para registo ${identificador}.`);
    validarConfiguracaoEmail();

    const subject = 'Nova mensagem recebida pelo website';
    strapi.log.info(
      `[Email lifecycle] Configuracao SMTP carregada: host=${process.env.SMTP_HOST ?? 'smtp.gmail.com'}, port=${process.env.SMTP_PORT ?? '587'}, secure=${process.env.SMTP_SECURE ?? 'false'}, user=${process.env.SMTP_USERNAME ?? 'webdevcv.cv@gmail.com'}, passwordDefinida=${process.env.SMTP_PASSWORD ? 'sim' : 'nao'}`
    );

    strapi.log.info(`[Email lifecycle] Gerando HTML e texto simples para registo ${identificador}.`);
    const html = gerarHtmlNovaMensagem(dados, enviadoEm);
    const text = gerarTextoNovaMensagem(dados, enviadoEm);

    strapi.log.info(
      `[Email lifecycle] Conteudo gerado para registo ${identificador}: html=${html.length} caracteres, text=${text.length} caracteres.`
    );
    strapi.log.info(
      `[Email lifecycle] Chamando strapi.plugin('email').service('email').send() para ${DESTINATARIO}.`
    );

    const response = await enviarEmailComTimeout(
      {
        to: DESTINATARIO,
        subject,
        text,
        html,
      },
      EMAIL_SEND_TIMEOUT_MS
    );

    strapi.log.info(
      `[Email lifecycle] Resposta do provider para registo ${identificador}: ${formatarValor(response as EmailRecordValue)}`
    );
    strapi.log.info(
      `[Email lifecycle] Email de notificacao enviado com sucesso para ${DESTINATARIO}. Registo: ${identificador}`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    strapi.log.error(
      `[Email lifecycle] Erro ao enviar email de notificacao para ${DESTINATARIO}. Registo: ${identificador}. Erro: ${message}`
    );

    if (error instanceof Error && error.stack) {
      strapi.log.error(`[Email lifecycle] Stack do erro: ${error.stack}`);
    }
  }
}

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

async function enviarEmailComTimeout(
  payload: EmailPayload,
  timeoutMs: number
): Promise<EmailRecordValue> {
  let timeout: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      strapi.plugin('email').service('email').send(payload) as Promise<EmailRecordValue>,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          reject(
            new Error(
              `Timeout ao enviar email depois de ${timeoutMs}ms. Verifique SMTP_HOST, SMTP_PORT, SMTP_SECURE e se a rede permite ligacao SMTP.`
            )
          );
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

function validarConfiguracaoEmail(): void {
  if (!process.env.SMTP_PASSWORD) {
    throw new Error('Configuracao SMTP incompleta. Variavel em falta: SMTP_PASSWORD.');
  }

  if (process.env.SMTP_PASSWORD === 'your-gmail-app-password') {
    throw new Error(
      'Configuracao SMTP invalida. Substitua SMTP_PASSWORD por uma App Password real do Gmail.'
    );
  }
}

function gerarHtmlNovaMensagem(dados: EmailRecordData, enviadoEm: Date): string {
  const linhas = Object.entries(dados)
    .filter(([campo]) => !campo.endsWith('By'))
    .map(
      ([campo, valor]) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 700; color: #111827; vertical-align: top;">
            ${escapeHtml(formatarNomeCampo(campo))}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151; vertical-align: top; white-space: pre-wrap;">
            ${escapeHtml(formatarValor(valor))}
          </td>
        </tr>`
    )
    .join('');

  return `
<!doctype html>
<html lang="pt">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Nova mensagem recebida</title>
  </head>
  <body style="margin: 0; padding: 0; background: #f3f4f6; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width: 720px; margin: 0 auto; padding: 32px 16px;">
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: #111827; padding: 24px;">
          <h1 style="margin: 0; color: #ffffff; font-size: 22px; line-height: 1.3;">
            Nova mensagem recebida
          </h1>
        </div>

        <div style="padding: 24px;">
          <p style="margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.6;">
            Foi criado um novo registo na collection <strong>${escapeHtml(CONTENT_TYPE_UID)}</strong>.
          </p>

          <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.6;">
            <strong>Data e hora do envio:</strong> ${escapeHtml(formatarData(enviadoEm))}
          </p>

          <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; font-size: 14px;">
            <thead>
              <tr>
                <th align="left" style="padding: 12px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  Campo
                </th>
                <th align="left" style="padding: 12px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function gerarTextoNovaMensagem(dados: EmailRecordData, enviadoEm: Date): string {
  const linhas = Object.entries(dados)
    .filter(([campo]) => !campo.endsWith('By'))
    .map(([campo, valor]) => `${formatarNomeCampo(campo)}: ${formatarValor(valor)}`)
    .join('\n');

  return [
    'Nova mensagem recebida',
    '',
    `Foi criado um novo registo na collection ${CONTENT_TYPE_UID}.`,
    `Data e hora do envio: ${formatarData(enviadoEm)}`,
    '',
    'Dados do registo:',
    linhas,
  ].join('\n');
}

function obterIdentificador(dados: EmailRecordData): string {
  return dados.documentId ?? String(dados.id ?? 'sem-id');
}

function formatarNomeCampo(campo: string): string {
  return campo
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (letra) => letra.toUpperCase());
}

function formatarValor(valor: EmailRecordValue): string {
  if (valor === null || valor === undefined || valor === '') {
    return 'Nao informado';
  }

  if (valor instanceof Date) {
    return formatarData(valor);
  }

  if (Array.isArray(valor)) {
    return valor.length > 0
      ? valor.map((item) => formatarValor(item)).join(', ')
      : 'Nao informado';
  }

  if (typeof valor === 'object') {
    return JSON.stringify(valor, null, 2);
  }

  return String(valor);
}

function formatarData(data: Date): string {
  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Atlantic/Cape_Verde',
  }).format(data);
}

function escapeHtml(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
