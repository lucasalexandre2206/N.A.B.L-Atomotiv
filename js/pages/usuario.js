let usuarios = JSON.parse(localStorage.getItem("usuarios")) || []


function salvarUsuario(){


let usuario = {


nome: document.getElementById("nome").value,
matricula: document.getElementById("matricula").value,
cargo: document.getElementById("cargo").value,
setor: document.getElementById("setor").value,
email: document.getElementById("email").value,
senha: document.getElementById("senha").value,
tipo: document.getElementById("tipo").value,
status: "ativo"


}


usuarios.push(usuario)


localStorage.setItem("usuarios", JSON.stringify(usuarios))


mostrarUsuarios()


}

function pesquisarUsuario(){

let pesquisa = document
.getElementById("pesquisaUsuario")
.value
.toLowerCase()

let tabela = document.getElementById("tabelaUsuarios")
let msg = document.getElementById("msgVazio")

tabela.innerHTML = ""

let encontrados = 0

usuarios.forEach((u,index)=>{

let texto = (u.nome + u.matricula + u.cargo + u.setor + u.email).toLowerCase()

if(texto.includes(pesquisa)){

encontrados++

tabela.innerHTML += `

<tr>
<td>${u.nome}</td>
<td>${u.matricula}</td>
<td>${u.cargo}</td>
<td>${u.setor}</td>
<td>${u.email}</td>
<td>${u.tipo}</td>

<td>
<select onchange="mudarStatus(${index}, this.value)">
<option value="ativo" ${u.status=="ativo"?"selected":""}>Ativo</option>
<option value="inativo" ${u.status=="inativo"?"selected":""}>Inativo</option>
</select>
</td>

<td>
<button class="btn-excluir" onclick="excluirUsuario(${index})">
Excluir
</button>
</td>

</tr>

`

}

})

// 🔥 controle de mensagem
if(encontrados === 0){
msg.style.display = "block"
}else{
msg.style.display = "none"
}

// 🔥 se campo vazio → mostra tudo
if(pesquisa === ""){
mostrarUsuarios()
msg.style.display = "none"
}

}

function limparBusca(){

document.getElementById("pesquisaUsuario").value = ""

mostrarUsuarios()

document.getElementById("msgVazio").style.display = "none"

}


function mostrarUsuarios(){


let tabela = document.getElementById("tabelaUsuarios")


tabela.innerHTML = ""


usuarios.forEach((u,index)=>{


tabela.innerHTML += `


<tr>
<td>${u.nome}</td>
<td>${u.matricula}</td>
<td>${u.cargo}</td>
<td>${u.setor}</td>
<td>${u.email}</td>
<td>${u.tipo}</td>


<td>
<select onchange="mudarStatus(${index}, this.value)">
<option value="ativo" ${u.status=="ativo"?"selected":""}>Ativo</option>
<option value="inativo" ${u.status=="inativo"?"selected":""}>Inativo</option>
</select>
</td>


<td>
<button class="btn-excluir" onclick="excluirUsuario(${index})">
Excluir
</button>
</td>


</tr>


`


})


}


function mudarStatus(index,novoStatus){


usuarios[index].status = novoStatus


localStorage.setItem("usuarios", JSON.stringify(usuarios))


mostrarUsuarios()


}


function excluirUsuario(index){


usuarios.splice(index,1)


localStorage.setItem("usuarios", JSON.stringify(usuarios))


mostrarUsuarios()


}


mostrarUsuarios()
