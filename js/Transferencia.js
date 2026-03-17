alert("JS carregou!");
function registrar() {
    const tipo = document.getElementById("tipo").value;
    const produto = document.getElementById("produto").value;
    const quantidade = document.getElementById("quantidade").value;
    const responsavel = document.getElementById("responsavel").value;
    const obs = document.getElementById("obs").value;

    if (!quantidade || !responsavel) {
        alert("Preencha os campos obrigatórios!");
        return;
    }

    alert("Funcionando!");
}