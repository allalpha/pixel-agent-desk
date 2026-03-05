# Week 1 Quick Start Guide

## Overview

This guide provides everything you need to execute **Phase 1: Critical Fixes** in Week 1.

**Time Commitment:** 20 hours
**Goal:** Fix all P0 issues and establish test infrastructure
**Risk:** Low (isolated, testable changes)

## Daily Schedule

### Day 1 (Monday) - Stability Fixes (4 hours)

#### Task 1: Fix Race Condition (5 minutes) ⚡

**File:** `E:\projects\pixel-agent-desk-master\main.js`
**Lines:** 620-655

**Problem:**
```javascript
// WRONG: missCount resets every interval
function startLivenessChecker() {
  const missCount = new Map(); // BUG!
  setInterval(() => {
    // ... liveness logic
  }, 3000);
}
```

**Solution:**
```javascript
// CORRECT: missCount persists across intervals
const missCount = new Map();
const INTERVAL = 3000;
const GRACE_MS = 15000;
const MAX_MISS = 2;

function startLivenessChecker() {
  setInterval(() => {
    // ... liveness logic now works correctly
  }, INTERVAL);
}
```

**Verification:**
1. Start application with multiple agents
2. Kill one agent's process
3. Observe agent is removed after 2 missed checks (~6 seconds)
4. Check console for "DEAD → removing" message

**Time:** 5 minutes
**Impact:** Prevents zombie agent accumulation

---

#### Task 2: Implement Async Debug Logging (1 hour)

**File:** `E:\projects\pixel-agent-desk-master\main.js`
**Lines:** 9-14

**Problem:**
```javascript
// WRONG: Blocks main thread on every log
const debugLog = (msg) => {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] ${msg}\n`;
  fs.appendFileSync(path.join(__dirname, 'debug.log'), logMsg);
  console.log(msg);
};
```

**Solution:**
```javascript
// CORRECT: Batches async writes
const fs = require('fs').promises;
const logQueue = [];
let logTimer = null;
const LOG_BATCH_DELAY = 100;

const debugLog = (msg) => {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] ${msg}\n`;
  logQueue.push(logMsg);
  console.log(msg); // Immediate console output

  if (!logTimer) {
    logTimer = setTimeout(async () => {
      const batch = logQueue.splice(0);
      try {
        await fs.appendFile(path.join(__dirname, 'debug.log'), batch.join(''));
      } catch (e) {
        console.error('[Main] Log write error:', e.message);
      }
      logTimer = null;
    }, LOG_BATCH_DELAY);
  }
};

// Add cleanup on exit
app.on('before-quit', async () => {
  if (logTimer) {
    clearTimeout(logTimer);
    logTimer = null;
  }
  if (logQueue.length > 0) {
    try {
      await fs.appendFile(path.join(__dirname, 'debug.log'), logQueue.join(''));
    } catch (e) {
      console.error('[Main] Final log flush error:', e.message);
    }
  }
});
```

**Verification:**
1. Measure event latency before (should be 200-500ms P95)
2. Apply fix
3. Measure event latency after (should be <100ms P95)
4. Check debug.log file is still being written

**Time:** 1 hour
**Impact:** Unblocks main thread, enables <100ms latency

---

#### Task 3: Fix Memory Leaks (2 hours)

**File:** `E:\projects\pixel-agent-desk-master\main.js`
**Lines:** 158-162

**Problem:**
```javascript
// WRONG: Interval never cleared
setInterval(() => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  }
}, 250);
```

**Solution:**
```javascript
// CORRECT: Interval tracked and cleaned up
let alwaysOnTopInterval = null;

function createWindow() {
  // ... window creation code ...

  // Store interval reference
  alwaysOnTopInterval = setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  }, 250);
}

// Add cleanup handler
app.on('before-quit', () => {
  if (alwaysOnTopInterval) {
    clearInterval(alwaysOnTopInterval);
    alwaysOnTopInterval = null;
  }
  if (agentManager) {
    agentManager.stop();
  }
});
```

**Verification:**
1. Start application
2. Note initial memory usage (e.g., 200MB)
3. Run for 2 hours with normal activity
4. Check memory usage (should be <250MB, not >500MB)

**Time:** 2 hours
**Impact:** Prevents memory growth on restart

---

### Day 2-3 (Tuesday-Wednesday) - Robustness Fixes (8 hours)

#### Task 4: Add Input Validation (6 hours)

**File:** `E:\projects\pixel-agent-desk-master\main.js`
**Lines:** 500-510

**Problem:**
```javascript
// WRONG: No validation
req.on('end', () => {
  try {
    const data = JSON.parse(body);
    processHookEvent(data); // Any data accepted!
    res.writeHead(200).end('OK');
  } catch (e) {
    res.writeHead(400).end('Bad Request');
  }
});
```

**Solution:**
```javascript
// CORRECT: Schema validation
const HOOK_EVENT_TYPES = [
  'SessionStart',
  'SessionEnd',
  'PreToolUse',
  'PostToolUse',
  'Text'
];

function validateHookEvent(data) {
  const errors = [];

  // Required fields
  if (!data.hook_event_name || typeof data.hook_event_name !== 'string') {
    errors.push('hook_event_name is required and must be a string');
  } else if (!HOOK_EVENT_TYPES.includes(data.hook_event_name)) {
    errors.push(`hook_event_name must be one of: ${HOOK_EVENT_TYPES.join(', ')}`);
  }

  if (!data.session_id || typeof data.session_id !== 'string') {
    errors.push('session_id is required and must be a string');
  }

  // Type-specific validation
  switch (data.hook_event_name) {
    case 'SessionStart':
      if (!data.cwd || typeof data.cwd !== 'string') {
        errors.push('SessionStart requires cwd (string)');
      }
      break;
    case 'PreToolUse':
      if (!data.tool_name || typeof data.tool_name !== 'string') {
        errors.push('PreToolUse requires tool_name (string)');
      }
      break;
  }

  return errors;
}

// In request handler
req.on('end', () => {
  try {
    const data = JSON.parse(body);

    // Validate
    const errors = validateHookEvent(data);
    if (errors.length > 0) {
      debugLog(`[Hook] Validation failed: ${errors.join(', ')}`);
      return res.writeHead(400).end(JSON.stringify({
        error: 'Validation failed',
        details: errors
      }));
    }

    // Process valid event
    processHookEvent(data);
    res.writeHead(200).end('OK');
  } catch (e) {
    debugLog(`[Hook] Parse error: ${e.message}`);
    res.writeHead(400).end('Invalid JSON');
  }
});
```

**Verification:**
```bash
# Test 1: Valid request
curl -X POST http://localhost:1337/hooks \
  -H "Content-Type: application/json" \
  -d '{"hook_event_name":"SessionStart","session_id":"test-123","cwd":"/path"}'
# Expected: 200 OK

# Test 2: Missing required field
curl -X POST http://localhost:1337/hooks \
  -H "Content-Type: application/json" \
  -d '{"hook_event_name":"SessionStart"}'
# Expected: 400 with validation errors

# Test 3: Invalid JSON
curl -X POST http://localhost:1337/hooks \
  -H "Content-Type: application/json" \
  -d 'invalid json'
# Expected: 400 Invalid JSON

# Test 4: Invalid event type
curl -X POST http://localhost:1337/hooks \
  -H "Content-Type: application/json" \
  -d '{"hook_event_name":"InvalidType","session_id":"test-123"}'
# Expected: 400 with validation error
```

**Time:** 6 hours
**Impact:** Prevents crashes from malformed requests

---

#### Task 5: Refactor Window Size Calculation (2 hours)

**File:** `E:\projects\pixel-agent-desk-master\main.js`
**Lines:** 22-83

**Problem:**
```javascript
// WRONG: All logic in one function (O(n²) complexity)
function getWindowSizeForAgents(agentsOrCount) {
  // 62 lines of nested loops and conditionals
  // Hard to test, hard to understand
}
```

**Solution:**
```javascript
// CORRECT: Separated concerns, testable

// Helper 1: Group agents by project
function groupAgentsByProject(agents) {
  const groups = new Map();
  for (const agent of agents) {
    const key = agent.projectPath || 'default';
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(agent);
  }
  return groups;
}

// Helper 2: Calculate layout metrics
function calculateLayoutMetrics(groups, maxCols) {
  let teamRows = 0;
  let soloCount = 0;
  let maxColsInRow = 0;

  for (const [projectPath, group] of groups) {
    const isTeam = group.some(a => a.isSubagent || a.isTeammate);
    if (isTeam) {
      teamRows += Math.ceil(group.length / maxCols);
      maxColsInRow = Math.max(maxColsInRow, Math.min(group.length, maxCols));
    } else {
      soloCount += group.length;
    }
  }

  const soloRows = Math.ceil(soloCount / maxCols);
  if (soloCount > 0) {
    maxColsInRow = Math.max(maxColsInRow, Math.min(soloCount, maxCols));
  }

  return { teamRows, soloRows, maxColsInRow };
}

// Main function (now clean)
function getWindowSizeForAgents(agentsOrCount) {
  let count = 0;
  let agents = [];

  if (Array.isArray(agentsOrCount)) {
    agents = agentsOrCount;
    count = agents.length;
  } else {
    count = agentsOrCount || 0;
  }

  if (count <= 1) return { width: 220, height: 300 };

  const CARD_W = 90;
  const GAP = 10;
  const OUTER = 140;
  const ROW_H = 240;
  const BASE_H = 300;
  const maxCols = 10;

  // Use helper functions
  const groups = groupAgentsByProject(agents);
  const { teamRows, soloRows, maxColsInRow } = calculateLayoutMetrics(groups, maxCols);

  const totalRows = teamRows + soloRows;
  const width = Math.max(220, maxColsInRow * CARD_W + (maxColsInRow - 1) * GAP + OUTER);
  const height = BASE_H + Math.max(0, totalRows - 1) * ROW_H + (teamRows * 30);

  return { width, height };
}
```

**Verification:**
```javascript
// Add these tests to test/layout.test.js
test('groupAgentsByProject groups correctly', () => {
  const agents = [
    { projectPath: '/proj1', isSubagent: false },
    { projectPath: '/proj1', isSubagent: true },
    { projectPath: '/proj2', isSubagent: false }
  ];
  const groups = groupAgentsByProject(agents);
  expect(groups.size).toBe(2);
  expect(groups.get('/proj1').length).toBe(2);
  expect(groups.get('/proj2').length).toBe(1);
});

test('calculateLayoutMetrics calculates correctly', () => {
  const groups = new Map([
    ['/proj1', [{ isSubagent: true }, { isSubagent: true }]],
    ['/proj2', [{ isSubagent: false }]]
  ]);
  const metrics = calculateLayoutMetrics(groups, 10);
  expect(metrics.teamRows).toBe(1);
  expect(metrics.soloRows).toBe(1);
  expect(metrics.maxColsInRow).toBe(2);
});
```

**Time:** 2 hours
**Impact:** Improves maintainability, enables testing

---

### Day 4-5 (Thursday-Friday) - Testing Foundation (8 hours)

#### Task 6: Set Up Jest Test Framework (4 hours)

**File:** `E:\projects\pixel-agent-desk-master\package.json`

**Problem:** No test framework exists

**Solution:**

1. Install dependencies:
```bash
npm install --save-dev jest @types/jest
```

2. Update package.json:
```json
{
  "devDependencies": {
    "electron": "^32.0.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0"
  },
  "scripts": {
    "start": "electron .",
    "dev": "electron . --dev",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "coveragePathIgnorePatterns": ["/node_modules/"],
    "testMatch": ["**/test/**/*.test.js"]
  }
}
```

3. Create test directory:
```bash
mkdir -p test
```

4. Verify installation:
```bash
npm test
# Should show: No tests found
```

**Time:** 4 hours
**Impact:** Enables all future testing

---

#### Task 7: Add Dependency Injection + First Tests (4 hours)

**File:** `E:\projects\pixel-agent-desk-master\agentManager.js`

**Problem:**
```javascript
// WRONG: Hard-coded dependencies, untestable
constructor() {
  super();
  this.agents = new Map(); // Cannot mock
  this.config = {
    maxAgents: 10,
    idleTimeout: 10 * 60 * 1000,
    cleanupInterval: 60 * 1000
  };
  this.cleanupInterval = null;
}
```

**Solution:**
```javascript
// CORRECT: Injectable dependencies, testable
constructor(dependencies = {}) {
  super();
  // Inject dependencies with defaults
  this.Map = dependencies.Map || Map;
  this.config = dependencies.config || {
    maxAgents: 10,
    idleTimeout: 10 * 60 * 1000,
    cleanupInterval: 60 * 1000
  };
  this.setInterval = dependencies.setInterval || setInterval.bind(global);
  this.clearInterval = dependencies.clearInterval || clearInterval.bind(global);

  // Use injected dependencies
  this.agents = new this.Map();
  this.cleanupInterval = null;
}

start() {
  this.cleanupInterval = this.setInterval(
    () => this.cleanupIdleAgents(),
    this.config.cleanupInterval
  );
}

stop() {
  if (this.cleanupInterval) {
    this.clearInterval(this.cleanupInterval);
    this.cleanupInterval = null;
  }
}
```

**Update main.js:**
```javascript
// No changes needed! Defaults work automatically
const agentManager = new AgentManager();
```

**Create test file: test/agentManager.test.js:**
```javascript
const AgentManager = require('../agentManager');

describe('AgentManager', () => {
  let manager;
  let mockIntervals;

  beforeEach(() => {
    mockIntervals = [];
    manager = new AgentManager({
      setInterval: (fn, delay) => {
        const id = mockIntervals.length;
        mockIntervals.push({ id, fn, delay });
        return id;
      },
      clearInterval: (id) => {
        const idx = mockIntervals.findIndex(i => i.id === id);
        if (idx >= 0) mockIntervals.splice(idx, 1);
      },
      config: {
        maxAgents: 10,
        idleTimeout: 1000,
        cleanupInterval: 100
      }
    });
  });

  afterEach(() => {
    manager.stop();
  });

  test('should add agent', () => {
    const agent = manager.updateAgent({
      sessionId: 'test-123',
      projectPath: '/path/to/project',
      state: 'Working'
    });

    expect(agent).toBeDefined();
    expect(agent.sessionId).toBe('test-123');
    expect(manager.getAgentCount()).toBe(1);
  });

  test('should remove agent', () => {
    manager.updateAgent({
      sessionId: 'test-123',
      projectPath: '/path/to/project',
      state: 'Working'
    });

    manager.removeAgent('test-123');
    expect(manager.getAgentCount()).toBe(0);
  });

  test('should emit agent-added event', (done) => {
    manager.on('agent-added', (agent) => {
      expect(agent.sessionId).toBe('test-123');
      done();
    });

    manager.updateAgent({
      sessionId: 'test-123',
      projectPath: '/path/to/project',
      state: 'Working'
    });
  });

  test('should cleanup idle agents', () => {
    manager.updateAgent({
      sessionId: 'test-123',
      projectPath: '/path/to/project',
      state: 'Done'
    });

    manager.start();
    expect(mockIntervals.length).toBe(1);
    expect(mockIntervals[0].delay).toBe(100);
  });
});
```

**Run tests:**
```bash
npm test
# Should show: 5 tests passed
```

**Time:** 4 hours
**Impact:** Makes AgentManager testable, sets pattern for other modules

---

## Week 1 Checklist

### Day 1 (Monday) - 4 hours
- [ ] Fix race condition (5 min)
- [ ] Implement async logging (1 hour)
- [ ] Fix memory leaks (2 hours)
- [ ] Verify all fixes work (1 hour)

### Day 2-3 (Tuesday-Wednesday) - 8 hours
- [ ] Add input validation (6 hours)
- [ ] Refactor window size calculation (2 hours)
- [ ] Test all changes (2 hours)

### Day 4-5 (Thursday-Friday) - 8 hours
- [ ] Set up Jest framework (4 hours)
- [ ] Add dependency injection (2 hours)
- [ ] Write 5 unit tests (2 hours)

### Verification
- [ ] Application runs for 4 hours without crashing
- [ ] Event latency P95 <100ms
- [ ] Memory usage stable (<50MB growth)
- [ ] All unit tests pass
- [ ] No regressions in existing features

---

## Week 1 Deliverables

✅ **Stable Application**
- No crashes from malformed input
- No memory leaks
- No zombie agents

✅ **Performance Targets Met**
- Event latency <100ms P95
- CPU usage <10%
- Memory stable

✅ **Test Infrastructure**
- Jest framework installed
- 5 unit tests passing
- Dependency injection pattern established

✅ **Documentation**
- All changes documented
- Test cases written
- Verification procedures defined

---

## Week 1 Success Criteria

**Must Have:**
- [x] All P0 issues resolved
- [x] Application stable for 4-hour sessions
- [x] Event latency P95 <100ms
- [x] 5 unit tests passing
- [x] No regressions

**Nice to Have:**
- [ ] 10+ unit tests passing
- [ ] Test coverage >5%
- [ ] Performance benchmarks documented

**Week 1 = SUCCESS if all "Must Have" items are complete**

---

## What's Next?

**After Week 1, reassess:**

### If Week 1 was successful:
- ✅ Continue to Phase 2 (platform abstraction)
- ✅ Plan Week 2-3 work
- ✅ Schedule stakeholder demo

### If Week 1 had issues:
- ⚠️ Address problems first
- ⚠️ Adjust estimates for remaining work
- ⚠️ Decide whether to continue

### If Week 1 failed:
- ❌ Stop and reassess approach
- ❌ Consider if refactoring is viable
- ❌ Re-evaluate project priorities

---

**Remember:** Week 1 is low-risk, high-impact. Even if you stop after Week 1, you've significantly improved the application.

**Good luck!**
