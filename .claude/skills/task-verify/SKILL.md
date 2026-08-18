---
name: task-verify
description: Close out one unchecked TASKS.md item — for frontend items (patient-portal, doctor-portal, admin panel src/) implement it directly then verify with lint/build; for backend items the user already wrote, verify with real tests/requests only, never edit backend files. Only checks the item off and appends a dated evidence-based "Tekshirildi" note after real verification actually passed — never rubber-stamps. Trigger when the user says "tekshirib ber", "tayyor bo'ldi", "shu bandni yop", "checkoff qil", points at a TASKS.md item, or asks to verify/close out a task.
---

# Skill: Task Verify

**Trigger:** User points at (or describes) an unchecked `TASKS.md` item and wants it implemented and/or verified and checked off. Also triggers when the user says they already wrote backend code for an item and want it confirmed.

**Purpose:** Do exactly what the "Ishlash tartibi" note at the bottom of `TASKS.md` describes — implement frontend directly, verify backend the user wrote — then close the loop the same way every existing entry in the file was closed: real verification evidence, not a checkbox flip.

---

## Step 1 — Identify the item and which lane it's in

Read the exact `- [ ]` item text (and its sub-items) from `TASKS.md`. Determine the lane:

- **Frontend lane** — files under `patient-portal/`, `doctor-portal/`, or the admin panel `src/` in this repo.
- **Backend lane** — Django/DRF code in the separate backend repo (see project memory for its path if needed).

If genuinely ambiguous, ask.

---

## Step 2A — Frontend lane

1. Read neighboring files in the same portal to match existing conventions (component structure, i18n keys in `translations.js`, API call patterns in `api/axios.js`, styling).
2. Implement the change directly.
3. Run local verification, matching the exact gates this file already cites everywhere:
   - `npx eslint .` (in the affected portal's directory) — zero new errors.
   - `npm run build` — must succeed.
4. There is no browser automation available in this environment. Do not claim visual/UI testing happened. If the change is visual/interactive, say so explicitly in the note — this file's own convention for that is:
   `⚠️ Vizual/UI sinov hali qilinmadi.`
5. If eslint/build reveals a bug introduced during implementation, fix it before writing the note — don't hand off a red build.

---

## Step 2B — Backend lane

**Never edit backend repo files in this lane** — the user writes backend code themselves (see project memory / the "Ishlash tartibi" note). This skill only verifies.

1. Read the relevant backend code (if the backend repo is reachable from this session) to understand what was actually implemented.
2. Verify for real, in this order of preference — matching how every existing backend entry in `TASKS.md` was closed:
   - Run the relevant test app: `python manage.py test <app> --keepdb` (report the exact pass count, e.g. `12/12`).
   - If a behavior needs an HTTP-level check with no existing test, send a real request (or a scoped `transaction.atomic()` + forced-rollback check, matching the pattern used throughout this file) and report the actual observed status codes/bodies.
   - If neither is possible from this session (backend server/DB not reachable here), say so plainly and ask the user to run a specific command and paste the output, or state clearly that the item is being closed on code-reading alone (and say that in the note) — never imply a test ran when it didn't.
3. If you find a bug, report it precisely (file:line, what's wrong, what's expected) — do not fix it yourself unless the user explicitly asks you to. This mirrors the "Yo'lda N ta bug topildi" pattern already used throughout the file, except the fix itself belongs to the user in this lane.
4. Do not proceed to Step 3 until the acceptance criteria implied by the item text are actually confirmed true.

---

## Step 3 — Write the close-out note and check off

Only after real verification (Step 2A or 2B) actually passed:

1. Change `- [ ]` to `- [x]` for the item (and any sub-items that are now genuinely satisfied — leave any that aren't unchecked and explain why).
2. Append a note in the file's existing style — concrete and dated, not vague:
   ```
   ✅ Tekshirildi (YYYY-MM-DD): <specific evidence — test counts, exact request/response behavior, or eslint/build result>.
   ```
   Bad: "✅ Tekshirildi: ishlaydi." — too vague, does not match this file's convention.
   Good: "✅ Tekshirildi: `manage.py test billing --keepdb` — 12/12 o'tdi; boshqa doktorning payout'ini ID bilan ochishga urinsa 404."
3. If a bug was found and fixed (frontend lane) or found and reported (backend lane), note it inline the same way the file already does ("Yo'lda N ta bug topildi...").
4. If verification could not be completed (backend unreachable, visual testing unavailable), do not check the item off — leave it `[ ]` and state exactly what's missing and what the user needs to do or confirm.

---

## What this skill does NOT do

- Never marks an item `[x]` without real, stated verification evidence.
- Never edits backend repo files.
- Never restructures unrelated parts of `TASKS.md`.
- Never invents test results or request/response behavior that wasn't actually observed.

---

## Output

The targeted item (and its sub-items, where genuinely satisfied) checked off with a dated, evidence-based note in `TASKS.md`'s existing style — or left open with a clear statement of what's still needed.
