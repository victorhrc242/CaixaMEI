document.addEventListener("DOMContentLoaded", () => {
    
    // URL BASE - Em produção, idealmente via variável de ambiente, mas mantida conforme solicitado
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

    // --- LÓGICA DE ALTERNÂNCIA DE MODAIS (CORREÇÃO DE PRODUÇÃO) ---
    if (linkRegister) {
        linkRegister.addEventListener("click", (e) => {
            e.preventDefault();
            loginModal.classList.remove("active");
            registerModal.classList.add("active");
        });
    }

    if (linkLogin) {
        linkLogin.addEventListener("click", (e) => {
            e.preventDefault();
            registerModal.classList.remove("active");
            loginModal.classList.add("active");
        });
    }

    // Fechar ao clicar fora do box
    window.addEventListener("click", (e) => {
        if (e.target === loginModal) loginModal.classList.remove("active");
        if (e.target === registerModal) registerModal.classList.remove("active");
    });

    // Função para exibir feedback (Erro/Sucesso)
    function exibirErro(modal, mensagem, sucesso = false) {
        let msgElemento = modal.querySelector(".mensagem-feedback");
        
        if (!msgElemento) {
            msgElemento = document.createElement("p");
            msgElemento.className = "mensagem-feedback";
            msgElemento.style.cssText = "font-size: 14px; margin-top: 10px; text-align: center;";
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

    // --- SEGURANÇA E REDIRECIONAMENTO ---
    function atualizarInterfaceUsuario() {
        const usuarioLogado = localStorage.getItem("usuario");
        const isDashboard = window.location.pathname.includes("dashboard.html");

        if (usuarioLogado) {
            // Se estiver logado e na home, manda pro Dashboard
            if (!isDashboard) {
                window.location.replace("dashboard.html");
                return;
            }
            if (btnOpenLogin) {
                btnOpenLogin.innerText = "Sair";
                btnOpenLogin.style.backgroundColor = "#ff4d4d";
                btnOpenLogin.onclick = (e) => { e.preventDefault(); logout(); };
            }
            carregarDashboard();
        } else {
            // Se não estiver logado e tentar ver o Dashboard, manda pro Login
            if (isDashboard) {
                window.location.replace("index.html");
                return;
            }
            if (btnOpenLogin) {
                btnOpenLogin.onclick = () => loginModal.classList.add("active");
            }
        }
    }

    function logout() {
        localStorage.clear(); // Limpa tudo por segurança
        window.location.replace("index.html");
    }

    // --- LÓGICA DE LOGIN ---
    if (btnLogin) {
        btnLogin.onclick = async (e) => { 
            e.preventDefault();
            const email = document.getElementById("emailLogin").value.trim();
            const senha = document.getElementById("senhaLogin").value.trim();

            if (!email || !senha) {
                exibirErro(loginModal, "Informe email e senha.");
                return;
            }

            const textoOriginal = btnLogin.innerHTML;
            btnLogin.disabled = true;
            btnLogin.innerHTML = `<span class="spinner"></span> Aguarde...`;

            try {
                const response = await fetch(`${API_BASE_URL}/Usuario/fazer_login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ Email: email, Senha: senha }) 
                });

                if (!response.ok) throw new Error("Credenciais inválidas ou erro no servidor.");

                const usuario = await response.json();
                localStorage.setItem("usuario", JSON.stringify(usuario));
                
                window.location.replace("dashboard.html");

            } catch (err) {
                exibirErro(loginModal, "Falha no login. Verifique seus dados.");
                console.error("Auth Error"); // Log genérico para segurança
                btnLogin.disabled = false;
                btnLogin.innerHTML = textoOriginal;
            }
        };
    }

    // --- LÓGICA DE CADASTRO ---
    if (btnRegister) {
        btnRegister.onclick = async (e) => {
            e.preventDefault();
            const nome = document.getElementById("nome").value.trim();
            const email = document.getElementById("emailRegister").value.trim();
            const senha = document.getElementById("senhaRegister").value.trim();
            const confirmarSenha = document.getElementById("confirmarSenhaRegister").value.trim();
            const dataNasc = document.getElementById("dataNascimento").value;

            if (!nome || !email || !senha || senha !== confirmarSenha) {
                exibirErro(registerModal, "Verifique os campos e a senha.");
                return;
            }

            btnRegister.disabled = true;
            const textoOriginal = btnRegister.innerHTML;
            btnRegister.innerHTML = `Criando...`;

            try {
                const response = await fetch(`${API_BASE_URL}/Usuario/CadastrarUsuario`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nome, email, senha,
                        comfirmarsenha: confirmarSenha,
                        dataNascimento: dataNasc
                    })
                });

                if (!response.ok) throw new Error();

                exibirErro(registerModal, "Sucesso! Faça login.", true);
                setTimeout(() => {
                    registerModal.classList.remove("active");
                    loginModal.classList.add("active");
                }, 2000);
            } catch (err) {
                exibirErro(registerModal, "Erro ao cadastrar. Tente outro email.");
            } finally {
                btnRegister.disabled = false;
                btnRegister.innerHTML = textoOriginal;
            }
        };
    }

    async function carregarDashboard() {
        const usuarioStr = localStorage.getItem("usuario");
        if (!usuarioStr) return;
        
        const user = JSON.parse(usuarioStr);
        const container = document.getElementById("lista");
        if (!container) return;

        try {
            const res = await fetch(`${API_BASE_URL}/movimentacao/${user.id}`);
            if (!res.ok) return;
            const dados = await res.json();
            
            if (dados.length === 0) {
                container.innerHTML = "<p>Sem movimentações.</p>";
                return;
            }

            let html = `<div class="financeiro-resumo"><table><thead><tr><th>Data</th><th>Tipo</th><th>Valor</th></tr></thead><tbody>`;
            dados.forEach(mov => {
                const isEntrada = mov.Tipo.toLowerCase().includes("receita") || mov.Tipo.toLowerCase().includes("entrada");
                html += `<tr>
                    <td>${new Date(mov.Data).toLocaleDateString('pt-BR')}</td>
                    <td>${mov.Tipo}</td>
                    <td style="color: ${isEntrada ? '#2ecc71' : '#ff4d4d'}; font-weight:bold;">R$ ${mov.Valor.toFixed(2)}</td>
                </tr>`;
            });
            container.innerHTML = html + `</tbody></table></div>`;
        } catch (e) {
            container.innerHTML = "<p>Erro ao carregar dados.</p>";
        }
    }

    if (fecharLogin) fecharLogin.onclick = () => loginModal.classList.remove("active");
    if (fecharRegister) fecharRegister.onclick = () => registerModal.classList.remove("active");
    
    atualizarInterfaceUsuario();
});