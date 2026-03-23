
function carregarSidebar() {

    let tipo = localStorage.getItem("tipoUsuario")

    let menu = ""

    if (tipo === "admin") {

        menu = `
        <a class="item" href="/views/admin/dashboard.html">
            <div class="icon1"><img src="/img/casa1.png" alt="" class="casa"></div>
            <span>Dashboard</span>
        </a>

        <a class="item" href="/views/admin/usuarios.html">
            <div class="icon">👤</div>
            <span>Usuários</span>
        </a>

        <a class="item" href="/views/admin/maquinas.html">
            <div class="icon">⚙</div>
            <span>Máquinas</span>
        </a>

        <a class="item" href="/views/admin/transferencias.html">
            <div class="icon"><img src="/img/tranferencia.png" alt="" class="imagem2"></div>
            <span>Transferências</span>
        </a>

        <a class="item" href="/views/admin/divergencias.html">
            <div  ><img src="/img/x.png" alt="" class="x"></div>
            <span>Divergências</span>
        </a>



        <a class="item logout" href="../login.html">
            <div class="icon">↩</div>
            <span>Sair</span>
        </a>
`

    } else {

        menu = `
        <a class="item" href="/views/operador/dashboard.html">
            <div class="icon1"><img src="../img/casa1.png" alt="" class="casa"></div>
            <span>Dashboard</span>
        </a>

        <a class="item" href="/views/operador/transferencias.html">
            <div class="icon"><img src="../img/tranferencia.png" alt="" class="imagem2"></div>
            <span>Transferências</span>
        </a>

        <a class="item" href="/views/operador/divergencias.html">
            <div  ><img src="../img/x.png" alt="" class="x"></div>
            <span>Divergências</span>
        </a>

        <a class="item logout" href="/login.html">
            <div class="icon">↩</div>
            <span>Sair</span>
        </a>
`

    }

    document.getElementById("menuSidebar").innerHTML = menu

}

carregarSidebar()

function toggleMenu(){
    document.getElementById("sidebar").classList.toggle("ativo")
}
