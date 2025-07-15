const mallaDiv = document.getElementById('malla');
let materias = [];
let aprobadas = new Set();

fetch('materias.json')
  .then(res => res.json())
  .then(data => {
    materias = data;
    renderMaterias();
    actualizarDesbloqueos();
  });

function renderMaterias() {
  mallaDiv.innerHTML = '';
  materias.forEach(materia => {
    const div = document.createElement('div');
    div.classList.add('materia', 'bloqueada');
    div.textContent = materia.nombre;
    div.dataset.nombre = materia.nombre;

    div.addEventListener('click', () => {
      if (div.classList.contains('bloqueada')) return; // no clic si bloqueada

      if (aprobadas.has(materia.nombre)) {
        aprobadas.delete(materia.nombre);
        div.classList.remove('aprobada');
      } else {
        aprobadas.add(materia.nombre);
        div.classList.add('aprobada');
      }
      actualizarDesbloqueos();
    });

    mallaDiv.appendChild(div);
  });
}

function actualizarDesbloqueos() {
  document.querySelectorAll('.materia').forEach(div => {
    const nombre = div.dataset.nombre;
    const materia = materias.find(m => m.nombre === nombre);

    const previas = materia.previas || [];
    const desbloqueada = previas.every(p => aprobadas.has(p)) || previas.length === 0;

    if (desbloqueada) {
      div.classList.remove('bloqueada');
    } else {
      div.classList.add('bloqueada');
      div.classList.remove('aprobada');
      aprobadas.delete(nombre);
    }
  });
}
