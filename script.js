document.addEventListener("DOMContentLoaded", () => {
    
    // url
    const API_BASE_URL = "http://localhost:5142/api/Usuario";

    
    const loginModal = document.getElementById("loginModal");
    const registerModal = document.getElementById("registerModal");
    const btnOpenLogin = document.getElementById("btnOpenLogin");
    const fecharLogin = document.getElementById("fecharLogin");
    const fecharRegister = document.getElementById("fecharRegister");
    const linkRegister = document.getElementById("linkRegister");
    const linkLogin = document.getElementById("linkLogin");
    const btnRegister = document.getElementById("btnRegister");
    
    // input senha
    const senhaLogin = document.getElementById("senhaLogin");
    const senhaRegister = document.getElementById("senhaRegister");

    
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

    // validacoes
    const validarSenhaForte = (senha) => {
        return senha.length >= 8 && /[A-Z]/.test(senha) && /[a-z]/.test(senha) && /[0-9]/.test(senha) && /[\W_]/.test(senha);
    };

    // interface/logout
    function atualizarInterfaceUsuario() {
        const usuarioLogado = localStorage.getItem("usuario");
        
        if (usuarioLogado) {
            btnOpenLogin.innerText = "Logout";
            btnOpenLogin.style.backgroundColor = "#ff4d4d";
            btnOpenLogin.onclick = (e) => { e.preventDefault(); logout(); };
            carregarDashboard(); 
        } else {
            btnOpenLogin.innerText = "Fazer login";
            btnOpenLogin.style.backgroundColor = "";
            btnOpenLogin.onclick = () => loginModal.classList.add("active");
            const lista = document.getElementById("lista");
            if(lista) lista.innerHTML = "";
        }
    }

    function logout() {
        localStorage.removeItem("usuario");
        window.location.reload(); 
    }

    // login
    const btnLogin = document.getElementById("btnLogin");
    if (btnLogin) {
        btnLogin.onclick = async (e) => { 
            e.preventDefault();
            const email = document.getElementById("emailLogin").value.trim();
            const senha = document.getElementById("senhaLogin").value.trim();

            try {
                const response = await fetch(`${API_BASE_URL}/fazer_login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ Email: email, Senha: senha }) 
                });

                if (!response.ok) {
                    const erroTexto = await response.text();
                    throw new Error(erroTexto || "Falha no login");
                }

                const usuario = await response.json();
                localStorage.setItem("usuario", JSON.stringify(usuario));
                
                loginModal.classList.remove("active");
                window.location.reload(); 

            } catch (err) {
                exibirErro(loginModal, err.message);
            }
        };
    }

    // cdstr
    
  btnRegister.onclick = async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("emailRegister").value.trim();
    const senha = document.getElementById("senhaRegister").value.trim();

    if (!validarSenhaForte(senha)) {
        exibirErro(registerModal, "Senha fraca! Use 8 caracteres, maiúsculas, números e símbolos.");
        return;
    }

    const dadosCadastro = {
        Nome: nome,
        Email: email,
        Senha: senha,
        comfirmarsenha: senha, 
        DataNascimento: "2000-01-01T00:00:00Z"
    };

   try {
    const response = await fetch(`${API_BASE_URL}/CadastrarUsuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosCadastro)
    });

    const erroTexto = await response.text();

    if (!response.ok) {
        if (erroTexto.includes("<!DOCTYPE html>")) {
            throw new Error("Erro interno no servidor. Veja o terminal da API.");
        }
        throw new Error(erroTexto || "Erro ao processar cadastro.");
    }

    exibirErro(registerModal, "Conta criada! Redirecionando...", true);
    setTimeout(() => {
        registerModal.classList.remove("active");
        loginModal.classList.add("active");
    }, 2000);

} catch (err) {
    exibirErro(registerModal, err.message);
}

};

    // dash
    async function carregarDashboard() {
        const usuarioLogadoStr = localStorage.getItem("usuario");
        if (!usuarioLogadoStr) return;
        const usuarioLogado = JSON.parse(usuarioLogadoStr);
        const listaContainer = document.getElementById("lista");
        if (!listaContainer) return;

        try {
            const response = await fetch(`http://localhost:5142/api/movimentacao/${usuarioLogado.Id}`);
            if (!response.ok) throw new Error("Erro ao buscar dados.");

            const movimentacoes = await response.json();
            
            if (movimentacoes.length === 0) {
                listaContainer.innerHTML = "<p style='text-align:center; padding:20px;'>Nenhuma movimentação encontrada.</p>";
                return;
            }

            let html = `
                <div class="financeiro-resumo" style="max-width: 800px; margin: 20px auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h3>Suas últimas movimentações</h3>
                    <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
                        <thead>
                            <tr style="background: #f4f4f4; text-align: left;">
                                <th style="padding:12px; border-bottom:2px solid #ddd">Data</th>
                                <th style="padding:12px; border-bottom:2px solid #ddd">Tipo</th>
                                <th style="padding:12px; border-bottom:2px solid #ddd">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            movimentacoes.forEach(mov => {
                const cor = (mov.Tipo.toLowerCase().includes("receita") || mov.Tipo.toLowerCase().includes("entrada")) ? "#2ecc71" : "#ff4d4d";
                html += `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">${new Date(mov.Data).toLocaleDateString('pt-BR')}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">${mov.Tipo}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee; color: ${cor}; font-weight: bold;">R$ ${mov.Valor.toFixed(2)}</td>
                    </tr>
                `;
            });

            html += `</tbody></table></div>`;
            listaContainer.innerHTML = html;

        } catch (err) {
            console.error("Erro dashboard:", err);
        }
    }

    
    
    // toggle login
    const toggleLogin = document.getElementById("toggleSenha");
    if (toggleLogin && senhaLogin) {
        toggleLogin.style.cursor = "pointer";
        toggleLogin.onclick = () => {
            const isPassword = senhaLogin.type === "password";
            senhaLogin.type = isPassword ? "text" : "password";
            toggleLogin.style.stroke = isPassword ? "#0047ab" : "#000";
        };
    }

    //  toggle cdstr
    const toggleRegister = document.getElementById("toggleSenha2");
    if (toggleRegister && senhaRegister) {
        toggleRegister.style.cursor = "pointer";
        toggleRegister.style.userSelect = "none";
        toggleRegister.onclick = () => {
            const isPassword = senhaRegister.type === "password";
            senhaRegister.type = isPassword ? "text" : "password";
            
            toggleRegister.style.stroke = isPassword ? "#0047ab": "#000"
        };
    }

    // ctrl modais
    if (fecharLogin) fecharLogin.onclick = () => loginModal.classList.remove("active");
    if (fecharRegister) fecharRegister.onclick = () => registerModal.classList.remove("active");
    
    if (linkRegister) linkRegister.onclick = (e) => {
        e.preventDefault();
        loginModal.classList.remove("active");
        registerModal.classList.add("active");
    };

    if (linkLogin) linkLogin.onclick = (e) => {
        e.preventDefault();
        registerModal.classList.remove("active");
        loginModal.classList.add("active");
    };

    atualizarInterfaceUsuario();
});