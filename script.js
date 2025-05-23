// Mapeamento das teclas do teclado do computador para as notas musicais
const mapeamento = {
  'z': 'do', 's': 'do#', 'x': 're', 'd': 're#',
  'c': 'mi', 'v': 'fa', 'g': 'fa#', 'b': 'sol',
  'h': 'sol#', 'n': 'la', 'j': 'la#', 'm': 'si',
  '1': 'engracado', '2': 'gravar', '3': 'reproduzir'
};

let gravando = false;
let gravaNotas = [];
let inicioGravacao = 0;
let modoEngracado = false;

let duracaoReproducao = 0;
let inicioReproduçao = 0;
let intervaloProgresso;
let tocando = false;

const btnGravar = document.getElementById('btnGravar');
const btnReproduzir = document.getElementById('btnReproduzir');
const btnEngracado = document.getElementById('btnEngracado');
const barraProgresso = document.getElementById('barraProgresso');
const btnSalvar = document.getElementById('btnSalvar');

let ultimaTeclaDestacada = null;
let partesAudioGravado = [];
let mediaRecorder;

let playTimeouts = [];
let reproduzindo = false;

// Formata tempo em milissegundos para mm:ss
function formatarTempo(ms) {
  const s = Math.floor(ms / 1000);
  const min = Math.floor(s / 60);
  const seg = s % 60;
  return `${min}:${seg < 10 ? '0' + seg : seg}`;
}

// Destaca a última tecla tocada na interface
function destacarUltimaTecla(nota) {
  if (ultimaTeclaDestacada) {
    ultimaTeclaDestacada.classList.remove('ultima-ativa');
  }
  const teclaAtual = document.querySelector(`[data-nota="${nota}"]`);
  if (teclaAtual) {
    teclaAtual.classList.add('ultima-ativa');
    ultimaTeclaDestacada = teclaAtual;
  }
}

// Função para tocar uma nota, considerando o modo engraçado
function tocarNota(nota) {
  let audio;
  if (modoEngracado) {
    const sonsEngracadosMap = {
      'do': 'somEngracado1.mp3',
      're': 'somEngracado2.mp3',
      'mi': 'somEngracado3.mp3',
      'fa': 'somEngracado4.mp3',
      'sol': 'somEngracado5.mp3',
      'la': 'somEngracado6.mp3',
      'si': 'somEngracado7.mp3',
    };
    if (sonsEngracadosMap[nota]) {
      audio = new Audio(`sons/${sonsEngracadosMap[nota]}`);
    } else {
      return;
    }
  } else {
    const nomeArquivo = `sons/som${nota.replace('#', 'Sustenido')}.mp3`;
    audio = new Audio(nomeArquivo);
  }
  audio.play();
  destacarUltimaTecla(nota);
}

// Evento de clique nas teclas visuais
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

// Eventos do teclado físico
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

// Gravação de áudio usando MediaRecorder
function iniciarGravacaoAudio() {
  partesAudioGravado = [];
  if (!navigator.mediaDevices || !window.MediaRecorder) {
    alert("Seu navegador não suporta gravação de áudio.");
    return;
  }

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const dest = audioContext.createMediaStreamDestination();

  window.tocarNotaComGravacao = function(nota) {
    let audio;
    if (modoEngracado) {
      const sonsEngracadosMap = {
        'do': 'somEngracado1.mp3',
        're': 'somEngracado2.mp3',
        'mi': 'somEngracado3.mp3',
        'fa': 'somEngracado4.mp3',
        'sol': 'somEngracado5.mp3',
        'la': 'somEngracado6.mp3',
        'si': 'somEngracado7.mp3',
      };
      if (sonsEngracadosMap[nota]) {
        audio = new Audio(`sons/${sonsEngracadosMap[nota]}`);
      } else {
        return;
      }
    } else {
      const nomeArquivo = `sons/som${nota.replace('#', 'Sustenido')}.mp3`;
      audio = new Audio(nomeArquivo);
    }

    const source = audioContext.createMediaElementSource(audio);
    source.connect(dest);
    source.connect(audioContext.destination);
    audio.play();
    destacarUltimaTecla(nota);
  };

  mediaRecorder = new MediaRecorder(dest.stream);
  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) {
      partesAudioGravado.push(e.data);
    }
  };

  mediaRecorder.start();
}

function pararGravacaoAudio() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
}

// Substituir tocarNota para usar tocarNotaComGravacao durante gravação
const tocarNotaOriginal = tocarNota;
tocarNota = function(nota){
  if (gravando && window.tocarNotaComGravacao) {
    window.tocarNotaComGravacao(nota);
  } else {
    tocarNotaOriginal(nota);
  }
  if (gravando) {
    const tempoAgora = Date.now();
    gravaNotas.push({ nota, tempo: tempoAgora - inicioGravacao });
  }
}

// Botão Gravar: inicia/parar gravação
btnGravar.addEventListener('click', () => {
  if (!gravando) {
    gravando = true;
    gravaNotas = [];
    inicioGravacao = Date.now();
    btnGravar.textContent = 'Parar';
    btnReproduzir.disabled = true;
    btnSalvar.disabled = true;
    atualizarBarraManual(0);
    iniciarGravacaoAudio();
  } else {
    gravando = false;
    btnGravar.textContent = 'Gravar';
    btnReproduzir.disabled = gravaNotas.length === 0;
    btnSalvar.disabled = gravaNotas.length === 0;
    pararGravacaoAudio();
  }
});

// Botão Reproduzir: toca ou pausa a gravação
btnReproduzir.addEventListener('click', () => {
  if (gravaNotas.length === 0) return;

  if (!reproduzindo) {
    reproduzindo = true;
    atualizarIconeBotaoReproduzir(true);
    btnGravar.disabled = true;
    btnSalvar.disabled = true;

    const duracao = gravaNotas[gravaNotas.length - 1].tempo;
    iniciarBarra(duracao);

    playTimeouts = [];
    gravaNotas.forEach(({ nota, tempo }, index) => {
      const timeoutId = setTimeout(() => {
        tocarNotaOriginal(nota);
        const tecla = document.querySelector(`[data-nota="${nota}"]`);
        tecla?.classList.add('ativa');
        setTimeout(() => tecla?.classList.remove('ativa'), 150);

        if (index === gravaNotas.length - 1) {
          reproduzindo = false;
          btnGravar.disabled = false;
          btnSalvar.disabled = gravaNotas.length === 0;
          atualizarIconeBotaoReproduzir(false);
          pararBarra();
          playTimeouts = [];
        }
      }, tempo);
      playTimeouts.push(timeoutId);
    });
  } else {
    reproduzindo = false;
    atualizarIconeBotaoReproduzir(false);
    btnGravar.disabled = false;
    btnSalvar.disabled = gravaNotas.length === 0;

    playTimeouts.forEach(id => clearTimeout(id));
    playTimeouts = [];

    pararBarra();
  }
});

// Atualiza o ícone do botão Reproduzir (play/pause)
function atualizarIconeBotaoReproduzir(estaReproduzindo) {
  const btn = btnReproduzir;
  btn.innerHTML = '';

  if (estaReproduzindo) {
    btn.style.setProperty('background-color', 'transparent');
    btn.style.position = 'relative';

    btn.innerHTML = `
      <span style="
        position: absolute;
        left: 22px;
        top: 15px;
        width: 8px;
        height: 30px;
        background: white;
        border-radius: 2px;
        box-shadow: 1px 0 2px rgba(0,0,0,0.4);
      "></span>
      <span style="
        position: absolute;
        left: 38px;
        top: 15px;
        width: 8px;
        height: 30px;
        background: white;
        border-radius: 2px;
        box-shadow: 1px 0 2px rgba(0,0,0,0.4);
      "></span>
    `;
  } else {
    btn.style.setProperty('background-color', 'transparent');
    btn.style.position = 'relative';

    const triangle = document.createElement('div');
    triangle.style.width = "0";
    triangle.style.height = "0";
    triangle.style.borderTop = "15px solid transparent";
    triangle.style.borderBottom = "15px solid transparent";
    triangle.style.borderLeft = "24px solid white";
    triangle.style.position = "absolute";
    triangle.style.left = "22px";
    triangle.style.top = "15px";
    triangle.style.boxShadow = "1px 0 2px rgba(0,0,0,0.4)";

    btn.appendChild(triangle);
  }
}

// Botão Modo Engraçado: ativa/desativa modo engraçado
btnEngracado.addEventListener('click', () => {
  modoEngracado = !modoEngracado;
  btnEngracado.classList.toggle('ativo');
  btnEngracado.textContent = modoEngracado ? 'Modo Normal 🎉' : 'Modo Engraçado 🎵';
});

// Barra de progresso da reprodução
function iniciarBarra(duracao = 5000) {
  duracaoReproducao = duracao;
  inicioReproduçao = Date.now();
  tocando = true;

  intervaloProgresso = setInterval(() => {
    const tempoAtual = Date.now() - inicioReproduçao;
    const progresso = Math.min((tempoAtual / duracaoReproducao) * 100, 100);

    barraProgresso.value = progresso;
    document.getElementById('tempoAtual').textContent = formatarTempo(tempoAtual);
    document.getElementById('tempoTotal').textContent = formatarTempo(duracaoReproducao);

    if (progresso >= 100) {
      pararBarra();
      reproduzindo = false;
      atualizarIconeBotaoReproduzir(false);
      btnGravar.disabled = false;
      btnSalvar.disabled = gravaNotas.length === 0;
    }
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

// Permite alterar a barra manualmente durante a reprodução
barraProgresso.addEventListener('input', (e) => {
  if (!tocando) return;
  const novoProgresso = parseFloat(e.target.value);
  const novoTempo = (novoProgresso / 100) * duracaoReproducao;

  document.getElementById('tempoAtual').textContent = formatarTempo(novoTempo);
  inicioReproduçao = Date.now() - novoTempo;
});

// Botão para alternar tema claro/escuro
const btn = document.getElementById('toggleTheme');
btn.addEventListener('click', () => {
  document.body.classList.toggle('white-mode');
  if (document.body.classList.contains('white-mode')) {
    btn.textContent = '🌙 ';
  } else {
    btn.textContent = '☀️';
  }
});

// Tela de carregamento (loading screen)
window.onload = () => {
  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
    atualizarIconeBotaoReproduzir(false); // mostra ícone play ao iniciar
  }, 3000);
};

// Botão salvar gravação em arquivo .webm
btnSalvar.addEventListener("click", () => {
  if (partesAudioGravado.length === 0) {
    alert("Nenhuma gravação disponível para salvar.");
    return;
  }
  const blob = new Blob(partesAudioGravado, { type: "audio/webm" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gravacao.webm";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
