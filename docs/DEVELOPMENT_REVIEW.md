# 개발 재검토 보고서
## Development Review Report

**문서 버전:** 1.0
**검토일:** 2026-03-05
**검토자:** Senior Developer
**대상 문서:** PRD_FINAL.md v2.0.0

---

## 1. 검토 요약

### 전반적인 평가
**점수: 7.5/10**

PRD_FINAL.md는 포괄적이고 상세한 문서이나, 일부 기술적 설명이 실제 구현과 불일치하거나 지나치게 낙관적인 추정이 포함되어 있습니다. 문서 구조는 우수하나 실행 가능성 면에서 현실적인 조정이 필요합니다.

### 주요 강점 3가지

1. **상세한 아키텍처 문서화**
   - 3계층 구조 (Data Collection, Business Logic, Presentation) 명확히 정의
   - IPC 채널 매핑 테이블로 통신 프로토콜 체계화
   - 상태 전이 다이어그램으로 에이전트 생명주기 가시화

2. **실제 코드와의 높은 일치도**
   - Hook 기반 이벤트 수신 (hook.js) - 실제 구현 확인
   - PID 기반 생명주기 관리 (process.kill(pid, 0)) - 구현됨
   - AgentManager의 EventEmitter 패턴 - 코드에 적용됨
   - CSS Grid + Flexbox 하이브리드 레이아웃 - styles.css에 구현됨

3. **체계적인 기술 부채 관리**
   - 우선순위별 분류 (높음/중간/낮음)
   - 구체적인 해결 로드맵 제시
   - 예상 시간 산정 (총 124시간)

### 주요 약점 3가지

1. **기술 스택 설명의 부정확성**
   - "비동기 I/O 도입 필요"라고 명시하나, 실제 코드는 동기 I/O를 사용 중
   - package.json에 DevDependency만 존재 (electron만), fs-extra 같은 런타임 의존성 누락
   - 테스트 도구 제안 (jest, spectron)이나 실제 프로젝트에는 미설치

2. **테스트 전략의 실효성 부족**
   - 테스트 커버리지 목표 50% 제시, 실제는 0% (테스트 파일 없음)
   - "각 빌드마다 실행" 명시했으나 CI/CD 파이프라인 미구축
   - P0/P1/P2 우선순위 분류했으나, 실행 계획 구체성 부족

3. **리소스 추정의 비현실성**
   - 1개월 내 "50% 테스트 커버리지" - 현재 0%에서 시작 시 과도함
   - "3주 만에 macOS/Linux 지원" - 플랫폼별 PID 조회, 창 관리 API 차이 고려 부족
   - 12개월 MAU 5,000명 - 오픈소스 도구로서 보수적이어야 함

---

## 2. 기술적 실행 가능성 검증

### 구현 가능한 기능

| 기능 | PRD 상태 | 실제 구현 | 실행 가능성 |
|------|----------|-----------|-------------|
| Hook 기반 실시간 이벤트 수신 | 완료 (95%) | hook.js 존재, 14개 이벤트 처리 | ⭐⭐⭐⭐⭐ |
| PID 기반 생명주기 관리 | 완료 (95%) | process.kill(pid, 0) 사용, 3초 간격 체크 | ⭐⭐⭐⭐⭐ |
| 자동 세션 복구 | 완료 (85%) | state.json 활용, WMI 쿼리로 PID 매칭 | ⭐⭐⭐⭐ |
| 터미널 포커싱 | 완료 (90%) | PowerShell 스크립트로 SetForegroundWindow | ⭐⭐⭐⭐ |
| 멀티 에이전트 관리 | 완료 (90%) | AgentManager Map 구조, 최대 10개 | ⭐⭐⭐⭐⭐ |
| 프로젝트 그룹화 | 완료 (85%) | CSS Grid auto-fill, projectPath 기반 | ⭐⭐⭐⭐ |

### 기술적 제약 사항

#### 1. OS 호환성 (Windows 전용)
```javascript
// main.js:683 - Windows 전용 코드
execFile('powershell.exe', ['-NoProfile', '-Command', psCmd], ...);
```

**PRD 명시:** "🔴 macOS/Linux 지원 (현재 Windows 전용)"
**실제:** 모든 프로세스 관리 코드가 Windows WMI/PowerShell에 의존
**영향:** TAM이 500만 명에서 실제는 Windows 사용자로 제한

#### 2. 동기 I/O 병목
```javascript
// 실제 코드에서 발견 (main.js, hook.js)
fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf-8');
fs.appendFileSync(path.join(dir, 'hooks.jsonl'), ...);
```

**PRD 명시:** "비동기 I/O 도입 필요 - 메인 스레드 차단"
**해결 난이도:** 중간 (쓰기 버퍼링으로 우회 가능)
**예상 공수:** 8시간

#### 3. 메모리 누수 위험
```javascript
// renderer.js:83-102 - 각 에이전트별 개별 interval
const interval = setInterval(() => {
  // 애니메이션 프레임 업데이트
}, 1000 / sequence.fps);
```

**PRD 명시:** "메모리 누수: 2-3개 존재, 높음 우선순위"
**실제:** agentStates Map 정리 로직 확인 필요
**해결 시급성:** 높음

### 리소스 부족 영역

| 영역 | 현재 상태 | 필요 리소스 | 갭 |
|------|----------|------------|-----|
| 테스트 인프라 | 0% 커버리지, 테스트 파일 없음 | Jest, Spectron, CI/CD | 매우 큼 |
| 크로스 플랫폼 지원 | Windows만 | macOS/Linux 개발자 | 큼 |
| 성능 모니터링 | debug.log 파일만 | 구조화 로깅, APM | 중간 |
| 보안 감사 | 입출력 검증 없음 | 보안 전문가 리뷰 | 중간 |

---

## 3. 수정 제안

### 즉시 수정 필요 항목 (이번 주)

#### 1. package.json 정확화
**현재 문제:**
```json
{
  "devDependencies": {
    "electron": "^32.0.0"
  }
}
```

**수정 제안:**
```json
{
  "dependencies": {
    "fs-extra": "^11.2.0",
    "joi": "^17.11.0"  // 입력 검증용
  },
  "devDependencies": {
    "electron": "^32.0.0",
    "jest": "^29.7.0",
    "electron-mocha": "^12.0.0"
  },
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage"
  }
}
```

#### 2. 기술 스택 설명 수정
**PRD 2.1 "시스템 구조"에서:**
- 삭제: "비동기 I/O 기반으로 확장성 확보" (현재 거짓)
- 수정: "현재 동기 I/O 사용 중, 비동기 전환 계획됨"
- 추가: "Windows 전용으로 구현됨, 크로스 플랫폼은 TBD"

#### 3. 테스트 커버리지 목표 현실화
**현재:** "1개월 내 50% 커버리지"
**수정 제안:**
- 1개월: 20% (P0 기능 단위 테스트)
- 2개월: 40% (통합 테스트 추가)
- 3개월: 50% (E2E 테스트 도입)

### 개선 제안

#### 1. 성능 요구사항 구체화
**PRD 5.1 "성능 요구사항"에 추가:**
```markdown
| 지표 | 현재 값 | 목표치 | 측정 방법 |
|-----|--------|--------|----------|
| 이벤트 수신 지연 | ~50ms | <100ms | Hook → IPC까지 timestamp |
| 애니메이션 FPS | 측정 안됨 | 60fps | Chrome DevTools Performance |
| 메모리 사용량 (10개 에이전트) | 미측정 | <200MB | process.memoryUsage() |
```

**실행 계획:**
- 측정 코드 추가 (main.js, renderer.js)
- 벤치마크 자동화 스크립트 작성
- CI에서 성능 회귀 감지

#### 2. 보안 요구사항 구현 로드맵
**PRD 5.2 "보안 요구사항"에 추가:**

**Phase 1 (1주일):**
```javascript
// 입력 검증 추가
const Joi = require('joi');
const hookSchema = Joi.object({
  sessionId: Joi.string().required(),
  _pid: Joi.number().integer().positive().required(),
  // ...
});
const validated = hookSchema.validate(data);
```

**Phase 2 (2주일):**
- IPC 메시지 서명 (MessagePort)
- Mission Control 토큰을 POST로 전송

**Phase 3 (1개월):**
- 감사 로깅 (winston, pino)
- 보안 이벤트 알림

#### 3. 개발 가이드 실용화
**PRD에 "개발 가이드" 섹션 추가:**

```markdown
## 10. 개발 가이드

### 10.1 로컬 개발 환경 설정
```bash
# 1. 의존성 설치
npm install

# 2. Claude CLI에 hook 등록
claude config set hook.program "node /path/to/hook.js"

# 3. 앱 실행
npm start

# 4. 테스트 실행
npm test
```

### 10.2 디버깅
- Main Process: VS Code Debugger
- Renderer Process: Chrome DevTools (Ctrl+Shift+I)
- Log File: ~/.pixel-agent-desk/debug.log

### 10.3 공통 실수
- ❌ Hook에서 console.log 사용 (출력 없음)
- ✅ fs.appendFileSync로 hooks.jsonl에 기록
- ❌ setInterval 정리 안 함 (메모리 누수)
- ✅ AgentManager.removeAgent() 호출
```

### 추가 필요 내용

#### 1. API 레퍼런스
**현재 부족:** IPC 채널 매핑만 있고, 실제 함수 시그니처 없음
**추가 제안:**
```markdown
### 2.5 IPC API 레퍼런스

#### agent-added
**이벤트:** Main → Renderer
**데이터 형식:**
```typescript
interface AgentData {
  id: string;
  sessionId: string;
  displayName: string;
  state: 'Waiting' | 'Working' | 'Done' | 'Error' | 'Help';
  projectPath: string;
  isSubagent: boolean;
  activeStartTime: number;
  lastDuration: number;
}
```

#### focus-terminal
**요청:** Renderer → Main
**매개변수:** `agentId: string`
**동작:** PowerShell로 해당 PID 터미널 포커스
```

#### 2. 트러블슈팅 가이드
**PRD에 추가:**
```markdown
## 11. 트러블슈팅

### 에이전트가 나타나지 않음
**증상:** Claude CLI 실행해도 캐릭터 없음
**원인:** hook.js가 등록되지 않음
**해결:** `claude config list`로 hook.program 확인

### "Zombie" 에이전트 남음
**증상:** Claude 종료 후에도 캐릭터 유지
**원인:** PID 확인 실패 (2회 연속)
**해결:** 수동으로 dismiss (우클릭) 또는 앱 재시작

### 윈도우가 계속 최상위
**증상:** 다른 창을 덮음
**원인:** setAlwaysOnTop(true)
**해결:** ESC 키로 숨기기 또는 설정에서 비활성화
```

---

## 4. 타 전문가와의 협업 필요사항

### 아키텍처팀과 조율 필요사항

#### 1. 단위 테스트 전략 수립
**현재 문제:**
- AgentManager가 EventEmitter 상속 (테스트 까다로움)
- 파일 I/O와 밀결합 (fs.writeFileSync)

**제안:**
```javascript
// 의존성 주입으로 리팩토링
class AgentManager {
  constructor(options = {}) {
    this.storage = options.storage || new FileStorage();
    this.emitter = options.emitter || new EventEmitter();
  }
}

// 테스트에서 Mock 사용
const mockStorage = { save: jest.fn(), load: jest.fn() };
const manager = new AgentManager({ storage: mockStorage });
```

**아키텍처팀 요청사항:**
- Repository 패턴 도입 검토
- Dependency Injection 프레임워크 평가 (InversifyJS, Awilix)

#### 2. 성능 최적화 로드맵
**PRD 명시된 병목 지점:**
1. 동기 파일 I/O
2. 250ms마다 윈도우 속성 재설정
3. 각 에이전트별 개별 interval

**아키텍처팀 요청사항:**
- Worker Thread로 파일 I/O 격리 검토
- requestAnimationFrame 기반 통합 애니메이션 루프 설계
- SetForegroundWindow 호출 최적화 방안

#### 3. 메모리 프로파일링
**필요 데이터:**
- 10개 에이전트 실행 시 메모리 스냅샷
- 1시간 운영 후 메모리 누수 확인
- interval 누수 정도

**아키텍처팀 요청사항:**
- Chrome DevTools Memory Profiler 사용법
- Node.js heapdump 활용법
- CI에서 메모리 상한 테스트 (200MB)

### 기획팀과 조율 필요사항

#### 1. 기능 우선순위 재조정
**현재 MoSCoW 분석 문제:**
- P2 "작업 히스토리"가 미구현인데 PRD에서 상세히 설명
- Mission Control이 P1이나 완성도 60%인데 상세 UX 명시

**제안:**
```markdown
### 수정된 MoSCoW (실현 가능 버전)

**Must Have (P0) - MVP:**
- ✅ Hook 기반 실시간 이벤트 수신
- ✅ PID 기반 생명주기 관리
- ✅ 상태 시각화
- ✅ 터미널 포커싱
- ✅ 자동 세션 복구
- ✅ 최소한의 테스트 (20%)

**Should Have (P1) - 1개월 목표:**
- ✅ 멀티 에이전트 관리 (완료)
- ✅ 프로젝트 그룹화 (완료)
- 🚧 사용자 설정 UI (단순 버전만)
- 🚧 에러 복구 가이드 UI

**Could Have (P2) - 3개월 목표:**
- ❌ Mission Control (일시 보류)
- ❌ 작업 히스토리 타임라인
- ❌ 통계 대시보드

**Won't Have (P3) - 향후 고려:**
- ❌ macOS/Linux 지원 (별도 프로젝트로 분리 검토)
```

#### 2. 리소스 추정 현실화
**기획팀 제안:**
```markdown
### 수정된 개발 로드맵

**1개월 (안정화):**
- 테스트 20% 커버리지
- 메모리 누수 수정
- 에러 핸들링 강화
- 사용자 설정 UI (단순)

**3개월 (성숙):**
- 테스트 50% 커버리지
- CI/CD 파이프라인
- 모니터링 시스템
- 성능 최적화

**6개월 (확장):**
- Mission Control 재검토
- macOS/Linux 지원 검토
- 플러그인 시스템 설계
```

#### 3. 성공 지표 현실화
**현재:** 12개월 MAU 5,000명
**현실적 조정:**
```markdown
### 보수적인 성공 지표

**월간 활성 사용자 (MAU):**
- 1개월: 50명 (기여자 포함)
- 3개월: 200명 (워드마우스)
- 6개월: 500명 (초기 채택)
- 12개월: 1,000명 (안정적 성장)

**일간 활성 사용자 (DAU):**
- 1개월: 10명
- 3개월: 50명
- 6개월: 150명
- 12개월: 300명

**리텐션율:**
- 주간 리텐션: 30% 이상 (실현 가능)
- 월간 리텐션: 20% 이상 (오픈소스 툴 표준)
```

### QA팀과 조율 필요사항

#### 1. 테스트 자동화 전략
**현재 문제:** 테스트가 전혀 없음
**QA팀 요청사항:**

**Phase 1 (1주일):** smoke test
```javascript
// smoke.test.js
describe('Pixel Agent Desk Smoke Test', () => {
  it('앱이 시작해야 함', async () => {
    const app = await electron.start();
    expect(app.isRunning()).toBe(true);
  });

  it('Hook 서버가 47821 포트에서 리스닝해야 함', async () => {
    const response = await fetch('http://localhost:47821/health');
    expect(response.status).toBe(200);
  });
});
```

**Phase 2 (2주일):** 단위 테스트
```javascript
// agentManager.test.js
describe('AgentManager', () => {
  it('에이전트 추가 시 agent-added 이벤트를 emit해야 함', () => {
    const manager = new AgentManager();
    const spy = jest.fn();
    manager.on('agent-added', spy);
    manager.updateAgent({ sessionId: 'test-123' });
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: 'test-123' }));
  });
});
```

**Phase 3 (1개월):** 통합 테스트
```javascript
// integration.test.js
describe('Hook → AgentManager → IPC Flow', () => {
  it('SessionStart 이벤트가 에이전트 생성해야 함', async () => {
    // HTTP POST /hook으로 SessionStart 전송
    // AgentManager.agents 크기 확인
    // IPC로 agent-updated 수신 확인
  });
});
```

#### 2. 크로스 플랫폼 테스트 계획
**현재:** Windows만 테스트 가능
**QA팀 요청사항:**
- GitHub Actions Matrix 전략
```yaml
# .github/workflows/test.yml
strategy:
  matrix:
    os: [windows-latest, macos-latest, ubuntu-latest]
    node-version: [18.x, 20.x]
```

**문제점:**
- macOS/Linux에서는 테스트 스킵 필요 (PowerShell 없음)
- 조건부 테스트 로직 추가 필요

#### 3. 성능 회귀 테스트
**QA팀 요청사항:**
```javascript
// performance.test.js
describe('Performance Benchmarks', () => {
  it('이벤트 수신 지연이 100ms 미만이어야 함', async () => {
    const start = Date.now();
    await sendHookEvent({ type: 'SessionStart' });
    await waitForAgentUpdate();
    const latency = Date.now() - start;
    expect(latency).toBeLessThan(100);
  });

  it('10개 에이전트 시 메모리 사용량이 200MB 미만이어야 함', async () => {
    const mem = process.memoryUsage().heapUsed;
    await createAgents(10);
    const newMem = process.memoryUsage().heapUsed;
    expect(newMem - mem).toBeLessThan(200 * 1024 * 1024);
  });
});
```

#### 4. 버그 리포트 자동화
**QA팀 요청사항:**
- Sentry 또는 Bugsnag 통합
- 사용자 환경 정보 자동 수집
- crash-reporter (Electron built-in)

**PRD에 추가:**
```markdown
### 5.4 모니터링 및 버그 리포트

**수집 데이터:**
- OS 버전, Electron 버전
- 에이전트 수, 상태
- 에러 스택 트레이스
- 성능 지표 (앱 시작 시간, 메모리)

**개인정보 보호:**
- 프로젝트 경로 수집 안 함
- sessionId 해시해서 저장
- 사용자 명시적 동의 필요
```

---

## 5. 결론

### 요약

PRD_FINAL.md는 **우수한 문서 구조와 상세한 기술 설명**을 갖추고 있으나, **실제 구현과의 불일치**와 **지나치게 낙관적인 추정**이 있습니다.

### 우선순위별 액션 아이템

**긴급 (이번 주):**
1. ✅ package.json 정확화 (dependencies 추가)
2. ✅ 기술 스택 설명 수정 (동기 I/O, Windows 전용 명시)
3. ✅ 테스트 커버리지 목표 현실화

**중요 (1개월):**
1. ⚠️ 단위 테스트 프레임워크 구축 (Jest, Electron Mocha)
2. ⚠️ 메모리 누수 수정 (interval 정리, Map 정리)
3. ⚠️ 기능 우선순위 재조정 (Mission Control 보류)

**보통 (3개월):**
1. 📋 성능 모니터링 시스템
2. 📋 크로스 플랫폼 지원 검토
3. 📋 CI/CD 파이프라인 구축

### 최종 권장사항

PRD_FINAL.md를 **"기술적 비전"**이 아닌 **"실행 가능한 로드맵"**으로 수정하여, 개발팀이 실제로 따를 수 있는 현실적인 목표를 설정해야 합니다.

**다음 단계:**
1. 본 검토 보고서를 기획팀과 아키텍처팀에 공유
2. 1주일 내 수정된 PRD v2.1 작성
3. 개발팀 Kick-off 미팅에서 우선순위 합의

---

**검토자 서명:** Senior Developer
**승인자:** [ ] Tech Lead [ ] Product Manager
**다음 리뷰:** 2026-04-05
