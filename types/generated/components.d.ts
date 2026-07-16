import type { Schema, Struct } from '@strapi/strapi';

export interface LayoutFooter extends Struct.ComponentSchema {
  collectionName: 'components_layout_footers';
  info: {
    displayName: 'Footer';
  };
  attributes: {
    cargo: Schema.Attribute.String;
    mostrarMenu: Schema.Attribute.Boolean;
    mostrarRedesSociais: Schema.Attribute.Boolean;
    nome: Schema.Attribute.String;
    textoDireitos: Schema.Attribute.String;
  };
}

export interface SectionsCompetenciasTecnicas extends Struct.ComponentSchema {
  collectionName: 'components_sections_competencias_tecnicas';
  info: {
    displayName: 'Compet\u00EAncias T\u00E9cnicas';
  };
  attributes: {
    ativo: Schema.Attribute.Boolean;
    categorias: Schema.Attribute.Component<
      'shared.categoria-de-competencia',
      true
    >;
    descricao: Schema.Attribute.Text;
    etiqueta: Schema.Attribute.String;
    titulo: Schema.Attribute.Text;
  };
}

export interface SectionsContacto extends Struct.ComponentSchema {
  collectionName: 'components_sections_contactos';
  info: {
    displayName: 'Contacto';
  };
  attributes: {
    ativo: Schema.Attribute.Boolean;
    descricao: Schema.Attribute.Text;
    descricaoContactoDireto: Schema.Attribute.Text;
    etiqueta: Schema.Attribute.String;
    idAncora: Schema.Attribute.String;
    informacoes: Schema.Attribute.Component<
      'shared.informacao-de-contacto',
      true
    >;
    redesSocial: Schema.Attribute.Component<'shared.rede-social', true>;
    titulo: Schema.Attribute.Text;
    tituloContactoDireto: Schema.Attribute.String;
  };
}

export interface SectionsExperienciaProfissional
  extends Struct.ComponentSchema {
  collectionName: 'components_sections_experiencia_profissionals';
  info: {
    displayName: 'Experi\u00EAncia Profissional';
  };
  attributes: {
    ativo: Schema.Attribute.Boolean;
    descricao: Schema.Attribute.Text;
    etiqueta: Schema.Attribute.String;
    experiencias: Schema.Attribute.Component<'shared.experiencia', true>;
    titulo: Schema.Attribute.Text;
  };
}

export interface SectionsHeroPrincipal extends Struct.ComponentSchema {
  collectionName: 'components_sections_hero_principals';
  info: {
    displayName: 'Hero Principal';
    icon: 'apps';
  };
  attributes: {
    acoes: Schema.Attribute.Component<'shared.acoes', true>;
    cargo: Schema.Attribute.String;
    competencias: Schema.Attribute.Component<'shared.competencias', true>;
    curriculo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    descricao: Schema.Attribute.Text;
    disponivel: Schema.Attribute.Boolean;
    fotoPerfil: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    localizacao: Schema.Attribute.String;
    nome: Schema.Attribute.String;
    objetivo: Schema.Attribute.String;
    redesSociais: Schema.Attribute.Component<'shared.rede-social', true>;
    subtitulo: Schema.Attribute.String;
    textoDisponibilidade: Schema.Attribute.String;
    titulo: Schema.Attribute.Text;
  };
}

export interface SectionsProjetos extends Struct.ComponentSchema {
  collectionName: 'components_sections_projetos';
  info: {
    displayName: 'Projetos';
    icon: 'connector';
  };
  attributes: {
    ativo: Schema.Attribute.Boolean;
    descricao: Schema.Attribute.Text;
    etiqueta: Schema.Attribute.String;
    mostrarFiltros: Schema.Attribute.Boolean;
    quantidadeInicial: Schema.Attribute.Integer;
    titulo: Schema.Attribute.Text;
  };
}

export interface SectionsSeccaoDeCards extends Struct.ComponentSchema {
  collectionName: 'components_sections_seccao_de_cards';
  info: {
    displayName: 'Sec\u00E7\u00E3o de Cards';
  };
  attributes: {
    ativo: Schema.Attribute.Boolean;
    cards: Schema.Attribute.Component<'shared.card-informativo', true>;
    descricao: Schema.Attribute.Text;
    etiqueta: Schema.Attribute.String;
    idAncora: Schema.Attribute.String;
    titulo: Schema.Attribute.Text;
  };
}

export interface SectionsSobreMim extends Struct.ComponentSchema {
  collectionName: 'components_sections_sobre_mims';
  info: {
    displayName: 'Sobre Mim';
  };
  attributes: {
    ativo: Schema.Attribute.Boolean;
    conteudo: Schema.Attribute.RichText;
    destaque: Schema.Attribute.Component<'shared.destaque-profissional', true>;
    etiqueta: Schema.Attribute.String;
    introducao: Schema.Attribute.Text;
    titulo: Schema.Attribute.Text;
  };
}

export interface SharedAcoes extends Struct.ComponentSchema {
  collectionName: 'components_shared_acoes';
  info: {
    displayName: 'Acoes';
  };
  attributes: {
    ativo: Schema.Attribute.Boolean;
    icone: Schema.Attribute.String;
    novaAba: Schema.Attribute.Boolean;
    ordem: Schema.Attribute.Integer;
    texto: Schema.Attribute.String;
    tipoDestino: Schema.Attribute.Enumeration<['ancora', 'url', 'curriculo']>;
    url: Schema.Attribute.String;
    variante: Schema.Attribute.Enumeration<['primary', 'secondary', 'link']>;
  };
}

export interface SharedCardInformativo extends Struct.ComponentSchema {
  collectionName: 'components_shared_card_informativos';
  info: {
    displayName: 'Card Informativo';
  };
  attributes: {
    ativo: Schema.Attribute.Boolean;
    descricao: Schema.Attribute.Text;
    icone: Schema.Attribute.String;
    ordem: Schema.Attribute.Integer;
    titulo: Schema.Attribute.String;
  };
}

export interface SharedCategoriaDeCompetencia extends Struct.ComponentSchema {
  collectionName: 'components_shared_categoria_de_competencias';
  info: {
    displayName: 'Categoria de Compet\u00EAncia';
  };
  attributes: {
    ativo: Schema.Attribute.Boolean;
    icon: Schema.Attribute.String;
    ordem: Schema.Attribute.Integer;
    tecnologias: Schema.Attribute.Component<'shared.tecnologia', true>;
    titulo: Schema.Attribute.String;
  };
}

export interface SharedCompetencias extends Struct.ComponentSchema {
  collectionName: 'components_shared_competencias';
  info: {
    displayName: 'Competencias';
  };
  attributes: {
    descricao: Schema.Attribute.Text;
    icon: Schema.Attribute.String;
    ordem: Schema.Attribute.Integer;
    titulo: Schema.Attribute.String;
  };
}

export interface SharedDestaqueProfissional extends Struct.ComponentSchema {
  collectionName: 'components_shared_destaque_profissionals';
  info: {
    displayName: 'Destaque Profissional';
  };
  attributes: {
    ativo: Schema.Attribute.Boolean;
    descricao: Schema.Attribute.Text;
    icone: Schema.Attribute.String;
    titulo: Schema.Attribute.String;
  };
}

export interface SharedExperiencia extends Struct.ComponentSchema {
  collectionName: 'components_shared_experiencias';
  info: {
    displayName: 'Experi\u00EAncia';
  };
  attributes: {
    area: Schema.Attribute.String;
    ativo: Schema.Attribute.Boolean;
    atual: Schema.Attribute.Boolean;
    cargo: Schema.Attribute.String;
    dataFim: Schema.Attribute.Date;
    dataInicio: Schema.Attribute.Date;
    descricao: Schema.Attribute.Text;
    empresa: Schema.Attribute.String;
    localizacao: Schema.Attribute.String;
    ordem: Schema.Attribute.Integer;
    responsabilidades: Schema.Attribute.Component<
      'shared.responsabilidade',
      true
    >;
    tecnologias: Schema.Attribute.Component<'shared.tecnologia', true>;
    tipoExperiencia: Schema.Attribute.String;
  };
}

export interface SharedFuncionalidadeDoProjeto extends Struct.ComponentSchema {
  collectionName: 'components_shared_funcionalidade_do_projetos';
  info: {
    displayName: 'Funcionalidade do Projeto';
  };
  attributes: {
    ativo: Schema.Attribute.Boolean;
    ordem: Schema.Attribute.Integer;
    texto: Schema.Attribute.Text;
  };
}

export interface SharedInformacaoDeContacto extends Struct.ComponentSchema {
  collectionName: 'components_shared_informacao_de_contactos';
  info: {
    displayName: 'Informa\u00E7\u00E3o de Contacto';
  };
  attributes: {
    icone: Schema.Attribute.String;
    link: Schema.Attribute.String;
    ordem: Schema.Attribute.Integer;
    titulo: Schema.Attribute.String;
    valor: Schema.Attribute.String;
  };
}

export interface SharedLinkDeNavegacao extends Struct.ComponentSchema {
  collectionName: 'components_shared_link_de_navegacaos';
  info: {
    displayName: 'Link de Navega\u00E7\u00E3o';
  };
  attributes: {
    ativo: Schema.Attribute.Boolean;
    ordem: Schema.Attribute.Integer;
    texto: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface SharedRedeSocial extends Struct.ComponentSchema {
  collectionName: 'components_shared_rede_socials';
  info: {
    displayName: 'Rede Social';
  };
  attributes: {
    icon: Schema.Attribute.Enumeration<['Github', 'Linkedin', 'Mail']>;
    labelAcessibilidade: Schema.Attribute.String;
    nome: Schema.Attribute.String;
    novaAba: Schema.Attribute.Boolean;
    ordem: Schema.Attribute.Integer;
    url: Schema.Attribute.String;
  };
}

export interface SharedResponsabilidade extends Struct.ComponentSchema {
  collectionName: 'components_shared_responsabilidades';
  info: {
    displayName: 'Responsabilidade';
  };
  attributes: {
    ordem: Schema.Attribute.Integer;
    texto: Schema.Attribute.Text;
  };
}

export interface SharedTecnologia extends Struct.ComponentSchema {
  collectionName: 'components_shared_tecnologias';
  info: {
    displayName: 'Tecnologia';
  };
  attributes: {
    ativo: Schema.Attribute.Boolean;
    nome: Schema.Attribute.String;
    ordem: Schema.Attribute.Integer;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'layout.footer': LayoutFooter;
      'sections.competencias-tecnicas': SectionsCompetenciasTecnicas;
      'sections.contacto': SectionsContacto;
      'sections.experiencia-profissional': SectionsExperienciaProfissional;
      'sections.hero-principal': SectionsHeroPrincipal;
      'sections.projetos': SectionsProjetos;
      'sections.seccao-de-cards': SectionsSeccaoDeCards;
      'sections.sobre-mim': SectionsSobreMim;
      'shared.acoes': SharedAcoes;
      'shared.card-informativo': SharedCardInformativo;
      'shared.categoria-de-competencia': SharedCategoriaDeCompetencia;
      'shared.competencias': SharedCompetencias;
      'shared.destaque-profissional': SharedDestaqueProfissional;
      'shared.experiencia': SharedExperiencia;
      'shared.funcionalidade-do-projeto': SharedFuncionalidadeDoProjeto;
      'shared.informacao-de-contacto': SharedInformacaoDeContacto;
      'shared.link-de-navegacao': SharedLinkDeNavegacao;
      'shared.rede-social': SharedRedeSocial;
      'shared.responsabilidade': SharedResponsabilidade;
      'shared.tecnologia': SharedTecnologia;
    }
  }
}
