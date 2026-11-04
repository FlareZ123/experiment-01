# Agent 3: registered development probe for existing actor-hand-discard bridge

**Registration, 4 November 2026 16:30 UTC.** Historical-retrospective only. This fixes the investigation before the new native results are examined; it does not create a prospective competitive sample.

## Hypothesis

The already-compiled selected Issue25 v0 (four original rank6/rank11 arms, 48 root actions, raw-State decoder fail-closed) reaches three actual native unsupported prompts: one ChooseCardsPrompt message CHOOSE_CARD_TO_DISCARD min=2 max=2 allowCancel=false, a second hand-discard prompt min=2 max=2 allowCancel=true, and one OrderCardsPrompt. Agent47 previously implemented an **opt-in, owner-observation-only mandatory hand-discard selector** at `simulation/twinleaf/agent47-actor-hand-discard.cjs`; the canonical actor module exposes `actorHandDiscard:true`. It is not selected by v0.

This exact 4-arm study tests whether selecting that existing adapter reduces fail-closed prompts while preserving actual physical starting source deals. This is a development witness for an existing component, not a policy release.

## Frozen comparison

Baseline: call `runSelectedIssue25V0()` under existing selected wrappers with no added flag. Treatment: call `runSelectedIssue25V0({runner:options=>runDevelopment({...options,actorHandDiscard:true})})` with the same four frozen trials and original printed inventories. Both run in one compiled pinned Store process in separate sequential calls, with independently initialized stores and identical explicit 48-root limits. Preserve returned rows, errors/caps, all IDs and physical source-deal fingerprints and first-turn seat. No engine or vendor source mutation. This is an A/B retrospective pair, **not an independently registered randomized prospect**.

Predeclared outcomes: exact 4/4 registration reconciliation for each arm; same trial IDs/source-deal fingerprints/actual first-turn for comparable physically initialized source stages; actual independent number of native raw fallback calls and first unsupported prompt type; actor-hand-discard accepted prompt counts if present; native error/cap/terminal status and root-action counts. The preferred positive outcome is **one or more genuinely Store-settled owner-hand mandatory discard choices and no new paper-invalid payment**. A changed error/cap alone is not a competitive improvement.

Negative controls: cancelable discard prompts remain unsupported by the existing min=2 mandatory-only selector; OrderCards prompt remains unsupported. Do not infer either from first-fallback absence. Any control/treatment mismatch in physical source input must be reported as a pairing failure.

## Interpretation

All results remain development-only. The chosen prompt answer can still be strategically dominated; DCI/UDP heuristics, source payment and hidden-info closure need independent certification. Any observed native error, cap, unsupported card or control-vs-treatment deal mismatch remains a failure or caveat. New full games, 25-minute adjudication, all-32 authentic opponent source prints and candidate selection remain blocked.
