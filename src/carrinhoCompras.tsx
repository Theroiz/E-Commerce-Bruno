import { useState } from 'react';
import type { Produto, ItemCarrinho, Usuario } from './tiposEcommerce';
import {
  formatarMoeda,
  calcularSubtotalCarrinho,
  calcularDescontoCupom,
  calcularTotalFinal,
} from './calculo';

interface PropriedadesCarrinho {
  carrinho: ItemCarrinho[];
  produtos: Produto[];
  usuarioLogado: Usuario | null;
  aoAlterarQuantidade: (produtoId: number, novaQuantidade: number) => void;
  aoRemoverItem: (produtoId: number) => void;
  aoLimparCarrinho: () => void;
  aoFinalizarCompra: (formaPagamento: string, codigoCupom: string) => void;
  aoIrParaLoja: () => void;
  aoIrParaLogin: () => void;
}

export function CarrinhoCompras({
  carrinho,
  produtos,
  usuarioLogado,
  aoAlterarQuantidade,
  aoRemoverItem,
  aoLimparCarrinho,
  aoFinalizarCompra,
  aoIrParaLoja,
  aoIrParaLogin,
}: PropriedadesCarrinho) {
  const [codigoCupom, setCodigoCupom] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('PIX (Aprovação Imediata)');

  const itensDetalhados = carrinho
    .map((item) => {
      const produto = produtos.find((p) => p.id === item.produtoId);
      return produto ? { ...item, produto } : null;
    })
    .filter((item): item is { produtoId: number; quantidade: number; produto: Produto } => item !== null);

  const subtotal = calcularSubtotalCarrinho(carrinho, produtos);
  const desconto = calcularDescontoCupom(subtotal, codigoCupom);
  const valorTotal = calcularTotalFinal(subtotal, desconto);

  return (
    <section className="secaoContainer">
      <div className="cabecalhoSecao">
        <div>
          <h2>Carrinho de Compras</h2>
          <p className="subtituloSecao">
            Revise os itens selecionados. Ao finalizar o pedido, o estoque dos produtos será atualizado automaticamente.
          </p>
        </div>
        {itensDetalhados.length > 0 && (
          <button type="button" className="botaoSecundario" onClick={aoLimparCarrinho}>
            Esvaziar Carrinho
          </button>
        )}
      </div>

      {itensDetalhados.length === 0 ? (
        <div className="caixaVazia">
          <h3>Seu carrinho está vazio</h3>
          <p>Explore o catálogo de produtos e adicione itens para realizar um pedido.</p>
          <button type="button" className="botaoPrimario" onClick={aoIrParaLoja}>
            Ver Catálogo de Produtos
          </button>
        </div>
      ) : (
        <div className="layoutDuasColunas">
          <div className="listaItensCarrinho">
            {itensDetalhados.map(({ produto, quantidade }) => (
              <div key={produto.id} className="itemCarrinhoCard">
                <div className="infoItemCarrinho">
                  <code>{produto.sku}</code>
                  <h4>{produto.nomeProduto}</h4>
                  <span className="precoUnitarioItem">
                    Preço unitário: {formatarMoeda(produto.preco)} | Disponível em estoque:{' '}
                    <strong>{produto.estoque} un.</strong>
                  </span>
                </div>

                <div className="acoesItemCarrinho">
                  <div className="controlesQuantidade">
                    <button
                      type="button"
                      className="botaoQtd"
                      onClick={() => aoAlterarQuantidade(produto.id, quantidade - 1)}
                    >
                      -
                    </button>
                    <span className="displayQuantidade">{quantidade}</span>
                    <button
                      type="button"
                      className="botaoQtd"
                      disabled={quantidade >= produto.estoque}
                      onClick={() => aoAlterarQuantidade(produto.id, quantidade + 1)}
                      title={
                        quantidade >= produto.estoque
                          ? 'Limite máximo em estoque atingido'
                          : 'Adicionar mais uma unidade'
                      }
                    >
                      +
                    </button>
                  </div>

                  <strong className="subtotalItem">
                    {formatarMoeda(produto.preco * quantidade)}
                  </strong>

                  <button
                    type="button"
                    className="botaoPerigoPequeno"
                    onClick={() => aoRemoverItem(produto.id)}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="painelResumoPedido">
            <h3>Resumo do Pedido</h3>

            <div className="grupoCampo">
              <label htmlFor="inputCupom">Cupom de Desconto (experimente FATEC10)</label>
              <input
                id="inputCupom"
                type="text"
                className="campoInput"
                placeholder="Digite FATEC10 ou BEMVINDO5"
                value={codigoCupom}
                onChange={(e) => setCodigoCupom(e.target.value)}
              />
            </div>

            <div className="grupoCampo">
              <label htmlFor="selectPagamento">Forma de Pagamento</label>
              <select
                id="selectPagamento"
                className="campoSelect"
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
              >
                <option value="PIX (Aprovação Imediata)">PIX (Aprovação Imediata)</option>
                <option value="Cartão de Crédito (1x sem juros)">
                  Cartão de Crédito (1x sem juros)
                </option>
                <option value="Boleto Bancário">Boleto Bancário</option>
              </select>
            </div>

            <div className="linhasTotais">
              <div className="linhaResumo">
                <span>Subtotal ({itensDetalhados.reduce((a, b) => a + b.quantidade, 0)} itens):</span>
                <span>{formatarMoeda(subtotal)}</span>
              </div>
              <div className="linhaResumo">
                <span>Desconto aplicado:</span>
                <span className="textoDesconto">- {formatarMoeda(desconto)}</span>
              </div>
              <div className="linhaResumo linhaTotalFinal">
                <strong>Total a Pagar:</strong>
                <strong>{formatarMoeda(valorTotal)}</strong>
              </div>
            </div>

            {usuarioLogado ? (
              <div className="blocoFinalizacao">
                <p className="infoCompradorLogado">
                  Comprando como: <strong>{usuarioLogado.nomeCompleto}</strong> ({usuarioLogado.email})
                </p>
                <button
                  type="button"
                  className="botaoPrimario larguraTotal"
                  onClick={() => aoFinalizarCompra(formaPagamento, codigoCupom)}
                >
                  Finalizar Compra e Baixar Estoque
                </button>
              </div>
            ) : (
              <div className="avisoLoginNecessario">
                <p>Faça login ou cadastre-se para concluir seu pedido.</p>
                <button
                  type="button"
                  className="botaoPrimario larguraTotal"
                  onClick={aoIrParaLogin}
                >
                  Ir para Login / Cadastro
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
