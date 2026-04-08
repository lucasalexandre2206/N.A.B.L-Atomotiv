verificarAcesso("maquinas");

const SUPABASE_URL = "https://jduahknpujrqwekibrbm.supabase.co";
const SUPABASE_KEY = "sb_publishable_0vsAuckxkESYXHgKt17nYA_Z5pvsdNq";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const TABELA_MAQUINAS = "maquinas";
const TABELA_PRODUTOS = "produtos";

let maquinas = [];
let produtos = [];

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Página de máquinas carregada");
    await carregarProdutos();
    await carregarMaquinas();
});

async function carregarProdutos() {
    console.log("Entrou em carregarProdutos");

    const { data, error } = await client
        .from(TABELA_PRODUTOS)
        .select("*");

    console.log("Produtos carregados:", data);
    console.log("Erro ao carregar produtos:", error);

    if (error) {
        console.error("Erro ao carregar produtos:", error);
        alert("Erro ao carregar produtos: " + error.message);
        return;
    }

    produtos = data || [];

    const selectProduto = document.getElementById("produtoMaquina");
    if (selectProduto) {
        selectProduto.innerHTML = `<option value="">Selecione um produto</option>`;

        produtos.forEach((produto) => {
            selectProduto.innerHTML += `
                <option value="${produto.id}">${produto.nome}</option>
            `;
        });
    }
}

async function carregarMaquinas() {
    const { data, error } = await client
        .from(TABELA_MAQUINAS)
        .select("*");

    console.log("Dados das máquinas:", data);
    console.log("Erro ao carregar máquinas:", error);

    if (error) {
        console.error("Erro ao carregar máquinas:", error);
        alert("Erro ao carregar máquinas: " + error.message);
        return;
    }

    maquinas = data || [];
    mostrarMaquinas(maquinas);
}

async function salvarMaquina() {
    const nome = document.getElementById("nomeMaquina").value.trim();
    const codigo = document.getElementById("codigoMaquina").value.trim();
    const produtoId = Number(document.getElementById("produtoMaquina").value);
    const status = document.getElementById("statusMaquina").value;

    if (nome === "" || codigo === "" || !produtoId) {
        alert("Preencha nome, código e produto.");
        return;
    }

    const { error } = await client
        .from(TABELA_MAQUINAS)
        .insert([
            {
                nome: nome,
                codigo: codigo,
                produto_id: produtoId,
                status: status
            }
        ]);

    if (error) {
        console.error("Erro ao salvar máquina:", error);
        alert("Erro ao salvar máquina: " + error.message);
        return;
    }

    document.getElementById("nomeMaquina").value = "";
    document.getElementById("codigoMaquina").value = "";
    document.getElementById("produtoMaquina").value = "";
    document.getElementById("statusMaquina").value = "ativo";

    await carregarMaquinas();
    alert("Máquina cadastrada com sucesso.");
}

async function mudarStatus(id, novoStatus) {
    const { error } = await client
        .from(TABELA_MAQUINAS)
        .update({ status: novoStatus })
        .eq("id", id);

    if (error) {
        console.error("Erro ao atualizar status:", error);
        alert("Erro ao atualizar status da máquina: " + error.message);
        return;
    }

    await carregarMaquinas();
}

async function excluirMaquina(id) {
    const confirmar = confirm("Deseja realmente excluir esta máquina?");

    if (!confirmar) {
        return;
    }

    const { error } = await client
        .from(TABELA_MAQUINAS)
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Erro ao excluir máquina:", error);
        alert("Erro ao excluir máquina: " + error.message);
        return;
    }

    await carregarMaquinas();
    alert("Máquina excluída com sucesso.");
}

function mostrarMaquinas(lista = maquinas) {
    const tabela = document.getElementById("tabelaMaquinas");
    tabela.innerHTML = "";

    if (!lista || lista.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="5">Nenhuma máquina cadastrada.</td>
            </tr>
        `;
        return;
    }

    lista.forEach((m) => {
        const produto = produtos.find((p) => Number(p.id) === Number(m.produto_id));

        tabela.innerHTML += `
            <tr>
                <td>${m.nome ?? "-"}</td>
                <td>${m.codigo ?? "-"}</td>
                <td>${produto ? produto.nome : "⚠ Sem produto"}</td>
                <td>
                    <select onchange="mudarStatus(${m.id}, this.value)">
                        <option value="ativo" ${m.status === "ativo" ? "selected" : ""}>Ativo</option>
                        <option value="manutencao" ${m.status === "manutencao" ? "selected" : ""}>Manutenção</option>
                    </select>
                </td>
                <td>
                    <button class="btn-excluir" onclick="excluirMaquina(${m.id})">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    });
}

function pesquisarMaquina() {
    const campoPesquisa = document.getElementById("pesquisaMaquina");

    if (!campoPesquisa) {
        return;
    }

    const pesquisa = campoPesquisa.value.toLowerCase().trim();

    if (pesquisa === "") {
        mostrarMaquinas(maquinas);
        return;
    }

    const filtradas = maquinas.filter((m) => {
        const produto = produtos.find((p) => Number(p.id) === Number(m.produto_id));

        const textoPesquisa = `
            ${m.nome || ""}
            ${m.codigo || ""}
            ${m.status || ""}
            ${produto ? produto.nome : ""}
        `
            .toLowerCase()
            .trim();

        return textoPesquisa.includes(pesquisa);
    });

    mostrarMaquinas(filtradas);
}

function limparBuscaMaquina() {
    const campoPesquisa = document.getElementById("pesquisaMaquina");

    if (campoPesquisa) {
        campoPesquisa.value = "";
    }

    mostrarMaquinas(maquinas);
}

window.salvarMaquina = salvarMaquina;
window.mudarStatus = mudarStatus;
window.excluirMaquina = excluirMaquina;
window.pesquisarMaquina = pesquisarMaquina;
window.limparBuscaMaquina = limparBuscaMaquina;