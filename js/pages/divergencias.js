const SUPABASE_URL = "https://jduahknpujrqwekibrbm.supabase.co";
const SUPABASE_KEY = "sb_publishable_0vsAuckxkESYXHgKt17nYA_Z5pvsdNq";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const TABELA_DIVERGENCIAS = "divergencias";
const TABELA_PRODUTOS = "produtos";
const TABELA_MAQUINAS = "maquinas";

let divergencias = [];
let produtos = [];
let maquinas = [];

document.addEventListener("DOMContentLoaded", async () => {
    await carregarTudo();
});

async function carregarTudo() {
    await carregarProdutos();
    await carregarMaquinas();
    await carregarDivergencias();
    atualizarCards(divergencias);
    atualizarAlerta(divergencias);
    renderizarTabela(divergencias);
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

async function carregarDivergencias() {
    const { data, error } = await client
        .from(TABELA_DIVERGENCIAS)
        .select("*")
        .order("data_divergencia", { ascending: false });

    if (error) {
        console.error("Erro ao carregar divergências:", error);
        alert("Erro ao carregar divergências: " + error.message);
        return;
    }

    divergencias = data || [];
}

function atualizarCards(lista) {
    const hoje = new Date().toISOString().split("T")[0];

    const hojeCount = lista.filter(d => d.data_divergencia === hoje).length;
    const total = lista.length;
    const maquinasComErro = new Set(
        lista
            .filter(d => d.maquina_id !== null && d.maquina_id !== undefined)
            .map(d => d.maquina_id)
    ).size;
    const pecasDivergentes = new Set(
        lista
            .filter(d => d.produto_id !== null && d.produto_id !== undefined)
            .map(d => d.produto_id)
    ).size;

    document.getElementById("divHoje").innerText = hojeCount;
    document.getElementById("criticas").innerText = total;
    document.getElementById("maqErro").innerText = maquinasComErro;
    document.getElementById("pecas").innerText = pecasDivergentes;
}

function atualizarAlerta(lista) {
    const alerta = document.getElementById("alertaTexto");
    if (!alerta) return;

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

function renderizarTabela(lista) {
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

    lista.forEach((d) => {
        const produto = produtos.find(p => Number(p.id) === Number(d.produto_id));
        const maquina = maquinas.find(m => Number(m.id) === Number(d.maquina_id));

        tabela.innerHTML += `
            <tr>
                <td>${formatarDataBR(d.data_divergencia)}</td>
                <td>${maquina ? maquina.nome : "Não vinculada"}</td>
                <td>${produto ? produto.nome : "Produto não encontrado"}</td>
                <td class="${getClasseStatus(d.status)}">
                    ${formatarStatus(d.status)}
                </td>
                <td>
                    ${
                        normalizarTexto(d.status) === "aberta"
                            ? `<button onclick="resolverDivergencia(${d.id})">Resolver</button>`
                            : "-"
                    }
                </td>
            </tr>
        `;
    });
}

function filtrar() {
    const filtroData = document.getElementById("filtroData")?.value || "";
    const filtroMaquina = (document.getElementById("filtroMaquina")?.value || "").toLowerCase().trim();
    const filtroStatus = (document.getElementById("filtroStatus")?.value || "").toLowerCase().trim();
    const filtroProduto = (document.getElementById("filtroProduto")?.value || "").toLowerCase().trim();

    const filtradas = divergencias.filter((d) => {
        const maquina = maquinas.find(m => Number(m.id) === Number(d.maquina_id));
        const produto = produtos.find(p => Number(p.id) === Number(d.produto_id));

        const nomeMaquina = maquina ? maquina.nome.toLowerCase() : "";
        const nomeProduto = produto ? produto.nome.toLowerCase() : "";
        const status = normalizarTexto(d.status);

        const matchData = !filtroData || d.data_divergencia === filtroData;
        const matchMaquina = !filtroMaquina || nomeMaquina.includes(filtroMaquina);
        const matchStatus = !filtroStatus || status.includes(normalizarTexto(filtroStatus));
        const matchProduto = !filtroProduto || nomeProduto.includes(filtroProduto);

        return matchData && matchMaquina && matchStatus && matchProduto;
    });

    atualizarCards(filtradas);
    atualizarAlerta(filtradas);
    renderizarTabela(filtradas);
}

function limparFiltros() {
    const campoData = document.getElementById("filtroData");
    const campoMaquina = document.getElementById("filtroMaquina");
    const campoStatus = document.getElementById("filtroStatus");
    const campoProduto = document.getElementById("filtroProduto");

    if (campoData) campoData.value = "";
    if (campoMaquina) campoMaquina.value = "";
    if (campoStatus) campoStatus.value = "";
    if (campoProduto) campoProduto.value = "";

    atualizarCards(divergencias);
    atualizarAlerta(divergencias);
    renderizarTabela(divergencias);
}

async function resolverDivergencia(id) {
    const confirmar = confirm("Deseja resolver esta divergência?");
    if (!confirmar) return;

    const { data, error } = await client
        .from(TABELA_DIVERGENCIAS)
        .update({ status: "resolvida" })
        .eq("id", id)
        .select();

    console.log("Resultado update:", data);
    console.log("Erro update:", error);

    if (error) {
        console.error(error);
        alert("Erro ao resolver divergência: " + error.message);
        return;
    }

    alert("Divergência resolvida!");
    await carregarDivergencias();
    filtrar();
}

function formatarDataBR(dataISO) {
    if (!dataISO) return "-";
    const partes = dataISO.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarStatus(status) {
    const texto = normalizarTexto(status);

    if (texto === "aberta") return "Aberta";
    if (texto === "resolvida") return "Resolvida";
    if (texto === "em_analise") return "Em análise";

    return status || "-";
}

function getClasseStatus(status) {
    const texto = normalizarTexto(status);

    if (texto === "aberta") return "status-vermelho";
    if (texto === "resolvida") return "status-verde";
    if (texto === "em_analise") return "status-amarelo";

    return "";
}

function normalizarTexto(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

window.filtrar = filtrar;
window.limparFiltros = limparFiltros;
window.resolverDivergencia = resolverDivergencia;