/**
 * Renderer Config — 상수, 스프라이트 설정, 상태 맵
 */

// --- DOM Elements ---
const agentGrid = document.getElementById('agent-grid');

// --- 스프라이트 시트 설정 ---
const SHEET = {
  cols: 9,
  width: 48,
  height: 64
};

// --- 애니메이션 시퀀스 ---
const ANIM_SEQUENCES = {
  working: { frames: [1, 2, 3, 4], fps: 8, loop: true },
  complete: { frames: [20, 21, 22, 23, 24, 25, 26, 27], fps: 6, loop: true },
  waiting: { frames: [32], fps: 1, loop: true },
  alert: { frames: [0, 31], fps: 4, loop: true }
};

// --- 상태별 맵핑 ---
const stateConfig = {
  'Working': { anim: 'working', class: 'state-working', label: 'Working...' },
  'Thinking': { anim: 'working', class: 'state-working', label: 'Thinking...' },
  'Done': { anim: 'complete', class: 'state-complete', label: 'Done!' },
  'Waiting': { anim: 'waiting', class: 'state-waiting', label: 'Waiting...' },
  'Error': { anim: 'alert', class: 'state-alert', label: 'Error!' },
  'Help': { anim: 'alert', class: 'state-alert', label: 'Help!' },
  'Offline': { anim: 'waiting', class: 'state-offline', label: 'Offline' }
};

// --- 에이전트별 상태 관리 ---
const agentStates = new Map(); // agentId -> { animName, frameIdx, rafId, startTime, timerInterval, lastFormattedTime }

// --- 아바타 관리 ---
// 오피스 뷰(office-config.js)와 동일한 목록 — 동기화 필수
const AVATAR_FILES = [
  'avatar_0.webp','avatar_1.webp','avatar_2.webp','avatar_3.webp',
  'avatar_4.webp','avatar_5.webp','avatar_6.webp','avatar_7.webp',
  'avatar_8.webp','avatar_9.webp','avatar_09.webp',
  'avatar_10.webp','avatar_11.webp','avatar_12.webp','avatar_13.webp',
  'avatar_14.webp','avatar_15.webp','avatar_16.webp','avatar_17.webp',
  'avatar_18.webp','avatar_19.webp','avatar_20.webp','avatar_21.webp',
  'avatar_22.webp',
];
let availableAvatars = [];
let idleAvatar = 'avatar_0.webp';
const agentAvatars = new Map(); // agentId -> avatar filename

/** 에이전트 ID → 결정적 아바타 파일명 (오피스 뷰와 동일 결과) */
function avatarFromAgentId(id) {
  let hash = 0;
  const str = id || '';
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_FILES[Math.abs(hash) % AVATAR_FILES.length];
}
