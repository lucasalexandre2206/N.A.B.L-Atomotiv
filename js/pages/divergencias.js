const SUPABASE_URL = "https://jduahknpujrqwekibrbm.supabase.co";
const SUPABASE_KEY = "sb_publishable_0vsAuckxkESYXHgKt17nYA_Z5pvsdNq";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const TABELA_DIVERGENCIAS = "divergencias";
const TABELA_MAQUINAS = "maquinas";
const TABELA_PRODUTOS = "produtos";

let divergencias = [];
let maquinas = [];
let produtos = [];

document.addEventListener("DOMContentLoaded", async () => {
    await carregarTudo();
});

async function carregarTudo() {
    await carregarMaquinas();
    await carregarProdutos();
    await carregarDivergencias();
    atualizarCards(divergencias);
    atualizarAlerta(divergencias);
    carregarTabela(divergencias);
}

async function carregarMaquinas() {
    const { data, error } = await client
        .from(TABELA_MAQUINAS)
        .select("*");

    if (error) {
        console.error("Erro ao carregar máquinas:", error);
        alert("Erro ao carregar máquinas: " + error.message);
        return;
    }

    maquinas = data || [];
}

async function carregarProdutos() {
    const { data, error } = await client
        .from(TABELA_PRODUTOS)
        .select("*");

    if (error) {
        console.error("Erro ao carregar produtos:", error);
        alert("Erro ao carregar produtos: " + error.message);
        return;
    }

    produtos = data || [];
}

async function carregarDivergencias() {
    const { data, error } = await client
        .from(TABELA_DIVERGENCIAS)
        .select("*");

    if (error) {
        console.error("Erro ao carregar divergências:", error);
        alert("Erro ao carregar divergências: " + error.message);
        return;
    }

    divergencias = data || [];
}

function atualizarCards(lista) {
    const hoje = new Date().toISOString().split("T")[0];

    const divergenciasHoje = lista.filter((item) => item.data_divergencia === hoje).length;
    const divergenciasTotais = lista.length;

    const maquinasComErro = new Set(
        lista
            .filter((item) => item.maquina_id !== null && item.maquina_id !== undefined)
            .map((item) => item.maquina_id)
    ).size;

    const pecasDivergentes = new Set(
        lista
            .filter((item) => item.produto_id !== null && item.produto_id !== undefined)
            .map((item) => item.produto_id)
    ).size;

    document.getElementById("divHoje").innerText = divergenciasHoje;
    document.getElementById("criticas").innerText = divergenciasTotais;
    document.getElementById("maqErro").innerText = maquinasComErro;
    document.getElementById("pecas").innerText = pecasDivergentes;
}

function atualizarAlerta(lista) {
    const alerta = document.getElementById("alertaTexto");

    const criticas = lista.filter((item) => {
        const status = normalizarTexto(item.status);
        return status === "aberta" || status === "em_analise";
    });

    if (criticas.length === 0) {
        alerta.innerText = "Nenhuma divergência crítica no momento.";
        return;
    }

    const primeira = criticas[0];
    const maquina = maquinas.find((m) => Number(m.id) === Number(primeira.maquina_id));

    alerta.innerText = `⚠ ${maquina ? maquina.nome : "Máquina não encontrada"} com divergência crítica ⚠`;
}

function carregarTabela(lista) {
    const tabela = document.getElementById("tabelaDados");
    tabela.innerHTML = "";

    if (!lista || lista.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="5">Nenhuma divergência encontrada.</td>
            </tr>
        `;
        return;
    }

    lista.forEach((item) => {
        const maquina = maquinas.find((m) => Number(m.id) === Number(item.maquina_id));
        const produto = produtos.find((p) => Number(p.id) === Number(item.produto_id));

        const statusFormatado = formatarStatus(item.status);
        const alerta = statusEhCritico(item.status) ? "⚠" : "—";

        tabela.innerHTML += `
            <tr>
                <td>${formatarData(item.data_divergencia)}</td>
                <td>${maquina ? maquina.nome : "Máquina não encontrada"}</td>
                <td>${produto ? produto.nome : "Produto não encontrado"}</td>
                <td>${statusFormatado}</td>
                <td>${alerta}</td>
            </tr>
        `;
    });
}

function filtrar() {
    const filtroData = document.getElementById("filtroData").value;
    const filtroMaquina = document.getElementById("filtroMaquina").value.toLowerCase().trim();
    const filtroStatus = document.getElementById("filtroStatus").value.toLowerCase().trim();
    const filtroProduto = document.getElementById("filtroProduto").value.toLowerCase().trim();

    const listaFiltrada = divergencias.filter((item) => {
        const maquina = maquinas.find((m) => Number(m.id) === Number(item.maquina_id));
        const produto = produtos.find((p) => Number(p.id) === Number(item.produto_id));

        const nomeMaquina = maquina ? maquina.nome.toLowerCase() : "";
        const nomeProduto = produto ? produto.nome.toLowerCase() : "";
        const status = normalizarTexto(item.status);

        const matchData = !filtroData || item.data_divergencia === filtroData;
        const matchMaquina = !filtroMaquina || nomeMaquina.includes(filtroMaquina);
        const matchStatus = !filtroStatus || status.includes(normalizarTexto(filtroStatus));
        const matchProduto = !filtroProduto || nomeProduto.includes(filtroProduto);

        return matchData && matchMaquina && matchStatus && matchProduto;
    });

    atualizarCards(listaFiltrada);
    atualizarAlerta(listaFiltrada);
    carregarTabela(listaFiltrada);
}

function limparFiltros() {
    document.getElementById("filtroData").value = "";
    document.getElementById("filtroMaquina").value = "";
    document.getElementById("filtroStatus").value = "";
    document.getElementById("filtroProduto").value = "";

    atualizarCards(divergencias);
    atualizarAlerta(divergencias);
    carregarTabela(divergencias);
}

function formatarData(dataISO) {
    if (!dataISO) return "-";

    const partes = dataISO.split("-");
    if (partes.length !== 3) return dataISO;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarStatus(status) {
    const texto = normalizarTexto(status);

    if (texto === "aberta") return "Aberta";
    if (texto === "resolvida") return "Resolvida";
    if (texto === "em_analise") return "Em análise";

    return status || "-";
}

function statusEhCritico(status) {
    const texto = normalizarTexto(status);
    return texto === "aberta" || texto === "em_analise";
}

function normalizarTexto(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

window.filtrar = filtrar;
window.limparFiltros = limparFiltros;
