function carregarSidebar() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const tipo = String(usuarioLogado?.tipo_usuario || "").toLowerCase();

    console.log("TIPO:", tipo);

    let menu = "";

    if (tipo === "admin") {
        menu = `
        <a class="item" href="/views/dashboard.html">
            <div class="icon"><img src="/img/casa1.png"></div>
            <span>Dashboard</span>
        </a>

        <a class="item" href="/views/admin/usuarios.html">
            <div class="icon"><img src="/img/user.png"></div>
            <span>Usuários</span>
        </a>

        <a class="item" href="/views/admin/maquinas.html">
            <div class="icon"><img src="/img/engrenagem.png"></div>
            <span>Máquinas</span>
        </a>

        <a class="item" href="/views/transferencias.html">
            <div class="icon"><img src="/img/tranferencia.png"></div>
            <span>Transferências</span>
        </a>

        <a class="item" href="/views/divergencias.html">
            <div class="icon"><img src="/img/x.png"></div>
            <span>Divergências</span>
        </a>

        <a class="item logout" href="#" onclick="logout()">
            <div class="icon">↩</div>
            <span>Sair</span>
        </a>
        `;
    } else {
        menu = `
        <a class="item" href="/views/dashboard.html">
            <div class="icon"><img src="/img/casa1.png"></div>
            <span>Dashboard</span>
        </a>

        <a class="item" href="/views/transferencias.html">
            <div class="icon"><img src="/img/tranferencia.png"></div>
            <span>Transferências</span>
        </a>

        <a class="item" href="/views/divergencias.html">
            <div class="icon"><img src="/img/x.png"></div>
            <span>Divergências</span>
        </a>

        <a class="item logout" href="#" onclick="logout()">
            <div class="icon">↩</div>
            <span>Sair</span>
        </a>
        `;
    }

    document.getElementById("menuSidebar").innerHTML = menu;
}

function ativarToggle() {
    document.getElementById("menuToggle").addEventListener("click", () => {
        document.getElementById("sidebarMenu").classList.toggle("ativo");
    });
}

function logout() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "/views/login.html";
}