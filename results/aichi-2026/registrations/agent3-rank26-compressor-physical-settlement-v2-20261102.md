# Preregistered rank26 physical Battle Compressor settlement: source-first v2

**Agent 3 | 2 November 2026 | frozen before observing any v2 native original deal.**

## Research question and retained evidence

The earlier [owner-energy source v1 registration](agent3-rank26-compressor-source-owner-v1-20261102.md) instrumented source-only Battle Compressor proposals and owner deck-selection prompts. Its corrected native workflow [41395032379](https://github.com/FlareZ123/experiment-01/actions/runs/41395032379) completed and archived a 24-pair JSON, but the experiment's proposal and prompt-event counters alone do not establish that a selected physical owner card reached discard. The prior [owner-root prerequisite v1.2 diagnosis](../agent3-rank26-owner-root-prerequisite-v12-native-20261102.md) found no case with two discarded Lightning among thirteen source-first originals. We want a genuine, immediate printed-card effect-settlement denominator for the same policy class, including failed cases.

## Frozen 24-pair source design

Use unchanged authenticated rank **26 Meloetta Donk** original 60 and rank **6 Iron Thorns ex** original 60. Pin Twinleaf at commit a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. Keep the source baseline rank26-autonomous-cologne-pump-propagation-v3 unchanged in both arms and the v1.1 source-only held Battle Compressor and owner-prompt intervention only in the treatment.

Use **fresh** prospectively chosen source physical seeds: deriveSlotSeeds(20261106,'pilot',26,repeat), repeat **72 through 83** inclusive, with physical source seat A and B each. This is **24 distinct originally random source/opponent physical deals and 48 baseline/treatment native arms**. Do not select seeds using v1 outcomes. Max 120 native actions per arm, strict prompts and isolated bot policy RNG. Retain the same paper Battle Compressor positive-selection fix and previously registered rank26 first-turn source settings in **both** arms.

Both arms receive the exact same **read-only native Store movement observer** at simulation/twinleaf/agent3-compressor-discard-settlement.cjs as an outer hook; it must restore the previous dispatch method afterward. It detects unresolved owner-deck Battle Compressor ChooseCardsPrompt and, on each native ResolvePromptAction, compares pre-dispatch owner-deck objects with the post-dispatch owner's discard **by exact card object identity**. A positive physical movement means the *same object* was in deck before dispatch and in discard afterward, absent from deck and not already discarded before. It records moved objects, original card identities, source seat, turn, native return/exception, and the printed prompt bounds. A positive paper-minimum movement requires at least one card and no more than the printed maximum. This measurement cannot drive either bot's choices.

Record the full initial native physical deal fingerprint separately for both arms. **A matched intervention requires identical physical starting zones**, independent of matching seeds. Preserve all 24 paired seed slots, including failures, action caps and missed opportunities.

## Primary and secondary counters

Report all 24 physical deals, 48 execution arms, actual source-first count, exact/mismatched/unverified paired fingerprints, all native errors and 120-action caps. Within **actual source-first original deals** report baseline/treatment owner Battle Compressor plays, owner-deck selection proposals, native source Battle Compressor owner prompt-resolution attempts, **actual owner deck-to-discard positive settlements**, number of physically moved Lightning and Exeggcute, and whether two Lightning reached the source discard before first attack. Preserve printed source first-turn actions and opponent Prize transitions.

This observer is more stringent than interpreting a prompt selection as a completed discard effect. It does not certify an attack or full paper gameplay. Zero positive settlements is a valid result even if cards were proposed.

## Stop and qualification rule

Emit complete JSON, then return nonzero for any native-arm error, missing or mismatched physical deal fingerprint, missing 60-card original list or incomplete 24/48 denominator. Preserve failures, without dropping unsuccessful seeds.

Exact source play, information-set-safe decisions, human opponent competence, the 25-minute clock, and all 32 original opponent lists remain unfinished. All outcomes are **developmental**, with **zero competitive-qualified games** and no demonstrated 99.5% field strength. This protocol adds a narrow physical-effect witness, without nominating a new fixed deck.


## Native owner-field preflight correction (before v2 outcomes)

The first immutable invocation branch at commit d54b3859669abb93b0e91f355fe113e89b219581 was [CI 41412533630](https://github.com/FlareZ123/experiment-01/actions/runs/41412533630). It was **cancelled before interpreting or publishing any v2 source-game result**, after static inspection of the pinned `newmoon-compressor-owner-prompt-native.cjs` fixture demonstrated that native `ChooseCardsPrompt` ownership is `prompt.player === owner`, as also used by the preregistered source Item selector. The new passive observer alone had incorrectly tested `prompt.playerId === owner.id`, which would silently report zero recognized prompts even if source owner choices succeeded. This was a measurement preflight defect.

The only replacement changes are to compare the native owner object in the **read-only observer** (commit 91c5fec) and its pure fake prompt fixture (commit 5e1d314). The five pure tests pass locally again. All predeclared original 60s, seed base 20261106, repeats 72..83, two physical seats, 120-action cap, policies, and source scoring remain unchanged. Restart v2 on a new immutable commit without selecting any cases. This is the *same preregistered cohort*, not another independent sample.
