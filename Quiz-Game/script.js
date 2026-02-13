// DOM Elements
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const startButton = document.getElementById("start-btn");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-containers");
const currentQuestionSpan = document.getElementById("current-question");
const totalQuestionsSpan = document.getElementById("total-questions");
const scoreSpan = document.getElementById("score");
const finalScoreSpan = document.getElementById("final-score");
const maxScoreSpan = document.getElementById("max-score");
const resultMessage = document.getElementById("result-message");
const restartButton = document.getElementById("restart-btn");
const progressBar = document.getElementById("progress");
const progressMessage = document.getElementById("progress-message");
const standardResult = document.getElementById("standard-result");
const valentineScreen = document.getElementById("valentine-screen");
const valentineYes = document.getElementById("valentine-yes");
const valentineNo = document.getElementById("valentine-no");
// bouquet images to rotate when NO is clicked
const bouquetImages = [
  "https://media.tenor.com/Ly87GVX9qOIAAAAi/thanhhuyen.gif",
  "https://media.tenor.com/ZX6rILOBoUgAAAAi/troll-face.gif",
  "https://media.tenor.com/aUNFPNeEECcAAAAi/capoo-bug.gif",
  "https://media.tenor.com/3138W_RnmrgAAAAi/tkthao219-capoo.gif",
];
let bouquetIndex = 0;
// fixed bouquet gif to show for the valentine message (not part of NO rotation)
const bouquetDefault =
  "https://media.tenor.com/ZhNxfL0GmoMAAAAi/mocha-bear-hearts.gif";

// Quiz questions
const quizQuestions = [
  {
    question: "Who is the missing child in Stranger Things?",
    answers: [
      { text: "Eleven", correct: false },
      { text: "Mike", correct: false },
      { text: "Will", correct: true },
      { text: "Dustin", correct: false },
    ],
  },
  {
    question: "Who's the prettiest?",
    answers: [
      { text: "You", correct: true },
      { text: "You", correct: true },
      { text: "You", correct: true },
      { text: "You", correct: true },
    ],
  },
  {
    question: "Laufey's __witched Album",
    answers: [
      { text: "bebe", correct: false },
      { text: "Bee", correct: false },
      { text: "Bi", correct: false },
      { text: "Be", correct: true },
    ],
  },
  {
    question: "What is the abbreviation for Malaysia?",
    answers: [
      { text: "MYS", correct: false },
      { text: "MIA", correct: false },
      { text: "MY", correct: true },
      { text: "MYR", correct: false },
    ],
  },
  {
    question: "What is Laufey's song for the month of love?",
    answers: [
      { text: "Lover Girl", correct: false },
      { text: "From the Start", correct: false },
      { text: "Valentine", correct: true },
      { text: "Promise", correct: false },
    ],
  },
];

// Quiz state Variables
let currentQuestionIndex = 0;
let score = 0;
let answersDisabled = false;
// words revealed by correct answers (cumulative message parts)
let revealedWords = [];
let valentineActive = false;

totalQuestionsSpan.textContent = quizQuestions.length;
maxScoreSpan.textContent = quizQuestions.length;

// Event Listeners
startButton.addEventListener("click", startQuiz);
restartButton.addEventListener("click", restartQuiz);

function startQuiz() {
  // reset variables
  currentQuestionIndex = 0;
  score = 0;
  scoreSpan.textContent = score;

  showQuestion(currentQuestionIndex);

  startScreen.classList.remove("active");
  quizScreen.classList.add("active");
}

// create heart confetti elements and animate them
function createConfettiHearts(count) {
  const container =
    document.getElementById("confetti-container") || document.body;
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.className = "confetti-heart";
    // random heart emoji
    const hearts = ["❤️", "💖", "❣️", "💕", "💘"];
    span.textContent = hearts[Math.floor(Math.random() * hearts.length)];

    // random horizontal start
    const left = Math.random() * 100;
    span.style.left = left + "%";

    // random size
    const size = 12 + Math.random() * 24; // px
    span.style.fontSize = size + "px";

    // random duration and delay
    const duration = 1800 + Math.random() * 1400; // ms
    const delay = Math.random() * 200;
    span.style.animationDuration = duration + "ms";
    span.style.animationDelay = delay + "ms";

    // slight x offset animation via transform origin
    span.style.transform = `translateY(-20vh) rotate(${Math.random() * 360}deg)`;

    container.appendChild(span);

    // remove after animation
    setTimeout(
      () => {
        span.remove();
      },
      duration + delay + 300,
    );
  }
}

// continuous confetti control
let _confettiInterval = null;
function startConfettiContinuous(ratePerSec = 12) {
  // ratePerSec hearts per second
  stopConfetti();
  _confettiInterval = setInterval(() => {
    createConfettiHearts(Math.max(1, Math.round(ratePerSec / 6)));
  }, 250);
}

function stopConfetti() {
  if (_confettiInterval) {
    clearInterval(_confettiInterval);
    _confettiInterval = null;
  }
}

function showQuestion() {
  // Reset state
  answersDisabled = false;
  const currentQuestion = quizQuestions[currentQuestionIndex];

  currentQuestionSpan.textContent = currentQuestionIndex + 1;

  const progressPercent = (currentQuestionIndex / quizQuestions.length) * 100;
  progressBar.style.width = progressPercent + "%";

  questionText.textContent = currentQuestion.question;

  // todo: optimize this by reusing buttons instead of creating new ones each time
  answersContainer.innerHTML = "";

  currentQuestion.answers.forEach((answer) => {
    const button = document.createElement("button");
    button.textContent = answer.text;
    button.classList.add("answer-btn");

    // What is dataset? It is a property of the buttom element that allows you to store custom data attributes on the element.
    button.dataset.correct = answer.correct;

    button.addEventListener("click", selectAnswer);
    answersContainer.appendChild(button);
  });
}

function selectAnswer(event) {
  // optimization to prevent multiple answers
  if (answersDisabled) return;
  answersDisabled = true;

  const selectedButton = event.target;
  const isCorrect = selectedButton.dataset.correct === "true";

  Array.from(answersContainer.children).forEach((button) => {
    if (button.dataset.correct === "true") {
      button.classList.add("correct");
    } else {
      button.classList.add("incorrect");
    }
  });
  if (isCorrect) {
    score++;
    scoreSpan.textContent = score;
    // reveal the chosen answer as the next word in the cumulative message
    if (progressMessage) {
      revealedWords.push(selectedButton.textContent.trim());
      progressMessage.textContent = revealedWords.join(" ");
      progressMessage.classList.add("show");
    }
  }

  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
      showQuestion();
    } else {
      showResults();
    }
  }, 1000);
}

function showResults() {
  quizScreen.classList.remove("active");
  resultScreen.classList.add("active");
  finalScoreSpan.textContent = score;

  // If user got all answers correct, show the valentine special screen
  if (score === quizQuestions.length && valentineScreen) {
    // hide standard result and show valentine UI
    if (standardResult) standardResult.style.display = "none";
    valentineScreen.style.display = "flex";

    // reset scales
    let yesScale = 1;
    let noScale = 1;

    if (valentineYes && valentineNo) {
      // clear any previous handlers to avoid duplicates or lingering behavior
      try {
        valentineYes.onclick = null;
      } catch (e) {}
      try {
        valentineNo.onclick = null;
      } catch (e) {}
      // ensure initial transform
      valentineYes.style.transform = `scale(${yesScale})`;
      valentineNo.style.transform = `scale(${noScale})`;

      // remove keyboard focus to avoid Enter/Space triggering immediately
      try {
        valentineYes.blur();
      } catch (e) {}
      try {
        valentineNo.blur();
      } catch (e) {}

      // ensure the bouquet shows the fixed valentine GIF (not part of NO rotation)
      const bouquet = document.getElementById("bouquet-sticker-main");
      if (bouquet) bouquet.src = bouquetDefault;

      // prevent immediate activation — enable handlers after a short delay
      valentineActive = false;
      // hide sticker panel initially
      const spInit = document.getElementById("sticker-panel");
      if (spInit) spInit.style.display = "none";
      setTimeout(() => (valentineActive = true), 300);

      // no button click: shrink no, grow yes and cycle NO messages
      const noMessages = [
        "are you sure?",
        "final answer, bebe?",
        "please bebe :(",
        "im gonna cry if you say no :(",
      ];
      let noMsgIndex = 0;
      valentineNo.onclick = function (event) {
        // only respond when valentine UI is active and it's a real user click
        if (!valentineActive) return;
        if (!event || event.isTrusted !== true) return;
        if (event.currentTarget !== valentineNo) return;
        noScale = Math.max(0.35, noScale * 0.88);
        yesScale = Math.min(3, yesScale * 1.06);
        valentineNo.style.transform = `scale(${noScale})`;
        valentineYes.style.transform = `scale(${yesScale})`;

        if (noMsgIndex < noMessages.length) {
          valentineNo.textContent = noMessages[noMsgIndex];
          noMsgIndex++;
        }
        // change bouquet image each time NO is clicked (rotate through bouquetImages only)
        const bouquet = document.getElementById("bouquet-sticker-main");
        if (bouquet && bouquetImages && bouquetImages.length) {
          bouquetIndex = (bouquetIndex + 1) % bouquetImages.length;
          bouquet.src = bouquetImages[bouquetIndex];
        }
      };

      // yes button handler: show confetti, final celebratory message, sticker panel and show restart
      valentineYes.onclick = function (event) {
        // only respond when valentine UI is active and it's a real user click
        if (!valentineActive) return;
        if (!event || event.isTrusted !== true) return;
        if (event.currentTarget !== valentineYes) return;
        // disable further valentine actions until UI is reset
        valentineActive = false;
        // ensure bouquet shows the fixed valentine GIF when YES is clicked
        const bouquetYes = document.getElementById("bouquet-sticker-main");
        if (bouquetYes) bouquetYes.src = bouquetDefault;

        // start continuous heart confetti across the viewport
        startConfettiContinuous(40);

        // show sticker panel
        const sp = document.getElementById("sticker-panel");
        if (sp) sp.style.display = "flex";

        // replace valentine message with final text
        const vm = document.getElementById("valentine-message");
        if (vm) {
          vm.textContent = "YAY SEE YA TOMORROW! LOVE U BEBE MWA <3";
        }

        // hide the yes/no buttons
        const vb = valentineScreen.querySelector(".valentine-buttons");
        if (vb) vb.style.display = "none";

        // move the restart button into the valentine screen so user can restart
        if (restartButton) {
          // ensure restart button is visible
          restartButton.style.display = "inline-block";
          valentineScreen.appendChild(restartButton);
        }
      };
    }
    return;
  }

  // otherwise show standard results
  if (standardResult) standardResult.style.display = "block";
  if (valentineScreen) valentineScreen.style.display = "none";

  // ensure restart button is back in the standard result area and visible
  if (standardResult && restartButton) {
    standardResult.appendChild(restartButton);
    restartButton.style.display = "inline-block";
  }

  const percentage = (score / quizQuestions.length) * 100;
  if (percentage === 100) {
    resultMessage.textContent = "Perfect Score! Amazing!";
  } else if (percentage >= 80) {
    resultMessage.textContent = "TRY AGAIN!";
  } else if (percentage >= 50) {
    resultMessage.textContent = "TRY AGAIN!";
  } else {
    resultMessage.textContent = "TRY AGAIN!";
  }
}

function restartQuiz() {
  resultScreen.classList.remove("active");
  // reset revealed words and hide progress message
  revealedWords = [];
  if (progressMessage) {
    progressMessage.textContent = "";
    progressMessage.classList.remove("show");
  }

  // reset valentine UI if present
  if (standardResult) standardResult.style.display = "block";
  if (valentineScreen) {
    valentineScreen.style.display = "none";
  }
  if (valentineYes) valentineYes.style.transform = "scale(1)";
  if (valentineNo) valentineNo.style.transform = "scale(1)";

  // reset valentine active flag and remove handlers
  valentineActive = false;
  try {
    if (valentineYes) valentineYes.onclick = null;
  } catch (e) {}
  try {
    if (valentineNo) valentineNo.onclick = null;
  } catch (e) {}

  // clear any inserted stickers and confetti
  const sp = document.getElementById("sticker-panel");
  if (sp) sp.style.display = "none";
  const inserted = document.querySelectorAll(".inserted-sticker");
  inserted.forEach((i) => i.remove());
  const conf = document.getElementById("confetti-container");
  if (conf) conf.innerHTML = "";
  // stop continuous confetti if running
  stopConfetti();

  // reset no button text
  if (valentineNo) valentineNo.textContent = "NO";

  // reset bouquet main image
  const bouquet = document.getElementById("bouquet-sticker-main");
  if (bouquet) {
    bouquetIndex = 0;
    // reset to the fixed valentine GIF so the UI starts consistent
    bouquet.src = bouquetDefault;
  }

  // ensure restart button is in the standard result area
  if (standardResult && restartButton) {
    standardResult.appendChild(restartButton);
    restartButton.style.display = "inline-block";
  }

  // reset valentine message and UI elements to initial state
  const vm = document.getElementById("valentine-message");
  if (vm) vm.textContent = "WILL YOU BE MY VALENTINE?";
  const vb = document.querySelector("#valentine-screen .valentine-buttons");
  if (vb) vb.style.display = "flex";
  const sp2 = document.getElementById("sticker-panel");
  if (sp2) sp2.style.display = "none";
  if (conf) conf.innerHTML = "";

  // remove keyboard focus to avoid accidental activation after restart
  try {
    if (valentineYes) valentineYes.blur();
    if (valentineNo) valentineNo.blur();
    if (restartButton) restartButton.blur();
  } catch (e) {}

  startQuiz();
}
