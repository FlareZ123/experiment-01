# Agent39: shared-policy actor-view privacy and completeness audit

**20 November 2026 · static data audit only · no policy, deck, worker, fixture, workflow, or gate changes**

## Decision

The 21 records that pass the shared corpus's coarse eight-field presence screen have **digest integrity and no obvious hidden-information leakage in their authored actor-view payloads**. They are nevertheless **not runtime actor-only evidence and remain blocked**: all 21 are synthetic development cases, all use physical seat 0, none has a native acceptance receipt or trace digest, and important prompt/frontier data is absent or only described in prose.

Keep all 21 as synthetic regression/abstention material only. Do not treat them as training labels, competence evidence, matchup evidence, or a seat-symmetry demonstration.

## Frozen inputs and method

Audited the public shared-policy-challenge-corpus-v1.json at Git blob 1a70792f3c57423e1d25b702e6894bef248e1f89, resolving its exact source references against:

- Rank 2 Agent45 Vileplume suite v2, blob d5745e3c295bcd5ca485415943688dc29e062db6.
- Rank 10 Agent43 Phantom Dive suite v2, blob 148798cb40e1f9b076bedb0b6f55d0caf562859e.
- Agent2's suite-content contract, blob 47d43388ff07679e6ac21f94bc8be65a88bdda59.

The 21 presence-screen records are 15 rank-2 development cases and 6 rank-10 development cases. I resolved rank-2 actorViewRef values through the suite's actorViews map (rather than hashing the reference string), and used the inline actor views for rank 10. I independently recomputed SHA-256 over recursively key-sorted JSON, preserving array order and UTF-8 encoding. **All 21/21 declared digests match the resolved actor-view object.** Rank-2 digests are bare hex; rank-10 digests carry a sha256: prefix. Both forms normalize to the same verified result.

The privacy screen recursively inspected the resolved views for opponent hand/deck/prize identities, hidden/native state, private state, seed/RNG fields, and other secret-bearing keys, then inspected the actual public-zone values rather than relying only on key names.

## Findings

### 1. The presence-screen cohort is not evidence-complete

| Property | Result |
|---|---:|
| Records passing the eight-field presence screen | 21/318 |
| Rank 2 / Rank 10 | 15 / 6 |
| Split | 21 development |
| Evidence class | 21 synthetic |
| Disposition | 21 blocked |
| Physical actor seats represented | 0 only |
| Candidate-role cases | 0 |
| Native acceptance receipts | 0 |
| Native trace digests | 0 |

The screen checks field presence, not field semantics or execution. In the rank-2 suite, every passing case still has unitTestOutcome: pending, with null native receipt and trace fields. In rank 10, four cases report only local synthetic helper-suite outcomes; the remaining two are authored but not executed. All six explicitly disclaim native game or strategic-competence evidence.

### 2. No obvious hidden-information leak was found in these 21 payloads

- All 21 resolve to actorSeat: 0.
- Rank-2 views expose the actor's own hand and public board. The opponent view contains public board/zones and counts; opponentPublic.publicHand is null and opponentPublic.prizeSlots is empty in every passing case. The only non-null public-hand mirror is the actor's own Jet Energy in own-hand-public-hand-dedup-root.
- Rank-2 ownerK1 is null/empty throughout. No opponent hand identities, deck contents, face-down Prize identities, or RNG/seed values appear.
- Rank-10 views are smaller prompt-level slices: own Prize count, the opponent's public board, and a typed-in-fixture PutDamagePrompt with choice tokens. They contain no opponent hidden zones or seed/RNG fields.

This is a **structural privacy pass on synthetic fixtures**, not proof that the V3 runtime projection is actor-only. The views were authored as test data, not captured from accepted native decisions.

### 3. Several passing records are not complete policy requests

- The 15 rank-2 views contain state fields and pendingPromptType, but no exact legal-action frontier or typed prompt payload. Their promptCoverage entries are prose descriptions, not prompt objects with source, owner, bounds, choices, and indices.
- The Peonia and Gladion blocked-prompt cases resolve to the same actor-view object and digest: only pendingPromptType: ChoosePrizePrompt is present. Their case-level rationales differ, but the view itself does not contain source-specific prompt evidence that a shared policy could consume. Keep these as generic fail-closed/abstention regressions, not source-aware Prize-decision examples.
- The six rank-10 cases do include explicit choice tokens and labels for a PutDamagePrompt, but the case scope is only that prompt decision. The suite says host projection is unsupported and the native effect harness was not executed. They are not complete-turn or native strategic examples.

The corpus generator pins and resolves source cases but copies the declared digest; it does not itself recompute a digest over a resolved actor-view object. This audit independently performed that recomputation for the 21 records.

## Recommended use after the registered first trace

1. Preserve the 21 records as blocked, synthetic development regressions. Do not promote them to supervised strategic labels or competence passes.
2. When a case is converted for the shared player, bind the exact accepted V3 actor-observation digest **and** the exact typed prompt/legal frontier (including source identity, owner, selection bounds, and choice tokens where relevant). Keep all hidden opponent zones and physical seed data outside policy input.
3. Add mirrored seat-1 cases and candidate-role coverage before making any seat-symmetry claim. The current 21 cases provide no such evidence.
4. Keep held-out cases sealed; this audit touched only the 21 development records that passed the presence screen.
5. Retain the rank-2 Peonia/Gladion cases as abstention boundaries until the shared host/worker contract can supply the necessary actor-visible prompt and accepted-event evidence. Do not infer concealed Prize identities.

No source suite, shared corpus, candidate list, policy, workflow, PR #58 gate, first-trace registration, or Twinleaf pin was changed by this audit.

## Exact passing case inventory

- **Rank 2 (15):** mode0-grandtree-root, mode0-no-useful-root, mode0-competing-supporter-root, stoutland-live-hooded-root, stoutland-live-unhooded-root, stoutland-no-tool-root, stoutland-unknown-suppression-root, hood-under-item-lock-root, discard-jet-duplicates-prompt, discard-tm-duplicates-prompt, own-hand-public-hand-dedup-root, lusamine-unsupported-root, lusamine-unsupported-prompt, peonia-prize-blocked-prompt, gladion-prize-blocked-prompt.
- **Rank 10 (6):** rank10-pd-01-three-prize-ko, rank10-pd-02-ko-count-tiebreak, rank10-pd-03-nonlethal-focus, rank10-pd-04-zero-cap-filter, rank10-pd-05-unsupported-source, rank10-pd-06-default-disabled.
