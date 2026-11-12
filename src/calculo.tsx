import type { Produto, ItemCarrinho, Usuario } from './tiposEcommerce';

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function calcularSubtotalCarrinho(
  itensCarrinho: ItemCarrinho[],
  listaProdutos: Produto[]
): number {
  return itensCarrinho.reduce((acumulador, item) => {
    const produtoEncontrado = listaProdutos.find((p) => p.id === item.produtoId);
    if (!produtoEncontrado) return acumulador;
    return acumulador + produtoEncontrado.preco * item.quantidade;
  }, 0);
}

export function calcularDescontoCupom(subtotal: number, codigoCupom: string): number {
  const cupomLimpo = codigoCupom.trim().toUpperCase();
  if (cupomLimpo === 'FATEC10') {
    return subtotal * 0.1;
  }
  if (cupomLimpo === 'BEMVINDO5') {
    return subtotal * 0.05;
  }
  return 0;
}

export function calcularTotalFinal(subtotal: number, desconto: number): number {
  return Math.max(0, subtotal - desconto);
}

export function verificarStatusEstoque(produto: Produto): {
  rotulo: string;
  classeStatus: 'statusOk' | 'statusBaixo' | 'statusEsgotado';
} {
  if (produto.estoque <= 0) {
    return { rotulo: 'Esgotado (0 un.)', classeStatus: 'statusEsgotado' };
  }
  if (produto.estoque <= produto.estoqueMinimo) {
    return {
      rotulo: `Estoque baixo (${produto.estoque} un.)`,
      classeStatus: 'statusBaixo',
    };
  }
  return {
    rotulo: `Em estoque (${produto.estoque} un.)`,
    classeStatus: 'statusOk',
  };
}

export const produtosIniciais: Produto[] = [
  {
    id: 1,
    sku: 'PER-G203',
    nomeProduto: 'Mouse Gamer Logitech G203 LIGHTSYNC',
    categoria: 'Periféricos',
    preco: 149.9,
    estoque: 12,
    estoqueMinimo: 3,
    descricao: 'Sensor óptico de 8.000 DPI, iluminação RGB e 6 botões programáveis.',
  },
  {
    id: 2,
    sku: 'AUD-H2002D',
    nomeProduto: 'Headset Gamer Havit HV-H2002d',
    categoria: 'Áudio',
    preco: 189.9,
    estoque: 8,
    estoqueMinimo: 3,
    descricao: 'Drivers de 53mm, estrutura em metal resistente e microfone destacável.',
  },
  {
    id: 3,
    sku: 'ARM-NVME1T',
    nomeProduto: 'SSD Kingston NV2 1TB M.2 NVMe PCIe 4.0',
    categoria: 'Armazenamento',
    preco: 429.0,
    estoque: 5,
    estoqueMinimo: 2,
    descricao: 'Leitura de até 3.500 MB/s e gravação de 2.100 MB/s no formato M.2 2280.',
  },
  {
    id: 4,
    sku: 'REF-COOLER5',
    nomeProduto: 'Cooler Fan Reposição Notebook Gamer',
    categoria: 'Refrigeração',
    preco: 119.5,
    estoque: 2,
    estoqueMinimo: 3,
    descricao: 'Ventoinha de alta rotação DC 5V para dissipação térmica de CPU/GPU.',
  },
  {
    id: 5,
    sku: 'MEM-DDR416',
    nomeProduto: 'Memória RAM DDR4 16GB 3200MHz',
    categoria: 'Hardware',
    preco: 279.9,
    estoque: 7,
    estoqueMinimo: 2,
    descricao: 'Módulo de alta performance com baixa latência para multitarefas e jogos.',
  },
  {
    id: 6,
    sku: 'PER-TECMK',
    nomeProduto: 'Teclado Mecânico Compacto Switch Tactile',
    categoria: 'Periféricos',
    preco: 259.0,
    estoque: 0,
    estoqueMinimo: 2,
    descricao: 'Layout ABNT2 compacto 75%, anti-ghosting completo e cabo USB-C removível.',
  },
];

export const usuariosIniciais: Usuario[] = [];