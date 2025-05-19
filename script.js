// Mapeamento de teclas físicas
const mapeamento = {
  'a': 'C',
  's': 'D',
  'd': 'E',
  'f': 'F',
  'g': 'G',
  'h': 'A',
  'j': 'B'
};

function tocarNota(nota) {
  const audio = new Audio(`sounds/${nota}.mp3`);
  audio.play();
}

// Clique com o mouse
document.querySelectorAll('.tecla').forEach(tecla => {
  tecla.addEventListener('click', () => {
    const nota = tecla.dataset.nota;
    tocarNota(nota);
  });
});

// Pressionar o teclado físico
document.addEventListener('keydown', (e) => {
  const tecla = e.key.toLowerCase();
  if (mapeamento[tecla]) {
    tocarNota(mapeamento[tecla]);
    document.querySelector(`[data-nota="${mapeamento[tecla]}"]`)?.classList.add('ativa');
  }
});

// Remover o efeito de pressão
document.addEventListener('keyup', (e) => {
  const tecla = e.key.toLowerCase();
  if (mapeamento[tecla]) {
    document.querySelector(`[data-nota="${mapeamento[tecla]}"]`)?.classList.remove('ativa');
  }
});
