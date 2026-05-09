---
marp: true
theme: tech
paginate: true
header: "Opencode vs Claude Code"
footer: "2026 — Developer Tools Showdown"
---

<!-- _class: title-academic -->
<!-- _paginate: skip -->
<!-- _header: "" -->
<!-- _footer: "" -->

# Why Opencode is Better Than Claude Code

## A Developer's Honest Comparison

---

<!-- _class: invert -->

## The AI Coding Assistant Landscape

The market has exploded. Every team is picking a tool — and the choice matters.

| Tool | Maker | Model | Open Source |
|------|-------|-------|-------------|
| **Claude Code** | Anthropic | Claude only | ✗ No |
| **Opencode** | Community | Any LLM | ✓ Yes |
| GitHub Copilot | Microsoft | GPT-4o | ✗ No |
| Cursor | Anysphere | Various | ✗ No |

> Does closed & curated — or open & flexible — win?

---

## What Is Opencode?

![bg right:38%](https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80)

A **terminal-native, open-source AI coding agent** that runs in your shell.

- Written in Go — fast, single binary, no runtime deps
- Beautiful TUI built on Bubble Tea
- Plugs into **any LLM provider** via a unified interface
- Full MCP (Model Context Protocol) support
- Apache 2.0 licensed — fork it, own it, ship it

```bash
brew install sst/tap/opencode
opencode
```

---

<!-- _class: chapter -->
<!-- _paginate: skip -->

# Five Reasons Opencode Wins

---

## 1. Model Freedom — No Lock-In

Claude Code forces you onto **one model, one provider, one price point.**

Opencode connects to anything:

```toml
providers:
  - anthropic    # Claude Sonnet, Opus
  - openai       # GPT-4o, o1, o3
  - google       # Gemini 2.0 Flash, Pro
  - groq         # Llama 3.3 70B at 500 tok/s
  - ollama       # Fully local, zero API cost
  - bedrock      # AWS enterprise accounts
```

**Switch models mid-session.** Cheap model for boilerplate, powerful model for architecture.

---

## 2. Cost — Orders of Magnitude Cheaper

Claude Code: **$100–200/month** for heavy use. Opus burns tokens fast.

| Scenario | Claude Code | Opencode |
|----------|-------------|----------|
| Local exploration | $0.003/req | **$0.00** (Ollama) |
| Quick edits | Sonnet rate | Gemini Flash: 10× cheaper |
| Deep refactors | Opus rate | Route to o1 only when needed |
| Team of 10 devs | ~$1,500/mo | ~$150/mo |

**Build your own model routing strategy.** Opencode doesn't decide for you.

---

## 3. Privacy — The Data Flow Problem

With Claude Code, **everything goes through Anthropic's infrastructure.**

```
Your code → Anthropic API → Model → Response
            ^^^^^^^^^^^^
            Logged. Potentially used for training.
```

Every file you open. Every prompt you type. Every refactor you request.

For teams with sensitive codebases, this is a **non-starter.**

---

## 3. Privacy — The Local Solution

With Opencode + Ollama, your code never leaves the machine.

```
Your code → Local model → Response
            ^^^^^^^^^^^
            Air-gapped. Zero external calls.
```

**Use cases that demand this:**
- Financial systems, healthcare, legal code
- Pre-IPO startups protecting trade secrets
- Government / defense contractors
- Any codebase under NDA or compliance review

---

## 4. Open Source — Full Auditability

Claude Code is a **black box.** You use it as-is, trusting the internals.

With Opencode, the entire agent loop is readable:

```
github.com/sst/opencode
├── agent/        ← planning, tool dispatch, memory
├── provider/     ← LLM adapters (add your own)
├── tools/        ← every tool implementation
├── tui/          ← terminal UI
└── mcp/          ← Model Context Protocol client
```

Know exactly what system prompt is sent. Audit every tool call.

---

## 4. Open Source — Full Extensibility

Because you own the code, you can change the code.

- **Add internal tools** — wire in your company's APIs, wikis, DBs
- **Fix bugs yourself** — don't wait for Anthropic's release cycle
- **Override any prompt** — tune the agent behavior for your team
- **Self-host entirely** — air-gapped environments, no internet required

> Opencode is a platform. Claude Code is a product.

---

## 5. Community Velocity

Claude Code ships when Anthropic decides.

```
Claude Code:   Nov 2024 ──── Mar 2025 ──── Jun 2025  (quarterly)

Opencode:      ████████████████████████████████████  (daily)
               Last 30 days: 47 commits · 12 contributors · 8 features
```

Open source compounds. Every contributor improves the tool for everyone.

Anthropic has commercial incentives that don't always align with power users.

---

## 5. Community — What That Looks Like in Practice

- **Bug filed → fix merged in hours**, not months
- Feature requests discussed **openly on GitHub** — vote, comment, fork
- Prompt engineering improvements shared freely across the community
- Plugin ecosystem grows without a gatekeeper

> The best developer tools are built by developers, for developers —  
> not by product teams optimizing for retention metrics.

---

## Head-to-Head: Developer Experience

|  | Claude Code | Opencode |
|--|-------------|----------|
| **Setup** | `npm i -g @anthropic-ai/claude-code` | `brew install sst/tap/opencode` |
| **UI** | Terminal text | Rich TUI with panels |
| **Switch models** | Restart session | `Ctrl+M` mid-session |
| **Offline use** | ✗ | ✓ via Ollama |
| **Custom tools** | Via MCP only | Native + MCP |
| **Source available** | ✗ | ✓ Apache 2.0 |
| **Token counter** | Limited | Real-time, per-model |

---

<!-- _class: invert -->

## When Claude Code Still Makes Sense

There are legitimate reasons to stay.

- Your team has **zero ops appetite** — you want SaaS that just works
- You're deeply integrated with the **Anthropic ecosystem**
- You need **enterprise SLAs** and dedicated support contracts
- You're on a **Claude Max plan** and cost is already absorbed

Convenience is a valid reason to choose a tool.  
Just be honest that it's the **only** reason.

---

<!-- _class: invert -->

## The Trade-offs You're Accepting

When you choose Claude Code, you're also choosing:

- To bet your workflow on **one company's roadmap**
- To absorb any **price increase** with no alternative
- To never see the **system prompt** driving the agent
- To operate in a **walled garden** — no forks, no plugins, no escape hatch

> Lock-in is invisible until the day it isn't.

---

## The Migration Path

Moving from Claude Code to Opencode takes **under 15 minutes.**

```bash
# 1. Install
brew install sst/tap/opencode

# 2. Your existing key works immediately
export ANTHROPIC_API_KEY="sk-ant-..."

# 3. Run — same models, same MCP servers, same CLAUDE.md
opencode
```

Your existing project instructions are respected.  
Your MCP servers keep working.  
**You keep your workflow. You gain the flexibility.**

---

<!-- _class: end -->
<!-- _paginate: skip -->
<!-- _header: "" -->
<!-- _footer: "" -->

# The Bottom Line

Open source wins in the long run.  
Model flexibility wins on cost.  
Privacy wins on compliance.

## `github.com/sst/opencode`
