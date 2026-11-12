import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import './Meu.css';
import {
  produtosIniciais,
  usuariosIniciais,
  calcularSubtotalCarrinho,
  calcularDescontoCupom,
  calcularTotalFinal,
  formatarMoeda,
} from './calculo';
import type {
  Produto,
  ItemCarrinho,
  Usuario,
  Pedido,
  AbaAtiva,
} from './tiposEcommerce';
import { CatalogoProdutos } from './catalogoProdutos';
import { ControleEstoque } from './controleEstoque';
import { CarrinhoCompras } from './carrinhoCompras';
import { AutenticacaoUsuario } from './autenticacaoUsuario';

function carregarEstadoSalvo<T>(chave: string, valorPadrao: T): T {
  try {
    const salvo = localStorage.getItem(chave);
    if (salvo) {
      return JSON.parse(salvo) as T;
    }
  } catch {
    // Fallback em caso de bloqueio de localStorage
  }
  return valorPadrao;
}

function salvarEstado<T>(chave: string, valor: T): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Ignorar falha de gravação em ambiente restrito
  }
}

function App() {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('loja');
  const [produtos, setProdutos] = useState<Produto[]>(() =>
    carregarEstadoSalvo<Produto[]>('fatecStore_v2_produtos', produtosIniciais)
  );
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>(() =>
    carregarEstadoSalvo<ItemCarrinho[]>('fatecStore_v2_carrinho', [])
  );
  const [usuarios, setUsuarios] = useState<Usuario[]>(() =>
    carregarEstadoSalvo<Usuario[]>('fatecStore_v2_usuarios', usuariosIniciais)
  );
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(() =>
    carregarEstadoSalvo<Usuario | null>('fatecStore_v2_usuarioLogado', null)
  );
  const [pedidos, setPedidos] = useState<Pedido[]>(() =>
    carregarEstadoSalvo<Pedido[]>('fatecStore_v2_pedidos', [])
  );
  const [notificacao, setNotificacao] = useState<{
    mensagem: string;
    tipo: 'sucesso' | 'erro' | 'info';
  } | null>(null);

  useEffect(() => {
    salvarEstado('fatecStore_v2_produtos', produtos);
  }, [produtos]);

  useEffect(() => {
    salvarEstado('fatecStore_v2_carrinho', carrinho);
  }, [carrinho]);

  useEffect(() => {
    salvarEstado('fatecStore_v2_usuarios', usuarios);
  }, [usuarios]);

  useEffect(() => {
    salvarEstado('fatecStore_v2_usuarioLogado', usuarioLogado);
  }, [usuarioLogado]);

  useEffect(() => {
    salvarEstado('fatecStore_v2_pedidos', pedidos);
  }, [pedidos]);

  function exibirAviso(
    mensagem: string,
    tipo: 'sucesso' | 'erro' | 'info' = 'info'
  ) {
    setNotificacao({ mensagem, tipo });
  }

  function adicionarAoCarrinho(produtoId: number) {
    const produtoAlvo = produtos.find((p) => p.id === produtoId);
    if (!produtoAlvo || produtoAlvo.estoque <= 0) {
      exibirAviso('Produto sem estoque disponível no momento.', 'erro');
      return;
    }

    const itemExistente = carrinho.find((item) => item.produtoId === produtoId);
    const qtdAtual = itemExistente ? itemExistente.quantidade : 0;

    if (qtdAtual + 1 > produtoAlvo.estoque) {
      exibirAviso(
        `Limite atingido! Há apenas ${produtoAlvo.estoque} un. disponíveis em estoque.`,
        'erro'
      );
      return;
    }

    if (itemExistente) {
      setCarrinho(
        carrinho.map((item) =>
          item.produtoId === produtoId
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      );
    } else {
      setCarrinho([...carrinho, { produtoId, quantidade: 1 }]);
    }

    exibirAviso(
      `"${produtoAlvo.nomeProduto}" adicionado ao carrinho!`,
      'sucesso'
    );
  }

  function alterarQuantidadeCarrinho(produtoId: number, novaQuantidade: number) {
    const produtoAlvo = produtos.find((p) => p.id === produtoId);
    if (!produtoAlvo) return;

    if (novaQuantidade <= 0) {
      removerItemCarrinho(produtoId);
      return;
    }

    if (novaQuantidade > produtoAlvo.estoque) {
      exibirAviso(
        `Estoque insuficiente. Máximo disponível: ${produtoAlvo.estoque} un.`,
        'erro'
      );
      return;
    }

    setCarrinho(
      carrinho.map((item) =>
        item.produtoId === produtoId
          ? { ...item, quantidade: novaQuantidade }
          : item
      )
    );
  }

  function removerItemCarrinho(produtoId: number) {
    setCarrinho(carrinho.filter((item) => item.produtoId !== produtoId));
    exibirAviso('Item removido do carrinho.', 'info');
  }

  function limparCarrinho() {
    setCarrinho([]);
    exibirAviso('Carrinho esvaziado.', 'info');
  }

  function ajustarEstoqueProduto(produtoId: number, novaQuantidade: number) {
    const qtdSegura = Math.max(0, novaQuantidade);
    setProdutos(
      produtos.map((p) =>
        p.id === produtoId ? { ...p, estoque: qtdSegura } : p
      )
    );
    setCarrinho((carrinhoAtual) =>
      carrinhoAtual
        .map((item) =>
          item.produtoId === produtoId
            ? { ...item, quantidade: Math.min(item.quantidade, qtdSegura) }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  }

  function atualizarPrecoProduto(produtoId: number, novoPreco: number) {
    setProdutos(
      produtos.map((p) =>
        p.id === produtoId ? { ...p, preco: novoPreco } : p
      )
    );
  }

  function cadastrarNovoProduto(novoProduto: Omit<Produto, 'id'>) {
    const proximoId =
      produtos.length > 0 ? Math.max(...produtos.map((p) => p.id)) + 1 : 1;
    setProdutos([{ id: proximoId, ...novoProduto }, ...produtos]);
    exibirAviso(
      `Produto "${novoProduto.nomeProduto}" cadastrado no estoque!`,
      'sucesso'
    );
  }

  function removerProdutoCatalogo(produtoId: number) {
    setProdutos(produtos.filter((p) => p.id !== produtoId));
    setCarrinho(carrinho.filter((item) => item.produtoId !== produtoId));
    exibirAviso('Produto removido do estoque e do catálogo.', 'info');
  }

  function realizarLogin(email: string, senha: string) {
    const encontrado = usuarios.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
    );
    if (!encontrado) {
      exibirAviso('E-mail ou senha inválidos. Cadastre uma conta caso ainda não tenha.', 'erro');
      return;
    }
    setUsuarioLogado(encontrado);
    exibirAviso(`Bem-vindo(a), ${encontrado.nomeCompleto}!`, 'sucesso');
  }

  function realizarCadastro(
    nomeCompleto: string,
    email: string,
    senha: string,
    perfil: 'cliente' | 'admin'
  ) {
    const emailJaExiste = usuarios.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (emailJaExiste) {
      exibirAviso('Este e-mail já está cadastrado. Faça login.', 'erro');
      return;
    }

    const novoUsuario: Usuario = {
      id: usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1,
      nomeCompleto,
      email,
      senha,
      perfil,
    };

    setUsuarios([...usuarios, novoUsuario]);
    setUsuarioLogado(novoUsuario);
    exibirAviso(
      `Cadastro realizado! Você entrou como ${novoUsuario.nomeCompleto}.`,
      'sucesso'
    );
  }

  function realizarLogout() {
    setUsuarioLogado(null);
    exibirAviso('Sessão encerrada com sucesso.', 'info');
  }

  function finalizarCompra(formaPagamento: string, codigoCupom: string) {
    if (!usuarioLogado) {
      setAbaAtiva('conta');
      exibirAviso('Faça login ou cadastre-se antes de finalizar o pedido.', 'erro');
      return;
    }

    if (carrinho.length === 0) {
      exibirAviso('Seu carrinho está vazio.', 'erro');
      return;
    }

    for (const item of carrinho) {
      const prod = produtos.find((p) => p.id === item.produtoId);
      if (!prod || prod.estoque < item.quantidade) {
        exibirAviso(
          `Estoque insuficiente para o item "${prod?.nomeProduto || 'selecionado'}".`,
          'erro'
        );
        return;
      }
    }

    const subtotal = calcularSubtotalCarrinho(carrinho, produtos);
    const desconto = calcularDescontoCupom(subtotal, codigoCupom);
    const valorTotal = calcularTotalFinal(subtotal, desconto);

    const itensComprados = carrinho.map((item) => {
      const prod = produtos.find((p) => p.id === item.produtoId)!;
      return {
        produtoId: prod.id,
        nomeProduto: prod.nomeProduto,
        quantidade: item.quantidade,
        precoUnitario: prod.preco,
      };
    });

    setProdutos(
      produtos.map((prod) => {
        const itemNoCarrinho = carrinho.find((i) => i.produtoId === prod.id);
        if (!itemNoCarrinho) return prod;
        return {
          ...prod,
          estoque: Math.max(0, prod.estoque - itemNoCarrinho.quantidade),
        };
      })
    );

    const novoPedido: Pedido = {
      id: pedidos.length > 0 ? Math.max(...pedidos.map((p) => p.id)) + 1 : 1001,
      usuarioEmail: usuarioLogado.email,
      nomeCliente: usuarioLogado.nomeCompleto,
      dataHora: new Date().toLocaleString('pt-BR'),
      itens: itensComprados,
      subtotal,
      desconto,
      valorTotal,
      formaPagamento,
    };

    setPedidos([novoPedido, ...pedidos]);
    setCarrinho([]);
    setAbaAtiva('conta');
    exibirAviso(
      `Pedido #${novoPedido.id} aprovado (${formatarMoeda(valorTotal)})! Estoque atualizado.`,
      'sucesso'
    );
  }

  function restaurarDadosPadrao() {
    setProdutos(produtosIniciais);
    setCarrinho([]);
    setUsuarios([]);
    setUsuarioLogado(null);
    setPedidos([]);
    exibirAviso('Produtos restaurados e dados reiniciados!', 'info');
  }

  const totalItensCarrinho = carrinho.reduce(
    (acc, item) => acc + item.quantidade,
    0
  );

  return (
    <div className="containerPrincipal">
      <header className="topoEcommerce">
        <div className="identidadeMarca">
          <img src={reactLogo} className="logoCabecalho" alt="Logo FATEC STORE" />
          <div className="textosMarca">
            <h1>FATEC STORE</h1>
          </div>
        </div>

        <nav className="menuNavegacao">
          <button
            type="button"
            className={abaAtiva === 'loja' ? 'botaoMenuAtivo' : 'botaoMenu'}
            onClick={() => setAbaAtiva('loja')}
          >
            Loja ({produtos.length})
          </button>
          <button
            type="button"
            className={abaAtiva === 'carrinho' ? 'botaoMenuAtivo' : 'botaoMenu'}
            onClick={() => setAbaAtiva('carrinho')}
          >
            Carrinho ({totalItensCarrinho})
          </button>
          <button
            type="button"
            className={abaAtiva === 'estoque' ? 'botaoMenuAtivo' : 'botaoMenu'}
            onClick={() => setAbaAtiva('estoque')}
          >
            Estoque
          </button>
          <button
            type="button"
            className={abaAtiva === 'conta' ? 'botaoMenuAtivo' : 'botaoMenu'}
            onClick={() => setAbaAtiva('conta')}
          >
            {usuarioLogado
              ? `Conta (${usuarioLogado.nomeCompleto.split(' ')[0]})`
              : 'Login / Cadastro'}
          </button>
        </nav>
      </header>

      {notificacao && (
        <div className={`barraNotificacao ${notificacao.tipo}`}>
          <span>{notificacao.mensagem}</span>
          <button
            type="button"
            className="fecharNotificacao"
            onClick={() => setNotificacao(null)}
          >
            ×
          </button>
        </div>
      )}

      <main className="conteudoPrincipal">
        {abaAtiva === 'loja' && (
          <CatalogoProdutos
            produtos={produtos}
            carrinho={carrinho}
            aoAdicionarAoCarrinho={adicionarAoCarrinho}
            aoIrParaEstoque={() => setAbaAtiva('estoque')}
          />
        )}

        {abaAtiva === 'carrinho' && (
          <CarrinhoCompras
            carrinho={carrinho}
            produtos={produtos}
            usuarioLogado={usuarioLogado}
            aoAlterarQuantidade={alterarQuantidadeCarrinho}
            aoRemoverItem={removerItemCarrinho}
            aoLimparCarrinho={limparCarrinho}
            aoFinalizarCompra={finalizarCompra}
            aoIrParaLoja={() => setAbaAtiva('loja')}
            aoIrParaLogin={() => setAbaAtiva('conta')}
          />
        )}

        {abaAtiva === 'estoque' && (
          <ControleEstoque
            produtos={produtos}
            aoAjustarEstoque={ajustarEstoqueProduto}
            aoAtualizarPreco={atualizarPrecoProduto}
            aoCadastrarProduto={cadastrarNovoProduto}
            aoRemoverProduto={removerProdutoCatalogo}
          />
        )}

        {abaAtiva === 'conta' && (
          <AutenticacaoUsuario
            usuarioLogado={usuarioLogado}
            pedidosRealizados={pedidos}
            aoRealizarLogin={realizarLogin}
            aoRealizarCadastro={realizarCadastro}
            aoRealizarLogout={realizarLogout}
          />
        )}
      </main>

      <footer className="rodapeEcommerce">
        <button
          type="button"
          className="botaoLink"
          onClick={restaurarDadosPadrao}
        >
          Restaurar Dados Iniciais
        </button>
      </footer>
    </div>
  );
}

export default App;
