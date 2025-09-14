/* ======= CONFIG ======= */
const TOTAL_TIME_SECONDS = 120; // exam total time in seconds (2 minutes). Change as needed.
const QUESTIONS_TO_ASK = 5; // how many questions from the pool to ask (<= questions.length)

/* ======= SAMPLE QUESTIONS =======
  structure:
  {
    id: 1,
    q: "Question text",
    choices: ["A", "B", "C", "D"],
    answer: 0 // index of correct choice
  }
*/
const questions = [
  {
    id: 1,
    q: "What is the output of `typeof NaN` in JavaScript?",
    choices: ["'number'", "'NaN'", "'object'", "'undefined'"],
    answer: 0,
  },
  {
    id: 2,
    q: "Which method creates a new array with all elements that pass a test?",
    choices: ["map", "filter", "reduce", "forEach"],
    answer: 1,
  },
  {
    id: 3,
    q: "How do you declare a constant in ES6?",
    choices: ["let x", "const x", "var x", "constant x"],
    answer: 1,
  },
  {
    id: 4,
    q: "What does DOM stand for?",
    choices: [
      "Document Object Model",
      "Data Object Model",
      "Document Oriented Markup",
      "Direct Object Mapping",
    ],
    answer: 0,
  },
  {
    id: 5,
    q: "Which operator is used for strict equality (no type conversion)?",
    choices: ["==", "===", "=", "!=="],
    answer: 1,
  },
  {
    id: 6,
    q: "Which event is fired when a page finishes loading resources?",
    choices: ["onload", "onclick", "onready", "ondom"],
    answer: 0,
  },
  {
    id: 7,
    q: "Which array method merges arrays into a single string?",
    choices: ["join", "concat", "slice", "splice"],
    answer: 0,
  },
  {
    id: 8,
    q: "What is closure in JavaScript?",
    choices: [
      "A scope containing function and its lexical environment",
      "A special loop",
      "HTTP request",
      "A DOM element",
    ],
    answer: 0,
  },
];
/* ======= END CONFIG ======= */

let shuffled = [];
let currentIndex = 0;
let answers = {}; // map question id -> selected choice index
let remainingSeconds = TOTAL_TIME_SECONDS;
let timerInterval = null;

// Fisher-Yates shuffle
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// prepare exam: pick QUESTIONS_TO_ASK random non-repeated questions
function prepareExam() {
  const pool = shuffleArray(questions);
  const selected = pool.slice(0, Math.min(QUESTIONS_TO_ASK, pool.length));
  shuffled = selected;
  currentIndex = 0;
  answers = {};
  remainingSeconds = TOTAL_TIME_SECONDS;
  updateProgress();
  renderQuestion();
  startTimer();
}

// render current progress text
function updateProgress() {
  const progressEl = document.getElementById("progress");
  progressEl.textContent = `Question ${currentIndex + 1} / ${shuffled.length}`;
}

// render current question and choices
function renderQuestion() {
  const qObj = shuffled[currentIndex];
  document.getElementById("questionArea").textContent = qObj.q;
  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  qObj.choices.forEach((choice, idx) => {
    const id = `choice_${qObj.id}_${idx}`;
    const wrapper = document.createElement("label");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "10px";
    wrapper.style.padding = "8px";
    wrapper.style.border = "1px solid #eee";
    wrapper.style.borderRadius = "8px";
    wrapper.style.cursor = "pointer";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "choice";
    radio.id = id;
    radio.value = idx;
    radio.checked = answers[qObj.id] === idx;
    radio.addEventListener("change", () => {
      answers[qObj.id] = idx;
    });

    const text = document.createElement("span");
    text.textContent = choice;

    wrapper.appendChild(radio);
    wrapper.appendChild(text);
    choicesDiv.appendChild(wrapper);
  });

  updateNavButtons();
  updateProgress();
}

// update Next / Previous button states
function updateNavButtons() {
  document.getElementById("prevBtn").disabled = currentIndex === 0;
  document.getElementById("nextBtn").textContent =
    currentIndex === shuffled.length - 1 ? "Finish" : "Next";
}

// next action
function nextAction() {
  if (currentIndex < shuffled.length - 1) {
    currentIndex++;
    renderQuestion();
  } else {
    finishExam();
  }
}

// previous action
function prevAction() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

// compute score and show result
function finishExam() {
  stopTimer();
  const total = shuffled.length;
  let correct = 0;
  shuffled.forEach((q) => {
    const selected = answers[q.id];
    if (selected === q.answer) correct++;
  });
  document.getElementById("questionArea").classList.add("hidden");
  document.getElementById("choices").classList.add("hidden");
  document.getElementById("finishArea").classList.remove("hidden");
  document.getElementById("result").innerHTML = `
    <h2>Exam finished</h2>
    <p>You answered <strong>${correct}</strong> out of <strong>${total}</strong> correctly.</p>
    <p>Score: <strong>${Math.round((correct / total) * 100)}%</strong></p>
  `;
}

// timer functions
function startTimer() {
  updateTimerDisplay();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateTimerDisplay();
    if (remainingSeconds <= 0) {
      // time up -> auto finish
      finishExam();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay() {
  const el = document.getElementById("timer");
  const mm = Math.floor(remainingSeconds / 60);
  const ss = remainingSeconds % 60;
  el.textContent = `${String(mm).padStart(2, "0")}:${String(ss).padStart(
    2,
    "0"
  )}`;
}

/* ======= UI HOOKS ======= */
document.getElementById("nextBtn").addEventListener("click", nextAction);
document.getElementById("prevBtn").addEventListener("click", prevAction);
document.getElementById("retryBtn").addEventListener("click", () => {
  document.getElementById("questionArea").classList.remove("hidden");
  document.getElementById("choices").classList.remove("hidden");
  document.getElementById("finishArea").classList.add("hidden");
  prepareExam();
});

// start the exam immediately
prepareExam();
