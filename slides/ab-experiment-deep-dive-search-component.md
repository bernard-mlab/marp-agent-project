---
marp: true
theme: custom-pandora
paginate: true
header: "Search AB Experiment"
footer: "© 2025 Delivery Hero SE | This document is strictly confidential and may not be copied, used, made available or be disclosed to third parties without prior written permission."
---

<!-- _class: lead -->
<!-- _paginate: skip -->

# AB Experiment Deep Dive
## Search Component

---

## Agenda

- Background & motivation
- Hypothesis & experiment design
- Metrics & success criteria
- Results & statistical analysis
- Key findings
- Decision & next steps

---

## Background & Problem Statement

- Search click-through rate (CTR) has plateaued at **38%** over the last 3 quarters
- User research revealed friction in result ranking and snippet relevance
- Opportunity: redesign ranking signals and result card layout to surface more relevant results

---

## Hypothesis

> We believe that improving result ranking using personalised signals and updating the result card layout to show richer snippets will increase search CTR and session depth.

- Primary assumption: users abandon search because top results lack relevance context

---

## Experiment Design

| | Control (A) | Treatment (B) |
|---|---|---|
| Ranking | Existing algorithm | Personalised signals |
| Card layout | Standard | Rich snippets |
| Traffic split | 50% | 50% |
| Audience | New users only | New users only |

- Duration: 3 weeks · MDE: 2%

---

## Metrics & Success Criteria

**Primary**
- Search CTR — target **+3%**

**Secondary**
- Session depth, time-on-site post-search

**Guardrails**
- Page load time: <200ms regression threshold
- Search abandonment rate: no degradation

---

## Results Overview

- Experiment ran: **2026-03-01 → 2026-03-22**
- 142,000 users per variant · 95% confidence level
- No SRM (Sample Ratio Mismatch) detected
- All guardrail metrics within acceptable thresholds

---

## Statistical Analysis

| Metric | Lift | p-value | Confidence Interval |
|--------|------|---------|---------------------|
| Search CTR | **+5.2%** | < 0.01 | +3.8% to +6.6% |
| Session depth | **+1.4 pages** | < 0.05 | — |
| Time-on-site | **+42s** | < 0.05 | — |
| Page load time | +14ms | — | Within guardrail |

---

## Key Findings — Primary Metrics

- Search CTR improved **significantly above** the +3% target
- Lift by device:
  - Mobile: **+6.1%** (strongest)
  - Desktop: **+4.3%**
  - Tablet: **+3.9%**
- Rich snippets drove the majority of incremental clicks

---

## Key Findings — Secondary & Guardrail Metrics

- No statistically significant degradation in abandonment rate
- Page load time delta (+14ms) within acceptable threshold
- Session depth gains most pronounced for **logged-in users**
- No negative impact on downstream conversion funnel

---

## Decision & Next Steps

**Decision: Ship to 100%**

- Gradual rollout: 10% → 25% → 50% → 100% over 2 weeks
- Real-time monitoring: CTR, load time, error rate dashboard
- Follow-on experiment: deeper personalisation signals (v2)

---

<!-- _class: lead -->
<!-- _paginate: skip -->

# Thank You

#### Questions?
