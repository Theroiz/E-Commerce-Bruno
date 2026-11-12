import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Usuario, Pedido } from './tiposEcommerce';
import { formatarMoeda } from './calculo';

interface PropriedadesAutenticacao {
  usuarioLogado: Usuario | null;
  pedidosRealizados: Pedido[];
  aoRealizarLogin: (email: string, senha: string) => void;
  aoRealizarCadastro: (
    nomeCompleto: string,
    email: string,
    senha: string,
    perfil: 'cliente' | 'admin'
  ) => void;
  aoRealizarLogout: () => void;
}

export function AutenticacaoUsuario({
  usuarioLogado,
  pedidosRealizados,
  aoRealizarLogin,
  aoRealizarCadastro,
  aoRealizarLogout,
}: PropriedadesAutenticacao) {
  const [modoFormulario, setModoFormulario] = useState<'login' | 'cadastro'>('cadastro');
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');

  const [nomeCadastro, setNomeCadastro] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [perfilCadastro, setPerfilCadastro] = useState<'cliente' | 'admin'>('cliente');

  function submeterLogin(evento: FormEvent) {
    evento.preventDefault();
    aoRealizarLogin(emailLogin.trim(), senhaLogin);
  }

  function submeterCadastro(evento: FormEvent) {
    evento.preventDefault();
    if (!nomeCadastro.trim() || !emailCadastro.trim() || !senhaCadastro.trim()) {
      return;
    }
    aoRealizarCadastro(
      nomeCadastro.trim(),
      emailCadastro.trim(),
      senhaCadastro,
      perfilCadastro
    );
    setNomeCadastro('');
    setEmailCadastro('');
    setSenhaCadastro('');
  }

  if (usuarioLogado) {
    const meusPedidos = pedidosRealizados.filter(
      (p) => p.usuarioEmail.toLowerCase() === usuarioLogado.email.toLowerCase()
    );

    return (
      <section className="secaoContainer">
        <div className="layoutDuasColunas">
          <div className="painelFormulario">
            <h2>Minha Conta</h2>
            <div className="cartaoPerfilUsuario">
              <div className="avatarInicial">
                {usuarioLogado.nomeCompleto.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3>{usuarioLogado.nomeCompleto}</h3>
                <p>{usuarioLogado.email}</p>
                <span className="tagCategoria">
                  Perfil: {usuarioLogado.perfil === 'admin' ? 'Administrador' : 'Cliente'}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="botaoPerigoPequeno larguraTotal"
              onClick={aoRealizarLogout}
            >
              Sair da Conta (Logout)
            </button>
          </div>

          <div className="painelTabelaEstoque">
            <h3>Histórico de Pedidos ({meusPedidos.length})</h3>
            {meusPedidos.length === 0 ? (
              <div className="caixaVazia">
                <p>Você ainda não finalizou nenhum pedido nesta conta.</p>
              </div>
            ) : (
              <div className="listaPedidos">
                {meusPedidos.map((pedido) => (
                  <div key={pedido.id} className="cartaoPedido">
                    <div className="topoCartaoProduto">
                      <strong>Pedido #{pedido.id}</strong>
                      <span className="codigoSku">{pedido.dataHora}</span>
                    </div>
                    <p className="textoMenor">Pagamento: {pedido.formaPagamento}</p>
                    <ul className="listaItensPedido">
                      {pedido.itens.map((item, idx) => (
                        <li key={idx}>
                          {item.quantidade}x {item.nomeProduto} (
                          {formatarMoeda(item.precoUnitario * item.quantidade)})
                        </li>
                      ))}
                    </ul>
                    <div className="rodapePedido">
                      <span>Desconto: {formatarMoeda(pedido.desconto)}</span>
                      <strong>Total: {formatarMoeda(pedido.valorTotal)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="secaoContainer">
      <div className="painelAuthCentralizado">
        <div className="painelFormulario">
          <div className="abasInternasAuth">
            <button
              type="button"
              className={modoFormulario === 'login' ? 'abaAuthAtiva' : 'abaAuth'}
              onClick={() => setModoFormulario('login')}
            >
              Entrar (Login)
            </button>
            <button
              type="button"
              className={modoFormulario === 'cadastro' ? 'abaAuthAtiva' : 'abaAuth'}
              onClick={() => setModoFormulario('cadastro')}
            >
              Criar Conta (Cadastro)
            </button>
          </div>

          {modoFormulario === 'login' ? (
            <form onSubmit={submeterLogin}>
              <h3>Acessar Conta</h3>
              <div className="grupoCampo">
                <label htmlFor="loginEmail">E-mail</label>
                <input
                  id="loginEmail"
                  type="email"
                  className="campoInput"
                  placeholder="Digite seu e-mail"
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  required
                />
              </div>

              <div className="grupoCampo">
                <label htmlFor="loginSenha">Senha</label>
                <input
                  id="loginSenha"
                  type="password"
                  className="campoInput"
                  placeholder="Digite sua senha"
                  value={senhaLogin}
                  onChange={(e) => setSenhaLogin(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="botaoPrimario larguraTotal">
                Entrar
              </button>
            </form>
          ) : (
            <form onSubmit={submeterCadastro}>
              <h3>Novo Cadastro de Usuário</h3>
              <div className="grupoCampo">
                <label htmlFor="cadNome">Nome Completo</label>
                <input
                  id="cadNome"
                  type="text"
                  className="campoInput"
                  placeholder="Digite seu nome completo"
                  value={nomeCadastro}
                  onChange={(e) => setNomeCadastro(e.target.value)}
                  required
                />
              </div>

              <div className="grupoCampo">
                <label htmlFor="cadEmail">E-mail</label>
                <input
                  id="cadEmail"
                  type="email"
                  className="campoInput"
                  placeholder="Digite seu e-mail"
                  value={emailCadastro}
                  onChange={(e) => setEmailCadastro(e.target.value)}
                  required
                />
              </div>

              <div className="linhaCamposDuplos">
                <div className="grupoCampo">
                  <label htmlFor="cadSenha">Senha</label>
                  <input
                    id="cadSenha"
                    type="password"
                    className="campoInput"
                    placeholder="Crie uma senha"
                    value={senhaCadastro}
                    onChange={(e) => setSenhaCadastro(e.target.value)}
                    required
                  />
                </div>

                <div className="grupoCampo">
                  <label htmlFor="cadPerfil">Tipo de Conta</label>
                  <select
                    id="cadPerfil"
                    className="campoSelect"
                    value={perfilCadastro}
                    onChange={(e) =>
                      setPerfilCadastro(e.target.value as 'cliente' | 'admin')
                    }
                  >
                    <option value="cliente">Cliente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="botaoPrimario larguraTotal">
                Concluir Cadastro e Entrar
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
