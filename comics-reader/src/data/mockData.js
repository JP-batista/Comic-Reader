// ─────────────────────────────────────────────
//  mockData.js
//  Estrutura preparada para integração real:
//  - coverImage será a URI da imagem extraída do arquivo
//  - stackCovers são os 2 próximos arquivos da pasta (para o efeito de pilha)
//  - currentPage / totalPages salvos via AsyncStorage
// ─────────────────────────────────────────────

// Status possíveis de leitura
export const READ_STATUS = {
  UNREAD:      'unread',      // "Não lido"
  IN_PROGRESS: 'in_progress', // "Página X de Y"
  COMPLETED:   'completed',   // "Lido"
};

// ── Biblioteca raiz ─────────────────────────────────────────────────────────
export const MOCK_ROOT = {
  name: 'Biblioteca',
  // Em produção: caminho real selecionado pelo usuário
  // path: '/storage/emulated/0/Comics'
  folders: [
    {
      id: 'f1',
      name: 'Antiga Coleção Oficial de Graphic Novels Marvel',
      comicCount: 107,
      // coverImages[0] = capa principal, [1] e [2] = pilha traseira
      // Em produção: primeiras imagens dos 3 primeiros arquivos da pasta
      coverImages: [
        { bg: '#1A0A0A', accent: '#3D1010', letter: 'M' },
        { bg: '#150808', accent: '#2D0C0C', letter: 'M' },
        { bg: '#100606', accent: '#220909', letter: 'M' },
      ],
      // thumbComicId: id do quadrinho escolhido como capa (null = primeiro)
      thumbComicId: null,
    },
    {
      id: 'f2',
      name: 'DC',
      comicCount: 9256,
      coverImages: [
        { bg: '#0A0F2A', accent: '#101840', letter: 'D' },
        { bg: '#080D22', accent: '#0C1535', letter: 'D' },
        { bg: '#06091A', accent: '#09102A', letter: 'D' },
      ],
      thumbComicId: null,
    },
    {
      id: 'f3',
      name: 'Homem de Ferro – Deluxe',
      comicCount: 67,
      coverImages: [
        { bg: '#2A0A00', accent: '#501200', letter: 'H' },
        { bg: '#220800', accent: '#400E00', letter: 'H' },
        { bg: '#1A0600', accent: '#300A00', letter: 'H' },
      ],
      thumbComicId: null,
    },
    {
      id: 'f4',
      name: 'Marvel',
      comicCount: 12684,
      coverImages: [
        { bg: '#2A0000', accent: '#500000', letter: 'M' },
        { bg: '#220000', accent: '#400000', letter: 'M' },
        { bg: '#1A0000', accent: '#300000', letter: 'M' },
      ],
      thumbComicId: null,
    },
    {
      id: 'f5',
      name: 'Os Cavaleiros do Zodíaco',
      comicCount: 180,
      coverImages: [
        { bg: '#1A1A2A', accent: '#2A2A40', letter: 'C' },
        { bg: '#151522', accent: '#222235', letter: 'C' },
        { bg: '#10101A', accent: '#1A1A28', letter: 'C' },
      ],
      thumbComicId: null,
    },
    {
      id: 'f6',
      name: 'Outros',
      comicCount: 8686,
      coverImages: [
        { bg: '#0A1A0A', accent: '#102A10', letter: 'O' },
        { bg: '#081508', accent: '#0C220C', letter: 'O' },
        { bg: '#061006', accent: '#091A09', letter: 'O' },
      ],
      thumbComicId: null,
    },
    {
      id: 'f7',
      name: 'Teste',
      comicCount: 325,
      coverImages: [
        { bg: '#1A0A1A', accent: '#2A102A', letter: 'T' },
        { bg: '#150815', accent: '#220C22', letter: 'T' },
        { bg: '#100610', accent: '#1A091A', letter: 'T' },
      ],
      thumbComicId: null,
    },
  ],
  comics: [],
};

// ── Pasta: Homem de Ferro – Deluxe ──────────────────────────────────────────
export const MOCK_IRONMAN = {
  name: 'Homem de Ferro – Deluxe',
  parentName: 'Biblioteca',
  parentId: 'f3',
  // Em produção: este será o fundo desfocado da tela
  // bgImage: require('../assets/bg_ironman.jpg')
  bgColor: '#1A0800',
  bgAccent: '#3D1200',
  comics: [
    {
      id: 'c1',
      title: '01 de 06',
      format: 'CBZ',
      totalPages: 24,
      currentPage: 24,
      status: READ_STATUS.COMPLETED,
      coverBg: '#1A0600', coverAccent: '#3D1200', letter: 'I',
    },
    {
      id: 'c2',
      title: '02 de 06',
      format: 'CBZ',
      totalPages: 24,
      currentPage: 12,
      status: READ_STATUS.IN_PROGRESS,
      coverBg: '#1A0800', coverAccent: '#401500', letter: 'I',
    },
    {
      id: 'c3',
      title: '03 de 06',
      format: 'CBZ',
      totalPages: 24,
      currentPage: 0,
      status: READ_STATUS.UNREAD,
      coverBg: '#150500', coverAccent: '#350F00', letter: 'I',
    },
    {
      id: 'c4',
      title: '04 de 06',
      format: 'CBZ',
      totalPages: 24,
      currentPage: 0,
      status: READ_STATUS.UNREAD,
      coverBg: '#180600', coverAccent: '#381100', letter: 'I',
    },
    {
      id: 'c5',
      title: '05 de 06',
      format: 'CBZ',
      totalPages: 24,
      currentPage: 0,
      status: READ_STATUS.UNREAD,
      coverBg: '#1C0700', coverAccent: '#3C1200', letter: 'I',
    },
    {
      id: 'c6',
      title: '06 de 06',
      format: 'CBZ',
      totalPages: 24,
      currentPage: 0,
      status: READ_STATUS.UNREAD,
      coverBg: '#200800', coverAccent: '#421400', letter: 'I',
    },
  ],
};

// ── Páginas mock do leitor ───────────────────────────────────────────────────
export const MOCK_PAGES = Array.from({ length: 24 }, (_, i) => ({
  id:     i,
  number: i + 1,
  bg:     ['#0D1117', '#111827', '#0D0D1F', '#1A0D0D', '#0D1A0D'][i % 5],
  accent: ['#1A2233', '#1F2D3D', '#1A1A33', '#2D1A1A', '#1A2D1A'][i % 5],
}));