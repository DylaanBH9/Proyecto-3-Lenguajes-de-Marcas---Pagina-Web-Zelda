// Importamos las funciones exactas que pide tu profesor desde el CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAMOnS2Y4IVXY3EAn9WVwXJeVropidUv3A",
    authDomain: "infohyrule-dbh.firebaseapp.com",
    projectId: "infohyrule-dbh",
    storageBucket: "infohyrule-dbh.firebasestorage.app",
    messagingSenderId: "491746827545",
    appId: "1:491746827545:web:4797b3568a8bde7744b988",
    measurementId: "G-VFPNG270JZ"
};


// Inicializamos la App y la Base de Datos
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const coleccionFavs = collection(db, "favoritos");

// 1. OBTENER TODOS LOS FAVORITOS
export async function obtenerFavoritos() {
    const snapshot = await getDocs(coleccionFavs);
    const favoritos = [];
    snapshot.forEach(documento => {
        favoritos.push({ idFirebase: documento.id, ...documento.data() });
    });
    return favoritos;
}

// 2. AGREGAR A FAVORITOS
export async function agregarFavorito(idApi, titulo, plataforma, anio, endpoint) {
    const docRef = await addDoc(coleccionFavs, {
        idApi: idApi,
        titulo: titulo,
        plataforma: plataforma || "Desconocida",
        anio: anio || "N/A",
        tipo: endpoint, // 'games' o 'monsters'
        fechaAdicion: new Date().getTime() // Guardamos en milisegundos para poder ordenar luego
    });
    return docRef.id; // Devuelve el ID de Firestore
}

// 3. ELIMINAR DE FAVORITOS
export async function eliminarFavorito(idFirebase) {
    const referenciaDoc = doc(db, "favoritos", idFirebase);
    await deleteDoc(referenciaDoc);
}