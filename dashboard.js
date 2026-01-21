// 1. Configurações Globais e Verificação de Login
const API = "https://caixamei.onrender.com/api";
const usuarioLogadoStr = localStorage.getItem("usuario");
const usuarioLogado = JSON.parse(usuarioLogadoStr);

// Redireciona imediatamente se não houver usuário (segurança básica de navegação)
if (!usuarioLogado || !usuarioLogado.id) {
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    // Se por algum motivo o listener disparar sem usuário, aborta
    if (!usuarioLogado) return;
    
    console.log("Sistema iniciado para o Usuário ID:", usuarioLogado.id);

    // Função utilitária para formatar valores em R$
    const money = v =>
        Number(v || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    /* ============================================================
       1. CONTROLE DE FILTROS (DASHBOARD)
    ============================================================ */
    const selectMes = document.getElementById("filtro-mes");
    const selectAno = document.getElementById("filtro-ano");
    const btnFiltrar = document.getElementById("btnFiltrar");

    // Define mês e ano atual nos selects ao carregar
    const dataAtual = new Date();
    if (selectMes) selectMes.value = dataAtual.getMonth() + 1;
    if (selectAno) selectAno.value = dataAtual.getFullYear();

    if (btnFiltrar) {
        btnFiltrar.onclick = () => {
            const mes = selectMes.value;
            const ano = selectAno.value;
            carregarDashboard(mes, ano);
            carregarGrafico(mes, ano);
        };
    }

   /* ============================================================
   2. ADICIONAR NOVA MOVIMENTAÇÃO (POST)
============================================================ */
const btnSalvar = document.getElementById("btnSalvarMovimentacao");

if (btnSalvar) {
    btnSalvar.onclick = async (e) => {
        // Previne comportamento padrão caso seja um form
        if(e) e.preventDefault();

        const valorInput = document.getElementById("movValor");
        const categoriaInput = document.getElementById("movCategoria");
        const tipoInput = document.getElementById("movTipo");
        const msgFeedback = document.getElementById("msgFeedback");

        // Validação básica
        if (!valorInput.value || !categoriaInput.value.trim()) {
            msgFeedback.innerText = "⚠️ Preencha todos os campos!";
            msgFeedback.style.color = "#ff4d4d";
            msgFeedback.style.display = "block";
            return;
        }

        // --- ESTADO DE CARREGAMENTO (SPINNER) ---
        const textoOriginal = btnSalvar.innerHTML;
        btnSalvar.disabled = true;
        btnSalvar.innerHTML = `<span class="spinner"></span> Salvando...`;
        msgFeedback.style.display = "none"; // Limpa mensagens anteriores

        const dataAgora = new Date().toISOString();

        // Tratamento do tipo (Remove acentos: Saída -> saida)
        const tipoFormatado = tipoInput.value.toLowerCase()
                                .normalize("NFD")
                                .replace(/[\u0300-\u036f]/g, "");

        // Montagem do Objeto (Verifique se o seu C# espera usuarioId ou UsuarioId)
        const dadosMovimentacao = {
            usuarioId: usuarioLogado.id, 
            tipo: tipoFormatado, 
            valor: Number(valorInput.value),
            data: dataAgora,
            categoria: categoriaInput.value.trim(),
            createdAt: dataAgora
        };

        console.log("Enviando para API:", dadosMovimentacao);

        try {
            const response = await fetch(`${API}/movimentacao/adicionar`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosMovimentacao)
            });

            if (response.ok) {
                msgFeedback.innerText = "✅ Sucesso! Atualizando...";
                msgFeedback.style.color = "#2ecc71";
                msgFeedback.style.display = "block";

                // Limpa campos para uma sensação de "limpeza"
                valorInput.value = "";
                categoriaInput.value = "";

                // Aguarda 1.5s para o usuário ler o sucesso antes de recarregar
                setTimeout(() => {
                    window.location.reload();
                }, 1500);

            } else {
                const erroTexto = await response.text();
                console.error("Detalhe do Erro 500:", erroTexto);
                throw new Error("Erro no servidor. Verifique os dados.");
            }

        } catch (err) {
            console.error(err);
            msgFeedback.innerText = `❌ Erro: ${err.message}`;
            msgFeedback.style.color = "#ff4d4d";
            msgFeedback.style.display = "block";

            // Restaura o botão em caso de erro para o usuário tentar novamente
            btnSalvar.disabled = false;
            btnSalvar.innerHTML = textoOriginal;
        }
    };
}
    /* ============================================================
       3. DASHBOARD / RESUMO FINANCEIRO
    ============================================================ */
    async function carregarDashboard(mesFiltro = null, anoFiltro = null) {
        try {
            const hoje = new Date();
            const mes = mesFiltro || (hoje.getMonth() + 1);
            const ano = anoFiltro || hoje.getFullYear();

            const res = await fetch(`${API}/movimentacao/${usuarioLogado.id}/resumo?mes=${mes}&ano=${ano}`);
            if (!res.ok) throw new Error("Não foi possível carregar o resumo.");
            
            const d = await res.json();

            // Atualiza os cards no HTML
            document.getElementById("card-entradas").innerText = money(d.totalEntradas);
            document.getElementById("card-saidas").innerText = money(d.totalSaidas);
            document.getElementById("card-saldo").innerText = money(d.saldo);
            document.getElementById("card-mensal").innerText = money(d.totalEntradas);

        } catch (e) {
            console.error("Erro Dashboard:", e);
        }
    }

    /* ============================================================
       4. GRÁFICO DE FLUXO (CHART.JS)
    ============================================================ */
    let fluxoChart;
    async function carregarGrafico(mesFiltro = null, anoFiltro = null) {
        const canvas = document.getElementById("fluxoChart");
        if (!canvas || typeof Chart === "undefined") return;

        try {
            const res = await fetch(`${API}/movimentacao/${usuarioLogado.id}`);
            let dados = await res.json();

            // Filtra os dados para o gráfico se houver filtro ativo
            if (mesFiltro && anoFiltro) {
                dados = dados.filter(m => {
                    const d = new Date(m.data);
                    return (d.getMonth() + 1) == mesFiltro && d.getFullYear() == anoFiltro;
                });
            }

            const entradas = Array(7).fill(0);
            const saidas = Array(7).fill(0);

            dados.forEach(m => {
                const dia = new Date(m.data).getDay();
                if (m.tipo.toLowerCase() === "entrada") entradas[dia] += m.valor;
                else saidas[dia] += m.valor;
            });

            if (fluxoChart) fluxoChart.destroy();

            fluxoChart = new Chart(canvas, {
                type: "line",
                data: {
                    labels: ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"],
                    datasets: [
                        { 
                            label: "Entradas", 
                            data: entradas, 
                            borderColor: "#2ed47a", 
                            backgroundColor: "rgba(46, 212, 122, 0.1)", 
                            fill: true, 
                            tension: 0.4 
                        },
                        { 
                            label: "Saídas", 
                            data: saidas, 
                            borderColor: "#ff4d4d", 
                            backgroundColor: "rgba(255, 77, 77, 0.1)", 
                            fill: true, 
                            tension: 0.4 
                        }
                    ]
                },
                options: { responsive: true }
            });
        } catch (e) {
            console.error("Erro Gráfico:", e);
        }
    }

    /* ============================================================
       5. HISTÓRICO / ESTOQUE
    ============================================================ */
    async function carregarEstoque() {
        const tbody = document.getElementById("lista-estoque");
        const selectCategoria = document.getElementById("filtro-categoria");
        if (!tbody) return;

        try {
            const response = await fetch(`${API}/movimentacao/${usuarioLogado.id}`);
            console.log(usuarioLogado.id+"aqui ta passando seu troxa");
            const movimentacoes = await response.json();
            
            // Preenche categorias no select de filtro (sem duplicatas)
            const cats = [...new Set(movimentacoes.map(m => m.categoria))].filter(Boolean);
            if (selectCategoria && selectCategoria.options.length <= 1) {
                cats.forEach(c => {
                    const opt = document.createElement("option");
                    opt.value = c.toLowerCase();
                    opt.textContent = c;
                    selectCategoria.appendChild(opt);
                });
                selectCategoria.onchange = () => renderizarTabela(movimentacoes);
                console.log(movimentacoes)
            }

            function renderizarTabela(lista) {
                const filtro = selectCategoria?.value || "todas";
                tbody.innerHTML = "";

                const filtrados = filtro === "todas" 
                    ? lista 
                    : lista.filter(m => m.categoria?.toLowerCase() === filtro);

                filtrados.sort((a, b) => new Date(b.data) - new Date(a.data));

                filtrados.forEach(m => {
                    const isEntrada = m.tipo.toLowerCase() === "entrada";
                    const tr = document.createElement("tr");
                    tr.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
                    tr.innerHTML = `
                        <td style="padding: 15px;">${new Date(m.data).toLocaleDateString('pt-BR')}</td>
                        <td style="padding: 15px; text-transform: capitalize;">${m.categoria || '-'}</td>
                        <td style="padding: 15px;">
                            <span style="color: ${isEntrada ? '#2ed47a' : '#ff4d4d'}">${m.tipo.toUpperCase()}</span>
                        </td>
                        <td style="padding: 15px; font-weight: bold;">${money(m.valor)}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
            renderizarTabela(movimentacoes);

        } catch (err) {
            console.error("Erro Tabela:", err);
        }
    }

    /* ============================================================
       6. NAVEGAÇÃO ENTRE PÁGINAS (SPA)
    ============================================================ */
    const menuLinks = document.querySelectorAll(".sidebar nav a");
    const pages = document.querySelectorAll(".page");

    menuLinks.forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            
            // Nome da página baseado no texto do link (normalizado)
            const pageName = link.textContent.trim().toLowerCase()
                                .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            menuLinks.forEach(l => l.classList.remove("active"));
            pages.forEach(p => p.classList.remove("active"));

            link.classList.add("active");
            const target = document.querySelector(`[data-page="${pageName}"]`);
            
            if (target) {
                target.classList.add("active");
                // Carregamento sob demanda
                if (pageName === "historico") carregarEstoque();
                if (pageName === "dashboard") carregarDashboard();
                if (pageName === "addmovim") carregarDashboard();
            }
        };
    });
// Lógica de Logout
// Seleção de elementos do Modal
const modalLogout = document.getElementById("modalLogout");
const btnLogout = document.getElementById("btnLogout");
const btnConfirmarSair = document.getElementById("btnConfirmarSair");
const btnCancelarSair = document.getElementById("btnCancelarSair");

// 1. Abre o modal ao clicar em "Sair"
if (btnLogout) {
    btnLogout.onclick = (e) => {
        e.preventDefault();
        modalLogout.style.display = "flex";
    };
}

// 2. Fecha o modal se clicar em "Cancelar"
if (btnCancelarSair) {
    btnCancelarSair.onclick = () => {
        modalLogout.style.display = "none";
    };
}

// 3. Executa o logout se clicar em "Sim, Sair"
if (btnConfirmarSair) {
    btnConfirmarSair.onclick = () => {
        localStorage.removeItem("usuario");
        window.location.href = "index.html";
    };
}

// 4. Fecha o modal se o usuário clicar fora da caixa branca (no fundo escuro)
window.onclick = (event) => {
    if (event.target == modalLogout) {
        modalLogout.style.display = "none";
    }
};
    // Chamadas iniciais
    carregarDashboard();
    carregarGrafico();
    carregarEstoque(); 
});