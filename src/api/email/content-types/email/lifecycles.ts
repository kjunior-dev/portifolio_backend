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

export default {
  async afterCreate(event: LifecycleEvent<EmailRecordData>): Promise<void> {
    const { result } = event;
    const identificador = obterIdentificador(result);

    strapi.log.info(`Novo registo criado em ${CONTENT_TYPE_UID}: ${identificador}`);

    if ('publishedAt' in result && !result.publishedAt) {
      strapi.log.info(
        `Email nao enviado: registo ${identificador} ainda esta em rascunho.`
      );
      return;
    }

    await executarCodigoDepoisDaCriacao(result);
  },
};

async function executarCodigoDepoisDaCriacao(dados: EmailRecordData): Promise<void> {
  const enviadoEm = new Date();
  const identificador = obterIdentificador(dados);

  try {
    const subject = 'Nova mensagem recebida pelo website';
    const html = gerarHtmlNovaMensagem(dados, enviadoEm);
    const text = gerarTextoNovaMensagem(dados, enviadoEm);

    await strapi.plugin('email').service('email').send({
      to: DESTINATARIO,
      subject,
      text,
      html,
    });

    strapi.log.info(
      `Email de notificacao enviado com sucesso para ${DESTINATARIO}. Registo: ${identificador}`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    strapi.log.error(
      `Erro ao enviar email de notificacao para ${DESTINATARIO}. Registo: ${identificador}. Erro: ${message}`
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
