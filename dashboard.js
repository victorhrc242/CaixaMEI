const API = "http://localhost:5142/api";
const usuarioId = localStorage.getItem("usuarioId");

if (!usuarioId) {
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {

  
  const money = v =>
    Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

  /* ===============================
     DASHBOARD / RESUMO
  =============================== */
  async function carregarDashboard() { 
    try {
      const hoje = new Date();
      const mes = hoje.getMonth() + 1;
      const ano = hoje.getFullYear();

      const res = await fetch(
        `${API}/movimentacao/${usuarioId}/resumo?mes=${mes}&ano=${ano}`
      );

      const d = await res.json();

      document.getElementById("card-entradas").innerText = money(d.totalEntradas);
      document.getElementById("card-saidas").innerText   = money(d.totalSaidas);
      document.getElementById("card-saldo").innerText    = money(d.saldo);
      document.getElementById("card-mensal").innerText   = money(d.totalEntradas);
    } catch (e) {
      console.error("Erro no resumo:", e);
    }
  }

  /* ===============================
     GRÁFICO FLUXO
  =============================== */
  let fluxoChart;

  async function carregarGrafico() {
    const canvas = document.getElementById("fluxoChart");
    if (!canvas || typeof Chart === "undefined") return;

    try {
      const res = await fetch(`${API}/movimentacao/${usuarioId}`);
      const dados = await res.json();

      const entradas = Array(7).fill(0);
      const saidas   = Array(7).fill(0);

      dados.forEach(m => {
        const dia = new Date(m.data).getDay();
        if (m.tipo === "entrada") entradas[dia] += m.valor;
        else saidas[dia] += m.valor;
      });

      if (fluxoChart) fluxoChart.destroy();

      fluxoChart = new Chart(canvas, {
        type: "line",
        data: {
          labels: ["DOM","SEG","TER","QUA","QUI","SEX","SÁB"],
          datasets: [
            {
              label: "Entradas",
              data: entradas,
              borderColor: "#2ed47a",
              tension: 0.4
            },
            {
              label: "Saídas",
              data: saidas,
              borderColor: "#ff4d4d",
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: true } }
        }
      });
    } catch (e) {
      console.error("Erro no gráfico:", e);
    }
  }

  /* ===============================
     MENU LATERAL
  =============================== */
  const layout = document.querySelector(".layout");
  document.querySelector(".menu-toggle")?.addEventListener("click", () => {
    layout.classList.toggle("closed");
  });

  /* ===============================
     NAVEGAÇÃO
  =============================== */
  const menuLinks = document.querySelectorAll(".sidebar nav a");
  const pages = document.querySelectorAll(".page");

  menuLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();

      menuLinks.forEach(l => l.classList.remove("active"));
      pages.forEach(p => p.classList.remove("active"));

      link.classList.add("active");

      const page = link.textContent
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      document
        .querySelector(`[data-page="${page}"]`)
        ?.classList.add("active");
    });
  });

  /* ===============================
     TAREFAS (LOCAL)
  =============================== */
  const tarefas = JSON.parse(localStorage.getItem("tarefas") || "[]");
  const listaTarefas = document.getElementById("listaTarefas");
  const inputTarefa = document.getElementById("novaTarefa");

  function renderTarefas() {
    listaTarefas.innerHTML = "";
    tarefas.forEach((t, i) => {
      listaTarefas.innerHTML += `
        <li>
          <span>${t}</span>
          <button onclick="removerTarefa(${i})">✕</button>
        </li>
      `;
    });
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
  }

  window.removerTarefa = i => {
    tarefas.splice(i, 1);
    renderTarefas();
  };

  document.getElementById("addTarefa")?.addEventListener("click", () => {
    if (!inputTarefa.value.trim()) return;
    tarefas.unshift(inputTarefa.value);
    inputTarefa.value = "";
    renderTarefas();
  });

  /* ===============================
     RELATÓRIOS (LOCAL)
  =============================== */
  const relatorios = JSON.parse(localStorage.getItem("relatorios") || "[]");
  const listaRelatorios = document.getElementById("listaRelatorios");

  function renderRelatorios() {
    listaRelatorios.innerHTML = "";
    relatorios.forEach(r => {
      listaRelatorios.innerHTML += `
        <li>
          <small>${r.data}</small><br>${r.texto}
        </li>
      `;
    });
    localStorage.setItem("relatorios", JSON.stringify(relatorios));
  }

  document.getElementById("saveRelatorio")?.addEventListener("click", () => {
    const txt = document.querySelector(".relatorio");
    if (!txt.value.trim()) return;

    relatorios.unshift({
      texto: txt.value,
      data: new Date().toLocaleDateString("pt-BR")
    });

    txt.value = "";
    txt.style.display = "none";
    document.querySelector(".relatorio-buttons").style.display = "none";
    document.getElementById("addRelatorio").style.display = "block";

    renderRelatorios();
  });

  document.getElementById("cancelRelatorio")?.addEventListener("click", () => {
    document.querySelector(".relatorio").style.display = "none";
    document.querySelector(".relatorio-buttons").style.display = "none";
    document.getElementById("addRelatorio").style.display = "block";
  });

  document.getElementById("addRelatorio")?.addEventListener("click", () => {
    document.querySelector(".relatorio").style.display = "block";
    document.querySelector(".relatorio-buttons").style.display = "flex";
    document.getElementById("addRelatorio").style.display = "none";
  });

  /* INIT */
  carregarDashboard();
  carregarGrafico();
  renderTarefas();
  renderRelatorios();
});
