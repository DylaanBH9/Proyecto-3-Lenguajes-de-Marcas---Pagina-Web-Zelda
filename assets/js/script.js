document.addEventListener('DOMContentLoaded', () => {

    // MODO OSCURO / CLARO
    const botonModo = document.querySelector('.boton__modo');
    const body = document.body;

    if (localStorage.getItem('modoOscuro') === 'activado') {
        body.classList.add('oscuro');
    }

    if (botonModo) {

        if (body.classList.contains('oscuro')) {
            botonModo.textContent = 'Modo Claro';
        } else {
            botonModo.textContent = 'Modo Oscuro';
        }

        botonModo.addEventListener('click', () => {
            body.classList.toggle('oscuro');

            if (body.classList.contains('oscuro')) {
                botonModo.textContent = 'Modo Claro';
                localStorage.setItem('modoOscuro', 'activado');
            } else {
                botonModo.textContent = 'Modo Oscuro';
                localStorage.setItem('modoOscuro', 'desactivado');
            }
        });
    }

    // LÓGICA DE TU BUSCADOR

});