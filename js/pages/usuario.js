verificarAcesso("usuarios");
const SUPABASE_URL = "https://jduahknpujrqwekibrbm.supabase.co";
const SUPABASE_KEY = "sb_publishable_0vsAuckxkESYXHgKt17nYA_Z5pvsdNq";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const TABELA_USUARIOS = "login";

let usuarios = [];

document.addEventListener("DOMContentLoaded", async () => {
    await carregarUsuarios();
});

async function carregarUsuarios() {
    const { data, error } = await client
        .from(TABELA_USUARIOS)
        .select("*");

    console.log("Dados dos usuários:", data);
    console.log("Erro ao carregar usuários:", error);

    if (error) {
        console.error("Erro ao carregar usuários:", error);
        alert("Erro ao carregar usuários: " + error.message);
        return;
    }

    usuarios = data || [];
    mostrarUsuarios();
}

async function salvarUsuario() {
    const nome = document.getElementById("nome").value.trim();
    const matricula = document.getElementById("matricula").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const tipo = document.getElementById("tipo").value;

    if (nome === "" || matricula === "" || email === "" || senha === "") {
        alert("Preencha todos os campos.");
        return;
    }

    const { error } = await client
        .from(TABELA_USUARIOS)
        .insert([
            {
                nome: nome,
                matricula: matricula,
                email: email,
                senha: senha,
                tipo_usuario: tipo,
                status: "ativo"
            }
        ]);

    if (error) {
        console.error("Erro ao salvar usuário:", error);
        alert("Erro ao salvar usuário: " + error.message);
        return;
    }

    document.getElementById("nome").value = "";
    document.getElementById("matricula").value = "";
    document.getElementById("email").value = "";
    document.getElementById("senha").value = "";
    document.getElementById("tipo").value = "admin";

    await carregarUsuarios();
    alert("Usuário cadastrado com sucesso.");
}

function mostrarUsuarios(lista = usuarios) {
    const tabela = document.getElementById("tabelaUsuarios");
    const contador = document.getElementById("contadorUsuarios");
    const msg = document.getElementById("msgVazio");

    tabela.innerHTML = "";

    contador.innerText = `Total de usuários: ${lista.length}`;

    if (!lista || lista.length === 0) {
        tabela.innerHTML = "";
        msg.style.display = "block";
        return;
    }

    msg.style.display = "none";

    lista.forEach((u) => {
        tabela.innerHTML += `
            <tr>
                <td>${u.nome ?? "-"}</td>
                <td>${u.matricula ?? "-"}</td>
                <td>${u.email ?? "-"}</td>
                <td>${u.tipo_usuario ?? "-"}</td>
                <td>
                    <select onchange="mudarStatus(${u.id}, this.value)">
                        <option value="ativo" ${u.status === "ativo" ? "selected" : ""}>Ativo</option>
                        <option value="inativo" ${u.status === "inativo" ? "selected" : ""}>Inativo</option>
                    </select>
                </td>
                <td>
                    <button class="btn-excluir" onclick="excluirUsuario(${u.id})">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    });
}

function pesquisarUsuario() {
    const pesquisa = document
        .getElementById("pesquisaUsuario")
        .value
        .toLowerCase()
        .trim();

    if (pesquisa === "") {
        mostrarUsuarios();
        document.getElementById("msgVazio").style.display = "none";
        return;
    }

    const encontrados = usuarios.filter((u) => {
        const texto = (
            (u.nome || "") +
            (u.matricula || "") +
            (u.email || "") +
            (u.tipo_usuario || "") +
            (u.status || "")
        ).toLowerCase();

        return texto.includes(pesquisa);
    });

    mostrarUsuarios(encontrados);
}

function limparBusca() {
    document.getElementById("pesquisaUsuario").value = "";
    document.getElementById("msgVazio").style.display = "none";
    mostrarUsuarios();
}

async function mudarStatus(id, novoStatus) {
    const { error } = await client
        .from(TABELA_USUARIOS)
        .update({ status: novoStatus })
        .eq("id", id);

    if (error) {
        console.error("Erro ao atualizar status:", error);
        alert("Erro ao atualizar status: " + error.message);
        return;
    }

    await carregarUsuarios();
}

async function excluirUsuario(id) {
    const confirmar = confirm("Deseja realmente excluir este usuário?");

    if (!confirmar) {
        return;
    }

    const { error } = await client
        .from(TABELA_USUARIOS)
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Erro ao excluir usuário:", error);
        alert("Erro ao excluir usuário: " + error.message);
        return;
    }

    await carregarUsuarios();
    alert("Usuário excluído com sucesso.");
}

window.salvarUsuario = salvarUsuario;
window.pesquisarUsuario = pesquisarUsuario;
window.limparBusca = limparBusca;
window.mudarStatus = mudarStatus;
window.excluirUsuario = excluirUsuario;