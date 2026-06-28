/* =============================================
   gameLogic.js — 고양이 타자 게임
   ============================================= */

'use strict';

/* ─── 단어 카테고리 ─── */
// 카테고리별로 단어를 관리. 레벨이 오를수록 카테고리가 추가되고 가중치가 변화함.
const WORD_CATEGORIES = {
  food: {
    label: '일상',
    words: [
      '뱀', '엔지니어', '신해량', '칫솔', '치약', '바다의', '노을이', '손전등', '가팀', '씬해량', '체육관', '전시장',
      '치과', '유금이', '서지혁', '치실', '해저기지', '고양이', '바다', '가족', '뜨개질', '커피', '담배',
      '스케일링', '케이블카', '헨리', '박무진', '침대', '나는', '떨어지는', '충격에', '잠에서', '깼다'
    ],
  },
  fruit: {
    label: '시작',
    words: [
      '탈출정', '계단', '박무현', '무한교', '블라디미르', '등불이', '바다의', '사이비', '해파리', '빵', '침수', '물', '불', '양말', '고래',
      '초콜릿', '사탕', '유금이', '신해량', '의식', '서지혁', '가족', '백호동', '김가영', '백애영', '강수정', '어두운', '벤자민',
      '무장', '엘리베이터', '포커', '잠수정', '되어', '케이블카', '딥블루', '자판기', '관절', '캐시키', '용병', '돌격', '소총', '동물', '아이'
    ],
  },
  color: {
    label: '탈출',
    words: [
      '암흑', '스미레', '가방', '김재희', '뱀', '엠마', '복면', '금괴', '어두운', '총구', '주작동', '인간혐오', '이지현', '진통제', '고양이',
      '침수', '붕대', '바다의', '대한도', '양말', '박무현', '형', '코피', '가족', '낙하산', '첼로니', '서지혁', '백애영', '그린란드', '문신',
      '구원자', '목걸이', '등불이', '라피스라줄리', '총성', '의족', '팀원', '해저기지', '딥블루', '병원', '금괴', '물', '무릎', '구원', '보석', '인형'
    ],
  },
  animal: {
    label: '시도',
    words: [
      '생존의지', '총소리', '해저기지', '어두운', '도와', '다이아몬드', '구원자', '엘리자베스', '보석', '동생', '팀장', '칼',
      '부팀장', '되어', '메딕', '패드', '정상현', '영화관', '의족', '반복', '희생', '시도', '헤드샷', '바다의', '신해량', '귀금속', '머리',
      '무한교', '구명조끼', '의수', '과거', '겨우살이', '등불이', '라피도포라', '총', '구원자', '걸어', '오렌지', '검은'
    ],
  },
  space: {
    label: '심화',
    words: [
      '감압', '지상', '대한도', '김재희', '보석', '원석', '무한교', '사이비', '다이아몬드', '가족', '섬망',
      '바다의', '배신자', '소원', '구원자', '반복', '잠수정', '실패', '침수', '총상', '구원', '의지',
      '어두운', '메딕', '딥블루', '의수', '코피', '화분', '총', '나는', '이제', '바다를', '안다', '챔버'
    ],
  },
  cat: {
    label: '끝',
    words: [
      '악몽', '야옹'
    ],
  },
};

/*
  레벨별 카테고리 가중치 (7단계)
  레벨  | food | fruit | color | animal | space | cat
  ------+------+-------+-------+--------+-------+----
  1     |  10  |   0   |   0   |   0    |   0   |  0   (음식만)
  2     |   6  |   4   |   0   |   0    |   0   |  0   (과일 추가)
  3     |   4  |   3   |   3   |   0    |   0   |  0   (색깔 추가)
  4     |   3  |   2   |   2   |   3    |   0   |  0   (동물 추가)
  5     |   2  |   2   |   2   |   2    |   2   |  0   (우주 추가)
  6     |   2  |   1   |   1   |   2    |   2   |  2   (고양이 추가)
  7     |   1  |   1   |   1   |   2    |   2   |  3   (고양이 우세)
*/
const LEVEL_WORD_WEIGHTS = [
  /* lv 1 */ { food: 10 },
  /* lv 2 */ { food: 6,  fruit: 4 },
  /* lv 3 */ { food: 4,  fruit: 3,  color: 3 },
  /* lv 4 */ { food: 3,  fruit: 2,  color: 2,  animal: 3 },
  /* lv 5 */ { food: 2,  fruit: 2,  color: 2,  animal: 2,  space: 2 },
  /* lv 6 */ { food: 1,  fruit: 1,  color: 2,  animal: 2,  space: 4 },
  /* lv 7 */ { fruit: 1,  color: 1,  animal: 3,  space: 4,  cat: 1 },
];

/* ─── 레벨 설정 ─── */
// 기존 4단계 난이도가 새 1단계 — 표시 레벨과 실제 난이도 배열 인덱스가 1:1 대응
const LEVEL_CONFIG = [
  /* lv */ /* spawnInterval */ /* speedPx/s */ /* maxWords */
  { level: 1,  interval: 2800, speed: 55,  max: 5  },
  { level: 2,  interval: 2400, speed: 68,  max: 6  },
  { level: 3,  interval: 2000, speed: 83,  max: 7  },
  { level: 4,  interval: 1700, speed: 100, max: 8  },
  { level: 5,  interval: 1400, speed: 120, max: 10 },
  { level: 6,  interval: 1100, speed: 143, max: 12 },
  { level: 7,  interval:  850, speed: 170, max: 15 },
];

/* ─── 고양이 성장 (레벨 기반, 무한) ─── */
// 레벨이 오를수록 고양이가 커지고 배경이 어두워짐
// t = 0(lv1) → 1(lv20+) 로 서서히 포화되는 정규화 값
function getCatStateForLevel(level) {
  const t = Math.min(1, (level - 1) / 19);  // 0~1

  // 이모지: 레벨 구간별
  let emoji;
  if (level <= 3)       emoji = '🐱';
  else if (level <= 7)  emoji = '😼';
  else if (level <= 12) emoji = '😾';
  else                  emoji = '🙀';

  // 크기: lv1=52px → 매 레벨 +26px 무한 증가
  const size = `${52 + (level - 1) * 26}px`;

  // t^2 이징: 초반엔 천천히, 후반에 확 어두워짐
  const tEased = t * t;

  // 오버레이: lv1 거의 투명 → lv20 거의 불투명 검정
  const oA = +(0.02 + 0.93 * tEased).toFixed(2);
  const overlayColor = `rgba(0, 0, 0, ${oA})`;

  // 방 배경색: lv1 따뜻한 베이지 → lv20 짙은 네이비
  const wallR = Math.round(215 - 200 * tEased);
  const wallG = Math.round(190 - 175 * tEased);
  const wallB = Math.round(155 - 110 * tEased);
  const wallColor  = `rgb(${wallR}, ${wallG}, ${wallB})`;
  const floorColor = `rgb(${Math.round(wallR*0.78)}, ${Math.round(wallG*0.75)}, ${Math.round(wallB*0.72)})`;

  // 밝기: lv1=1.0 → lv20=0.08
  const filterBrightness = Math.max(0.08, 1.0 - 0.92 * tEased);

  return { emoji, size, overlayColor, wallColor, floorColor, filterBrightness };
}

/* ─── 레벨업 기준 점수 (무한 레벨) ─── */
// 레벨 N으로 올라가는 데 필요한 누적 점수를 동적으로 계산
// 공식: 300 * N * (N+1) / 2  → 레벨이 높을수록 구간이 기하급수적으로 커짐
function scoreThresholdForLevel(level) {
  return Math.floor(300 * level * (level + 1) / 2);
}
// 예시: lv2=300, lv3=900, lv4=1800, lv5=3000, lv6=4500, lv7=6300, lv8=8400 ...


/* ─── 게임 상태 ─── */
const state = {
  running: false,
  score: 0,
  lives: 5,
  level: 1,
  activeWords: [],
  spawnTimer: null,
  animFrameId: null,
  lastTimestamp: null,
};

/* ─── DOM 참조 ─── */
const gameField       = document.getElementById('gameField');
const typingInput     = document.getElementById('typingInput');
const scoreDisplay    = document.getElementById('scoreDisplay');
const levelDisplay    = document.getElementById('levelDisplay');
const livesDisplay    = document.getElementById('livesDisplay');
const startScreen     = document.getElementById('startScreen');
const startBtn        = document.getElementById('startBtn');
const gameoverScreen  = document.getElementById('gameoverScreen');
const restartBtn      = document.getElementById('restartBtn');
const titleBtn        = document.getElementById('titleBtn');
const finalScore      = document.getElementById('finalScore');
const finalLevel      = document.getElementById('finalLevel');
const catEmoji        = document.getElementById('catEmoji');
const sceneFallback   = document.getElementById('sceneFallback');
const sceneImgs		  = Array.from({ length: 3 }, (_, i) => document.getElementById(`sceneImg${i}`));
const darknessOverlay = document.getElementById('darknessOverlay');
const roomBg          = document.getElementById('roomBg');

/* ─── 유틸 ─── */
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getLevelConfig() {
  if (state.level <= LEVEL_CONFIG.length) {
    return LEVEL_CONFIG[state.level - 1];
  }
  // 7단계 초과: 매 레벨마다 속도 +12px/s, 간격 -50ms, 최대 단어 +1
  const over = state.level - LEVEL_CONFIG.length; // 초과 레벨 수
  const base = LEVEL_CONFIG[LEVEL_CONFIG.length - 1];
  return {
    level:    state.level,
    interval: Math.max(300, base.interval - over * 50),
    speed:    Math.min(400, base.speed    + over * 12),
    max:      Math.min(25,  base.max      + over),
  };
}

/**
 * 현재 레벨의 가중치 테이블을 기반으로 카테고리를 확률적으로 선택한 뒤
 * 해당 카테고리의 단어 배열을 반환한다.
 */
function getWeightedWordPool() {
  const weights = LEVEL_WORD_WEIGHTS[Math.min(state.level - 1, LEVEL_WORD_WEIGHTS.length - 1)];
  const entries = Object.entries(weights);
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);

  let roll = Math.random() * totalWeight;
  for (const [category, weight] of entries) {
    roll -= weight;
    if (roll <= 0) {
      return { category, words: WORD_CATEGORIES[category].words };
    }
  }
  const [fallback] = entries[entries.length - 1];
  return { category: fallback, words: WORD_CATEGORIES[fallback].words };
}

/** 현재 레벨에서 활성화된 카테고리 목록 반환 (HUD 표시용) */
function getActiveCategories() {
  const weights = LEVEL_WORD_WEIGHTS[Math.min(state.level - 1, LEVEL_WORD_WEIGHTS.length - 1)];
  return Object.keys(weights).map(k => WORD_CATEGORIES[k].label);
}

/* ─── HUD 업데이트 ─── */
function updateHUD() {
  scoreDisplay.textContent = state.score.toLocaleString();
  levelDisplay.textContent = state.level;
  const hearts = '❤️'.repeat(state.lives) + '🖤'.repeat(5 - state.lives);
  livesDisplay.textContent = hearts;

  // 카테고리 배지 업데이트
  const categoryBar = document.getElementById('categoryBar');
  if (categoryBar) {
    const cats = getActiveCategories();
    categoryBar.innerHTML = cats.map(label =>
      `<span class="category_badge">${label}</span>`
    ).join('');
  }
}

/* ─── 고양이 비주얼 업데이트 (레벨 기반) ─── */
function updateCatStage() {
  const { emoji, size, overlayColor, wallColor, floorColor, filterBrightness } = getCatStateForLevel(state.level);

  // 오버레이 + 방 배경색 + 밝기 동시 적용
  darknessOverlay.style.background = overlayColor;
  roomBg.style.background = wallColor;
  roomBg.style.filter = `brightness(${filterBrightness})`;

  // 바닥색도 CSS 변수로 업데이트
  document.documentElement.style.setProperty('--color_room_wall', wallColor);
  document.documentElement.style.setProperty('--color_room_floor', floorColor);

  // 레벨 3구간마다 씬 이미지 전환 (3장)
  // 변경 (3장 기준, 레벨 1~3→0장, 4~6→1장, 7+→2장)
  const imgIdx = Math.min(Math.floor((state.level - 1) / 3), 2);
  sceneImgs.forEach((el, i) => {
    if (!el) return;
    el.classList.toggle('active', i === imgIdx);
  });

  // 파도 높이: 레벨 1=0px, 레벨 2부터 매 레벨마다 10px씩 증가
  const ocean = document.querySelector('.ocean');
  if (ocean) {
    const oceanHeight = (state.level - 1) * 20;
    ocean.style.height = `${oceanHeight}px`;
  }
}

/* ─── 단어 생성 ─── */
function spawnWord() {
  const cfg = getLevelConfig();
  if (state.activeWords.length >= cfg.max) return;

  const { category, words } = getWeightedWordPool();
  // 이미 화면에 있는 단어는 제외
  const activeTexts = new Set(state.activeWords.map(w => w.word));
  const available = words.filter(w => !activeTexts.has(w));
  if (available.length === 0) return;

  const word = getRandom(available);
  const fieldW = gameField.clientWidth;

  const el = document.createElement('div');
  el.className = `falling_word cat_${category}`;
  el.textContent = word;
  gameField.appendChild(el);

  // 단어 너비 계산 후 랜덤 X 배치
  const wordW  = el.offsetWidth || 120;
  const margin = 16;
  const x = margin + Math.random() * (fieldW - wordW - margin * 2);

  el.style.left = `${x}px`;
  el.style.top  = '-40px';

  state.activeWords.push({ el, word, category, x, y: -40, speed: cfg.speed });
}

/* ─── 단어 제거 (성공) ─── */
function clearWord(wordObj) {
  wordObj.el.classList.remove('matched');
  wordObj.el.classList.add('cleared');

  state.score += wordObj.word.length * 10 * state.level;
  checkLevelUp();
  updateHUD();

  setTimeout(() => {
    if (wordObj.el.parentNode) {
      wordObj.el.parentNode.removeChild(wordObj.el);
    }
  }, 300);

  state.activeWords = state.activeWords.filter(w => w !== wordObj);
}

/* ─── 단어 바닥 도달 (실패) ─── */
function missWord(wordObj) {
  if (wordObj.el.parentNode) {
    wordObj.el.parentNode.removeChild(wordObj.el);
  }
  state.activeWords = state.activeWords.filter(w => w !== wordObj);

  state.lives = Math.max(0, state.lives - 1);
  updateHUD();

  if (state.lives <= 0) {
    endGame();
  }
}

/* ─── 입력 처리 (타이핑 중 강조만) ─── */
function handleInput() {
  if (!state.running) return;

  const typed = typingInput.value.trim();

  // 매칭되는 단어 강조 (완전 일치 포함)
  state.activeWords.forEach(w => {
    if (typed.length > 0 && w.word.startsWith(typed)) {
      w.el.classList.add('matched');
    } else {
      w.el.classList.remove('matched');
    }
  });
}

/* ─── 게임 루프 ─── */
function gameLoop(timestamp) {
  if (!state.running) return;

  const delta = state.lastTimestamp ? (timestamp - state.lastTimestamp) / 1000 : 0;
  state.lastTimestamp = timestamp;

  const fieldH = gameField.clientHeight;

  // 단어 이동
  const toMiss = [];
  state.activeWords.forEach(w => {
    w.y += w.speed * delta;
    w.el.style.top = `${w.y}px`;

    // 하단 도달 판정
    const elH = w.el.offsetHeight || 36;
    if (w.y + elH >= fieldH) {
      toMiss.push(w);
    } else {
      // 긴박감 표시 (화면 70% 이하 → urgent, 85% 이하 → critical)
      const progress = w.y / fieldH;
      w.el.classList.remove('urgent', 'critical');
      if (progress >= 0.85) {
        w.el.classList.add('critical');
      } else if (progress >= 0.65) {
        w.el.classList.add('urgent');
      }
    }
  });

  // 바닥 도달한 단어 처리 (루프 밖에서)
  toMiss.forEach(w => {
    if (state.running) missWord(w);
  });

  if (state.running) {
    state.animFrameId = requestAnimationFrame(gameLoop);
  }
}

/* ─── 스폰 타이머 ─── */
function startSpawnTimer() {
  clearInterval(state.spawnTimer);
  const cfg = getLevelConfig();
  spawnWord(); // 즉시 하나 생성
  state.spawnTimer = setInterval(() => {
    if (state.running) spawnWord();
  }, cfg.interval);
}

/* ─── 점수 기반 레벨업 체크 (무한) ─── */
function checkLevelUp() {
  const threshold = scoreThresholdForLevel(state.level);
  if (state.score >= threshold) {
    state.level++;
    updateCatStage();  // 레벨업마다 고양이 커지고 배경 어두워짐
    startSpawnTimer();
  }
}

/* ─── 게임 시작 ─── */
function startGame() {
  // 상태 초기화
  state.running     = false;
  state.score       = 0;
  state.lives       = 5;
  state.level       = 1;
  state.lastTimestamp = null;

  // 기존 단어 전부 제거
  state.activeWords.forEach(w => {
    if (w.el.parentNode) w.el.parentNode.removeChild(w.el);
  });
  state.activeWords = [];

  // UI 초기화
  updateHUD();
  updateCatStage();
  typingInput.value = '';

  startScreen.classList.add('hidden');
  gameoverScreen.classList.add('hidden');

  state.running = true;
  startSpawnTimer();
  state.animFrameId = requestAnimationFrame(gameLoop);

  typingInput.focus();
}

/* ─── 게임 종료 ─── */
function endGame() {
  state.running = false;

  clearInterval(state.spawnTimer);
  cancelAnimationFrame(state.animFrameId);

  finalScore.textContent = state.score.toLocaleString();
  finalLevel.textContent = state.level;
  gameoverScreen.classList.remove('hidden');
}

/* ─── 타이틀로 (게임오버 → 시작화면) ─── */
function goToTitle() {
  state.running = false;
  clearInterval(state.spawnTimer);
  cancelAnimationFrame(state.animFrameId);

  state.activeWords.forEach(w => {
    if (w.el.parentNode) w.el.parentNode.removeChild(w.el);
  });
  state.activeWords = [];

  gameoverScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
}

/* ─── 이벤트 바인딩 ─── */
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
titleBtn.addEventListener('click', goToTitle);

typingInput.addEventListener('input', handleInput);

// 엔터 키 → 단어 클리어 시도
typingInput.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  e.preventDefault();

  if (!state.running) return;

  const typed = typingInput.value.trim();
  if (typed.length === 0) return;

  const matched = state.activeWords.find(w => w.word === typed);
  if (matched) {
    typingInput.value = '';
    state.activeWords.forEach(w => w.el.classList.remove('matched'));
    clearWord(matched);
  } else {
    // 틀린 단어 피드백 + 입력창 초기화
    typingInput.classList.add('wrong');
    typingInput.value = '';
    state.activeWords.forEach(w => w.el.classList.remove('matched'));
    setTimeout(() => typingInput.classList.remove('wrong'), 350);
  }
});

// 게임 중 항상 입력창에 포커스 유지
document.addEventListener('keydown', () => {
  if (state.running && document.activeElement !== typingInput) {
    typingInput.focus();
  }
});
