// 1. The Master's Wisdom (Random Quotes)
const dailyQuotes = [
    "A journey of a thousand miles begins with a single digit.",
    "Yesterday is history, tomorrow is a mystery, but today is a gift.",
    "Your mind is like water, my friend. When it is agitated, it becomes difficult to see.",
    "There is no secret ingredient. It’s just you.",
    "One often meets his destiny on the road he takes to avoid it.",
    "The marks of a true strategist are focus and patience.",
    "Your strength is not in the numbers, but in how you find them."
];

// 2. The Kick-off Function
function kickOffDay() {
    const bubble = document.getElementById('ai-bubble');
    const randomQuote = dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)];
    
    const hour = new Date().getHours();
    let greeting = "Good Morning";
    if (hour >= 12) greeting = "Good Afternoon";
    if (hour >= 17) greeting = "Good Evening";

    // This uses your name to make it feel like a personal mentor
    bubble.textContent = `${greeting},Wanderer! ${randomQuote}`;
}
const secret = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10));
let currentGuess = [];
let currentRowIdx = 0;
let streak = localStorage.getItem('thinknumb_streak') || 0;
let soundOn = true;

document.getElementById('streak-count').textContent = streak;

const board = document.getElementById('board');
const popSound = document.getElementById('pop-sound');

/* Create Board */
for (let i = 0; i < 5; i++) {
    const row = document.createElement('div');
    row.className = 'row';

    for (let j = 0; j < 5; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        row.appendChild(cell);
    }

    board.appendChild(row);
}

/* Sound toggle */
document.getElementById('sound-toggle').onclick = () => {
    soundOn = !soundOn;
    document.getElementById('sound-toggle').textContent = soundOn ? "🔊 Sound" : "🔇 Muted";
};
// Add this right before your game logic starts
window.onload = function() {
    kickOffDay();
};
/* Keyboard Input */
window.onkeydown = function (e) {
    if (currentRowIdx >= 5) return;

    const key = e.key;

    if (!isNaN(key) && currentGuess.length < 5) {
        currentGuess.push(Number(key));

        if (soundOn) {
            popSound.currentTime = 0;
            popSound.play();
        }

        updateGrid();
        updatePanda("thinking");
    }

    if (key === 'Backspace') {
        currentGuess.pop();
        updateGrid();
        updatePanda("idle");
    }

    if (key === 'Enter') {
        if (currentGuess.length < 5) {
            shakeRow();
            updateAI("Complete all digits.");
            updatePanda("confused");
        } else {
            processGuess();
        }
    }
};

/* Update Grid */
function updateGrid() {
    const row = board.children[currentRowIdx];

    for (let i = 0; i < 5; i++) {
        const cell = row.children[i];
        cell.textContent = currentGuess[i] ?? '';

        if (i === currentGuess.length - 1) {
            cell.classList.add('pop');
            setTimeout(() => cell.classList.remove('pop'), 150);
        }
    }
}

/* Process Guess */
function processGuess() {
    const row = board.children[currentRowIdx];
    const status = Array(5).fill('black');
    const tempSecret = [...secret];

    updateAI("Analyzing...");
    updatePanda("thinking");

    setTimeout(() => {

        for (let i = 0; i < 5; i++) {
            if (currentGuess[i] === secret[i]) {
                status[i] = 'blue';
                tempSecret[i] = null;
            }
        }

        for (let i = 0; i < 5; i++) {
            if (status[i] === 'black' && tempSecret.includes(currentGuess[i])) {
                status[i] = 'orange';
                tempSecret[tempSecret.indexOf(currentGuess[i])] = null;
            }
        }

        status.forEach((s, i) => {
            setTimeout(() => {
                row.children[i].className = `cell ${s}`;
            }, i * 120);
        });

        setTimeout(() => evaluateGuess(status), 700);

    }, 300);
}

/* Evaluate */
function evaluateGuess(status) {
    if (currentGuess.join('') === secret.join('')) {
        streak++;
        localStorage.setItem('thinknumb_streak', streak);

        updateAI("Mastery achieved!");
        updatePanda("wink");

        finishGame(true);
    } else {
        currentRowIdx++;
        currentGuess = [];

        giveHint(status);

        if (currentRowIdx === 5) {
            updatePanda("angry");
            finishGame(false);
        } else {
            updatePanda("idle");
        }
    }
}

/* Panda Expressions */
function updatePanda(state) {
    const panda = document.getElementById('panda-mascot');

    const positions = {
        idle: "0% 0%",
        happy: "100% 0%",
        thinking: "0% 50%",
        wink: "100% 50%",
        confused: "0% 100%",
        angry: "100% 100%"
    };

    panda.style.objectPosition = positions[state] || "0% 0%";
}

/* AI Text */
function updateAI(msg) {
    const bubble = document.getElementById('ai-bubble');
    bubble.style.opacity = 0;

    setTimeout(() => {
        bubble.textContent = msg;
        bubble.style.opacity = 1;
    }, 150);
}

/* Hint System */
function giveHint(status) {
    const blues = status.filter(s => s === 'blue').length;
    const oranges = status.filter(s => s === 'orange').length;

    if (blues > 0) {
        updateAI(`${blues} correct, ${oranges} close.`);
        updatePanda("happy");
    } else if (oranges > 0) {
        updateAI(`${oranges} digits misplaced.`);
        updatePanda("thinking");
    } else {
        updateAI("Try a different pattern.");
        updatePanda("confused");
    }
}

/* Shake */
function shakeRow() {
    const row = board.children[currentRowIdx];
    row.classList.add('shake');
    setTimeout(() => row.classList.remove('shake'), 400);
}

/* Finish */
function finishGame(win) {
    setTimeout(() => {
        alert(win ? "🏆 VICTORY!" : "💀 Secret: " + secret.join(''));
    }, 800);
}