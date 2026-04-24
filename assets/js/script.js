document.addEventListener('DOMContentLoaded', () => {

    // 1. MODO OSCURO / CLARO
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

    // 2. CARGA DEL CATÁLOGO XML

    const contenedorCatalogo = document.getElementById('contenedor-catalogo');

    if (contenedorCatalogo) {
        cargarCatalogoNativo();
    }

    async function cargarCatalogoNativo() {
        try {
            const respuesta = await fetch('juegos.xml');
            if (!respuesta.ok) {
                throw new Error(`HTTP error! status: ${respuesta.status}`);
            }

            // Cargar el xml juegos
            const textoXML = await respuesta.text();

            // Parsear los datos del xml para tenerlos en una lista con los atributos de cada juego.
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(textoXML, "application/xml");
            const juegos = xmlDoc.querySelectorAll("juego");

            // Seleccionar el ul donde se insertan los li con los articles con la información de cada juego.
            const contenedorCatalogo = document.getElementById('contenedor-catalogo');

            // Recorrer la lista de juegos y crear un elemento por cada uno con su boton interacivo para poder guardarlos en favorito.
            juegos.forEach(juego => {
                const id = juego.getAttribute('id');
                const titulo = juego.querySelector('titulo').textContent;
                const plataforma = juego.querySelector('plataforma').textContent;
                const anio = juego.querySelector('anio').textContent;
                const puntuacion = juego.querySelector('puntuacion').textContent;

                const li = document.createElement('li');
                li.classList.add('favoritos__item');

                const articulo = document.createElement('article');
                articulo.classList.add('tarjeta-fav', 'tarjeta-texto');

                const cabecera = document.createElement('header');
                cabecera.classList.add('tarjeta-texto__cabecera');

                const h3 = document.createElement('h3');
                h3.textContent = titulo;
                cabecera.appendChild(h3);
                articulo.appendChild(cabecera);

                const seccionDatos = document.createElement('section');
                seccionDatos.classList.add('tarjeta-texto__datos');

                const ulEtiquetas = document.createElement('ul');
                ulEtiquetas.classList.add('tarjeta-texto__etiquetas');

                const liPlataforma = document.createElement('li');
                liPlataforma.textContent = plataforma;
                ulEtiquetas.appendChild(liPlataforma);

                const liAnio = document.createElement('li');
                liAnio.textContent = anio;
                ulEtiquetas.appendChild(liAnio);

                seccionDatos.appendChild(ulEtiquetas);

                const pPuntuacion = document.createElement('p');
                pPuntuacion.classList.add('tarjeta-texto__puntuacion');

                const strongPuntuacion = document.createElement('strong');
                strongPuntuacion.textContent = puntuacion;
                strongPuntuacion.classList.add("tarjeta-texto__valoracion")

                pPuntuacion.appendChild(strongPuntuacion);
                pPuntuacion.appendChild(document.createTextNode('/100'));

                seccionDatos.appendChild(pPuntuacion);
                articulo.appendChild(seccionDatos);

                const btnFav = document.createElement('button');
                btnFav.classList.add('boton-fav');
                btnFav.dataset.id = id; // Guarda el ID por si luego lo necesitas para Firebase
                btnFav.setAttribute('aria-label', 'Añadir a favoritos');
                btnFav.title = 'Añadir a favoritos';

                btnFav.addEventListener('click', () => {
                    btnFav.classList.toggle('guardado');

                    if (btnFav.classList.contains('guardado')) {
                        btnFav.setAttribute('aria-label', 'Quitar de favoritos');
                        btnFav.title = 'Quitar de favoritos';
                    } else {
                        btnFav.setAttribute('aria-label', 'Añadir a favoritos');
                        btnFav.title = 'Añadir a favoritos';
                    }
                });

                articulo.appendChild(btnFav);
                li.appendChild(articulo);

                contenedorCatalogo.appendChild(li);
            });

        } catch (error) {
            console.error("Error al cargar el XML:", error);
        }
    }
});