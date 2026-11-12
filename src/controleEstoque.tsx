import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Produto } from './tiposEcommerce';
import { formatarMoeda, verificarStatusEstoque } from './calculo';

interface PropriedadesControleEstoque {
  produtos: Produto[];
  aoAjustarEstoque: (produtoId: number, novaQuantidade: number) => void;
  aoAtualizarPreco: (produtoId: number, novoPreco: number) => void;
  aoCadastrarProduto: (novoProduto: Omit<Produto, 'id'>) => void;
  aoRemoverProduto: (produtoId: number) => void;
}

export function ControleEstoque({
  produtos,
  aoAjustarEstoque,
  aoAtualizarPreco,
  aoCadastrarProduto,
  aoRemoverProduto,
}: PropriedadesControleEstoque) {
  const [sku, setSku] = useState('');
  const [nomeProduto, setNomeProduto] = useState('');
  const [categoria, setCategoria] = useState('Periféricos');
  const [precoTexto, setPrecoTexto] = useState('');
  const [estoqueInicialTexto, setEstoqueInicialTexto] = useState('10');
  const [estoqueMinimoTexto, setEstoqueMinimoTexto] = useState('3');
  const [descricao, setDescricao] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'baixo' | 'esgotado'>('todos');

  const totalUnidadesEstoque = produtos.reduce((acc, p) => acc + p.estoque, 0);
  const valorPatrimonialEstoque = produtos.reduce((acc, p) => acc + p.estoque * p.preco, 0);
  const produtosEstoqueCritico = produtos.filter((p) => p.estoque <= p.estoqueMinimo).length;

  function lidarComCadastroProduto(evento: FormEvent) {
    evento.preventDefault();
    const precoNumerico = Number(precoTexto.replace(',', '.'));
    const estoqueNumerico = Math.max(0, parseInt(estoqueInicialTexto, 10) || 0);
    const minimoNumerico = Math.max(1, parseInt(estoqueMinimoTexto, 10) || 1);

    if (!nomeProduto.trim() || !sku.trim() || isNaN(precoNumerico) || precoNumerico <= 0) {
      return;
    }

    aoCadastrarProduto({
      sku: sku.trim().toUpperCase(),
      nomeProduto: nomeProduto.trim(),
      categoria: categoria.trim() || 'Geral',
      preco: precoNumerico,
      estoque: estoqueNumerico,
      estoqueMinimo: minimoNumerico,
      descricao: descricao.trim() || 'Produto cadastrado no sistema de estoque.',
    });

    setSku('');
    setNomeProduto('');
    setPrecoTexto('');
    setEstoqueInicialTexto('10');
    setEstoqueMinimoTexto('3');
    setDescricao('');
  }

  const produtosExibidos = produtos.filter((p) => {
    if (filtroStatus === 'esgotado') return p.estoque === 0;
    if (filtroStatus === 'baixo') return p.estoque > 0 && p.estoque <= p.estoqueMinimo;
    return true;
  });

  return (
    <section className="secaoContainer">
      <div className="cabecalhoSecao">
        <div>
          <h2>Sistema de Controle de Estoque</h2>
          <p className="subtituloSecao">
            Gerencie quantidades disponíveis, reponha mercadorias e cadastre novos produtos no catálogo.
          </p>
        </div>
      </div>

      <div className="gradeResumoEstoque">
        <div className="cartaoIndicador">
          <span className="rotuloIndicador">SKUs Cadastrados</span>
          <strong className="valorIndicador">{produtos.length} produtos</strong>
        </div>
        <div className="cartaoIndicador">
          <span className="rotuloIndicador">Unidades Totais em Estoque</span>
          <strong className="valorIndicador">{totalUnidadesEstoque} un.</strong>
        </div>
        <div className="cartaoIndicador">
          <span className="rotuloIndicador">Valor Total em Estoque</span>
          <strong className="valorIndicador">{formatarMoeda(valorPatrimonialEstoque)}</strong>
        </div>
        <div className="cartaoIndicador">
          <span className="rotuloIndicador">Alertas de Reposição</span>
          <strong className="valorIndicador destaqueAlerta">{produtosEstoqueCritico} itens</strong>
        </div>
      </div>

      <div className="layoutDuasColunas">
        <form className="painelFormulario" onSubmit={lidarComCadastroProduto}>
          <h3>Cadastrar Novo Produto</h3>
          <div className="grupoCampo">
            <label htmlFor="campoSku">Código SKU</label>
            <input
              id="campoSku"
              type="text"
              className="campoInput"
              placeholder="Ex: PER-MOUSE01"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </div>

          <div className="grupoCampo">
            <label htmlFor="campoNomeProd">Nome do Produto</label>
            <input
              id="campoNomeProd"
              type="text"
              className="campoInput"
              placeholder="Ex: Webcam Full HD 1080p"
              value={nomeProduto}
              onChange={(e) => setNomeProduto(e.target.value)}
              required
            />
          </div>

          <div className="linhaCamposDuplos">
            <div className="grupoCampo">
              <label htmlFor="campoCatProd">Categoria</label>
              <select
                id="campoCatProd"
                className="campoSelect"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="Periféricos">Periféricos</option>
                <option value="Hardware">Hardware</option>
                <option value="Armazenamento">Armazenamento</option>
                <option value="Áudio">Áudio</option>
                <option value="Refrigeração">Refrigeração</option>
                <option value="Monitores">Monitores</option>
              </select>
            </div>

            <div className="grupoCampo">
              <label htmlFor="campoPrecoProd">Preço (R$)</label>
              <input
                id="campoPrecoProd"
                type="number"
                step="0.01"
                min="0.01"
                className="campoInput"
                placeholder="Ex: 199.90"
                value={precoTexto}
                onChange={(e) => setPrecoTexto(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="linhaCamposDuplos">
            <div className="grupoCampo">
              <label htmlFor="campoEstoqueIni">Estoque Inicial</label>
              <input
                id="campoEstoqueIni"
                type="number"
                min="0"
                className="campoInput"
                value={estoqueInicialTexto}
                onChange={(e) => setEstoqueInicialTexto(e.target.value)}
                required
              />
            </div>

            <div className="grupoCampo">
              <label htmlFor="campoEstoqueMin">Estoque Mínimo</label>
              <input
                id="campoEstoqueMin"
                type="number"
                min="1"
                className="campoInput"
                value={estoqueMinimoTexto}
                onChange={(e) => setEstoqueMinimoTexto(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grupoCampo">
            <label htmlFor="campoDescProd">Descrição Técnica</label>
            <textarea
              id="campoDescProd"
              className="campoTextarea"
              rows={2}
              placeholder="Especificações principais do produto..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <button type="submit" className="botaoPrimario larguraTotal">
            + Cadastrar no Estoque
          </button>
        </form>

        <div className="painelTabelaEstoque">
          <div className="topoTabelaEstoque">
            <h3>Inventário de Produtos</h3>
            <div className="botoesFiltroRapido">
              <button
                type="button"
                className={filtroStatus === 'todos' ? 'botaoFiltroAtivo' : 'botaoFiltro'}
                onClick={() => setFiltroStatus('todos')}
              >
                Todos ({produtos.length})
              </button>
              <button
                type="button"
                className={filtroStatus === 'baixo' ? 'botaoFiltroAtivo' : 'botaoFiltro'}
                onClick={() => setFiltroStatus('baixo')}
              >
                Estoque Baixo
              </button>
              <button
                type="button"
                className={filtroStatus === 'esgotado' ? 'botaoFiltroAtivo' : 'botaoFiltro'}
                onClick={() => setFiltroStatus('esgotado')}
              >
                Esgotados
              </button>
            </div>
          </div>

          <div className="tabelaResponsiva">
            <table className="tabelaEstoque">
              <thead>
                <tr>
                  <th>SKU / Produto</th>
                  <th>Preço Unit.</th>
                  <th>Status</th>
                  <th>Ajuste de Estoque</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosExibidos.map((produto) => {
                  const status = verificarStatusEstoque(produto);
                  return (
                    <tr key={produto.id}>
                      <td>
                        <div className="celulaProdutoNome">
                          <code>{produto.sku}</code>
                          <strong>{produto.nomeProduto}</strong>
                          <span className="textoMenor">{produto.categoria}</span>
                        </div>
                      </td>
                      <td>
                        <div className="controlePrecoInline">
                          <span>R$</span>
                          <input
                            type="number"
                            step="0.10"
                            min="0.01"
                            className="inputNumeroCurto"
                            value={produto.preco}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val > 0) {
                                aoAtualizarPreco(produto.id, val);
                              }
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <span className={`badgeEstoque ${status.classeStatus}`}>
                          {status.rotulo}
                        </span>
                      </td>
                      <td>
                        <div className="controlesQuantidade">
                          <button
                            type="button"
                            className="botaoQtd"
                            onClick={() =>
                              aoAjustarEstoque(produto.id, Math.max(0, produto.estoque - 1))
                            }
                            title="Reduzir 1 unidade"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            className="inputQtdDireta"
                            value={produto.estoque}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              aoAjustarEstoque(produto.id, isNaN(val) ? 0 : Math.max(0, val));
                            }}
                          />
                          <button
                            type="button"
                            className="botaoQtd"
                            onClick={() => aoAjustarEstoque(produto.id, produto.estoque + 1)}
                            title="Adicionar 1 unidade"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="botaoSecundarioPequeno"
                            onClick={() => aoAjustarEstoque(produto.id, produto.estoque + 5)}
                            title="Repor lote de +5 unidades"
                          >
                            +5 un.
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="botaoPerigoPequeno"
                          onClick={() => aoRemoverProduto(produto.id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
