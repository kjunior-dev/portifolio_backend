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

const CAMPOS_VISIVEIS_DO_EMAIL = [
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'assunto', label: 'Assunto' },
] as const;

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
    strapi.log.info(`[Email lifecycle] Validando configuracao SendGrid para registo ${identificador}.`);
    validarConfiguracaoEmail();

    const subject = 'Nova mensagem recebida pelo website';
    strapi.log.info(
      `[Email lifecycle] Configuracao SendGrid carregada: apiKeyDefinida=${process.env.SENDGRID_API_KEY ? 'sim' : 'nao'}, from=${process.env.SENDGRID_DEFAULT_FROM ?? 'webdevcv.cv@gmail.com'}`
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
              `Timeout ao enviar email depois de ${timeoutMs}ms. Verifique SENDGRID_API_KEY e se a rede permite ligacoes HTTPS para o provider de email.`
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
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('Configuracao SendGrid incompleta. Variavel em falta: SENDGRID_API_KEY.');
  }

  if (process.env.SENDGRID_API_KEY === 'your-sendgrid-api-key') {
    throw new Error(
      'Configuracao SendGrid invalida. Substitua SENDGRID_API_KEY por uma API key real do SendGrid.'
    );
  }
}

function gerarHtmlNovaMensagem(dados: EmailRecordData, enviadoEm: Date): string {
  const detalhes = CAMPOS_VISIVEIS_DO_EMAIL
    .map(
      ({ key, label }) => `
        <div style="padding: 14px 0; border-bottom: 1px solid #edf0f3;">
          <div style="margin-bottom: 5px; color: #6b7280; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;">
            ${escapeHtml(label)}
          </div>
          <div style="color: #111827; font-size: 16px; line-height: 1.55;">
            ${formatarCampoHtml(key, dados[key])}
          </div>
        </div>`
    )
    .join('');
  const mensagem = escapeHtml(formatarValor(dados.mensagem));

  return `
<!doctype html>
<html lang="pt">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Nova mensagem recebida</title>
  </head>
  <body style="margin: 0; padding: 0; background: #f3f4f6; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width: 680px; margin: 0 auto; padding: 28px 16px;">
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
        <div style="padding: 28px 28px 22px; background: #0f172a;">
          <div style="margin-bottom: 10px; color: #cbd5e1; font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;">
            Portfolio
          </div>
          <h1 style="margin: 0; color: #ffffff; font-size: 26px; line-height: 1.25;">
            Nova mensagem recebida
          </h1>
        </div>

        <div style="padding: 28px;">
          <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.65;">
            Recebeu uma nova mensagem atraves do formulario de contacto.
          </p>

          <div style="margin-bottom: 26px; border-top: 1px solid #edf0f3;">
            ${detalhes}
          </div>

          <div style="margin-bottom: 24px;">
            <div style="margin-bottom: 8px; color: #6b7280; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;">
              Mensagem
            </div>
            <div style="padding: 18px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; color: #111827; font-size: 16px; line-height: 1.7; white-space: pre-wrap;">
              ${mensagem}
            </div>
          </div>

          <div style="padding-top: 18px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; line-height: 1.5;">
            Enviado em ${escapeHtml(formatarData(enviadoEm))}
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function gerarTextoNovaMensagem(dados: EmailRecordData, enviadoEm: Date): string {
  const linhas = CAMPOS_VISIVEIS_DO_EMAIL
    .map(({ key, label }) => `${label}: ${formatarValor(dados[key])}`)
    .join('\n');

  return [
    'Nova mensagem recebida',
    '',
    'Recebeu uma nova mensagem atraves do formulario de contacto.',
    '',
    linhas,
    `Mensagem: ${formatarValor(dados.mensagem)}`,
    '',
    `Enviado em: ${formatarData(enviadoEm)}`,
  ].join('\n');
}

function formatarCampoHtml(campo: string, valor: EmailRecordValue): string {
  const valorFormatado = escapeHtml(formatarValor(valor));

  if (campo === 'email' && valor && typeof valor === 'string') {
    return `<a href="mailto:${escapeHtml(valor)}" style="color: #2563eb; text-decoration: none;">${valorFormatado}</a>`;
  }

  return valorFormatado;
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
