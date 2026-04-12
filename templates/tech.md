---
marp: true
theme: tech
paginate: true
header: "project-name v1.0"
footer: "© 2026"
---

<!-- _class: lead -->
<!-- _paginate: skip -->

# System Title

## A brief technical description of what this is

---

<!-- _class: invert -->

## Architecture Overview

![bg right:45%](../assets/placeholder.png)

**Core components:**

- **Service A** — responsibility
- **Service B** — responsibility  
- **Service C** — responsibility

> Built on: Node.js · PostgreSQL · Redis

---

## Code Example

```javascript
async function processData(input) {
  const validated = await validate(input)
  const result = await transform(validated)
  return result
}
```

Key points about the implementation above.

---

## Performance Benchmarks

| Operation | p50 | p95 | p99 |
|-----------|-----|-----|-----|
| Read | 2ms | 8ms | 15ms |
| Write | 5ms | 18ms | 32ms |
| Batch | 12ms | 45ms | 80ms |

All numbers measured under 10k req/s sustained load.

---

## Technical Deep Dive

**The problem:**
Brief description of the challenge being solved.

**The solution:**
- Approach taken and why
- Key trade-offs considered
- What was ruled out and why

---

<!-- _class: lead invert -->
<!-- _paginate: skip -->

# Demo

---

## Roadmap

```
Q1 ████████░░ Core infrastructure
Q2 ████░░░░░░ API layer + auth  
Q3 ░░░░░░░░░░ Client libraries
Q4 ░░░░░░░░░░ GA release
```

- `v0.1.0` — Internal alpha (done)
- `v0.2.0` — Beta release (in progress)
- `v1.0.0` — General availability (Q4)

---

<!-- _class: lead -->
<!-- _paginate: skip -->

# Questions?

## github.com/org/repo · docs.example.com
