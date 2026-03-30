const SUPABASE_URL = "https://jduahknpujrqwekibrbm.supabase.co";
const SUPABASE_KEY = "sb_publishable_0vsAuckxkESYXHgKt17nYA_Z5pvsdNq";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const TABELA_MAQUINAS = "maquinas";

let maquinas = [];

document.addEventListener("DOMContentLoaded", async () => {
    await carregarMaquinas();
});

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
    mostrarMaquinas();
}

async function salvarMaquina() {
    const nome = document.getElementById("nomeMaquina").value.trim();
    const codigo = document.getElementById("codigoMaquina").value.trim();
    const status = document.getElementById("statusMaquina").value;

    if (nome === "" || codigo === "") {
        alert("Preencha nome e código.");
        return;
    }

    const { error } = await client
        .from(TABELA_MAQUINAS)
        .insert([
            {
                nome: nome,
                codigo: codigo,
                status: status
            }
        ]);

    if (error) {
        console.error("Erro ao salvar máquina:", error);
        alert("Erro ao salvar máquina no banco: " + error.message);
        return;
    }

    document.getElementById("nomeMaquina").value = "";
    document.getElementById("codigoMaquina").value = "";
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

function mostrarMaquinas() {
    const tabela = document.getElementById("tabelaMaquinas");
    tabela.innerHTML = "";

    if (!maquinas || maquinas.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="4">Nenhuma máquina cadastrada.</td>
            </tr>
        `;
        return;
    }

    maquinas.forEach((m) => {
        tabela.innerHTML += `
            <tr>
                <td>${m.nome ?? "-"}</td>
                <td>${m.codigo ?? "-"}</td>
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

window.salvarMaquina = salvarMaquina;
window.mudarStatus = mudarStatus;
window.excluirMaquina = excluirMaquina;