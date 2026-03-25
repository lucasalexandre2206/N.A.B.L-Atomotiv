let entradas = 0;
let saidas = 0;
let estoque = 0;

let movimentacoes = [];

// 🔹 Atualiza os cards
function atualizarPainel() {
    document.getElementById("totalEntradas").innerText = entradas;
    document.getElementById("totalSaidas").innerText = saidas;
    document.getElementById("totalEstoque").innerText = estoque;
}

// 🔹 Adiciona nova movimentação
function adicionarNoHistorico(tipo, produto, quantidade, responsavel, observacao) {
    let agora = new Date();

    let dataISO = agora.toISOString().split("T")[0];
    let dataBR = agora.toLocaleDateString("pt-BR");

    movimentacoes.unshift({
        tipo,
        produto,
        quantidade,
        responsavel,
        observacao,
        dataISO,
        dataBR
    });

    aplicarFiltros();
}

// 🔹 Renderiza tabela
function renderizarTabela(lista) {
    let tabela = document.getElementById("tabelaMovimentos");
    tabela.innerHTML = "";

    lista.forEach((mov) => {
        let classe = mov.tipo === "Entrada" ? "entrada" : "saida";
        let qtd = mov.tipo === "Entrada" ? `+${mov.quantidade}` : `-${mov.quantidade}`;

        tabela.innerHTML += `
            <tr>
                <td>${mov.dataBR}</td>
                <td class="${classe}">${mov.tipo}</td>
                <td>${mov.produto}</td>
                <td class="${classe}">${qtd}</td>
                <td>${mov.responsavel}</td>
                <td>${mov.observacao}</td>
            </tr>
        `;
    });
}

// 🔥 FILTROS COMPLETOS
function aplicarFiltros() {
    let busca = document.getElementById("buscarProduto").value.toLowerCase();
    let tipo = document.getElementById("filtroTipo").value;
    let dataFiltro = document.getElementById("filtroData").value;

    let hoje = new Date();
    let hojeISO = hoje.toISOString().split("T")[0];

    let filtrados = movimentacoes.filter((mov) => {

        // 🔎 Busca por produto
        let matchBusca = mov.produto.toLowerCase().includes(busca);

        // 🔄 Tipo
        let matchTipo = tipo === "" || mov.tipo === tipo;

        // 📅 Data
        let matchData = true;

        if (dataFiltro === "Hoje") {
            matchData = mov.dataISO === hojeISO;
        }

        if (dataFiltro === "Ontem") {
            let ontem = new Date();
            ontem.setDate(hoje.getDate() - 1);

            let ontemISO = ontem.toISOString().split("T")[0];

            matchData = mov.dataISO === ontemISO;
        }

        if (dataFiltro === "Semana") {
            let seteDias = new Date();
            seteDias.setDate(hoje.getDate() - 7);

            matchData = new Date(mov.dataISO) >= seteDias;
        }

        if (dataFiltro === "Mês") {
            let mesAtual = hoje.getMonth();
            let anoAtual = hoje.getFullYear();

            let dataMov = new Date(mov.dataISO);

            matchData =
                dataMov.getMonth() === mesAtual &&
                dataMov.getFullYear() === anoAtual;
        }

        return matchBusca && matchTipo && matchData;
    });

    renderizarTabela(filtrados);
}

// 🔘 Botão registrar
function registrar() {
    let tipo = document.getElementById("tipo").value;
    let produto = document.getElementById("produto").value.trim();
    let quantidade = Number(document.getElementById("quantidade").value);
    let responsavel = document.getElementById("responsavel").value.trim();
    let observacao = document.getElementById("observacao").value.trim();

    if (produto === "") {
        alert("Digite o produto");
        return;
    }

    if (!quantidade || quantidade <= 0) {
        alert("Quantidade inválida");
        return;
    }

    if (responsavel === "") {
        alert("Digite o responsável");
        return;
    }

    if (tipo === "Entrada") {
        entradas += quantidade;
        estoque += quantidade;
    } else {
        if (quantidade > estoque) {
            alert("Estoque insuficiente!");
            return;
        }

        saidas += quantidade;
        estoque -= quantidade;
    }

    atualizarPainel();
    adicionarNoHistorico(tipo, produto, quantidade, responsavel, observacao || "-");

    // limpa campos
    document.getElementById("produto").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("responsavel").value = "";
    document.getElementById("observacao").value = "";
}

// 🔥 Eventos dos filtros
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("buscarProduto").addEventListener("input", aplicarFiltros);
    document.getElementById("filtroTipo").addEventListener("change", aplicarFiltros);
    document.getElementById("filtroData").addEventListener("change", aplicarFiltros);
});