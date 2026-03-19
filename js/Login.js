
localStorage.setItem("tipoUsuario", usuario.tipo)

let tipo = usuario.tipo

if(tipo === "admin"){
    window.location.href = "views/admin/dashboard.html"
}else{
    window.location.href = "views/operador/dashboard.html"
}
{


    
}