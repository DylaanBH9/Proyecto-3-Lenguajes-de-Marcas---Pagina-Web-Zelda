# InfoHyrule - Enciclopedia de The Legend of Zelda

InfoHyrule es una web donde los fans de *The Legend of Zelda* pueden buscar juegos y criaturas de la saga.  
También permite ver un catálogo antiguo en XML y guardar favoritos en la nube para no perderlos.

---

## Tecnologías usadas

En este proyecto he usado tecnologías web básicas, sin frameworks pesados:

- **HTML5 y CSS3**: estructura de la web y diseño adaptable (responsive), con modo claro y oscuro.
- **JavaScript (Vanilla JS)**: lógica de la app, separada en archivos (`api.js`, `ui.js`, `transform.js`, `firebase.js`).
- **Firebase Firestore**: base de datos en la nube para guardar favoritos.
- **DOMParser**: para leer el archivo XML desde el navegador y convertirlo.

---

## API usada (Zelda API)

La app usa la [Zelda API](https://docs.zelda.fanapis.com/) para obtener datos en formato JSON.  
Las peticiones se hacen con `fetch` y `async/await`.

Endpoints principales:

1. `/api/games` → buscar juegos.
2. `/api/monsters` → buscar monstruos.

Ejemplo de respuesta de `/api/games`:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "name": "The Legend of Zelda: Breath of the Wild",
      "description": "The Legend of Zelda: Breath of the Wild is the nineteenth main installment...",
      "developer": "Nintendo EPD",
      "publisher": "Nintendo",
      "released_date": "March 3, 2017",
      "id": "5f6ce9d805615a85623ea218"
    }
  ]
}
```

De esta respuesta uso sobre todo `id`, `name` y `description` para mostrar las tarjetas.

---

## Formatos de datos que uso

En el proyecto aparecen 3 formatos:

- **XML**: se usa en `juegos.xml` (catálogo antiguo).
- **JSON**: es el formato de la API, más cómodo para trabajar en JavaScript.
- **CSV**: formato de texto por comas, útil para exportar datos.

---

## Almacenamiento de datos

### 1) LocalStorage (caché)

Guarda datos en el navegador del usuario.

- Lo uso para guardar búsquedas ya hechas y no repetir llamadas a la API.
- Ventaja: carga más rápido.
- Límite: solo funciona en ese dispositivo y tiene poco espacio.

### 2) Firebase Firestore (favoritos)

Guarda los favoritos en la nube.

- Así los favoritos se mantienen entre sesiones y dispositivos.
- Ahora mismo está en **modo test** (abierto temporalmente).
- En producción habría que añadir autenticación y reglas de seguridad.

---

## Decisiones técnicas importantes

- **Búsqueda en paralelo con `Promise.all`**: para buscar juegos y monstruos al mismo tiempo.
- **Debounce en el buscador (500 ms)**: evita hacer una petición por cada letra.
- **Código modular**: cada archivo tiene su función (`api`, `ui`, `transform`, `firebase`).

---

## Cómo ejecutar el proyecto

1. Desde el repositorio de github selecciona el enlace que esta a la derecha en la parte de about o dale click al siguiente enlace:
[Página InfoHyrule](https://dylaanbh9.github.io/Proyecto-3-Lenguajes-de-Marcas---Pagina-Web-Zelda/)