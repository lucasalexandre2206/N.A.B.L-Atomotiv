let maquinas = JSON.parse(localStorage.getItem("maquinas")) || []


function salvarMaquina(){


let maquina = {


nome: document.getElementById("nomeMaquina").value,
codigo: document.getElementById("codigoMaquina").value,
setor: document.getElementById("setorMaquina").value,
status: document.getElementById("statusMaquina").value


}


maquinas.push(maquina)


localStorage.setItem("maquinas", JSON.stringify(maquinas))


mostrarMaquinas()


}


function mostrarMaquinas(){


let tabela = document.getElementById("tabelaMaquinas")


tabela.innerHTML = ""


maquinas.forEach((m,index)=>{


tabela.innerHTML += `


<tr>
<td>${m.nome}</td>
<td>${m.codigo}</td>
<td>${m.setor}</td>


<td>
<select onchange="mudarStatus(${index}, this.value)">
<option value="ativo" ${m.status=="ativo"?"selected":""}>Ativo</option>
<option value="manutencao" ${m.status=="manutencao"?"selected":""}>Manutenção</option>
</select>
</td>


<td>
<button class="btn-excluir" onclick="excluirMaquina(${index})">
Excluir
</button>
</td>


</tr>


`


})


}


function mudarStatus(index,novoStatus){


maquinas[index].status = novoStatus


localStorage.setItem("maquinas", JSON.stringify(maquinas))


mostrarMaquinas()


}


function excluirMaquina(index){


maquinas.splice(index,1)


localStorage.setItem("maquinas", JSON.stringify(maquinas))


mostrarMaquinas()


}


mostrarMaquinas()

