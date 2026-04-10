fetch("/components/sidebar.html")
.then(res => res.text())
.then(data => {
    document.getElementById("sidebar-container").innerHTML = data

    carregarSidebar()   
    ativarToggle()     
})