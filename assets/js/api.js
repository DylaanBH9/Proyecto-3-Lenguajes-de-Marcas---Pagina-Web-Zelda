// api.js - Lógica de conexión con Zelda API y Caché

export async function buscarEnZeldaAPI(termino, endpointReal) {
    const claveCache = `zelda_${endpointReal}_${termino.toLowerCase()}`;
    const datosCacheados = localStorage.getItem(claveCache);

    // 1. Comprobar Caché
    if (datosCacheados) {
        console.log("Datos cargados desde localStorage (Caché)");
        return JSON.parse(datosCacheados);
    }

    // 2. Si no hay caché, llamar a la API
    console.log("Llamando a la Zelda API...");
    const respuesta = await fetch(`https://zelda.fanapis.com/api/${endpointReal}?limit=100`);

    if (!respuesta.ok) {
        throw new Error(`Error en la petición: ${respuesta.status}`);
    }

    const json = await respuesta.json();

    // Filtramos nosotros mismos con JavaScript (solución al problema de la API)
    const resultadosFiltrados = json.data.filter(item =>
        item.name.toLowerCase().includes(termino.toLowerCase())
    );

    // Guardamos en caché
    localStorage.setItem(claveCache, JSON.stringify(resultadosFiltrados));

    return resultadosFiltrados;
}