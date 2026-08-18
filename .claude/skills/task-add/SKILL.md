---
name: task-add
description: Add one or more new checklist items to TASKS.md in this repo's existing hand-written style (bold title, Uzbek description, nested sub-items) under the right BOSQICH section, after user confirmation. Trigger when the user says "yangi vazifa qo'sh", "TASKS.md ga yozib qo'y", "buni ham qo'shib qo'y", starts describing new work to track, or asks to plan/log a new feature or fix. Never invents scope — only records what the user actually describes. Does not implement anything itself.
---

# Skill: Task Add

**Trigger:** User describes new work to do and wants it tracked, or explicitly says "TASKS.md ga qo'sh" / "yangi band qo'sh".

**Purpose:** Append new checklist item(s) to `TASKS.md` that read exactly like the rest of the file — so the file stays one consistent hand-written journal, not a mix of styles.

`TASKS.md` is the single source of truth for progress on this project (both the frontend repo and the related backend repo). It is precious, hand-maintained history — never restructure or rewrite existing entries, only append.

---

## Steps

### Step 1 — Read the current file

Read `TASKS.md` in full (or at minimum: the `##` section headers, and the last ~100 lines) to see:
- the existing `N-BOSQICH — <name>` sections and their topic
- whether the target feature already has a `### Backend` / `### Frontend` subsection to append under
- the exact voice/format used: `- [ ] **Short bold title** — description in Uzbek.` with nested `  - [ ]` sub-items when the work has multiple discrete pieces
- the very last line of the file — the "Ishlash tartibi" note. Do not remove or contradict it.

### Step 2 — Decide where it belongs

- If the new work extends a feature already covered by an existing `BOSQICH`, append under that section (in the matching `### Backend` / `### Frontend` subsection if the section has that split — see e.g. `9-BOSQICH`).
- If it's a genuinely new feature area, propose a new `## N-BOSQICH — <short name>` (next sequential number) with a one-line rationale.
- If it's a small bug fix unrelated to a feature section, prefer appending to a dated "topilgan va tuzatilgan bug" block if one exists for that portal/app, or create a small new one (see the `Admin panel — 2026-08-02'da topilgan...` section as the pattern).

### Step 3 — Determine which lane it is (this changes who implements it later, not how it's written now)

- **Backend** (Django/DRF, separate repo) — the user writes this themselves.
- **Frontend** (`patient-portal`, `doctor-portal`, admin panel `src/`, this repo) — implemented directly in a later `task-verify` pass.

If it's ambiguous, ask.

### Step 4 — Draft the entry

Write in Uzbek, matching tone exactly:

```
- [ ] **<Qisqa qalin nom>** — <nima qilinishi kerakligi, aniq va qisqa tavsif>.
  - [ ] <agar kerak bo'lsa, alohida tekshiriladigan qism>
  - [ ] <yana bir qism>
```

Rules:
- No invented acceptance criteria beyond what the user described. If scope is vague, ask one focused question rather than guessing.
- No `✅ Tekshirildi` note yet — that's only added by `task-verify` after real verification.
- Keep it a `[ ]` (unchecked) item.
- If the user gave enough detail for multiple independent pieces, split into nested sub-checkboxes (matches the file's existing pattern, e.g. the SMS OTP or Payouts entries).

### Step 5 — Confirm before writing

Show the drafted markdown block and which section it will go under. Ask the user to confirm or edit — do not write to `TASKS.md` silently. This file has no automatic regenerator; a bad edit is a manual fix.

### Step 6 — Write

After confirmation, insert the block in the right place with `Edit`, preserving surrounding blank lines and `---` separators exactly as they already appear.

---

## What this skill does NOT do

- Does not implement the feature.
- Does not mark anything `[x]` or add `✅ Tekshirildi`.
- Does not touch backend repo files.
- Does not regenerate or reformat unrelated parts of `TASKS.md`.

---

## Output

One or more new `- [ ]` entries appended to the correct section of `TASKS.md`, in the file's existing voice, after user confirmation.
