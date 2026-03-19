
// Dados simulados (como se viessem do Java/backend)
const dados = [
  {
    data: "18/03/2026",
    maquina: "Injetora 01",
    produto: "Peça A",
    sistema: "OK",
    quantidade: 100,
    status: "ok"
  },
  {
    data: "18/03/2026",
    maquina: "Injetora 02",
    produto: "Peça B",
    sistema: "Erro",
    quantidade: 50,
    status: "critico"
  }
];


// Preencher cards
document.getElementById("divHoje").innerText = "1200 peças";
document.getElementById("criticas").innerText = "5 crítica";
document.getElementById("maqErro").innerText = "12";
document.getElementById("pecas").innerText = "8";


// Preencher tabela
function carregarTabela(lista) {
  const tabela = document.getElementById("tabelaDados");
  tabela.innerHTML = "";


  lista.forEach(item => {
    tabela.innerHTML += `
      <tr>
        <td>${item.data}</td>
        <td>${item.maquina}</td>
        <td>${item.produto}</td>
        <td>${item.sistema}</td>
        <td>${item.quantidade}</td>
        <td>
          <span class="dot amarelo"></span>
          <span class="dot vermelho"></span>
          <span class="dot verde"></span>
        </td>
        <td>⚠</td>
      </tr>
    `;
  });
}


// Filtro simples
function filtrar() {
  alert("Filtro clicado (você pode implementar lógica aqui)");
}


// Inicializar
carregarTabela(dados);
