function home() {
    window.location.href ="home.html"
 
}
function home() {
    
    const usuario = document.getElementById('usuario').value;
    const matricula = document.getElementById('matricula').value;
    const cargo = document.getElementById('cargo').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    if (usuario === '' || matricula === '' || cargo === '' || senha === '' || confirmarSenha === '') {
        alert("Por favor, preencha todos os campos obrigatórios!");
        return; 
    }

   
    if (senha !== confirmarSenha) {
        alert("As senhas não coincidem!");
        return;
    }

    
    alert("Cadastro realizado com sucesso!");
   
}