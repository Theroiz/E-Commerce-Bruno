export interface Usuario {
  id: number;
  nomeCompleto: string;
  email: string;
  senha: string;
  perfil: 'cliente' | 'admin';
}

export interface Produto {
  id: number;
  sku: string;
  nomeProduto: string;
  categoria: string;
  preco: number;
  estoque: number;
  estoqueMinimo: number;
  descricao: string;
}

export interface ItemCarrinho {
  produtoId: number;
  quantidade: number;
}

export interface ItemPedidoRealizado {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
}

export interface Pedido {
  id: number;
  usuarioEmail: string;
  nomeCliente: string;
  dataHora: string;
  itens: ItemPedidoRealizado[];
  subtotal: number;
  desconto: number;
  valorTotal: number;
  formaPagamento: string;
}

export type AbaAtiva = 'loja' | 'carrinho' | 'estoque' | 'conta';
