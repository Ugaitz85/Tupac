const gameArea = document.getElementById("game-area");
const startButton = document.getElementById("start-button");
const shareButton = document.getElementById("share-button");
const scoreLabel = document.getElementById("score");
const comboLabel = document.getElementById("combo");
const timerLabel = document.getElementById("timer");
const bestScoreLabel = document.getElementById("best-score");
const timerFill = document.getElementById("timer-fill");
const shareDialog = document.getElementById("share-dialog");
const shareMessage = document.getElementById("share-message");
const closeDialog = document.getElementById("close-dialog");
const copyMessageButton = document.getElementById("copy-message");
const gamePlaceholder = document.getElementById("game-placeholder");
const adButton = document.getElementById("view-ad");
const purchaseButtons = document.querySelectorAll(".purchase");

const GAME_DURATION = 60;
const STORAGE_KEY = "coinCrazeBestScore";
const DEFAULT_SHARE_TEXT = shareMessage.textContent.trim();
shareMessage.textContent = DEFAULT_SHARE_TEXT;
let bestScore = loadBestScore();

let score = 0;
let combo = 1;
let comboTimeoutId;
let timeLeft = GAME_DURATION;
let spawnTimeoutId;
let countdownId;
let gameRunning = false;
let coinsCollected = 0;

const announcer = document.createElement("div");
announcer.className = "toast-stack";
document.body.appendChild(announcer);

function resetGame() {
  score = 0;
  combo = 1;
  timeLeft = GAME_DURATION;
  coinsCollected = 0;
  updateScore(0);
  updateCombo(1);
  timerLabel.textContent = `${timeLeft}s`;
  timerFill.style.width = "100%";
  clearCoins();
  if (gamePlaceholder) {
    gamePlaceholder.textContent = "¡Atrapa tantas monedas como puedas!";
    gamePlaceholder.hidden = true;
  }
}

function updateScore(delta) {
  score += delta;
  scoreLabel.textContent = score.toLocaleString("es-ES");
  if (score > bestScore) {
    updateBestScore(score);
    showToast("Nuevo récord personal 🤩");
  }
}

function updateCombo(value) {
  combo = value;
  const formatted = Number.isInteger(combo)
    ? combo.toString()
    : combo.toFixed(1);
  comboLabel.textContent = `${formatted}x`;
}

function increaseCombo() {
  const nextCombo = Math.min(combo + 0.25, 5);
  updateCombo(nextCombo);
  clearTimeout(comboTimeoutId);
  comboTimeoutId = setTimeout(() => updateCombo(1), 3000);
}

function startGame() {
  if (gameRunning) {
    return;
  }
  gameRunning = true;
  resetGame();
  spawnCoin();
  scheduleNextSpawn();
  countdownId = setInterval(handleCountdown, 1000);
  startButton.textContent = "Reiniciar";
  hideShareDialog();
}

function endGame() {
  clearTimeout(spawnTimeoutId);
  clearInterval(countdownId);
  clearTimeout(comboTimeoutId);
  gameRunning = false;
  clearCoins();
  const summary =
    `¡Partida terminada! Alcancé ${score.toLocaleString("es-ES")} puntos en ${GAME_DURATION} ` +
    `segundos y atrapé ${coinsCollected} monedas. ¿Puedes superarlo? 👉 ${window.location.href}`;
  updateShareMessage(summary);
  showShareDialog();
  timerFill.style.width = "0%";
  if (gamePlaceholder) {
    gamePlaceholder.textContent =
      "Partida terminada. Pulsa «Iniciar partida» para intentar batir tu récord.";
    gamePlaceholder.hidden = false;
  }
  startButton.textContent = "Iniciar partida";
}

function spawnCoin() {
  if (!gameRunning) {
    return;
  }
  const coin = document.createElement("button");
  coin.type = "button";
  coin.className = "coin";
  const rare = Math.random() < 0.12;
  const value = rare ? 250 : 75;
  if (rare) {
    coin.classList.add("rare");
    coin.textContent = "★";
  } else {
    coin.textContent = "C";
  }

  const size = rare ? 80 : 70;
  coin.style.width = `${size}px`;
  coin.style.height = `${size}px`;
  const { width, height } = gameArea.getBoundingClientRect();
  const x = Math.random() * (width - size);
  const y = Math.random() * (height - size);
  coin.style.left = `${x}px`;
  coin.style.top = `${y}px`;

  coin.addEventListener("click", () => {
    if (!gameRunning) {
      return;
    }
    coin.remove();
    const gain = Math.round(value * combo);
    updateScore(gain);
    increaseCombo();
    coinsCollected += 1;
    flashGain(gain, x + size / 2, y + size / 2);
  });

  gameArea.appendChild(coin);

  setTimeout(() => {
    coin.classList.add("fade");
    setTimeout(() => coin.remove(), 200);
  }, rare ? 2200 : 2600);
}

function scheduleNextSpawn() {
  if (!gameRunning) {
    return;
  }
  const intensityBoost = Math.max(0.6, 1.2 - combo * 0.08);
  const scoreFactor = Math.max(0.55, 1 - score / 10000);
  const delay = Math.max(280, 850 * intensityBoost * scoreFactor);
  spawnTimeoutId = setTimeout(() => {
    spawnCoin();
    scheduleNextSpawn();
  }, delay);
}

function handleCountdown() {
  timeLeft -= 1;
  timerLabel.textContent = `${Math.max(timeLeft, 0)}s`;
  const percent = Math.max(0, (timeLeft / GAME_DURATION) * 100);
  timerFill.style.width = `${percent}%`;
  if (timeLeft <= 0) {
    endGame();
  }
}

function flashGain(points, x, y) {
  const bubble = document.createElement("span");
  bubble.textContent = `+${points}`;
  bubble.className = "gain";
  bubble.style.left = `${x}px`;
  bubble.style.top = `${y}px`;
  gameArea.appendChild(bubble);
  setTimeout(() => bubble.remove(), 700);
}

function showShareDialog(customMessage) {
  if (customMessage) {
    updateShareMessage(customMessage);
  }
  shareDialog.hidden = false;
}

function hideShareDialog() {
  shareDialog.hidden = true;
  updateShareMessage();
}

function handleShare() {
  if (navigator.share) {
    navigator
      .share({
        title: "Coin Craze",
        text: "¿Cuántas monedas puedes atrapar? Juega Coin Craze y supera mi récord!",
        url: window.location.href,
      })
      .catch(() => showShareDialog());
  } else {
    showShareDialog();
  }
}

function handleAdReward() {
  if (!gameRunning) {
    startGame();
  }
  updateScore(100);
  increaseCombo();
  showToast("Recompensa de anuncio +100 💰");
}

function handlePurchase(event) {
  const { upgrade } = event.target.dataset;
  alert(
    `Conecta este botón a tu backend para vender el paquete «${upgrade}». ` +
      "Mientras tanto se simula una compra ficticia."
  );
}

function updateBestScore(value) {
  bestScore = Math.max(0, Math.round(value));
  bestScoreLabel.textContent = bestScore.toLocaleString("es-ES");
  try {
    localStorage.setItem(STORAGE_KEY, bestScore);
  } catch (error) {
    console.warn("No se pudo guardar el récord local:", error);
  }
}

function clearCoins() {
  const existingCoins = gameArea.querySelectorAll(".coin, .gain");
  existingCoins.forEach((node) => node.remove());
}

function updateShareMessage(message) {
  shareMessage.textContent = message || DEFAULT_SHARE_TEXT;
}

function showToast(text) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;
  announcer.appendChild(toast);
  setTimeout(() => toast.classList.add("visible"), 10);
  setTimeout(() => {
    toast.classList.remove("visible");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, 2600);
}

startButton.addEventListener("click", startGame);
shareButton.addEventListener("click", handleShare);
adButton.addEventListener("click", handleAdReward);
closeDialog.addEventListener("click", hideShareDialog);
copyMessageButton.addEventListener("click", () => {
  const text = shareMessage.textContent;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast("Mensaje copiado 📋"))
      .catch(() => showShareDialog(text));
  } else {
    showShareDialog(text);
  }
});
shareDialog.addEventListener("click", (event) => {
  if (event.target === shareDialog) {
    hideShareDialog();
  }
});
purchaseButtons.forEach((button) =>
  button.addEventListener("click", handlePurchase)
);

window.addEventListener("resize", () => {
  if (!gameRunning) {
    return;
  }
  const coins = [...gameArea.querySelectorAll(".coin")];
  coins.forEach((coin) => {
    const size = parseFloat(coin.style.width);
    const { width, height } = gameArea.getBoundingClientRect();
    const x = Math.random() * (width - size);
    const y = Math.random() * (height - size);
    coin.style.left = `${x}px`;
    coin.style.top = `${y}px`;
  });
});

if (bestScore > 0) {
  bestScoreLabel.textContent = bestScore.toLocaleString("es-ES");
}

function loadBestScore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return 0;
    }
    const parsed = Number(stored);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : 0;
  } catch (error) {
    console.warn("No se pudo leer el récord local:", error);
    return 0;
  }
}
