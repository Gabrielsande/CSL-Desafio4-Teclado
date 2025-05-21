const mapeamento = {
  'z': 'do',  's': 'do#', 'x': 're', 'd': 're#',
  'c': 'mi',  'v': 'fa',  'g': 'fa#', 'b': 'sol',
  'h': 'sol#','n': 'la',  'j': 'la#', 'm': 'si',
  '1': 'engracado', '2': 'gravar', '3': 'reproduzir'
};

let gravando = false;
let gravaNotas = [];
let inicioGravacao = 0;
let modoEngracado = false;

let duracaoReproducao = 0;
let inicioReproducao = 0;
let intervaloProgresso;
let tocando = false;

const btnGravar = document.getElementById('btnGravar');
const btnReproduzir = document.getElementById('btnReproduzir');
const btnEngracado = document.getElementById('btnEngracado');
const barraProgresso = document.getElementById('barraProgresso');

function formatarTempo(ms) {
  const s = Math.floor(ms / 1000);
  const min = Math.floor(s / 60);
  const seg = s % 60;
  return `${min}:${seg < 10 ? '0' + seg : seg}`;
}

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
    const notaOuComando = mapeamento[tecla];
    if (notaOuComando === 'gravar') btnGravar.click();
    else if (notaOuComando === 'reproduzir') btnReproduzir.click();
    else if (notaOuComando === 'engracado') btnEngracado.click();
    else {
      tocarNota(notaOuComando);
      const teclaElemento = document.querySelector(`[data-nota="${notaOuComando}"]`);
      teclaElemento?.classList.add('ativa');
      if (gravando) {
        const tempoAgora = Date.now();
        gravaNotas.push({ nota: notaOuComando, tempo: tempoAgora - inicioGravacao });
      }
    }
  }
});

document.addEventListener('keyup', e => {
  const nota = mapeamento[e.key.toLowerCase()];
  if (nota && !['gravar', 'reproduzir', 'engracado'].includes(nota)) {
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
    atualizarBarraManual(0);
  } else {
    gravando = false;
    btnGravar.textContent = 'Gravar';
    btnReproduzir.disabled = gravaNotas.length === 0;
  }
});

btnReproduzir.addEventListener('click', () => {
  if (gravaNotas.length === 0) return;

  btnGravar.disabled = true;
  btnReproduzir.disabled = true;

  const duracao = gravaNotas[gravaNotas.length - 1].tempo;
  iniciarBarra(duracao);

  gravaNotas.forEach(({ nota, tempo }, index) => {
    setTimeout(() => {
      tocarNota(nota);
      const tecla = document.querySelector(`[data-nota="${nota}"]`);
      tecla?.classList.add('ativa');
      setTimeout(() => tecla?.classList.remove('ativa'), 150);

      if (index === gravaNotas.length - 1) {
        btnGravar.disabled = false;
        btnReproduzir.disabled = false;
        pararBarra();
      }
    }, tempo);
  });
});

btnEngracado.addEventListener('click', () => {
  modoEngracado = !modoEngracado;
  btnEngracado.classList.toggle('ativo');
  btnEngracado.textContent = modoEngracado ? 'Modo Normal 🎉' : 'Modo Engraçado 🎵';
});

// BARRA DE PROGRESSO COM CONTROLE MANUAL

function iniciarBarra(duracao = 5000) {
  duracaoReproducao = duracao;
  inicioReproducao = Date.now();
  tocando = true;

  intervaloProgresso = setInterval(() => {
    const tempoAtual = Date.now() - inicioReproducao;
    const progresso = Math.min((tempoAtual / duracaoReproducao) * 100, 100);

    barraProgresso.value = progresso;
    document.getElementById('tempoAtual').textContent = formatarTempo(tempoAtual);
    document.getElementById('tempoTotal').textContent = formatarTempo(duracaoReproducao);

    if (progresso >= 100) pararBarra();
  }, 100);
}

function pararBarra() {
  clearInterval(intervaloProgresso);
  tocando = false;
}

function atualizarBarraManual(porcentagem) {
  barraProgresso.value = porcentagem;
  document.getElementById('tempoAtual').textContent = formatarTempo(0);
  document.getElementById('tempoTotal').textContent = formatarTempo(0);
}

barraProgresso.addEventListener('input', (e) => {
  if (!tocando) return;
  const novoProgresso = parseFloat(e.target.value);
  const novoTempo = (novoProgresso / 100) * duracaoReproducao;

  document.getElementById('tempoAtual').textContent = formatarTempo(novoTempo);
  inicioReproducao = Date.now() - novoTempo;
});
