// transformar_xml2json.js - Conversión de XML a JSON

export async function obtenerCatalogoJSON() {
    const respuesta = await fetch('data/juegos.xml');

    const textoXML = await respuesta.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(textoXML, "application/xml");
    const juegosXML = xmlDoc.querySelectorAll("juego");

    const juegosJSON = Array.from(juegosXML).map(juego => {
        return {
            id: juego.getAttribute('id'),
            titulo: juego.querySelector('titulo').textContent,
            plataforma: juego.querySelector('plataforma').textContent,
            anio: Number(juego.querySelector('anio').textContent),
            puntuacion: Number(juego.querySelector('puntuacion').textContent),
            tipo: "juegos"
        };
    });

    return juegosJSON;
}