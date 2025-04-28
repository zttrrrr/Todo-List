
document.addEventListener("DOMContentLoaded", () => {
    const inputTarea = document.getElementById("inputTarea");
    const btnAgregar = document.getElementById("btnAgregar");
    const listaTareas = document.getElementById("listaTareas");
    const btnEliminarCompletadas = document.getElementById("btnEliminarCompletadas");
    const tareaMasRapida = document.getElementById("tareaMasRapida");
    const botonesFiltro = document.querySelectorAll(".filtro");

    let tareas = JSON.parse(localStorage.getItem("tareas")) || [];
    let filtroActual = "todas";

    const guardarTareas = () => localStorage.setItem("tareas", JSON.stringify(tareas));

    const renderizarTareas = () => {
        listaTareas.innerHTML = "";

        let tareasFiltradas = tareas;
        if (filtroActual === "pendientes") {
            tareasFiltradas = tareas.filter(t => !t.completada);
        } else if (filtroActual === "completadas") {
            tareasFiltradas = tareas.filter(t => t.completada);
        }

        tareasFiltradas
            .sort((a, b) => new Date(a.creadaEn) - new Date(b.creadaEn))
            .forEach(({ id, texto, completada, creadaEn }) => {
                const li = document.createElement("li");
                li.className = "tarea-item";

                li.innerHTML = `
                    <span class="tarea-texto ${completada ? 'completada' : ''}" data-id="${id}">
                        ${texto} (${new Date(creadaEn).toLocaleString()})
                    </span>
                    <div>
                        <button class="btnToggle" data-id="${id}">${completada ? "Desmarcar" : "Completar"}</button>
                        <button class="btnEliminar" data-id="${id}">Eliminar</button>
                    </div>
                `;

                listaTareas.appendChild(li);
            });

        calcularTareaMasRapida();
    };

    const calcularTareaMasRapida = () => {
        const completadas = tareas.filter(t => t.completada && t.completadaEn);

        if (completadas.length === 0) {
            tareaMasRapida.textContent = "";
            return;
        }

        const tarea = completadas.reduce((prev, curr) => {
            const tiempoPrev = new Date(prev.completadaEn) - new Date(prev.creadaEn);
            const tiempoCurr = new Date(curr.completadaEn) - new Date(curr.creadaEn);
            return tiempoCurr < tiempoPrev ? curr : prev;
        });

        const tiempoSegundos = ((new Date(tarea.completadaEn) - new Date(tarea.creadaEn)) / 1000).toFixed(2);
        tareaMasRapida.textContent = ` Tarea más rápida: "${tarea.texto}" en ${tiempoSegundos} segundos`;
    };

    btnAgregar.addEventListener("click", () => {
        const texto = inputTarea.value.trim();
        if (!texto) return;

        const nuevaTarea = {
            id: Date.now(),
            texto,
            completada: false,
            creadaEn: new Date().toISOString(),
            completadaEn: null
        };

        tareas.push(nuevaTarea);
        guardarTareas();
        renderizarTareas();
        inputTarea.value = "";
    });

    listaTareas.addEventListener("click", (e) => {
        const id = Number(e.target.dataset.id);
        if (e.target.classList.contains("btnToggle")) {
            tareas = tareas.map(t => t.id === id ? {
                ...t,
                completada: !t.completada,
                completadaEn: t.completada ? null : new Date().toISOString()
            } : t);
        }

        if (e.target.classList.contains("btnEliminar")) {
            tareas = tareas.filter(t => t.id !== id);
        }

        guardarTareas();
        renderizarTareas();
    });

    btnEliminarCompletadas.addEventListener("click", () => {
        tareas = tareas.filter(t => !t.completada);
        guardarTareas();
        renderizarTareas();
    });

    botonesFiltro.forEach(boton => {
        boton.addEventListener("click", () => {
            filtroActual = boton.dataset.filtro;
            renderizarTareas();
        });
    });

    renderizarTareas();
});
