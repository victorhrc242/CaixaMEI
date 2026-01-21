document.addEventListener("DOMContentLoaded", () => {
    
    // URL BASE
    const API_BASE_URL = "https://caixamei.onrender.com/api";

    // Seleção de Elementos
    const loginModal = document.getElementById("loginModal");
    const registerModal = document.getElementById("registerModal");
    const btnOpenLogin = document.getElementById("btnOpenLogin");
    const fecharLogin = document.getElementById("fecharLogin");
    const fecharRegister = document.getElementById("fecharRegister");
    const linkRegister = document.getElementById("linkRegister");
    const linkLogin = document.getElementById("linkLogin");
    const btnRegister = document.getElementById("btnRegister");
    const btnLogin = document.getElementById("btnLogin");
    
    const senhaLogin = document.getElementById("senhaLogin");
    const senhaRegister = document.getElementById("senhaRegister");

    // Função para exibir feedback (Erro/Sucesso)
    function exibirErro(modal, mensagem, sucesso = false) {
        let msgElemento = modal.querySelector(".mensagem-feedback");
        
        if (!msgElemento) {
            msgElemento = document.createElement("p");
            msgElemento.className = "mensagem-feedback";
            msgElemento.style.fontSize = "14px";
            msgElemento.style.marginTop = "10px";
            msgElemento.style.textAlign = "center";
            const form = modal.querySelector(".login-box");
            form.insertBefore(msgElemento, form.querySelector("button"));
        }

        msgElemento.innerText = mensagem;
        msgElemento.style.color = sucesso ? "#2ecc71" : "#ff4d4d";
        msgElemento.style.display = "block";

        setTimeout(() => {
            msgElemento.style.display = "none";
        }, 5000);
    }

    // Gerenciamento de Interface e Redirecionamento
    function atualizarInterfaceUsuario() {
        const usuarioLogado = localStorage.getItem("usuario");
        
        if (usuarioLogado) {
            if (!window.location.pathname.includes("dashboard.html")) {
                window.location.href = "dashboard.html";
                return; 
            }
            btnOpenLogin.innerText = "Logout";
            btnOpenLogin.style.backgroundColor = "#ff4d4d";
            btnOpenLogin.onclick = (e) => { e.preventDefault(); logout(); };
            carregarDashboard(); 
        } else {
            if (window.location.pathname.includes("dashboard.html")) {
                window.location.href = "index.html";
            }
            btnOpenLogin.innerText = "Fazer login";
            btnOpenLogin.onclick = () => loginModal.classList.add("active");
        }
    }

    function logout() {
        localStorage.removeItem("usuario");
        window.location.href = "index.html"; 
    }

    // --- LÓGICA DE LOGIN COM SPINNER ---
    if (btnLogin) {
        btnLogin.onclick = async (e) => { 
            e.preventDefault();
            const email = document.getElementById("emailLogin").value.trim();
            const senha = document.getElementById("senhaLogin").value.trim();

            if (!email || !senha) {
                exibirErro(loginModal, "Informe email e senha.");
                return;
            }

            // Estado de Carregamento
            const textoOriginal = btnLogin.innerHTML;
            btnLogin.disabled = true;
            btnLogin.innerHTML = `<span class="spinner"></span> Entrando...`;

            try {
                const response = await fetch(`${API_BASE_URL}/Usuario/fazer_login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ Email: email, Senha: senha }) 
                });

                if (!response.ok) {
                    const erroTexto = await response.text();
                    throw new Error(erroTexto || "Email ou senha incorretos.");
                }

                const usuario = await response.json();
                localStorage.setItem("usuario", JSON.stringify(usuario));
                
                loginModal.classList.remove("active");
                window.location.href = "dashboard.html"; 

            } catch (err) {
                exibirErro(loginModal, err.message);
                btnLogin.disabled = false;
                btnLogin.innerHTML = textoOriginal;
                document.getElementById("senhaLogin").value = ""; // Limpa senha por segurança
            }
        };
    }

    // --- LÓGICA DE CADASTRO COM SPINNER ---
    if (btnRegister) {
        btnRegister.onclick = async (e) => {
            e.preventDefault();

            const nome = document.getElementById("nome").value.trim();
            const email = document.getElementById("emailRegister").value.trim();
            const senha = document.getElementById("senhaRegister").value.trim();
            const confirmarSenha = document.getElementById("confirmarSenhaRegister").value.trim();
            const dataNascimentoInput = document.getElementById("dataNascimento").value.trim();

            if (!nome || !email || !senha || !confirmarSenha || !dataNascimentoInput) {
                exibirErro(registerModal, "Preencha todos os campos.");
                return;
            }

            if (senha !== confirmarSenha) {
                exibirErro(registerModal, "As senhas não coincidem!");
                return;
            }

            // Estado de Carregamento
            const textoOriginal = btnRegister.innerHTML;
            btnRegister.disabled = true;
            btnRegister.innerHTML = `<span class="spinner"></span> Criando conta...`;

            // Formatação de Data
            let dataFormatada = dataNascimentoInput.includes("-") ? 
                dataNascimentoInput : 
                `${dataNascimentoInput.substring(4, 8)}-${dataNascimentoInput.substring(2, 4)}-${dataNascimentoInput.substring(0, 2)}`;

            const dadosCadastro = {
                nome: nome,
                email: email,
                senha: senha,
                comfirmarsenha: confirmarSenha,
                dataNascimento: dataFormatada 
            };

            try {
                const response = await fetch(`${API_BASE_URL}/Usuario/CadastrarUsuario`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(dadosCadastro)
                });

                const respostaTexto = await response.text();

                if (response.ok) {
                    exibirErro(registerModal, "Conta criada! Redirecionando...", true);
                    setTimeout(() => {
                        registerModal.classList.remove("active");
                        loginModal.classList.add("active");
                        btnRegister.disabled = false;
                        btnRegister.innerHTML = textoOriginal;
                    }, 2000);
                } else {
                    throw new Error(respostaTexto || "Erro no cadastro.");
                }
            } catch (err) {
                exibirErro(registerModal, err.message);
                btnRegister.disabled = false;
                btnRegister.innerHTML = textoOriginal;
            }
        };
    }

    // Carregamento do Dashboard
    async function carregarDashboard() {
        const usuarioLogadoStr = localStorage.getItem("usuario");
        if (!usuarioLogadoStr) return;
        
        const usuarioLogado = JSON.parse(usuarioLogadoStr);
        const listaContainer = document.getElementById("lista");
        if (!listaContainer) return;

        try {
            const response = await fetch(`${API_BASE_URL}/movimentacao/${usuarioLogado.id}`);
            if (!response.ok) throw new Error("Erro ao buscar dados.");

            const movimentacoes = await response.json();
            
            if (movimentacoes.length === 0) {
                listaContainer.innerHTML = "<p style='text-align:center; padding:20px;'>Nenhuma movimentação encontrada.</p>";
                return;
            }

            let html = `<div class="financeiro-resumo">
                            <h3>Suas últimas movimentações</h3>
                            <table>
                                <thead>
                                    <tr><th>Data</th><th>Tipo</th><th>Valor</th></tr>
                                </thead>
                                <tbody>`;

            movimentacoes.forEach(mov => {
                const cor = (mov.Tipo.toLowerCase().includes("receita") || mov.Tipo.toLowerCase().includes("entrada")) ? "#2ecc71" : "#ff4d4d";
                html += `<tr>
                            <td>${new Date(mov.Data).toLocaleDateString('pt-BR')}</td>
                            <td>${mov.Tipo}</td>
                            <td style="color: ${cor}; font-weight: bold;">R$ ${mov.Valor.toFixed(2)}</td>
                         </tr>`;
            });

            html += `</tbody></table></div>`;
            listaContainer.innerHTML = html;

        } catch (err) {
            console.error("Erro dashboard:", err);
        }
    }

    // Controles de Visibilidade de Senha e Modais (Seu código original mantido)
    if (fecharLogin) fecharLogin.onclick = () => loginModal.classList.remove("active");
    if (fecharRegister) fecharRegister.onclick = () => registerModal.classList.remove("active");
    
    atualizarInterfaceUsuario();
});