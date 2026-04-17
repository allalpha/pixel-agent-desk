# Claude Code Tool & Plugin Inventory — April 17, 2026

## Summary

| Category | Count | Details |
|----------|-------|---------|
| **MCP Servers** | 4 | claude-flow, Playwright, Gmail, IDE |
| **MCP Tools** | 314+ | Across all 4 servers |
| **Global Agents** | 31 | GSD specialized agents |
| **Global Skills** | 73 | GSD workflow skills |
| **Global Hooks** | 10 | GSD automation hooks |
| **Project Agents** | 3 | Fullstack, Electron Pro, Security Auditor |
| **Project Commands** | 1 | generate-tests |
| **Claude Plugin** | 1 | frontend-design (official) |
| **Installed Repos** | 5 | Vibe Kanban, GSD, CCT, Pixel Agent Desk, claude-dashboard |
| **WSL Tools** | 2 | Hermes Agent, claude-dashboard |
| **Hook Events** | 17 | Session, Tool, Agent, Config, Worktree lifecycle |

---

## 1. MCP Servers (4)

### 1a. RuFlo / claude-flow (314+ tools)
**Config:** `C:\Users\ganes\Projects\Clients\.mcp.json`
**Start:** Auto-starts with Claude Code session
**Mode:** V3, hierarchical-mesh topology, 15 max agents, hybrid memory

| Subsystem | Key Tools | What They Do |
|-----------|-----------|-------------|
| **Memory** | `memory_store`, `memory_search`, `memory_search_unified`, `memory_list`, `memory_delete`, `memory_import_claude`, `memory_bridge_status` | Store/search with ONNX 384-dim vector embeddings, HNSW index, sql.js |
| **Swarm** | `swarm_init`, `swarm_status`, `swarm_health`, `swarm_shutdown` | Multi-agent coordination (hierarchical, mesh, ring, star) |
| **Agents** | `agent_spawn`, `agent_list`, `agent_status`, `agent_health`, `agent_terminate`, `agent_update`, `agent_pool` | Agent lifecycle management |
| **Hive-Mind** | `hive-mind_init`, `hive-mind_spawn`, `hive-mind_consensus`, `hive-mind_broadcast`, `hive-mind_memory`, `hive-mind_status` | Byzantine/Raft consensus, queen-led coordination |
| **Hooks** | `hooks_route`, `hooks_session-start`, `hooks_post-task`, `hooks_pre-edit`, `hooks_intelligence`, `hooks_worker-list`, `hooks_worker-dispatch` | Task routing, learning, 12 background workers |
| **Workers** | ultralearn, optimize, consolidate, predict, audit, map, preload, deepdive, document, refactor, benchmark, testgaps | Background analysis workers |
| **Security** | `aidefence_scan`, `aidefence_is_safe`, `aidefence_has_pii`, `aidefence_analyze`, `aidefence_learn` | Prompt injection detection, PII scanning |
| **Intelligence** | `hooks_intelligence_pattern-search`, `hooks_intelligence_pattern-store`, `hooks_intelligence_attention`, `hooks_intelligence_trajectory-*`, `hooks_intelligence_learn` | SONA learning, trajectory recording, EWC++ consolidation |
| **Embeddings** | `embeddings_generate`, `embeddings_search`, `embeddings_compare`, `embeddings_init`, `embeddings_hyperbolic` | ONNX MiniLM-L6-v2, Poincare ball, semantic search |
| **Neural** | `neural_train`, `neural_predict`, `neural_patterns`, `neural_optimize`, `neural_status` | Neural model lifecycle |
| **WASM** | `wasm_agent_create`, `wasm_agent_prompt`, `wasm_agent_tool`, `wasm_gallery_list` | Sandboxed WASM agents |
| **Terminal** | `terminal_create`, `terminal_execute`, `terminal_list`, `terminal_history` | Remote terminal management |
| **Claims** | `claims_claim`, `claims_release`, `claims_steal`, `claims_handoff`, `claims_rebalance` | Agent load balancing, work stealing |
| **Coordination** | `coordination_orchestrate`, `coordination_consensus`, `coordination_sync`, `coordination_topology`, `coordination_load_balance` | Raft/BFT/Quorum consensus |
| **DAA** | `daa_agent_create`, `daa_cognitive_pattern`, `daa_knowledge_share`, `daa_workflow_create`, `daa_workflow_execute` | Decentralized autonomous agents |
| **Transfer** | `transfer_detect-pii`, `transfer_store-search`, `transfer_plugin-search`, `transfer_ipfs-resolve` | PII detection, plugin store |
| **Performance** | `performance_benchmark`, `performance_bottleneck`, `performance_metrics`, `performance_profile`, `performance_report` | System profiling and optimization |
| **GitHub** | `github_repo_analyze`, `github_pr_manage`, `github_issue_track`, `github_metrics`, `github_workflow` | GitHub integration |
| **Workflow** | `workflow_create`, `workflow_execute`, `workflow_status`, `workflow_pause`, `workflow_resume`, `workflow_template`, `workflow_run` | Event-driven workflow automation |
| **Task** | `task_create`, `task_update`, `task_complete`, `task_cancel`, `task_list`, `task_assign` | Task management |
| **Session** | `session_save`, `session_restore`, `session_list`, `session_info`, `session_delete` | Session state persistence |
| **Config** | `config_get`, `config_set`, `config_list`, `config_export`, `config_import` | Configuration management |
| **System** | `system_health`, `system_info`, `system_metrics`, `system_status`, `system_reset` | System diagnostics |
| **Browser** | `browser_open`, `browser_click`, `browser_fill`, `browser_snapshot`, `browser_screenshot`, `browser_eval` | Built-in browser automation |
| **Progress** | `progress_check`, `progress_summary`, `progress_sync`, `progress_watch` | V3 implementation tracking |
| **RuVLLM** | `ruvllm_hnsw_*`, `ruvllm_microlora_*`, `ruvllm_sona_*`, `ruvllm_chat_format`, `ruvllm_generate_config` | WASM LLM, HNSW routing, MicroLoRA, SONA |
| **AgentDB** | `agentdb_*` | Hierarchical memory, causal graph, pattern search, semantic routing, session replay |

**Quick usage:**
```
# Store a memory
memory_store --key "my-pattern" --value "JWT with refresh tokens" --namespace patterns

# Search memories semantically
memory_search --query "authentication patterns"

# Initialize a swarm
swarm_init --topology hierarchical --maxAgents 8

# Route a task to best agent
hooks_route --task "fix the login bug"
```

---

### 1b. Playwright MCP
**Source:** Anthropic-managed (built into Claude Code)
**Purpose:** Browser automation — navigate, click, type, screenshot, snapshot

| Tool | What It Does |
|------|-------------|
| `browser_navigate` | Go to URL |
| `browser_snapshot` | Get accessibility tree snapshot |
| `browser_click` | Click element by ref |
| `browser_type` | Type text into element |
| `browser_fill_form` | Fill multiple form fields |
| `browser_take_screenshot` | Capture screenshot |
| `browser_evaluate` | Run JavaScript on page |
| `browser_press_key` | Press keyboard key |
| `browser_select_option` | Select dropdown option |
| `browser_hover` | Hover over element |
| `browser_drag` | Drag and drop |
| `browser_file_upload` | Upload files |
| `browser_tabs` | Manage browser tabs |
| `browser_run_code` | Run Playwright code snippet |
| `browser_console_messages` | Get console output |
| `browser_network_requests` | Get network activity |
| `browser_wait_for` | Wait for element/text |
| `browser_resize` | Resize browser window |

**Quick usage:**
```
# Navigate and take snapshot
browser_navigate --url "https://example.com"
browser_snapshot

# Fill a form and submit
browser_fill_form --fields '[{"name":"email","ref":"@e1","type":"textbox","value":"test@test.com"}]'
browser_click --ref "@e5"
```

---

### 1c. Gmail MCP
**Source:** Anthropic-managed (claude-ai)
**Purpose:** Read, search, draft, and manage emails

| Tool | What It Does |
|------|-------------|
| `gmail_search_messages` | Search with Gmail query syntax |
| `gmail_read_message` | Read full email by ID |
| `gmail_read_thread` | Read full conversation |
| `gmail_create_draft` | Create draft email |
| `gmail_list_drafts` | List all drafts |
| `gmail_list_labels` | List all labels |
| `gmail_get_profile` | Get account info |

**Quick usage:**
```
# Search unread from boss
gmail_search_messages --q "is:unread from:boss@company.com"

# Create draft
gmail_create_draft --to "client@example.com" --subject "Proposal" --body "Hi..."

# Read a thread
gmail_read_thread --threadId "123abc"
```

---

### 1d. IDE MCP
**Source:** Anthropic-managed (claude-ai IDE extension)
**Purpose:** VS Code integration — diagnostics, notebook execution

| Tool | What It Does |
|------|-------------|
| `executeCode` | Run Python code in Jupyter kernel |
| `getDiagnostics` | Get VS Code language diagnostics |

**Quick usage:**
```
# Run Python snippet
executeCode --code "import pandas as pd; print(pd.__version__)"

# Check for errors in current file
getDiagnostics
```

---

## 2. Get Shit Done (GSD) — v1.36.0

**Repo:** https://github.com/gsd-build/get-shit-done
**Install:** `npx get-shit-done-cc@latest --claude --global`
**Location:** `~/.claude/skills/gsd-*` (skills), `~/.claude/agents/gsd-*` (agents), `~/.claude/hooks/gsd-*` (hooks)

### 6-Step Workflow

| Step | Command | What Happens |
|------|---------|-------------|
| 1 | `/gsd-new-project` | Interactive Q&A -> domain research -> requirements -> phased roadmap |
| 2 | `/gsd-discuss-phase N` | Capture implementation preferences, resolve gray areas before coding |
| 3 | `/gsd-plan-phase N` | Spawn research + planning agents -> atomic XML-structured task plans |
| 4 | `/gsd-execute-phase N` | Wave-based parallel execution, fresh 200K-token context per task, atomic git commits |
| 5 | `/gsd-verify-work N` | User acceptance testing with automated failure diagnosis |
| 6 | `/gsd-ship` -> `/gsd-complete-milestone` -> `/gsd-new-milestone` | PR creation, archival, next cycle |

### Key Shortcuts

| Command | When to Use |
|---------|------------|
| `/gsd-quick` | Ad-hoc task without full planning |
| `/gsd-next` | Auto-advance to next workflow step |
| `/gsd-do` | Execute a single task immediately |
| `/gsd-fast` | Accelerated execution mode |
| `/gsd-explore` | Explore codebase before starting |
| `/gsd-health` | Check GSD system health |
| `/gsd-progress` | View current project progress |
| `/gsd-stats` | Session statistics |
| `/gsd-help` | List all commands |

### 31 Global Agents

| Agent | Specialty |
|-------|----------|
| gsd-advisor-researcher | Research advisory |
| gsd-ai-researcher | AI/ML research |
| gsd-assumptions-analyzer | Validate assumptions |
| gsd-codebase-mapper | Map codebase structure |
| gsd-code-fixer | Fix code issues |
| gsd-code-reviewer | Code review |
| gsd-debugger | Debug issues |
| gsd-debug-session-manager | Debug session orchestration |
| gsd-doc-verifier | Documentation verification |
| gsd-doc-writer | Documentation writing |
| gsd-domain-researcher | Domain research |
| gsd-eval-auditor | Evaluation auditing |
| gsd-eval-planner | Evaluation planning |
| gsd-executor | Task execution |
| gsd-framework-selector | Framework selection |
| gsd-integration-checker | Integration testing |
| gsd-intel-updater | Intelligence updates |
| gsd-nyquist-auditor | Quality auditing |
| gsd-pattern-mapper | Pattern identification |
| gsd-phase-researcher | Phase-specific research |
| gsd-plan-checker | Plan validation |
| gsd-planner | Task planning |
| gsd-project-researcher | Project research |
| gsd-research-synthesizer | Research synthesis |
| gsd-roadmapper | Roadmap creation |
| gsd-security-auditor | Security auditing |
| gsd-ui-auditor | UI quality auditing |
| gsd-ui-checker | UI verification |
| gsd-ui-researcher | UI/UX research |
| gsd-user-profiler | User profiling |
| gsd-verifier | Work verification |

### 10 Global Hooks

| Hook | Purpose |
|------|---------|
| `gsd-check-update.js` | Check for GSD updates on session start |
| `gsd-context-monitor.js` | Monitor context window usage |
| `gsd-phase-boundary.sh` | Detect phase transitions |
| `gsd-prompt-guard.js` | Prompt injection detection |
| `gsd-read-guard.js` | Read-before-edit enforcement |
| `gsd-session-state.sh` | Session state persistence |
| `gsd-statusline.js` | Status line display |
| `gsd-validate-commit.sh` | Commit message validation |
| `gsd-workflow-guard.js` | Workflow boundary enforcement |

---

## 3. Vibe Kanban — v0.1.42

**Repo:** https://github.com/BloopAI/vibe-kanban
**Start:** `npx vibe-kanban`
**Stack:** Rust + TypeScript, 46.7MB binary

### Features

| Feature | What It Does |
|---------|-------------|
| Kanban Board | Create, prioritize, assign issues visually |
| Agent Workspaces | Each agent gets isolated branch + terminal + dev server |
| Diff Review | Inline code review with direct feedback to agents |
| Browser Preview | Built-in browser with devtools, inspect, device emulation |
| Multi-Agent | Switch between 10+ coding agents |
| PR Management | AI-generated descriptions, review, merge from UI |

### Supported Agents (10+)
Claude Code, Codex, Gemini CLI, GitHub Copilot, Amp, Cursor, OpenCode, Droid, CCR, Qwen Code

### Quick Usage
```bash
npx vibe-kanban              # Opens browser (auto-assigned port)
# Create issues on kanban board
# Assign to agent workspaces
# Review diffs inline
# Preview app in built-in browser
# Create and merge PRs
```

---

## 4. Claude Code Templates — v1.28.13

**Repo:** https://github.com/davila7/claude-code-templates
**CLI:** `npx claude-code-templates@latest`
**Web:** https://aitmpl.com

### 413 Available Agents (by category)

| Category | Count | Examples |
|----------|-------|---------|
| AI Specialists | 8 | LLM Architect, Prompt Engineer, Model Evaluator |
| API/GraphQL | 8 | API Architect, GraphQL Specialist, Shopify Expert |
| Blockchain/Web3 | 4 | Smart Contract Auditor, Web3 Integration |
| Business/Marketing | 20 | Product Manager, SEO Specialist, Legal Advisor |
| Data/AI | 38 | ML Engineer, Data Scientist, NLP Engineer, TDD |
| Database | 11 | Postgres Pro, Supabase Architect, Neon Expert |
| Deep Research | 16 | Research Coordinator, Fact-Checker, Data Analyst |
| Development Team | 16 | Fullstack Developer, Electron Pro, UI Designer |
| Development Tools | 32 | Code Reviewer, Debugger, Performance Profiler |
| DevOps/Infra | 40 | Cloud Architect, Kubernetes, Terraform, Azure |
| Documentation | 11 | Technical Writer, Diagram Architect, Changelog |
| Expert Advisors | 52 | Planner, Multi-Agent Coordinator, Mentor |
| MCP Dev Team | 8 | MCP Developer, MCP Security Auditor |
| Programming Languages | 48 | Python Pro, Rust Engineer, Go Expert, TypeScript Pro |
| Security | 20 | Penetration Tester, Compliance Auditor |
| UI Analysis | 5 | Screenshot Reviewer, Interaction Analyzer |
| Web Tools | 16 | Next.js Expert, React Optimizer, WordPress Master |
| + more | ~60 | Finance, Games, OCR, Podcast, FFmpeg |

### Installed for pixel-agent-desk

| Component | Type | Purpose |
|-----------|------|---------|
| `fullstack-developer` | Agent | Full-stack web development |
| `electron-pro` | Agent | Electron desktop app specialist |
| `security-auditor` | Agent | Security auditing |
| `generate-tests` | Command | Auto-generate test files |

### Quick Usage
```bash
npx claude-code-templates@latest                        # Interactive menu
npx claude-code-templates@latest --health-check          # System diagnostics
npx claude-code-templates@latest --analytics             # Analytics dashboard (localhost:3333)
npx claude-code-templates@latest --chats                 # Mobile chat viewer
npx claude-code-templates@latest --plugins               # Plugin marketplace

# Install specific templates
npx claude-code-templates@latest --agent development-team/fullstack-developer --yes
npx claude-code-templates@latest --command testing/generate-tests --yes
npx claude-code-templates@latest --mcp development/github-integration --yes
```

---

## 5. Pixel Agent Desk — v2.0.0

**Repo:** https://github.com/Mgpixelart/pixel-agent-desk
**Location:** `C:\Users\ganes\Projects\Clients\pixel-agent-desk\`
**Start:** `npm start` (Windows only)
**Dashboard:** `http://localhost:3000`
**Hooks port:** `47821` (auto-registered in `~/.claude/settings.json`)

### Features

| Feature | What It Shows |
|---------|-------------|
| Pixel Avatars | Visual agents as pixel-art characters in office scene |
| Agent Grid | Real-time status of all Claude Code sessions |
| Token Analytics | Token usage per session |
| Activity Heatmap | Coding activity visualization over time |
| Session Scanner | Auto-discovers active Claude Code sessions |
| Hook Server | Receives real-time events from Claude Code hooks |

### Architecture
- **Electron** main process with agent manager, session scanner, heatmap scanner
- **Dashboard server** on port 3000 (accessible from any browser)
- **Hook server** on port 47821 (receives Claude Code lifecycle events)
- **Liveness checker** for zombie session detection

### Quick Usage
```powershell
cd C:\Users\ganes\Projects\Clients\pixel-agent-desk
npm start          # Opens desktop app + web dashboard
# Dashboard: http://localhost:3000
```

---

## 6. Claude Dashboard (WSL) — v0.13.1

**Repo:** https://github.com/seunggabi/claude-dashboard
**Location:** WSL `~/.local/bin/claude-dashboard`
**Start:** `claude-dashboard` (in WSL with PATH set)

### Quick Usage
```bash
# In WSL terminal
export PATH="$HOME/.local/bin:$PATH"
claude-dashboard    # TUI session manager
```

---

## 7. Hermes Agent (WSL) — v0.9.0

**Repo:** Nous Research Hermes Agent
**Location:** WSL `~/.hermes/`
**Telegram:** @allalpha_hermes_bot
**Gateway:** tmux session `hermes`

### Quick Usage
```bash
# In WSL
tmux attach -t hermes          # Attach to running gateway
hermes gateway status          # Check status
hermes chat -q "Hello"        # Direct chat
```

---

## 8. Frontend Design Plugin (Official)

**Marketplace:** claude-plugins-official
**ID:** `frontend-design@claude-plugins-official`
**Installed:** April 13, 2026
**Scope:** User-level

Provides UI/UX design assistance capabilities within Claude Code.

---

## 9. Hook Events (17 events registered)

| Event | Handlers | Source |
|-------|----------|--------|
| SessionStart | 3 | Pixel Agent Desk (47821), GSD update check, GSD session state |
| SessionEnd | 1 | Pixel Agent Desk |
| UserPromptSubmit | 1 | Pixel Agent Desk |
| PreToolUse | 5 | GSD read-guard + Claude Code built-in |
| PostToolUse | 3 | GSD + Pixel Agent Desk |
| PostToolUseFailure | 1 | Built-in |
| Stop | 1 | Built-in |
| TaskCompleted | 1 | Built-in |
| PermissionRequest | 1 | Built-in |
| Notification | 1 | Built-in |
| SubagentStart | 1 | Built-in |
| SubagentStop | 1 | Built-in |
| TeammateIdle | 1 | Built-in |
| ConfigChange | 1 | Built-in |
| WorktreeCreate | 1 | Built-in |
| WorktreeRemove | 1 | Built-in |
| PreCompact | 1 | Pixel Agent Desk |

---

## Quick Reference: Which Tool for What

| Task | Use This |
|------|----------|
| Plan a new project from scratch | `/gsd-new-project` (GSD) |
| Quick ad-hoc coding task | `/gsd-quick` or `/gsd-do` |
| Browse/install agent templates | `npx claude-code-templates@latest` |
| Visual kanban for multi-agent work | `npx vibe-kanban` |
| Monitor Claude Code sessions | Pixel Agent Desk (`npm start`) or `claude-dashboard` (WSL) |
| Store/search memories | `memory_store` / `memory_search` (claude-flow) |
| Spawn multi-agent swarm | `swarm_init` + `agent_spawn` (claude-flow) |
| Browser automation/testing | Playwright MCP tools |
| Email management | Gmail MCP tools |
| Run Python in Jupyter | `executeCode` (IDE MCP) |
| Check system health | `system_health` / `npx claude-code-templates@latest --health-check` |
| Chat with Hermes via Telegram | @allalpha_hermes_bot |
| Security scan input | `aidefence_scan` (claude-flow) |
| Route task to best agent | `hooks_route` (claude-flow) |
| Generate tests for code | `/generate-tests` (CCT command) |

---

*Generated: April 17, 2026 | Session: 7a87253b-5216-4d87-b356-416fb9bb8d55*