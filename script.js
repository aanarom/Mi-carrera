let materias = [];
let aprobadas = new Set();

async function cargarMaterias() {
  const resp = await fetch('materias.json');
  materias = await resp.json();
  mostrarMalla();
}

function mostrarMalla() {
  const malla = document.getElementById('malla');
  malla.innerHTML = '';

  // Agrupar materias por año
  const años = [...new Set(materias.map(m => m.año))].sort();

  años.forEach(año => {
    const seccion = document.createElement('div');
    seccion.classList.add('año-section');

    const titulo = document.createElement('div');
    titulo.textContent = `Año ${año}`;
    titulo.classList.add('año-titulo');
    seccion.appendChild(titulo);

    // Materias de ese año
    materias
      .filter(m => m.año === año)
      .forEach(materia => {
        const div = document.createElement('div');
        div.textContent = materia.nombre;
        div.classList.add('materia');
        div.dataset.nombre = materia.nombre;
        div.classList.add('bloqueada'); // por defecto bloqueada

        div.addEventListener('click', () => {
          if (div.classList.contains('bloqueada')) return;
          if (div.classList.contains('aprobada')) {
            div.classList.remove('aprobada');
            aprobadas.delete(materia.nombre);
          } else {
            div.classList.add('aprobada');
            aprobadas.add(materia.nombre);
          }
          actualizarDesbloqueos();
        });

        seccion.appendChild(div);
      });

    malla.appendChild(seccion);
  });

  actualizarDesbloqueos();
}

function actualizarDesbloqueos() {
  document.querySelectorAll('.materia').forEach(div => {
    const nombre = div.dataset.nombre;
    const materia = materias.find(m => m.nombre === nombre);

    const previas = materia.previas;

    let desbloqueada = false;

    if (previas === "TODAS") {
      // Requiere todas las materias aprobadas menos ella misma
      const todasMenosElla = materias
        .map(m => m.nombre)
        .filter(n => n !== nombre);
      desbloqueada = todasMenosElla.every(n => aprobadas.has(n));
    } else if (Array.isArray(previas)) {
      // Requiere aprobar todas las previas
      desbloqueada = previas.every(p => aprobadas.has(p)) || previas.length === 0;
    }

    if (desbloqueada) {
      div.classList.remove('bloqueada');
    } else {
      div.classList.add('bloqueada');
      div.classList.remove('aprobada');
      aprobadas.delete(nombre);
    }
  });
}

cargarMaterias();
