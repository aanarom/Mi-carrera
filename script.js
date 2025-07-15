let materias = [];
let aprobadas = new Set();

async function cargarMaterias() {
  const resp = await fetch('materias.json');
  materias = await resp.json();

  // Cargar aprobadas guardadas
  const guardadas = localStorage.getItem('aprobadas');
  if (guardadas) {
    try {
      const arr = JSON.parse(guardadas);
      aprobadas = new Set(arr);
    } catch {
      aprobadas = new Set();
    }
  }

  mostrarMalla();
}

function mostrarMalla() {
  const malla = document.getElementById('malla');
  malla.innerHTML = '';

  const años = [...new Set(materias.map(m => m.año))].sort();

  años.forEach(año => {
    const seccion = document.createElement('div');
    seccion.classList.add('año-section');

    const titulo = document.createElement('div');
    titulo.textContent = `Año ${año}`;
    titulo.classList.add('año-titulo');
    seccion.appendChild(titulo);

    materias.filter(m => m.año === año).forEach(materia => {
      const div = document.createElement('div');
      div.textContent = materia.nombre;
      div.classList.add('materia');
      div.dataset.nombre = materia.nombre;

      // Lo agrego para marcar aprobado si ya está en la lista
      if (aprobadas.has(materia.nombre)) {
        div.classList.add('aprobada');
      }

      div.addEventListener('click', () => {
        // Antes de hacer nada verifico si está desbloqueada
        if (div.classList.contains('bloqueada')) {
          alert(`No podés aprobar "${materia.nombre}" porque no tenés aprobadas todas sus previas.`);
          return;
        }

        if (div.classList.contains('aprobada')) {
          div.classList.remove('aprobada');
          aprobadas.delete(materia.nombre);
        } else {
          div.classList.add('aprobada');
          aprobadas.add(materia.nombre);
        }

        localStorage.setItem('aprobadas', JSON.stringify([...aprobadas]));

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
      const todasMenosElla = materias
        .map(m => m.nombre)
        .filter(n => n !== nombre);
      desbloqueada = todasMenosElla.every(n => aprobadas.has(n));
    } else if (Array.isArray(previas)) {
      desbloqueada = previas.length === 0 || previas.every(p => aprobadas.has(p));
    }

    if (desbloqueada) {
      div.classList.remove('bloqueada');
      div.tabIndex = 0;
    } else {
      div.classList.add('bloqueada');
      // Si estaba aprobada pero ya no cumple previas, la desmarco
      if (div.classList.contains('aprobada')) {
        div.classList.remove('aprobada');
        aprobadas.delete(nombre);
        localStorage.setItem('aprobadas', JSON.stringify([...aprobadas]));
      }
      div.tabIndex = -1;
    }
  });
}

cargarMaterias();
