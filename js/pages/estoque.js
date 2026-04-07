verificarAcesso("transferencia");
const SUPABASE_URL = "https://jduahknpujrqwekibrbm.supabase.co";
const SUPABASE_KEY = "sb_publishable_0vsAuckxkESYXHgKt17nYA_Z5pvsdNq";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const TABELA_USUARIOS = "login";
const TABELA_PRODUTOS = "produtos";
const TABELA_MOVIMENTACOES = "movimentacoes";
const TABELA_DIVERGENCIAS = "divergencias";
const TABELA_MAQUINAS = "maquinas";

let movimentacoes = [];
let produtos = [];
let usuarios = [];
let maquinas = [];

document.addEventListener("DOMContentLoaded", async () => {
    await carregarTudo();

    document.getElementById("buscarProduto").addEventListener("input", aplicarFiltros);
    document.getElementById("filtroTipo").addEventListener("change", aplicarFiltros);
    document.getElementById("filtroData").addEventListener("change", aplicarFiltros);
});

async function carregarTudo() {
    await carregarProdutos();
    await carregarUsuarios();
    await carregarMaquinas();
    await carregarMovimentacoes();
    atualizarPainel();
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

    const selectProduto = document.getElementById("produto");
    selectProduto.innerHTML = `<option value="">Selecione um produto</option>`;

    produtos.forEach((produto) => {
        selectProduto.innerHTML += `
            <option value="${produto.id}">${produto.nome}</option>
        `;
    });
}

async function carregarUsuarios() {
    const { data, error } = await client
        .from(TABELA_USUARIOS)
        .select("*")
        .order("nome", { ascending: true });

    if (error) {
        console.error("Erro ao carregar usuários:", error);
        alert("Erro ao carregar usuários: " + error.message);
        return;
    }

    usuarios = data || [];
}

async function carregarMaquinas() {
    const { data, error } = await client
        .from(TABELA_MAQUINAS)
        .select("*");

    if (error) {
        console.error("Erro ao carregar máquinas:", error);
        return;
    }

    maquinas = data || [];
}

async function carregarMovimentacoes() {
    const { data, error } = await client
        .from(TABELA_MOVIMENTACOES)
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Erro ao carregar movimentações:", error);
        alert("Erro ao carregar movimentações: " + error.message);
        return;
    }

    movimentacoes = data || [];
    aplicarFiltros();
}

function atualizarPainel() {
    const hojeISO = new Date().toISOString().split("T")[0];

    const entradasHoje = movimentacoes
        .filter((mov) =>
            normalizarTipo(mov.tipo_movimentacao) === "entrada" &&
            mov.data_movimentacao === hojeISO
        )
        .reduce((total, mov) => total + Number(mov.quantidade || 0), 0);

    const saidasHoje = movimentacoes
        .filter((mov) =>
            normalizarTipo(mov.tipo_movimentacao) === "saida" &&
            mov.data_movimentacao === hojeISO
        )
        .reduce((total, mov) => total + Number(mov.quantidade || 0), 0);

    const estoqueAtual = produtos.reduce((total, produto) => {
        return total + Number(produto.estoque_atual || 0);
    }, 0);

    document.getElementById("totalEntradas").innerText = entradasHoje;
    document.getElementById("totalSaidas").innerText = saidasHoje;
    document.getElementById("totalEstoque").innerText = estoqueAtual;
}

async function registrar() {
    const tipoTela = document.getElementById("tipo").value;
    const produtoId = Number(document.getElementById("produto").value);
    const quantidade = Number(document.getElementById("quantidade").value);
    const responsavelNome = document.getElementById("responsavel").value.trim();
    const observacao = document.getElementById("observacao").value.trim();

    if (!produtoId) {
        alert("Selecione um produto.");
        return;
    }

    if (!quantidade || quantidade <= 0) {
        alert("Quantidade inválida.");
        return;
    }

    if (responsavelNome === "") {
        alert("Digite o responsável.");
        return;
    }

    const produto = produtos.find((p) => Number(p.id) === produtoId);

    if (!produto) {
        alert("Produto não encontrado.");
        return;
    }

    const usuario = usuarios.find(
        (u) => (u.nome || "").toLowerCase() === responsavelNome.toLowerCase()
    );

    if (!usuario) {
        alert("Responsável não encontrado na tabela de usuários.");
        return;
    }

    const tipoBanco = tipoTela === "Entrada" ? "entrada" : "saida";
    let estoqueAtual = Number(produto.estoque_atual || 0);
    let novoEstoque = estoqueAtual;

    if (tipoBanco === "entrada") {
        novoEstoque = estoqueAtual + quantidade;
    } else {
        if (quantidade > estoqueAtual) {
            alert("Estoque insuficiente!");
            return;
        }
        novoEstoque = estoqueAtual - quantidade;
    }

    const dataHoje = new Date().toISOString().split("T")[0];

    const { error: erroInsert } = await client
        .from(TABELA_MOVIMENTACOES)
        .insert([
            {
                tipo_movimentacao: tipoBanco,
                produto_id: produtoId,
                quantidade: quantidade,
                estoque_apos_movimentacao: novoEstoque,
                responsavel_id: usuario.id,
                observacao: observacao || "-",
                data_movimentacao: dataHoje
            }
        ]);

    if (erroInsert) {
        console.error("Erro ao registrar movimentação:", erroInsert);
        alert("Erro ao salvar movimentação: " + erroInsert.message);
        return;
    }

    const { error: erroUpdate } = await client
        .from(TABELA_PRODUTOS)
        .update({ estoque_atual: novoEstoque })
        .eq("id", produtoId);

    if (erroUpdate) {
        console.error("Erro ao atualizar estoque:", erroUpdate);
        alert("Movimentação salva, mas houve erro ao atualizar o estoque.");
        return;
    }

    document.getElementById("produto").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("responsavel").value = "";
    document.getElementById("observacao").value = "";
    document.getElementById("tipo").value = "Entrada";

    await carregarTudo();

    if (tipoBanco === "saida") {
        const zona = verificarZona(produto, novoEstoque);

        if (zona === "critica") {
            await registrarDivergencia(produtoId);
            alert("Saída registrada com sucesso. Produto em zona crítica.");
        } else if (zona === "media") {
            alert("Saída registrada com sucesso. Produto em zona média.");
        } else {
            alert("Saída registrada com sucesso. Produto em zona normal.");
        }
    } else {
        alert("Movimentação registrada com sucesso.");
    }
}

function verificarZona(produto, novoEstoque) {
    const estoqueMaximo = Number(produto.estoque_maximo || 0);
    const nivelCritico = Number(produto.nivel_critico || 0);
    const nivelMedio = estoqueMaximo / 2;

    if (novoEstoque <= nivelCritico) {
        return "critica";
    }

    if (novoEstoque <= nivelMedio) {
        return "media";
    }

    return "normal";
}

async function registrarDivergencia(produtoId) {
    const dataHoje = new Date().toISOString().split("T")[0];

    const maquina = maquinas.find(
        (m) => Number(m.produto_id) === Number(produtoId)
    );

    const { error } = await client
        .from(TABELA_DIVERGENCIAS)
        .insert([
            {
                data_divergencia: dataHoje,
                maquina_id: maquina ? maquina.id : null,
                produto_id: produtoId,
                status: "aberta"
            }
        ]);

    if (error) {
        console.error("Erro ao registrar divergência:", error);
    }
}

function aplicarFiltros() {
    const busca = document.getElementById("buscarProduto").value.toLowerCase().trim();
    const tipoFiltro = document.getElementById("filtroTipo").value;
    const dataFiltro = document.getElementById("filtroData").value;

    const hoje = new Date();
    const hojeISO = hoje.toISOString().split("T")[0];

    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);
    const ontemISO = ontem.toISOString().split("T")[0];

    let filtrados = movimentacoes.filter((mov) => {
        const produto = produtos.find((p) => Number(p.id) === Number(mov.produto_id));
        const nomeProduto = produto ? produto.nome.toLowerCase() : "";

        const matchBusca = nomeProduto.includes(busca);

        let matchTipo = true;
        if (tipoFiltro === "Entrada") {
            matchTipo = normalizarTipo(mov.tipo_movimentacao) === "entrada";
        } else if (tipoFiltro === "Saída") {
            matchTipo = normalizarTipo(mov.tipo_movimentacao) === "saida";
        }

        let matchData = true;

        if (dataFiltro === "Hoje") {
            matchData = mov.data_movimentacao === hojeISO;
        }

        if (dataFiltro === "Ontem") {
            matchData = mov.data_movimentacao === ontemISO;
        }

        if (dataFiltro === "Semana") {
            const dataMov = new Date(mov.data_movimentacao + "T00:00:00");
            const seteDias = new Date();
            seteDias.setDate(hoje.getDate() - 7);
            matchData = dataMov >= seteDias;
        }

        if (dataFiltro === "Mês") {
            const dataMov = new Date(mov.data_movimentacao + "T00:00:00");
            matchData =
                dataMov.getMonth() === hoje.getMonth() &&
                dataMov.getFullYear() === hoje.getFullYear();
        }

        return matchBusca && matchTipo && matchData;
    });

    renderizarTabela(filtrados);
    atualizarPainel();
}

function renderizarTabela(lista) {
    const tabela = document.getElementById("tabelaMovimentos");
    tabela.innerHTML = "";

    if (lista.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="7">Nenhuma movimentação encontrada.</td>
            </tr>
        `;
        return;
    }

    lista.forEach((mov) => {
        const produto = produtos.find((p) => Number(p.id) === Number(mov.produto_id));
        const usuario = usuarios.find((u) => Number(u.id) === Number(mov.responsavel_id));

        const tipoNormalizado = normalizarTipo(mov.tipo_movimentacao);
        const classe = tipoNormalizado === "entrada" ? "entrada" : "saida";
        const tipoExibicao = tipoNormalizado === "entrada" ? "Entrada" : "Saída";

        const transferencia =
            tipoNormalizado === "entrada"
                ? `+${mov.quantidade}`
                : `-${mov.quantidade}`;

        const estoqueNaData = mov.estoque_apos_movimentacao ?? 0;

        tabela.innerHTML += `
            <tr>
                <td>${formatarDataBR(mov.data_movimentacao)}</td>
                <td class="${classe}">${tipoExibicao}</td>
                <td>${produto ? produto.nome : "Produto não encontrado"}</td>
                <td class="${classe}">${transferencia}</td>
                <td><strong>${estoqueNaData}</strong></td>
                <td>${usuario ? usuario.nome : "Usuário não encontrado"}</td>
                <td>${mov.observacao || "-"}</td>
            </tr>
        `;
    });
}

function formatarDataBR(dataISO) {
    if (!dataISO) return "-";
    const partes = dataISO.split("-");
    if (partes.length !== 3) return dataISO;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function normalizarTipo(tipo) {
    return String(tipo || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

window.registrar = registrar;