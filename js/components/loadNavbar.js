fetch("/components/navbar.html")
.then(res => res.text())
.then(data => {
    document.getElementById("navbar-container").innerHTML = data;

    carregarNomeUsuario(); 
});

function carregarNomeUsuario() {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuario) return;

    const nome = usuario.nome || "Usuário";

    const elemento = document.getElementById("nomeUsuario");

    if (elemento) {
        elemento.innerText = `Olá, ${nome}`;
    }
}