const mapeamento = {
  'z': 'do',  's': 'do#', 'x': 're', 'd': 're#',
  'c': 'mi',  'v': 'fa',  'g': 'fa#', 'b': 'sol',
  'h': 'sol#','n': 'la',  'j': 'la#', 'm': 'si',
};

let gravando = false;
let gravaNotas = [];
let inicioGravacao = 0;
let modoEngracado = false;

const btnGravar = document.getElementById('btnGravar');
const btnReproduzir = document.getElementById('btnReproduzir');
const btnEngracado = document.getElementById('btnEngracado');
const barraProgresso = document.getElementById('barraProgresso');

function tocarNota(nota) {
  let audio;

  if (modoEngracado) {
    const random = Math.floor(Math.random() * 5) + 1;
    audio = new Audio(`sons/somEngracado${random}.mp3`);
  } else {
    const nomeArquivo = `sons/som${nota.replace('#', 'Sustenido')}.mp3`;
    audio = new Audio(nomeArquivo);
  }

  audio.play();
}

document.querySelectorAll('.tecla').forEach(tecla => {
  tecla.addEventListener('click', () => {
    const nota = tecla.dataset.nota;
    tocarNota(nota);
    tecla.classList.add('ativa');
    setTimeout(() => tecla.classList.remove('ativa'), 150);

    if (gravando) {
      const tempoAgora = Date.now();
      gravaNotas.push({ nota, tempo: tempoAgora - inicioGravacao });
    }
  });
});

document.addEventListener('keydown', e => {
  const tecla = e.key.toLowerCase();
  if (mapeamento[tecla]) {
    const nota = mapeamento[tecla];
    tocarNota(nota);
    const teclaElemento = document.querySelector(`[data-nota="${nota}"]`);
    teclaElemento?.classList.add('ativa');

    if (gravando) {
      const tempoAgora = Date.now();
      gravaNotas.push({ nota, tempo: tempoAgora - inicioGravacao });
    }
  }
});

document.addEventListener('keyup', e => {
  const tecla = e.key.toLowerCase();
  if (mapeamento[tecla]) {
    const nota = mapeamento[tecla];
    document.querySelector(`[data-nota="${nota}"]`)?.classList.remove('ativa');
  }
});

btnGravar.addEventListener('click', () => {
  if (!gravando) {
    gravando = true;
    gravaNotas = [];
    inicioGravacao = Date.now();
    btnGravar.textContent = 'Parar';
    btnReproduzir.disabled = true;
    atualizarBarra(0);
    iniciarBarra();
  } else {
    gravando = false;
    btnGravar.textContent = 'Gravar';
    btnReproduzir.disabled = gravaNotas.length === 0;
    pararBarra();
  }
});

btnReproduzir.addEventListener('click', () => {
  if (gravaNotas.length === 0) return;

  btnGravar.disabled = true;
  btnReproduzir.disabled = true;
  atualizarBarra(0);
  iniciarBarra(gravaNotas[gravaNotas.length - 1].tempo);

  gravaNotas.forEach(({ nota, tempo }, index) => {
    setTimeout(() => {
      tocarNota(nota);
      const tecla = document.querySelector(`[data-nota="${nota}"]`);
      tecla?.classList.add('ativa');
      setTimeout(() => tecla?.classList.remove('ativa'), 150);

      if (index === gravaNotas.length - 1) {
        btnGravar.disabled = false;
        btnReproduzir.disabled = false;
      }
    }, tempo);
  });
});

btnEngracado.addEventListener('click', () => {
  modoEngracado = !modoEngracado;
  btnEngracado.classList.toggle('ativo');
  btnEngracado.textContent = modoEngracado ? 'Modo Normal 🎉' : 'Modo Engraçado 🎵';
});

// Barra de progresso
let intervaloBarra;

function iniciarBarra(duracao = 5000) {
  const inicio = Date.now();
  intervaloBarra = setInterval(() => {
    const tempoAtual = Date.now() - inicio;
    const progresso = Math.min((tempoAtual / duracao) * 100, 100);
    atualizarBarra(progresso);
    if (progresso >= 100) pararBarra();
  }, 100);
}

function atualizarBarra(porcentagem) {
  barraProgresso.style.width = `${porcentagem}%`;
}

function pararBarra() {
  clearInterval(intervaloBarra);
}
