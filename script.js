// Mapeamento das teclas do teclado do computador para as notas musicais
const mapeamento = {
  'z': 'do',  's': 'do#', 'x': 're', 'd': 're#',
  'c': 'mi',  'v': 'fa',  'g': 'fa#', 'b': 'sol',
  'h': 'sol#','n': 'la',  'j': 'la#', 'm': 'si',
  '1': 'engracado', '2': 'gravar', '3': 'reproduzir'
};

let gravando = false; // Variável para indicar se está gravando
let gravaNotas = []; // Lista para armazenar as notas gravadas
let inicioGravacao = 0; // Tempo de início da gravação
let modoEngracado = false; // Variável que define se o modo engraçado está ativo

let duracaoReproducao = 0; // Duração da reprodução
let inicioReproducao = 0; // Tempo de início da reprodução
let intervaloProgresso; // Intervalo para atualizar a barra de progresso
let tocando = false; // Variável para controlar se está tocando a música

// Seleção dos botões de controle
const btnGravar = document.getElementById('btnGravar');
const btnReproduzir = document.getElementById('btnReproduzir');
const btnEngracado = document.getElementById('btnEngracado');
const barraProgresso = document.getElementById('barraProgresso');

// Função para formatar o tempo (milissegundos) em formato mm:ss
function formatarTempo(ms) {
  const s = Math.floor(ms / 1000);
  const min = Math.floor(s / 60);
  const seg = s % 60;
  return `${min}:${seg < 10 ? '0' + seg : seg}`;
}

// Função para tocar a nota correspondente ao som
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

// Adiciona evento de clique nas teclas do piano
document.querySelectorAll('.tecla').forEach(tecla => {
  tecla.addEventListener('click', () => {
    const nota = tecla.dataset.nota; // Obtém a nota da tecla clicada
    tocarNota(nota); // Toca a nota
    tecla.classList.add('ativa'); // Adiciona classe ativa para efeito visual
    setTimeout(() => tecla.classList.remove('ativa'), 150); // Remove o efeito visual após 150ms

    // Se estiver gravando, armazena a nota e o tempo em que foi tocada
    if (gravando) {
      const tempoAgora = Date.now();
      gravaNotas.push({ nota, tempo: tempoAgora - inicioGravacao });
    }
  });
});

// Adiciona evento de pressionamento de tecla
document.addEventListener('keydown', e => {
  const tecla = e.key.toLowerCase(); // Converte a tecla pressionada para minúscula
  if (mapeamento[tecla]) {
    const notaOuComando = mapeamento[tecla];
    // Se for um comando (gravar, reproduzir, modo engraçado), aciona o respectivo botão
    if (notaOuComando === 'gravar') btnGravar.click();
    else if (notaOuComando === 'reproduzir') btnReproduzir.click();
    else if (notaOuComando === 'engracado') btnEngracado.click();
    else {
      tocarNota(notaOuComando); // Se for uma nota, toca a nota correspondente
      const teclaElemento = document.querySelector(`[data-nota="${notaOuComando}"]`);
      teclaElemento?.classList.add('ativa'); // Adiciona o efeito visual na tecla
      if (gravando) {
        const tempoAgora = Date.now();
        gravaNotas.push({ nota: notaOuComando, tempo: tempoAgora - inicioGravacao });
      }
    }
  }
});

// Adiciona evento de liberação de tecla
document.addEventListener('keyup', e => {
  const nota = mapeamento[e.key.toLowerCase()];
  if (nota && !['gravar', 'reproduzir', 'engracado'].includes(nota)) {
    document.querySelector(`[data-nota="${nota}"]`)?.classList.remove('ativa');
  }
});

// Função para iniciar a gravação de notas
btnGravar.addEventListener('click', () => {
  if (!gravando) {
    gravando = true;
    gravaNotas = [];
    inicioGravacao = Date.now();
    btnGravar.textContent = 'Parar'; // Altera o texto do botão
    btnReproduzir.disabled = true; // Desabilita o botão de reprodução durante a gravação
    atualizarBarraManual(0); // Atualiza a barra de progresso
  } else {
    gravando = false;
    btnGravar.textContent = 'Gravar'; // Altera o texto do botão para "Gravar"
    btnReproduzir.disabled = gravaNotas.length === 0; // Habilita o botão de reprodução se houver notas gravadas
  }
});

// Função para reproduzir a gravação
btnReproduzir.addEventListener('click', () => {
  if (gravaNotas.length === 0) return;

  btnGravar.disabled = true;
  btnReproduzir.disabled = true;

  const duracao = gravaNotas[gravaNotas.length - 1].tempo;
  iniciarBarra(duracao); // Inicia a barra de progresso

  // Reproduz as notas gravadas com o respectivo intervalo
  gravaNotas.forEach(({ nota, tempo }, index) => {
    setTimeout(() => {
      tocarNota(nota);
      const tecla = document.querySelector(`[data-nota="${nota}"]`);
      tecla?.classList.add('ativa'); // Adiciona o efeito visual na tecla
      setTimeout(() => tecla?.classList.remove('ativa'), 150); // Remove o efeito visual após 150ms

      if (index === gravaNotas.length - 1) {
        btnGravar.disabled = false;
        btnReproduzir.disabled = false;
        pararBarra(); // Para a barra de progresso
      }
    }, tempo);
  });
});

// Função para alternar o modo engraçado
btnEngracado.addEventListener('click', () => {
  modoEngracado = !modoEngracado;
  btnEngracado.classList.toggle('ativo');
  btnEngracado.textContent = modoEngracado ? 'Modo Normal 🎉' : 'Modo Engraçado 🎵';
});

// Funções para manipulação da barra de progresso
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

// Função para atualizar a barra de progresso manualmente
barraProgresso.addEventListener('input', (e) => {
  if (!tocando) return;
  const novoProgresso = parseFloat(e.target.value);
  const novoTempo = (novoProgresso / 100) * duracaoReproducao;

  document.getElementById('tempoAtual').textContent = formatarTempo(novoTempo);
  inicioReproducao = Date.now() - novoTempo;
});

// Função para alternar o tema (modo claro/escuro)
const btn = document.getElementById('toggleTheme');
btn.addEventListener('click', () => {
  document.body.classList.toggle('white-mode');
  if(document.body.classList.contains('white-mode')) {
    btn.textContent = '🌙 ';
  } else {
    btn.textContent = '☀️';
  }
});

// Função para simular o carregamento da página
window.onload = () => {
  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none'; // Oculta a tela de carregamento
    document.getElementById('game-content').style.display = 'block'; // Exibe o conteúdo do jogo
  }, 3000); // Simula 3 segundos de carregamento
};
