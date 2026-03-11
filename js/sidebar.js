const links = document.querySelectorAll(".menu-item") 

links.forEach(link => {

if(link.href === window.location.href){
link.classList.add("active")
}

})