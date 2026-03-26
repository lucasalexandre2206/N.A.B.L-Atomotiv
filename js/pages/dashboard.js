const ctx = document.getElementById('graficoBarras');

new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'],
        datasets: [
            {
                label: 'Computador',
                data: [4000, 3200, 2200, 1200, 2000, 3100, 2200, 1000],
                backgroundColor: '#4e79ff'
            },
            {
                label: 'Dispositivo móvel',
                data: [2500, 1700, 1200, 3000, 1000, 500, 2000, 3000],
                backgroundColor: '#b084ff'
            }
        ]
    }
});