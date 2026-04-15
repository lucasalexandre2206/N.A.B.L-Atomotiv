const SUPABASE_URL = "https://jduahknpujrqwekibrbm.supabase.co";
const SUPABASE_KEY = "sb_publishable_0vsAuckxkESYXHgKt17nYA_Z5pvsdNq";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const botaoLogin = document.getElementById("botaoLogin");
const campoUsuario = document.getElementById("usuario");
const campoSenha = document.getElementById("senha");

const esqueciSenha = document.getElementById("esqueciSenha");
const loginBox = document.getElementById("loginBox");
const recuperarBox = document.getElementById("recuperarBox");
const btnVoltar = document.getElementById("btnVoltar");


// 👁 Mostrar / esconder senha
function toggleSenha() {
    const senha = document.getElementById("senha");
    senha.type = senha.type === "password" ? "text" : "password";
}


// 🔥 VALIDAÇÃO (estilo ENIAC)
function validarCampos() {
    let valido = true;

    document.querySelectorAll(".input-group").forEach(grupo => {
        const input = grupo.querySelector("input");

        if (input.value.trim() === "") {
            grupo.classList.add("erro");
            valido = false;
        } else {
            grupo.classList.remove("erro");
        }
    });

    return valido;
}


// 🔥 Remove erro ao digitar (fica profissional)
document.querySelectorAll(".input-group input").forEach(input => {
    input.addEventListener("input", () => {
        const grupo = input.parentElement;

        if (input.value.trim() !== "") {
            grupo.classList.remove("erro");
        }
    });
});


// 🔐 LOGIN
async function realizarLogin() {

    // 🔥 valida antes de tudo
    if (!validarCampos()) return;

    const usuarioDigitado = campoUsuario.value.trim();
    const senhaDigitada = campoSenha.value.trim();

    const { data, error } = await client
        .from("login")
        .select("*");

    if (error) {
        console.error("Erro ao buscar usuários:", error);
        alert("Erro ao conectar com o banco: " + error.message);
        return;
    }

    const usuario = data.find((u) => {
        const nome = String(u.nome || "").toLowerCase();
        const email = String(u.email || "").toLowerCase();
        const matricula = String(u.matricula || "").toLowerCase();
        const digitado = usuarioDigitado.toLowerCase();

        return nome === digitado || email === digitado || matricula === digitado;
    });

    if (!usuario) {
        alert("Usuário não encontrado.");
        return;
    }

    if (String(usuario.senha || "") !== senhaDigitada) {
        alert("Senha incorreta.");
        return;
    }

    if (String(usuario.status || "").toLowerCase() !== "ativo") {
        alert("Usuário inativo.");
        return;
    }

    const usuarioSalvo = {
        nome: usuario.nome,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario
    };

    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioSalvo));

    alert("Login realizado com sucesso!");
    window.location.href = "dashboard.html";
}


// 🖱 Botão login
if (botaoLogin) {
    botaoLogin.addEventListener("click", function (e) {
        e.preventDefault(); // 🔥 evita bug
        realizarLogin();
    });
}


// ⌨️ ENTER (corrigido)
document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault(); // 🔥 ESSENCIAL
        realizarLogin();
    }
});


// 🔄 Trocar tela (esqueci senha)
if (esqueciSenha) {
    esqueciSenha.addEventListener("click", () => {
        loginBox.style.display = "none";
        recuperarBox.style.display = "flex";
    });
}


// 🔙 Voltar
if (btnVoltar) {
    btnVoltar.addEventListener("click", () => {
        recuperarBox.style.display = "none";
        loginBox.style.display = "flex";
    });
}