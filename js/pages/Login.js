// Este alerta TEM que aparecer assim que você abrir o site
alert("JS CONECTADO COM SUCESSO!");

const botao = document.getElementById('botaoLogin');

if (botao) {
    botao.addEventListener('click', function() {
        const u = document.getElementById('usuario').value;
        const s = document.getElementById('senha').value;

        if (u === "admin" && s === "admin123") {
            alert("Acesso Admin!");
            window.location.href = "dashboard.html";
        } else {
            alert("Usuário ou senha errados!");
        }
    });
} else {
    alert("ERRO: O botão 'botaoLogin' não existe no seu HTML!");
}// Alerta de teste (remova após confirmar que funcionou)
alert("JS CONECTADO COM SUCESSO!");

// Seleção dos elementos do DOM
const botaoLogin = document.getElementById('botaoLogin');
const campoUsuario = document.getElementById('usuario');
const campoSenha = document.getElementById('senha');

// Função principal de autenticação
function realizarLogin() {
    const usuarioDigitado = campoUsuario.value.trim();
    const senhaDigitada = campoSenha.value;

    // 1. Validação de campos vazios
    if (usuarioDigitado === "" || senhaDigitada === "") {
        alert("Por favor, preencha todos os campos.");
        return; // Para a execução aqui
    }

    // 2. Lógica de autenticação (Simulação)
    // No mundo real, isso seria verificado em um banco de dados
    if (usuarioDigitado === "admin" && senhaDigitada === "admin123") {
        alert("Acesso Admin concedido! Redirecionando...");
        window.location.href = "dashboard.html"; 
    } else {
        alert("Usuário ou senha incorretos!");
        // Limpa a senha por segurança se errar
        campoSenha.value = "";
    }
}

// Evento de clique no botão
if (botaoLogin) {
    botaoLogin.addEventListener('click', realizarLogin);
}

// Atalho: Permitir fazer login apertando "Enter" no teclado
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        realizarLogin();
    }
});