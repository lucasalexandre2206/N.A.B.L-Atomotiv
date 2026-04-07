const SUPABASE_URL = "https://jduahknpujrqwekibrbm.supabase.co";
const SUPABASE_KEY = "sb_publishable_0vsAuckxkESYXHgKt17nYA_Z5pvsdNq";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const botaoLogin = document.getElementById("botaoLogin");
const campoUsuario = document.getElementById("usuario");
const campoSenha = document.getElementById("senha");

async function realizarLogin() {
    const usuarioDigitado = campoUsuario.value.trim();
    const senhaDigitada = campoSenha.value.trim();

    if (usuarioDigitado === "" || senhaDigitada === "") {
        alert("Preencha usuário e senha.");
        return;
    }

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

    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

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