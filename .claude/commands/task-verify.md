---
description: Implement (frontend) or verify (backend) one TASKS.md item, then check it off with a dated evidence note
---

Run the `task-verify` skill on the TASKS.md item the user points at (or the most recently added open item if none is specified). Frontend lane: implement directly, then verify with `eslint`/`build`. Backend lane: never edit backend files — verify only, via real tests or requests. Only check `[x]` and append a dated `✅ Tekshirildi:` note after real verification passes; otherwise leave it open and say what's missing. $ARGUMENTS
