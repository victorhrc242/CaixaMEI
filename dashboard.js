/* ============================================================
    1. CONFIGURAÇÕES GLOBAIS E SEGURANÇA
============================================================ */
const API = "https://caixamei.onrender.com/api";
const usuarioLogadoStr = localStorage.getItem("usuario");
const usuarioLogado = usuarioLogadoStr ? JSON.parse(usuarioLogadoStr) : null;

if (!usuarioLogado || !usuarioLogado.id) {
    window.location.replace("index.html");
}

document.addEventListener("DOMContentLoaded", () => {
    
    let fluxoChart;

    const money = v =>
        Number(v || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    /* ============================================================
       2. FUNÇÃO DO GRÁFICO
    ============================================================ */
    async function carregarGrafico(mesFiltro = null, anoFiltro = null) {
        const canvas = document.getElementById("fluxoChart");
        if (!canvas || typeof Chart === "undefined") return;

        try {
            const res = await fetch(`${API}/movimentacao/${usuarioLogado.id}`);
            let dados = await res.json();

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
                if (m.tipo.toLowerCase().includes("entrada") || m.tipo.toLowerCase().includes("receita")) {
                    entradas[dia] += m.valor;
                } else {
                    saidas[dia] += m.valor;
                }
            });

            if (fluxoChart) fluxoChart.destroy();

            fluxoChart = new Chart(canvas, {
                type: "line",
                data: {
                    labels: ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"],
                    datasets: [
                        { label: "Entradas", data: entradas, borderColor: "#2ed47a", backgroundColor: "rgba(46, 212, 122, 0.1)", fill: true, tension: 0.4 },
                        { label: "Saídas", data: saidas, borderColor: "#ff4d4d", backgroundColor: "rgba(255, 77, 77, 0.1)", fill: true, tension: 0.4 }
                    ]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#fff' } } },
                    scales: {
                        y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                        x: { ticks: { color: '#aaa' }, grid: { display: false } }
                    }
                }
            });
        } catch (e) { console.error("Erro gráfico:", e); }
    }

    /* ============================================================
       3. DASHBOARD / RESUMO
    ============================================================ */
    async function carregarDashboard(mesFiltro = null, anoFiltro = null) {
        try {
            const hoje = new Date();
            const mes = mesFiltro || (hoje.getMonth() + 1);
            const ano = anoFiltro || hoje.getFullYear();

            const res = await fetch(`${API}/movimentacao/${usuarioLogado.id}/resumo?mes=${mes}&ano=${ano}`);
            const d = await res.json();

            const ids = {
                "card-entradas": d.totalEntradas,
                "card-saidas": d.totalSaidas,
                "card-saldo": d.saldo,
                "card-mensal": d.totalEntradas
            };

            for (const [id, valor] of Object.entries(ids)) {
                const el = document.getElementById(id);
                if (el) el.innerText = money(valor);
            }
        } catch (e) { console.error("Erro dashboard"); }
    }

    /* ============================================================
       4. ADICIONAR MOVIMENTAÇÃO (POST) - ESSA PARTE VOLTOU
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
                if (msgFeedback) {
                    msgFeedback.innerText = "⚠️ Preencha todos os campos!";
                    msgFeedback.style.color = "#ff4d4d";
                    msgFeedback.style.display = "block";
                }
                return;
            }

            const textoOriginal = btnSalvar.innerHTML;
            btnSalvar.disabled = true;
            btnSalvar.innerHTML = `Salvando...`;

            try {
                const tipoFormatado = tipoInput.value.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

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
                    if (msgFeedback) {
                        msgFeedback.innerText = "✅ Movimentação salva!";
                        msgFeedback.style.color = "#2ed47a";
                        msgFeedback.style.display = "block";
                    }
                    setTimeout(() => window.location.reload(), 1000);
                } else { throw new Error(); }
            } catch (err) {
                if (msgFeedback) msgFeedback.innerText = "❌ Erro ao conectar com servidor.";
                btnSalvar.disabled = false;
                btnSalvar.innerHTML = textoOriginal;
            }
        };
    }

    /* ============================================================
       5. HISTÓRICO / ESTOQUE
    ============================================================ */
    /* Variável global para não ficar recriando as opções do filtro toda hora */
let categoriasMapeadas = false;

async function carregarEstoque(categoriaParaFiltrar = "todos") {
    const tbody = document.getElementById("lista-estoque");
    const filtroSelect = document.getElementById("filtro-categoria"); // Certifique-se que o ID no HTML é este
    if (!tbody) return;

    try {
        const response = await fetch(`${API}/movimentacao/${usuarioLogado.id}`);
        let movimentacoes = await response.json();

        // 1. MAPEIA CATEGORIAS ÚNICAS PARA O SELECT
        if (!categoriasMapeadas && filtroSelect) {
            // Pega apenas os nomes das categorias, remove nulos e duplicados
            const categoriasUnicas = [...new Set(movimentacoes.map(m => m.categoria).filter(c => c))];
            
            filtroSelect.innerHTML = '<option value="todos">Todas as Categorias</option>';
            categoriasUnicas.sort().forEach(cat => {
                const option = document.createElement("option");
                option.value = cat;
                option.textContent = cat;
                filtroSelect.appendChild(option);
            });
            categoriasMapeadas = true;
        }

        // 2. APLICA O FILTRO POR CATEGORIA
        if (categoriaParaFiltrar !== "todos") {
            movimentacoes = movimentacoes.filter(m => m.categoria === categoriaParaFiltrar);
        }

        // 3. RENDERIZA A TABELA
        tbody.innerHTML = "";
        movimentacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

        movimentacoes.forEach(m => {
            const isEntrada = m.tipo.toLowerCase().includes("entrada") || m.tipo.toLowerCase().includes("receita");
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
        console.error("Erro ao carregar histórico:", err); 
    }
}

/* ============================================================
   AJUSTE NO ESCUTADOR DO FILTRO (Colocar dentro do DOMContentLoaded)
============================================================ */
const filtroCategoriaElement = document.getElementById("filtro-categoria");
if (filtroCategoriaElement) {
    filtroCategoriaElement.onchange = (e) => {
        carregarEstoque(e.target.value);
    };
}

    /* ============================================================
       6. FILTROS E NAVEGAÇÃO
    ============================================================ */
    const btnFiltrar = document.getElementById("btnFiltrar");
    if (btnFiltrar) {
        btnFiltrar.onclick = () => {
            const mes = document.getElementById("filtro-mes").value;
            const ano = document.getElementById("filtro-ano").value;
            carregarDashboard(mes, ano);
            carregarGrafico(mes, ano);
        };
    }

    const menuLinks = document.querySelectorAll(".sidebar nav a");
    const pages = document.querySelectorAll(".page");

    menuLinks.forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const pageName = link.textContent.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            menuLinks.forEach(l => l.classList.remove("active"));
            pages.forEach(p => p.classList.remove("active"));

            link.classList.add("active");
            const target = document.querySelector(`[data-page="${pageName}"]`);
            
            if (target) {
                target.classList.add("active");
                if (pageName === "historico") carregarEstoque();
                if (pageName === "dashboard" || pageName === "adicionar") {
                    carregarDashboard();
                    carregarGrafico();
                }
            }
        };
    });

    // Logout
    const btnConfirmarSair = document.getElementById("btnConfirmarSair");
    if (btnConfirmarSair) {
        btnConfirmarSair.onclick = () => {
            localStorage.clear();
            window.location.replace("index.html");
        };
    }

    // Inicialização
    carregarDashboard();
    carregarGrafico();
    carregarEstoque();
});