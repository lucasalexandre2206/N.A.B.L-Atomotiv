function getUsuarioLogado() {
    return JSON.parse(localStorage.getItem("usuarioLogado"));
}

function verificarAcesso(pagina) {
    const usuario = getUsuarioLogado();

    if (!usuario) {
        alert("Você precisa fazer login.");
        window.location.href = "login.html";
        return false;
    }

    const tipo = String(usuario.tipo_usuario || "").toLowerCase();

    // ADMIN: acesso total
    if (tipo === "admin") {
        return true;
    }

    // OPERADOR: acesso limitado
    if (tipo === "operador") {
        if (pagina === "usuarios" || pagina === "maquinas") {
            alert("Acesso negado.");
            window.location.href = "dashboard.html";
            return false;
        }

        if (pagina === "dashboard") {
            bloquearDashboardOperador();
            return true;
        }

        return true;
    }

    alert("Tipo de usuário inválido.");
    window.location.href = "login.html";
    return false;
}

function bloquearDashboardOperador() {
    const cards = document.querySelector(".card-geral");
    if (cards) cards.style.display = "none";

    const tabela = document.querySelector(".tabela-container");
    if (tabela) tabela.style.display = "none";

    const filtros = document.querySelector(".filtros");
    if (filtros) filtros.style.display = "none";
}

function logout() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
}
function ajustarMenuPorPerfil() {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuario) return;

    const tipo = String(usuario.tipo_usuario || "").toLowerCase();

    if (tipo === "operador") {
        const linkUsuarios = document.querySelector('a[href*="usuarios"]');
        const linkMaquinas = document.querySelector('a[href*="maquinas"]');

        if (linkUsuarios) linkUsuarios.style.display = "none";
        if (linkMaquinas) linkMaquinas.style.display = "none";
    }
}
document.addEventListener("DOMContentLoaded", () => {
    ajustarMenuPorPerfil();
});