# Claude Code Hooks Reference

## 개요

Claude Code의 Hooks는 사용자 정의 셸 명령, HTTP 엔드포인트, 또는 LLM 프롬프트로 Claude Code 생명주기의 특정 지점에서 자동으로 실행됩니다.

## Hook Lifecycle

| Event | 발생 시점 |
|-------|----------|
| `SessionStart` | 세션이 시작되거나 재개될 때 |
| `UserPromptSubmit` | 사용자가 프롬프트를 제출할 때, Claude가 처리하기 전 |
| `PreToolUse` | 툴 호출이 실행되기 전 (차단 가능) |
| `PermissionRequest` | 권한 대화상자가 나타날 때 |
| `PostToolUse` | 툴 호출이 성공한 후 |
| `PostToolUseFailure` | 툴 호출이 실패한 후 |
| `Notification` | Claude Code가 알림을 보낼 때 |
| `SubagentStart` | 서브에이전트가 생성될 때 |
| `SubagentStop` | 서브에이전트가 완료될 때 |
| `Stop` | Claude가 응답을 마칠 때 |
| `TeammateIdle` | 에이전트 팀 팀메이트가 유휴 상태가 되려 할 때 |
| `TaskCompleted` | 작업이 완료로 표시될 때 |
| `InstructionsLoaded` | CLAUDE.md 또는 `.claude/rules/*.md` 파일이 로드될 때 |
| `ConfigChange` | 구성 파일이 세션 도중 변경될 때 |
| `WorktreeCreate` | worktree가 생성될 때 |
| `WorktreeRemove` | worktree가 제거될 때 |
| `PreCompact` | 컨텍스트 압축 전 |
| `SessionEnd` | 세션이 종료될 때 |

## Hook 타입

### 1. Command Hooks (`type: "command"`)
셸 명령을 실행합니다. stdin으로 JSON 입력을 받고 exit codes와 stdout을 통해 결과를 전달합니다.

### 2. HTTP Hooks (`type: "http"`)
이벤트 JSON 입력을 HTTP POST 요청으로 URL에 전송합니다. 응답 본문은 command hooks와 동일한 JSON 출력 형식을 사용합니다.

### 3. Prompt Hooks (`type: "prompt"`)
단일 턴 평가를 위해 Claude 모델에 프롬프트를 보냅니다. 모델이 yes/no 결정을 JSON으로 반환합니다.

### 4. Agent Hooks (`type: "agent"`)
조건을 확인하기 위해 툴을 사용할 수 있는 서브에이전트를 생성합니다.

## Hook 타입 지원 이벤트

### 모든 4가지 타입 지원
- `PermissionRequest`
- `PostToolUse`
- `PostToolUseFailure`
- `PreToolUse`
- `Stop`
- `SubagentStop`
- `TaskCompleted`
- `UserPromptSubmit`

### Command만 지원
- `ConfigChange`
- `InstructionsLoaded`
- `Notification`
- `PreCompact`
- `SessionEnd`
- `SessionStart`
- `SubagentStart`
- `TeammateIdle`
- `WorktreeCreate`
- `WorktreeRemove`

## 설정 위치

| 위치 | 범위 | 공유 가능 |
|------|------|-----------|
| `~/.claude/settings.json` | 모든 프로젝트 | 아니오 |
| `.claude/settings.json` | 단일 프로젝트 | 예 |
| `.claude/settings.local.json` | 단일 프로젝트 | 아니오 |
| 관리형 정책 설정 | 조직 전체 | 예 |
| 플러그인 `hooks/hooks.json` | 플러그인 활성화 시 | 예 |
| 스킬/에이전트 프론트매터 | 컴포넌트 활성화 시 | 예 |

## Exit Code 의미

- **Exit 0**: 성공. stdout에서 JSON 출력 파싱
- **Exit 2**: 차단 오류. stderr가 Claude에 에러 메시지로 전달
- **기타**: 비차단 오류. stderr가 verbose 모드에서 표시

## JSON 출력 필드 (공통)

| 필드 | 기본값 | 설명 |
|------|--------|------|
| `continue` | `true` | `false`이면 훅 실행 후 Claude가 완전히 중지 |
| `stopReason` | 없음 | `continue`가 `false`일 때 사용자에게 표시할 메시지 |
| `suppressOutput` | `false` | `true`이면 stdout을 verbose 모드 출력에서 숨김 |
| `systemMessage` | 없음 | 사용자에게 표시할 경고 메시지 |

## 주요 Hook 이벤트 상세

### PreToolUse
툴 호출 전에 실행되며 툴 호출을 차단할 수 있습니다.

**결정 제어:**
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask",
    "permissionDecisionReason": "이유",
    "updatedInput": { "field_to_modify": "new value" },
    "additionalContext": "추가 컨텍스트"
  }
}
```

### UserPromptSubmit
사용자 프롬프트 처리 전에 실행됩니다.

**결정 제어:**
```json
{
  "decision": "block",
  "reason": "차단 사유",
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "추가 컨텍스트"
  }
}
```

### TaskCompleted
작업이 완료로 표시될 때 실행됩니다.

**입력 필드:**
- `task_id`: 작업 식별자
- `task_subject`: 작업 제목
- `task_description`: 상세 설명 (선택)
- `teammate_name`: 팀메이트 이름 (선택)
- `team_name`: 팀 이름 (선택)

### ConfigChange
구성 파일이 변경될 때 실행됩니다.

**Matcher 값:**
- `user_settings`: `~/.claude/settings.json` 변경
- `project_settings`: `.claude/settings.json` 변경
- `local_settings`: `.claude/settings.local.json` 변경
- `policy_settings`: 관리형 정책 설정 변경
- `skills`: `.claude/skills/` 스킬 파일 변경

### InstructionsLoaded
CLAUDE.md 또는 `.claude/rules/*.md` 파일이 로드될 때 실행됩니다.

**입력 필드:**
- `file_path`: 로드된 지침 파일의 절대 경로
- `memory_type`: 파일 범위 (`"User"`, `"Project"`, `"Local"`, `"Managed"`)
- `load_reason`: 로드 이유 (`"session_start"`, `"nested_traversal"`, `"path_glob_match"`, `"include"`)

### WorktreeCreate / WorktreeRemove
Git worktree 대신 다른 버전 관리 시스템을 사용할 수 있습니다.

## Prompt Hooks

LLM을 사용하여 작업을 허용/차단할지 평가합니다.

**설정:**
```json
{
  "type": "prompt",
  "prompt": "평가 프롬프트 $ARGUMENTS",
  "model": "선택적 모델",
  "timeout": 30
}
```

**응답 스키마:**
```json
{
  "ok": true | false,
  "reason": "결정에 대한 설명"
}
```

## Agent Hooks

다중 턴 툴 액세스가 가능한 서브에이전트를 생성합니다.

**설정:**
```json
{
  "type": "agent",
  "prompt": "검증할 작업 설명 $ARGUMENTS",
  "model": "선택적 모델",
  "timeout": 60
}
```

## Async Hooks

`"async": true`로 설정하여 백그라운드에서 훅을 실행합니다. Claude는 훅이 완료될 때까지 기다리지 않습니다.

**제한사항:**
- `type: "command"` 훅만 지원
- 툴 호출을 차단하거나 결정을 반환할 수 없음
- 출력은 다음 대화 턴에 전달됨

## MCP 도구 매칭

MCP 서버 도구는 `mcp__<server>__<tool>` 형식으로 표시됩니다.

예시:
- `mcp__memory__create_entities`
- `mcp__filesystem__read_file`
- `mcp__github__search_repositories`

정규식 패턴으로 매칭:
- `mcp__memory__.*`: memory 서버의 모든 도구
- `mcp__.*__write.*`: 모든 서버의 write 포함 도구

## 환경 변수

훅에서 사용 가능한 환경 변수:
- `$CLAUDE_PROJECT_DIR`: 프로젝트 루트
- `${CLAUDE_PLUGIN_ROOT}`: 플러그인 루트
- `$CLAUDE_ENV_FILE`: 세션 지속 환경 변수 파일 경로 (SessionStart만)
- `$CLAUDE_CODE_REMOTE`: 원격 웹 환경에서 `"true"`로 설정

## 보안 고려사항

- 입력을 검증하고 정제하십시오
- 항상 셸 변수를 인용하십시오 (`"$VAR"`)
- 경로 순회를 차단하십시오 (`..` 확인)
- 절대 경로를 사용하십시오
- 민감 파일을 건너뛰십시오 (`.env`, `.git/`)

---

*이 문서는 https://code.claude.com/docs/en/hooks 의 내용을 요약한 것입니다.*
