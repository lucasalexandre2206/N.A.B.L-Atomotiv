const canvas = document.getElementById('meuCanvas');
const ctx = canvas.getContext('2d');

// Nossos dados (Valores das barras)
const dados = [120, 200, 80, 150, 280];
const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'];

// Configurações do layout
const larguraBarra = 50;
const espacamento = 20;
const margemEsquerda = 40;
const baseGrafico = canvas.height - 40; // Onde as barras "pisam"

// Desenhar cada barra
dados.forEach((valor, i) => {
  // Define a cor da barra
  ctx.fillStyle = '#4e73df';
  
  // Calcula a posição X
  const x = margemEsquerda + (larguraBarra + espacamento) * i;
  
  // Desenha o retângulo (x, y, largura, altura)
  // Nota: No canvas, o Y começa no topo (0) e cresce para baixo
  ctx.fillRect(x, baseGrafico - valor, larguraBarra, valor);
  
  // Adiciona o nome abaixo da barra
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText(nomes[i], x + larguraBarra/2, baseGrafico + 20);
  
  // Adiciona o valor acima da barra
  ctx.fillText(valor, x + larguraBarra/2, baseGrafico - valor - 10);
});