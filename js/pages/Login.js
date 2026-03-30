const SUPABASE_URL = "https://jduahknpujrqwekibrbm.supabase.co";
const SUPABASE_KEY = "sb_publishable_0vsAuckxkESYXHgKt17nYA_Z5pvsdNq";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const TABELA_USUARIOS = "login";

const botaoLogin = document.getElementById("botaoLogin");
const campoUsuario = document.getElementById("usuario");
const campoSenha = document.getElementById("senha");

async function realizarLogin() {
    const usuarioDigitado = campoUsuario.value.trim();
    const senhaDigitada = campoSenha.value.trim();

    if (usuarioDigitado === "" || senhaDigitada === "") {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const { data, error } = await client
        .from(TABELA_USUARIOS)
        .select("*")
        .or(`nome.eq.${usuarioDigitado},email.eq.${usuarioDigitado},matricula.eq.${usuarioDigitado}`);

    if (error) {
        console.error("Erro ao buscar usuário:", error);
        alert("Erro ao buscar usuário: " + error.message);
        return;
    }

    if (!data || data.length === 0) {
        alert("Usuário não encontrado.");
        campoSenha.value = "";
        return;
    }

    const usuario = data[0];

    if (usuario.status !== "ativo") {
        alert("Usuário inativo.");
        campoSenha.value = "";
        return;
    }

    if (usuario.senha !== senhaDigitada) {
        alert("Senha incorreta.");
        campoSenha.value = "";
        return;
    }

    localStorage.setItem("usuarioLogado", JSON.stringify({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        matricula: usuario.matricula,
        tipo_usuario: usuario.tipo_usuario,
        status: usuario.status
    }));

    alert("Login realizado com sucesso!");

    window.location.href = "dashboard.html";
}

if (botaoLogin) {
    botaoLogin.addEventListener("click", realizarLogin);
}

document.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        realizarLogin();
    }
});