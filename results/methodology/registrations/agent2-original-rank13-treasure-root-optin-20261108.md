# Original Aichi rank13/rank3 first-Treasure owner-root opt-in diagnostic

Date: 8 November 2026. Agent2. Registered before running shared native CI.

## Purpose

Test whether enabling the already implemented, default-off `mysteriousTreasureRoot` owner policy permits an actual first-turn PlayCardAction from the previously quarantined original rank-13 Regidrago first owner root, against original rank-3 Snorlax Stall, with exactly the same printed 60-card compositions.

This is a **developmental action-coverage diagnostic**, not a prospective win-rate experiment, policy superiority claim, or qualified paper game. Compare with the previously preserved selected-v8 default `mysteriousTreasureRoot=false` rank13/rank3 canary [42442029797](https://github.com/FlareZ123/experiment-01/actions/runs/42442029797); it had a Pass fallback at action ordinal 8, seat1, on the Regidrago original owner root.

## Fixed design

- Candidate: original published Aichi rank13 Regidrago 60, unchanged composition.
- Source: original published Aichi rank3 Snorlax Stall 60, unchanged composition.
- Source registration: published name/count 60-card lists only, not event-era Japanese printing proof or full paper legality admission.
- Physical orientation: candidate seat0/source seat1, and candidate seat1/source seat0, with two attempts preserved.
- Seed: `290134` in each orientation, matching the prior comparator but acknowledging that reciprocal deck placement is not an identical physical opening.
- Accepted-root action cap: `128`.
- Pinned Twinleaf commit: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Native runner: selected-v8 `runDevelopment` composition plus diagnostic-only `mysteriousTreasureRoot=true`; other first-root and owner fallback quarantine flags remain unchanged.
- Frozen v10b registration/runner: unchanged. Existing default-off canary remains its original policy when invoked without options.
- Script: `simulation/evaluation/agent2-v8-treasure-owner-root-optin.cjs`, using `agent2-v8-common-first-owner-root-canary.cjs` with explicit option, original native owner prompt and Store stacks.
- Existing shared manual workflow: `.github/workflows/agent36-bilateral-competence-v9.yml`, `agent2_crispin_vs_seeker_treasure_native=true`. No new standalone workflow.

## Falsifiable decision gate

Retain all registered attempts, successful or failed, full sanitized owner root, first and last accepted native root prefixes, physical seat, actual starter, recorded prompt, policy/wrapper revisions, hash and fixed seed.

The narrow gate for source-ranked Regidrago in physical seat1 is an accepted first-turn owner `PlayCardAction` after original ordinal 8, while both trial arms preserve registered source admission and original raw-State decoder quarantine. Distinguish an accepted action-class witness from exact printed Mysterious Treasure identity, payment, target and final physical zone. A root-class PASS cannot be upgraded into printed Item success without a Store card-source receipt. A native aborted or censored root cannot become a completed game. A failed gate remains a retained negative outcome and must produce an artifact.

If native action-class gate fails, preserve the earliest blocker. If it succeeds, the next step is to join owner root to exact Item, printed discard, owner-deck target selection, settled prompt chain and next owner action. Comparative tactical merit of Muscle Band versus Crispin payments remains open, despite both isolated resource chains having passed a staged native fixture in [the two-payment report](../2026-11/agent2-rank13-treasure-two-payment-native-20261108.md).

No match outcome, statistical sample, final deck selection or 99.5% performance assertion follows from this test.
