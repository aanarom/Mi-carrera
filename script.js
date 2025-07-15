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

  // Crear las materias sin ninguna clase aún
  materias.forEach(materia => {
    const div = document.createElement('div');
    div.textContent = materia.nombre;
    div.classList.add('materia');
    div.dataset.nombre = materia.nombre;

    div.addEventListener('click', () => {
      // Solo si está desbloqueada
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

    malla.appendChild(div);
  });

  actualizarDesbloqueos();
}

function actualizarDesbloqueos() {
  // Primero guardamos en una variable para optimizar
  const aprobadasArray = [...aprobadas];

  document.querySelectorAll('.materia').forEach(div => {
    const nombre = div.dataset.nombre;
    const materia = materias.find(m => m.nombre === nombre);

    let desbloqueada = false;

    if (materia.previas === "TODAS") {
      // requiere todas menos ella
      const todasMenosElla = materias
        .map(m => m.nombre)
        .filter(n => n !== nombre);

      desbloqueada = todasMenosElla.every(n => aprobadas.has(n));
    } else if (Array.isArray(materia.previas)) {
      desbloqueada = materia.previas.length === 0 || materia.previas.every(p => aprobadas.has(p));
    }

    if (desbloqueada) {
      div.classList.remove('bloqueada');
      div.tabIndex = 0;
    } else {
      div.classList.add('bloqueada');
      div.tabIndex = -1;

      // Si estaba marcada como aprobada y ahora no debería, la quitamos
      if (div.classList.contains('aprobada')) {
        div.classList.remove('aprobada');
        aprobadas.delete(nombre);
        localStorage.setItem('aprobadas', JSON.stringify([...aprobadas]));
      }
    }
  });
}

cargarMaterias();
