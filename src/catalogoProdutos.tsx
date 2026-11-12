import { useState } from 'react';
import type { Produto, ItemCarrinho } from './tiposEcommerce';
import { formatarMoeda, verificarStatusEstoque } from './calculo';

interface PropriedadesCatalogo {
  produtos: Produto[];
  carrinho: ItemCarrinho[];
  aoAdicionarAoCarrinho: (produtoId: number) => void;
  aoIrParaEstoque: () => void;
}

export function CatalogoProdutos({
  produtos,
  carrinho,
  aoAdicionarAoCarrinho,
  aoIrParaEstoque,
}: PropriedadesCatalogo) {
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todas');

  const categoriasDisponiveis = [
    'Todas',
    ...Array.from(new Set(produtos.map((p) => p.categoria))),
  ];

  const produtosFiltrados = produtos.filter((produto) => {
    const combinaTexto =
      produto.nomeProduto.toLowerCase().includes(termoBusca.toLowerCase()) ||
      produto.sku.toLowerCase().includes(termoBusca.toLowerCase()) ||
      produto.descricao.toLowerCase().includes(termoBusca.toLowerCase());
    const combinaCategoria =
      categoriaSelecionada === 'Todas' || produto.categoria === categoriaSelecionada;
    return combinaTexto && combinaCategoria;
  });

  function obterQuantidadeNoCarrinho(produtoId: number): number {
    const item = carrinho.find((i) => i.produtoId === produtoId);
    return item ? item.quantidade : 0;
  }

  return (
    <section className="secaoContainer">
      <div className="cabecalhoSecao">
        <div>
          <h2>Catálogo de Produtos</h2>
          <p className="subtituloSecao">
            Selecione os itens desejados. A disponibilidade é sincronizada em tempo real com o estoque.
          </p>
        </div>
        <div className="barraFiltros">
          <input
            type="text"
            className="campoInput"
            placeholder="Buscar por nome, SKU ou descrição..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
          <select
            className="campoSelect"
            value={categoriaSelecionada}
            onChange={(e) => setCategoriaSelecionada(e.target.value)}
          >
            {categoriasDisponiveis.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'Todas' ? 'Todas as Categorias' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {produtosFiltrados.length === 0 ? (
        <div className="caixaVazia">
          <p>Nenhum produto encontrado para o filtro selecionado.</p>
          <button
            type="button"
            className="botaoSecundario"
            onClick={() => {
              setTermoBusca('');
              setCategoriaSelecionada('Todas');
            }}
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="gradeProdutos">
          {produtosFiltrados.map((produto) => {
            const statusEstoque = verificarStatusEstoque(produto);
            const qtdNoCarrinho = obterQuantidadeNoCarrinho(produto.id);
            const estoqueRestanteParaAdicionar = produto.estoque - qtdNoCarrinho;
            const semEstoqueDisponivel = estoqueRestanteParaAdicionar <= 0;

            return (
              <article key={produto.id} className="cartaoProduto">
                <div className="topoCartaoProduto">
                  <span className="tagCategoria">{produto.categoria}</span>
                  <span className="codigoSku">SKU: {produto.sku}</span>
                </div>

                <h3 className="tituloProduto">{produto.nomeProduto}</h3>
                <p className="descricaoProduto">{produto.descricao}</p>

                <div className="blocoPrecoEstoque">
                  <strong className="precoProduto">{formatarMoeda(produto.preco)}</strong>
                  <span className={`badgeEstoque ${statusEstoque.classeStatus}`}>
                    {statusEstoque.rotulo}
                  </span>
                </div>

                {qtdNoCarrinho > 0 && (
                  <div className="infoNoCarrinho">
                    No seu carrinho: <strong>{qtdNoCarrinho} un.</strong>
                  </div>
                )}

                <div className="acoesCartaoProduto">
                  <button
                    type="button"
                    className="botaoPrimario"
                    disabled={semEstoqueDisponivel}
                    onClick={() => aoAdicionarAoCarrinho(produto.id)}
                  >
                    {produto.estoque === 0
                      ? 'Produto Esgotado'
                      : semEstoqueDisponivel
                        ? 'Limite do Estoque Atingido'
                        : 'Adicionar ao Carrinho'}
                  </button>
                  {produto.estoque === 0 && (
                    <button
                      type="button"
                      className="botaoLink"
                      onClick={aoIrParaEstoque}
                    >
                      Repor no Estoque
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
