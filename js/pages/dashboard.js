verificarAcesso("dashboard");
const SUPABASE_URL = "https://jduahknpujrqwekibrbm.supabase.co";
const SUPABASE_KEY = "sb_publishable_0vsAuckxkESYXHgKt17nYA_Z5pvsdNq";


const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


const TABELA_MOVIMENTACOES = "movimentacoes";
const TABELA_DIVERGENCIAS = "divergencias";
const TABELA_MAQUINAS = "maquinas";
const TABELA_USUARIOS = "login";
const TABELA_PRODUTOS = "produtos";


let movimentacoes = [];
let divergencias = [];
let maquinas = [];
let usuarios = [];
let produtos = [];
let grafico = null;


document.addEventListener("DOMContentLoaded", async () => {
    await carregarTudo();


    const btnFiltrar = document.getElementById("btnFiltrar");
    const btnLimpar = document.getElementById("btnLimpar");
    const btnExportar = document.getElementById("btnExportar");


    if (btnFiltrar) btnFiltrar.addEventListener("click", filtrarTabela);
    if (btnLimpar) btnLimpar.addEventListener("click", limparFiltros);
    if (btnExportar) btnExportar.addEventListener("click", exportarParaExcel);
});


async function carregarTudo() {
    await carregarProdutos();
    await carregarMaquinas();
    await carregarUsuarios();
    await carregarDivergencias();
    await carregarMovimentacoes();


    atualizarCards();
    atualizarGrafico();
    renderizarTabela(movimentacoes);
}


async function carregarProdutos() {
    const { data, error } = await client
        .from(TABELA_PRODUTOS)
        .select("*")
        .order("nome", { ascending: true });


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


async function carregarUsuarios() {
    const { data, error } = await client
        .from(TABELA_USUARIOS)
        .select("*");


    if (error) {
        console.error("Erro ao carregar usuários:", error);
        alert("Erro ao carregar usuários: " + error.message);
        return;
    }


    usuarios = data || [];
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


async function carregarMovimentacoes() {
    const { data, error } = await client
        .from(TABELA_MOVIMENTACOES)
        .select("*")
        .order("data_movimentacao", { ascending: false })
        .order("created_at", { ascending: false });


    if (error) {
        console.error("Erro ao carregar movimentações:", error);
        alert("Erro ao carregar movimentações: " + error.message);
        return;
    }


    movimentacoes = data || [];
}


function atualizarCards() {
    const hoje = new Date().toISOString().split("T")[0];


    const producaoHoje = movimentacoes
        .filter((m) =>
            m.data_movimentacao === hoje &&
            normalizarTexto(m.tipo_movimentacao) === "entrada"
        )
        .reduce((total, m) => total + Number(m.quantidade || 0), 0);


    const divergenciasAbertas = divergencias.filter((d) =>
        normalizarTexto(d.status) === "aberta"
    ).length;


    const maquinasAtivas = maquinas.filter((m) =>
        normalizarTexto(m.status) === "ativo"
    ).length;


    const operadoresAtivos = usuarios.filter((u) =>
        normalizarTexto(u.status) === "ativo" &&
        normalizarTexto(u.tipo_usuario) === "operador"
    ).length;


    document.getElementById("cardProducaoHoje").innerText = producaoHoje;
    document.getElementById("cardDivergencias").innerText = divergenciasAbertas;
    document.getElementById("cardMaquinasAtivas").innerText = maquinasAtivas;
    document.getElementById("cardOperadoresAtivos").innerText = operadoresAtivos;
}


function atualizarGrafico() {
    const ctx = document.getElementById("graficoBarras");


    const labels = produtos.map((p) => p.nome);
    const valores = produtos.map((p) => Number(p.estoque_atual || 0));


    if (grafico) {
        grafico.destroy();
    }


    grafico = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Estoque Atual",
                    data: valores,
                    backgroundColor: "#4e79ff"
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: "#ffffff"
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: "#ffffff"
                    }
                },
                y: {
                    ticks: {
                        color: "#ffffff"
                    }
                }
            }
        }
    });
}


function renderizarTabela(lista) {
    const tabela = document.getElementById("tabelaDashboard");
    tabela.innerHTML = "";


    if (!lista || lista.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="6">Nenhum registro de movimentação encontrado.</td>
            </tr>
        `;
        return;
    }


    lista.forEach((item) => {
        const produto = produtos.find((p) => Number(p.id) === Number(item.produto_id));
        const usuario = usuarios.find((u) => Number(u.id) === Number(item.responsavel_id));


        const tipo = formatarTipo(item.tipo_movimentacao);


        tabela.innerHTML += `
            <tr>
                <td>${formatarDataBR(item.data_movimentacao)}</td>
                <td>${tipo}</td>
                <td>${produto ? produto.nome : "Produto não encontrado"}</td>
                <td>${item.quantidade ?? 0}</td>
                <td>${usuario ? usuario.nome : "Usuário não encontrado"}</td>
                <td>${item.observacao || "-"}</td>
            </tr>
        `;
    });
}


function filtrarTabela() {
    const filtroData = document.getElementById("filtroData").value;
    const filtroTexto = document.getElementById("filtroMaquina").value
        .toLowerCase()
        .trim();


    const filtrada = movimentacoes.filter((item) => {
        // 🔥 corrigindo data (remove hora se tiver)
        const dataItem = (item.data_movimentacao || "").split("T")[0];


        const produto = produtos.find(
            (p) => Number(p.id) === Number(item.produto_id)
        );


        const nomeProduto = produto ? produto.nome.toLowerCase() : "";


        // 🔥 validações
        const matchData = !filtroData || dataItem === filtroData;
        const matchTexto =
            !filtroTexto ||
            nomeProduto.includes(filtroTexto);


        return matchData && matchTexto;
    });


    renderizarTabela(filtrada);
}
function limparFiltros() {
    document.getElementById("filtroData").value = "";
    document.getElementById("filtroMaquina").value = "";


    renderizarTabela(movimentacoes);
}
function formatarDataBR(dataISO) {
    if (!dataISO) return "-";
    const partes = dataISO.split("-");
    if (partes.length !== 3) return dataISO;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


function formatarTipo(tipo) {
    const texto = normalizarTexto(tipo);


    if (texto === "entrada") return "Entrada";
    if (texto === "saida") return "Saída";


    return tipo || "-";
}


function normalizarTexto(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}
function bloquearDashboardOperador() {
    const cards = document.querySelector(".card-geral");
    if (cards) cards.style.display = "none";


    const tabela = document.querySelector(".tabela-container");
    if (tabela) tabela.style.display = "none";


    const filtros = document.querySelector(".filtros");
    if (filtros) filtros.style.display = "none";
}


function exportarParaExcel() {
    let tabela = document.querySelector("table").outerHTML;


    let arquivo = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:x="urn:schemas-microsoft-com:office:excel"
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="UTF-8">
        </head>
        <body>
            ${tabela}
        </body>
        </html>
    `;


    let blob = new Blob([arquivo], {
        type: "application/vnd.ms-excel"
    });


    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "relatorio.xls";


    link.click();
}


document.getElementById("btnExportar")
    .addEventListener("click", exportarParaExcel);