/* ============================================================
    1. CONFIGURAÇÕES GLOBAIS E SEGURANÇA (EXECUTADO IMEDIATAMENTE)
============================================================ */
const API = "https://caixamei.onrender.com/api";
const usuarioLogadoStr = localStorage.getItem("usuario");
const usuarioLogado = usuarioLogadoStr ? JSON.parse(usuarioLogadoStr) : null;

// Redirecionamento de segurança (Impede acesso à página sem login)
if (!usuarioLogado || !usuarioLogado.id) {
    window.location.replace("index.html");
}

document.addEventListener("DOMContentLoaded", () => {
    // Seleção de Elementos Modais (Evita erro de undefined)
    const loginModal = document.getElementById("loginModal");
    const registerModal = document.getElementById("registerModal");
    const linkRegister = document.getElementById("linkRegister");
    const linkLogin = document.getElementById("linkLogin");

    /* ============================================================
       2. LÓGICA DE INTERFACE E MODAIS
    ============================================================ */
    
    // Alternar entre Login e Cadastro
    if (linkRegister && loginModal && registerModal) {
        linkRegister.onclick = (e) => {
            e.preventDefault();
            loginModal.classList.remove("active");
            registerModal.classList.add("active");
        };
    }

    if (linkLogin && loginModal && registerModal) {
        linkLogin.onclick = (e) => {
            e.preventDefault();
            registerModal.classList.remove("active");
            loginModal.classList.add("active");
        };
    }

    // Função utilitária para formatar valores em R$
    const money = v =>
        Number(v || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    /* ============================================================
       3. DASHBOARD / RESUMO FINANCEIRO
    ============================================================ */
    async function carregarDashboard(mesFiltro = null, anoFiltro = null) {
        try {
            const hoje = new Date();
            const mes = mesFiltro || (hoje.getMonth() + 1);
            const ano = anoFiltro || hoje.getFullYear();

            const res = await fetch(`${API}/movimentacao/${usuarioLogado.id}/resumo?mes=${mes}&ano=${ano}`);
            if (!res.ok) throw new Error("Erro ao buscar resumo");
            
            const d = await res.json();

            // Atualiza os cards (Verifica se o elemento existe para não travar o script)
            const elEntradas = document.getElementById("card-entradas");
            const elSaidas = document.getElementById("card-saidas");
            const elSaldo = document.getElementById("card-saldo");
            const elMensal = document.getElementById("card-mensal");

            if(elEntradas) elEntradas.innerText = money(d.totalEntradas);
            if(elSaidas) elSaidas.innerText = money(d.totalSaidas);
            if(elSaldo) elSaldo.innerText = money(d.saldo);
            if(elMensal) elMensal.innerText = money(d.totalEntradas);

        } catch (e) {
            console.error("Falha silenciosa no Dashboard");
        }
    }

    /* ============================================================
       4. ADICIONAR MOVIMENTAÇÃO (POST)
    ============================================================ */
    const btnSalvar = document.getElementById("btnSalvarMovimentacao");
    if (btnSalvar) {
        btnSalvar.onclick = async (e) => {
            e.preventDefault();

            const valorInput = document.getElementById("movValor");
            const categoriaInput = document.getElementById("movCategoria");
            const tipoInput = document.getElementById("movTipo");
            const msgFeedback = document.getElementById("msgFeedback");

            if (!valorInput.value || !categoriaInput.value.trim()) {
                if(msgFeedback) {
                    msgFeedback.innerText = "⚠️ Preencha todos os campos!";
                    msgFeedback.style.display = "block";
                }
                return;
            }

            const textoOriginal = btnSalvar.innerHTML;
            btnSalvar.disabled = true;
            btnSalvar.innerHTML = `<span class="spinner"></span> Aguarde...`;

            const tipoFormatado = tipoInput.value.toLowerCase()
                                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            try {
                const response = await fetch(`${API}/movimentacao/adicionar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuarioId: usuarioLogado.id, 
                        tipo: tipoFormatado, 
                        valor: Number(valorInput.value),
                        data: new Date().toISOString(),
                        categoria: categoriaInput.value.trim()
                    })
                });

                if (response.ok) {
                    if(msgFeedback) msgFeedback.innerText = "✅ Salvo com sucesso!";
                    setTimeout(() => window.location.reload(), 1200);
                } else {
                    throw new Error();
                }
            } catch (err) {
                if(msgFeedback) msgFeedback.innerText = "❌ Erro ao salvar.";
                btnSalvar.disabled = false;
                btnSalvar.innerHTML = textoOriginal;
            }
        };
    }

    /* ============================================================
       5. NAVEGAÇÃO SPA (ESTOQUE / HISTÓRICO)
    ============================================================ */
    async function carregarEstoque() {
        const tbody = document.getElementById("lista-estoque");
        if (!tbody) return;

        try {
            const response = await fetch(`${API}/movimentacao/${usuarioLogado.id}`);
            const movimentacoes = await response.json();
            
            tbody.innerHTML = "";
            movimentacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

            movimentacoes.forEach(m => {
                const isEntrada = m.tipo.toLowerCase() === "entrada";
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td style="padding: 12px;">${new Date(m.data).toLocaleDateString('pt-BR')}</td>
                    <td>${m.categoria || '-'}</td>
                    <td><span style="color: ${isEntrada ? '#2ed47a' : '#ff4d4d'}">${m.tipo.toUpperCase()}</span></td>
                    <td style="font-weight: bold;">${money(m.valor)}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error("Erro ao carregar lista");
        }
    }

    // Gerenciador de cliques da Sidebar
    const menuLinks = document.querySelectorAll(".sidebar nav a");
    const pages = document.querySelectorAll(".page");

    menuLinks.forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const pageName = link.textContent.trim().toLowerCase()
                                .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            menuLinks.forEach(l => l.classList.remove("active"));
            pages.forEach(p => p.classList.remove("active"));

            link.classList.add("active");
            const target = document.querySelector(`[data-page="${pageName}"]`);
            
            if (target) {
                target.classList.add("active");
                if (pageName === "historico") carregarEstoque();
                if (pageName === "dashboard") carregarDashboard();
            }
        };
    });

    /* ============================================================
       6. LOGOUT COM MODAL
    ============================================================ */
    const modalLogout = document.getElementById("modalLogout");
    const btnLogout = document.getElementById("btnLogout");
    const btnConfirmarSair = document.getElementById("btnConfirmarSair");
    const btnCancelarSair = document.getElementById("btnCancelarSair");

    if (btnLogout) {
        btnLogout.onclick = (e) => {
            e.preventDefault();
            if(modalLogout) modalLogout.style.display = "flex";
        };
    }

    if (btnConfirmarSair) {
        btnConfirmarSair.onclick = () => {
            localStorage.clear();
            window.location.replace("index.html");
        };
    }

    if (btnCancelarSair) {
        btnCancelarSair.onclick = () => {
            if(modalLogout) modalLogout.style.display = "none";
        };
    }

    // Inicialização
    carregarDashboard();
    carregarEstoque();
});