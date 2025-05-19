const mapeamento = {
  'z': 'do',
  's': 'do#',
  'x': 're',
  'd': 're#',
  'c': 'mi',
  'v': 'fa',
  'g': 'fa#',
  'b': 'sol',
  'h': 'sol#',
  'n': 'la',
  'j': 'la#',
  'm': 'si',
};

function tocarNota(nota) {
  const nomeArquivo = `sons/som${nota.replace('#', 'Sustenido')}.mp3`;
  const audio = new Audio(nomeArquivo);
  audio.play();
}

document.querySelectorAll('.tecla').forEach(tecla => {
  tecla.addEventListener('click', () => {
    const nota = tecla.dataset.nota;
    tocarNota(nota);
    tecla.classList.add('ativa');
    setTimeout(() => tecla.classList.remove('ativa'), 150);
  });
});

document.addEventListener('keydown', (e) => {
  const tecla = e.key.toLowerCase();
  if (mapeamento[tecla]) {
    const nota = mapeamento[tecla];
    tocarNota(nota);
    document.querySelector(`[data-nota="${nota}"]`)?.classList.add('ativa');
  }
});

document.addEventListener('keyup', (e) => {
  const tecla = e.key.toLowerCase();
  if (mapeamento[tecla]) {
    const nota = mapeamento[tecla];
    document.querySelector(`[data-nota="${nota}"]`)?.classList.remove('ativa');
  }
});
