// ui_dom_eventos.js - Manipulación del DOM y eventos

import { agregarFavorito, eliminarFavorito, obtenerFavoritos } from './firebase.js';
import { buscarEnZeldaAPI } from './api.js';
import { obtenerCatalogoJSON } from './transformar_xml2json.js';

document.addEventListener('DOMContentLoaded', async () => {

    // 1. MODO OSCURO / CLARO
    const botonModo = document.querySelector('.boton__modo');
    const body = document.body;

    if (localStorage.getItem('modoOscuro') === 'activado') {
        body.classList.add('oscuro');
        if (botonModo) botonModo.textContent = 'Modo Claro';
    }

    if (botonModo) {
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

    // 2. CARGAR FAVORITOS GLOBALES
    let listaFavoritos = [];
    try {
        listaFavoritos = await obtenerFavoritos();
    } catch (error) {
        console.error("Error al cargar favoritos iniciales:", error);
    }

    // SECCIÓN CATÁLOGO (XML)
    const contenedorCatalogo = document.getElementById('contenedor-catalogo');
    if (contenedorCatalogo) {
        cargarYRenderizarCatalogo();
    }

    async function cargarYRenderizarCatalogo() {
        try {
            // Usamos la función modular importada de transformar_xml2json.js
            const juegosJSON = await obtenerCatalogoJSON();

            juegosJSON.forEach(juego => {
                crearTarjetaDOM(
                    juego.id, juego.titulo, juego.plataforma,
                    juego.anio, juego.puntuacion, juego.tipo, contenedorCatalogo
                );
            });
        } catch (error) {
            console.error("Error al cargar el catálogo:", error);
            contenedorCatalogo.innerHTML = '<p>Error al cargar el catálogo.</p>';
        }
    }


    // SECCIÓN BUSCADOR (API)
    const inputBusqueda = document.getElementById('input-busqueda');
    const filtroEndpoint = document.getElementById('filtro-endpoint');
    const contenedorResultados = document.getElementById('contenedor-resultados');
    const formulario = document.getElementById('formulario-busqueda');

    if (inputBusqueda && contenedorResultados) {
        let temporizadorDebounce;

        const realizarBusqueda = async () => {
            const termino = inputBusqueda.value.trim();
            const endpoint = filtroEndpoint.value;

            if (termino === '') {
                contenedorResultados.innerHTML = '';
                return;
            }

            contenedorResultados.innerHTML = '<p class="busqueda__contexto" style="grid-column: 1/-1; text-align: center;">Buscando en Hyrule...</p>';

            try {
                let resultadosFinales = [];

                if (endpoint === 'todos') {
                    // Promise.all para buscar en los dos a la vez
                    const [resJuegos, resMonstruos] = await Promise.all([
                        buscarEnZeldaAPI(termino, 'games'),
                        buscarEnZeldaAPI(termino, 'monsters')
                    ]);

                    resJuegos.forEach(item => item.endpointOrigen = 'games');
                    resMonstruos.forEach(item => item.endpointOrigen = 'monsters');

                    resultadosFinales = [...resJuegos, ...resMonstruos];
                } else {
                    const endpointReal = endpoint === 'juegos' ? 'games' : 'monsters';
                    resultadosFinales = await buscarEnZeldaAPI(termino, endpointReal);
                    resultadosFinales.forEach(item => item.endpointOrigen = endpointReal);
                }

                renderizarResultadosAPI(resultadosFinales);

            } catch (error) {
                console.error(error);
                contenedorResultados.innerHTML = '<p class="busqueda__contexto" style="grid-column: 1/-1; text-align: center; color: #c95c5c;">Error de conexión.</p>';
            }
        };

        inputBusqueda.addEventListener('input', () => {
            clearTimeout(temporizadorDebounce);
            temporizadorDebounce = setTimeout(realizarBusqueda, 500);
        });

        if (formulario) {
            formulario.addEventListener('submit', (e) => {
                e.preventDefault();
                clearTimeout(temporizadorDebounce);
                realizarBusqueda();
            });
        }

        if (filtroEndpoint) {
            filtroEndpoint.addEventListener('change', () => {
                if (inputBusqueda.value.trim() !== '') {
                    clearTimeout(temporizadorDebounce);
                    realizarBusqueda();
                }
            });
        }
    }

    function renderizarResultadosAPI(resultados) {
        contenedorResultados.innerHTML = '';

        if (!resultados || resultados.length === 0) {
            contenedorResultados.innerHTML = '<p class="busqueda__contexto" style="grid-column: 1/-1; text-align: center;">No se encontró nada con ese nombre.</p>';
            return;
        }

        resultados.forEach(item => {
            crearTarjetaDOM(
                item.id,
                item.name,
                item.endpointOrigen.toUpperCase(),
                "N/A",
                (item.description ? item.description.substring(0, 80) + '...' : 'Sin descripción en la base de datos.'),
                item.endpointOrigen,
                contenedorResultados
            );
        });
    }


    // SECCIÓN MIS FAVORITOS (CON ORDEN Y FILTRO)
    const contenedorFavoritos = document.querySelector('.seccion__favoritos .favoritos__lista');
    if (contenedorFavoritos && contenedorCatalogo === null) {
        const filtroTipo = document.getElementById('filtro-tipo');
        const ordenFavs = document.getElementById('orden-favs');
        const btnVaciar = document.getElementById('btn-vaciar');

        function aplicarFiltrosYOrden() {
            let listaFiltrada = [...listaFavoritos];
            const tipo = filtroTipo.value;

            if (tipo !== 'todos') listaFiltrada = listaFiltrada.filter(f => f.tipo === tipo);

            const orden = ordenFavs.value;
            listaFiltrada.sort((a, b) => {
                if (orden === 'nombre-asc') return a.titulo.localeCompare(b.titulo);
                if (orden === 'nombre-desc') return b.titulo.localeCompare(a.titulo);
                if (orden === 'fecha-asc') return a.fechaAdicion - b.fechaAdicion;
                if (orden === 'fecha-desc') return b.fechaAdicion - a.fechaAdicion;
                return 0;
            });

            contenedorFavoritos.innerHTML = '';
            if (listaFiltrada.length === 0) {
                contenedorFavoritos.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No hay favoritos.</p>';
                return;
            }

            listaFiltrada.forEach(fav => {
                crearTarjetaDOM(fav.idApi, fav.titulo, fav.plataforma, fav.anio, "FAV", fav.tipo, contenedorFavoritos, fav.idFirebase);
            });
        }

        if(filtroTipo) filtroTipo.addEventListener('change', aplicarFiltrosYOrden);
        if(ordenFavs) ordenFavs.addEventListener('change', aplicarFiltrosYOrden);

        if(btnVaciar) {
            btnVaciar.addEventListener('click', async () => {
                if (listaFavoritos.length === 0) return;
                btnVaciar.textContent = "Borrando...";
                btnVaciar.disabled = true;
                try {
                    for (const fav of listaFavoritos) await eliminarFavorito(fav.idFirebase);
                    listaFavoritos = [];
                    aplicarFiltrosYOrden();
                } catch (error) {
                    console.error(error);
                } finally {
                    btnVaciar.textContent = "Vaciar Favoritos";
                    btnVaciar.disabled = false;
                }
            });
        }
        aplicarFiltrosYOrden();
    }

    // FUNCIÓN AUXILIAR PARA PINTAR TARJETAS EN CUALQUIER PÁGINA
    function crearTarjetaDOM(id, titulo, dato1, dato2, dato3, tipoEndpoint, contenedor, idFirebaseForzado = null) {
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

        const liDato1 = document.createElement('li'); liDato1.textContent = dato1; ulEtiquetas.appendChild(liDato1);
        if (dato2 !== "N/A") { const liDato2 = document.createElement('li'); liDato2.textContent = dato2; ulEtiquetas.appendChild(liDato2); }

        seccionDatos.appendChild(ulEtiquetas);

        if (dato3 !== "FAV") {
            const pExtra = document.createElement('p');
            pExtra.classList.add('tarjeta-texto__puntuacion');
            if (typeof dato3 === 'number') {
                pExtra.innerHTML = `<strong class="tarjeta-texto__valoracion">${dato3}</strong>/100`;
            } else {
                pExtra.textContent = dato3;
                pExtra.style.marginTop = '1rem';
            }
            seccionDatos.appendChild(pExtra);
        }

        articulo.appendChild(seccionDatos);

        const btnFav = document.createElement('button');
        btnFav.classList.add('boton-fav');
        btnFav.dataset.id = id;

        // Comprobar si es favorito
        let idFirebase = idFirebaseForzado;
        const favExistente = listaFavoritos.find(fav => fav.idApi === id);

        if (favExistente || idFirebase) {
            btnFav.classList.add('guardado');
            btnFav.title = 'Quitar de favoritos';
            if (!idFirebase) idFirebase = favExistente.idFirebase;
        } else {
            btnFav.title = 'Añadir a favoritos';
        }

        btnFav.addEventListener('click', async () => {
            btnFav.classList.toggle('guardado');
            try {
                if (btnFav.classList.contains('guardado')) {
                    btnFav.title = 'Quitar de favoritos';
                    idFirebase = await agregarFavorito(id, titulo, dato1, dato2, tipoEndpoint);
                    listaFavoritos.push({ idApi: id, idFirebase: idFirebase, titulo: titulo, plataforma: dato1, anio: dato2, tipo: tipoEndpoint, fechaAdicion: Date.now() });
                } else {
                    btnFav.title = 'Añadir a favoritos';
                    if (idFirebase) {
                        await eliminarFavorito(idFirebase);
                        listaFavoritos = listaFavoritos.filter(fav => fav.idFirebase !== idFirebase);
                        idFirebase = null;
                        // Si estamos en la página de favoritos, quitamos la tarjeta visualmente al desmarcar
                        if (contenedor === contenedorFavoritos) li.remove();
                    }
                }
            } catch (error) {
                btnFav.classList.toggle('guardado');
                console.error("Error Firebase:", error);
            }
        });

        articulo.appendChild(btnFav);
        li.appendChild(articulo);
        contenedor.appendChild(li);
    }
});