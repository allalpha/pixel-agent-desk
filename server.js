const http = require('http');

let mainWindow = null;
let serverPort = 3456;
let agentStates = {
  session_id: null,
  hook_event_name: 'Waiting',
  message: '대기 중',
  timestamp: Date.now()
};
let httpServer = null;

// 포트 할당 (동적 포트 지원)
function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = http.createServer();

    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });

    server.on('error', () => {
      // 포트가 사용 중이면 다음 포트 시도
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

// 상태 매핑 (Hook 이벤트 → 상태)
function mapState(hookEventName) {
  const stateMap = {
    'SessionStart': 'Working',
    'UserPromptSubmit': 'Working',
    'PreToolUse': 'Working',
    'PostToolUse': 'Working',
    'SubagentStart': 'Working',
    'SubagentStop': 'Working',
    'Stop': 'Done',
    'TaskCompleted': 'Done',
    'PostToolUseFailure': 'Error',
    'Notification': 'Alert',
    'PermissionRequest': 'Alert',
    'SessionEnd': 'Waiting'
  };

  return stateMap[hookEventName] || 'Waiting';
}

// 메시지 매핑
function mapMessage(hookEventName) {
  const messageMap = {
    'SessionStart': '작업 시작',
    'UserPromptSubmit': '작업 중...',
    'PreToolUse': '작업 실행 중',
    'PostToolUse': '작업 중...',
    'SubagentStart': '하위 작업 시작',
    'SubagentStop': '하위 작업 완료',
    'Stop': '완료!',
    'TaskCompleted': '완료!',
    'PostToolUseFailure': '오류 발생',
    'Notification': '알림',
    'PermissionRequest': '권한 필요',
    'SessionEnd': '대기 중'
  };

  return messageMap[hookEventName] || '대기 중';
}

// HTTP 서버 생성
async function createHttpServer() {
  // 사용 가능한 포트 찾기
  serverPort = await findAvailablePort(3456);

  httpServer = http.createServer((req, res) => {
    // CORS 헤더
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // URL 라우팅
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'POST' && url.pathname === '/agent/status') {
      // 상태 업데이트 수신
      let body = '';

      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const newState = mapState(data.hook_event_name);

          agentStates = {
            session_id: data.session_id || agentStates.session_id,
            hook_event_name: data.hook_event_name,
            state: newState,
            message: mapMessage(data.hook_event_name),
            timestamp: Date.now()
          };

          console.log(`[상태 변경] ${agentStates.state} - ${agentStates.message}`);

          // Renderer 프로세스로 상태 전송
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('agent-state-update', agentStates);
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, state: agentStates }));
        } catch (error) {
          console.error('상태 업데이트 오류:', error);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });

    } else if (req.method === 'GET' && url.pathname === '/agent/states') {
      // 현재 상태 조회
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(agentStates));

    } else if (req.method === 'GET' && url.pathname === '/health') {
      // 서버 상태 확인
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', port: serverPort }));

    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  // 서버 시작
  return new Promise((resolve, reject) => {
    httpServer.listen(serverPort, () => {
      console.log(`HTTP Server listening on port ${serverPort}`);
      resolve(httpServer);
    });

    httpServer.on('error', (error) => {
      console.error('HTTP Server error:', error);
      reject(error);
    });
  });
}

// 메인 윈도우 설정
function setMainWindow(window) {
  mainWindow = window;
}

// 현재 상태 조회
function getAgentStates() {
  return agentStates;
}

// 서버 포트 조회
function getServerPort() {
  return serverPort;
}

module.exports = {
  createHttpServer,
  setMainWindow,
  getAgentStates,
  getServerPort
};