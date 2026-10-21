# Agent 5: preregistered rank-6 owner Compressor → Powerglass native fork

**Registered before implementation:** 2026-10-21 23:20 UTC. Normal research identity Agent 5. Development-only, retrospective physical deal; zero eligibility for competitive game counts.

## Frozen comparison
- Existing canonical bilateral v2 runner `simulation/evaluation/agent41-bilateral-v2-development.cjs`, existing source-first retrospective cohort, its default source policy and optional paper Supporter guard.
- Rank 6, source first (seat A), New Moon Lockbreaker v1 candidate second (seat B), seed `407516727`, source-deal SHA `14549caa34487d41ae4100c0c3542085d6fe57ed33b9d7da89b79bc55379b5de`.
- The paired rank-6 champion-reference arm runs unchanged as a negative-control comparator. Rank-11 arms remain recorded, not selectively omitted from failures. All printed source and candidate 60s, engine pin, RNG, maximum action roots and all independent tactic flags stay fixed.
- Control is the existing development policy. Treatment adds one `candidate-seat-only` wrapper, disabled by default.

## Proposed causal intervention
After global turn 34, if the acting candidate's **own public Active** is Galarian Articuno V CRE (no Tool, at least one attached Basic Psychic) and the acting candidate **holds** a Battle Compressor PHF and Powerglass SFA, with no Basic Psychic in its own public discard, propose the genuine Item `PlayCardAction`. Only when a genuine owner-deck `ChooseCardsPrompt` for that Compressor appears, select up to two Basic Psychic Energy cards from the now legally visible owner deck, resolving through original Store. Once Basic Psychic enters own public discard, propose the genuine Powerglass Tool to the same Active. In a genuine own-discard `AttachEnergyPrompt` when the Tool is attached, choose Basic Psychic to own Active via native `ResolvePromptAction`; do the same in later turns if legal. Return all other decisions to the existing bot, and do not read opponent hand or concealed owner deck outside the legitimate search.

## Acceptance and failure conditions
Compare full control and treatment, preserving **all** four arms, errors, cap/censor, first actor divergence, native accepted/rejected root, physical card movement, original deck search and shuffle prompts, optional end-turn energy prompt, source T35/T37 replies, first settled Psyray turn, native Prize totals and terminal. A root chosen but not physically settled is failure, not a positive result. If absent, record the actual failure rather than inferring the combo. Keep candidate list, source list, actual physical deal, and paper rules fixed. Source and candidate complete-game policies remain competitively unqualified, so no resulting win counts in 99.5% estimate.

## Reproducibility
Use the existing manual-only GitHub Actions workflow, compiled vendor Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; no commit-triggered workflows. Prefer the same compiled workflow with OFF and ON arms, plus pure tests of actor-only decision gates and native prompt audit.
