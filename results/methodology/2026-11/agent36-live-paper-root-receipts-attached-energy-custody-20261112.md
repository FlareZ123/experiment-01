# Agent36: full-root physical custody must include attached Energy

**Date:** 12 November 2026  
**Scope:** Research-side Twinleaf evidence capture; not a deck-strength result.

## Finding

The v1 live Store receipt observer did not enumerate `slot.energies.cards` when building its physical-card position map. An Energy moved from an owner's hand onto an Active or Benched Pokémon therefore disappeared from the custody map even though it remained physically attached in the Store. The observer could consequently mark a real Energy payment as missing physical custody. This is material for the V2 admission contract, which requires root-by-root payment and physical-zone review.

This is an evidence-capture defect, not a Twinleaf game-rule defect and not evidence that any prior game was played illegally.

## Correction

`simulation/twinleaf/agent36-live-paper-root-receipts.cjs` now emits schema `agent36-live-paper-root-receipts-v2-attached-energy-custody` and includes each active/bench `slot.energies.cards` collection in the position map. Exact physical movement now records, for example:

- before: `s0.hand:0`
- after: `s0.active.energies:0`

The new regression in `tests/2026-11/agent36-live-paper-root-receipts.test.cjs` constructs two 60-card physical decks, attaches exact Energy objects from the owner's hand to both Active and Benched Pokémon, and asserts both movements and clean 120-card custody. The live recorder was also exercised in a local Store-shaped runtime harness: 120 original physical cards, one accepted root, exact Energy movement, zero duplicates/unregistered cards, and `settledPhysicalIdentityClean=true`. The changed JavaScript files and test sources passed syntax compilation.

## Shared-runner integration

The Agent36 posthoc rank5 Stone A/B/A runner now:

1. enables the full live physical-root observer on every arm;
2. checks that the receipt observer captured all 120 original physical cards;
3. checks that observer accepted-root count and action ordinals exactly match the native root ledger;
4. explicitly retains `paperPaymentReviewed=false`, `clockReviewed=false`, and `competitiveGameQualified=false`;
5. verifies that the requested A/B/A Forest Seal Stone flag reached the actual actor-root audit, rather than trusting the caller-side option; and
6. adds Agent43's native-public two-hit carryover screen as a separate postgame field, leaving ordinary `AttackAction` counts and Perfection Prize receipts unchanged.

The shared Agent20 arm now preserves the underlying Agent41 `trial`, `sourceAttackSettlement`, and `candidateAttackSettlement` fields so the carryover evaluator can operate on both seats and attach actual intervening opponent roots. Same-printing continuity remains only a native-public candidate: it does not prove same physical defender, printed legality, exclusive causality, or competitive strength.

The **separate preregistered Agent44 release-case runner** (`agent44-first-original-rank5-newmoon-case.cjs`) now uses the same v2 observer on every accepted Store root. Its output is versioned as `agent44-first-independent-original-source-case-intake-v2` and writes `agent44-first-independent-rank5-newmoon-case-v2.json`; it exposes raw receipts separately from reviewer-certified V2 receipts and verifies exact root-count/ordinal/seat/action alignment. The `release-case` branch of the existing manual workflow validates the observer and its Energy regression, then archives a v2 artifact. This is the prospective path for the next one-game intake; it has **not** yet been dispatched.

The same prospective runner now composes Agent50's narrow public acknowledgements **inside** Agent4's fail-closed native-decoder quarantine. The wrapper explicitly resolves owner-owned `ConfirmPrompt` with `false` (Twinleaf's default), preserves public mulligan/Wait handling, and delegates every unsupported prompt to the quarantine. Both audits are retained; the runner requires zero raw-State fallback calls. A local runtime composition harness verified that an owner ConfirmPrompt returns false with zero quarantine calls, while an unsupported prompt still throws `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED`. This is not a whole-policy owner-safety or strategic-competence certificate: Agent50 explicitly leaves beneficial ability use unqualified and Agent4's whole-policy flag remains false. The release-case workflow now runs both modules' tests.

The Agent36 posthoc Stone A/B/A runner uses the same nested Agent4/Agent50 composition, retains both audits in every arm, and fails closed on any raw-State decoder fallback. Its manual workflow now runs both guard test suites alongside the carryover and receipt regressions. The acknowledgement layer deliberately declines beneficial optional abilities; any future positive ability-use policy must be a separate, explicitly audited strategic component.

The existing manual workflow `.github/workflows/agent44-rank5-m4-paper-source-native.yml` now runs the new observer, Stone-runner, and Agent43 carryover tests. No push-triggered workflow was added.

## Correction to the previous Stone A/B/A interpretation

The old run **42716818547** is not a valid test of the Stone treatment. Its checked-out source was `fa7adf9537256dd23ea0a074cb49cf0a9dd375be`. The shared arm's option-name bridge to Agent41's `bilateralEarlyForestSealRoot` parameter was committed later at `fe477e51801f1d1996263d47b9746baaf43d860a` (23:06 UTC, after the old 23:00 run). The archived artifact confirms that `detailedComponentAudits.root.earlyForestSealRootOptIn` was false in **all three** arms, including B. Its lack of Stone activation is therefore an unexercised-treatment result, not a negative gameplay result.

The current runner now asserts the exact `false / true / false` root-policy audit sequence and confirms that the frozen control contains Forest Seal Stone in the candidate owner's hand while a Benched Galarian Articuno V has an empty Tool slot. This remains a posthoc diagnostic fixture selected after observing the original game; it is not prospective strength evidence.

## Admission boundary and remaining work

The raw observer is a data-capture layer only. It does not sign paper legality, owner-information compliance, clock, or strategic competence. Agent43's V2 gate requires each root to be enriched by an independent reviewer with the root ordinal, actor, action, paper-legality, payment, target/transition, owner-information, physical-custody, reviewer identity, and evidence reference fields. The raw observer's `actionOrdinal`, `seat`, movement, before/after positions, and physical hashes are inputs to that review, not substitutes for it.

The actual `agent44-first-release-independent-bundle.cjs` still emits the unversioned V1 bundle; Agent45 has been asked to own the V2 bundle/schema integration and specify the reviewer-enriched receipt contract. No reviewer signature or official clock record has been fabricated.

**Not yet done:** the updated manual native workflow has not been rerun, so no new Stone activation, full-root receipt artifact, or native outcome is claimed. The 50801 seed remains posthoc. Current collective status remains 29/32 original Aichi lists, zero independently paper-qualified competitive games, no nominated final fixed 60, and no demonstrated 99.5% win rate.

## Durable code and test locations

- `simulation/twinleaf/agent36-live-paper-root-receipts.cjs`
- `tests/2026-11/agent36-live-paper-root-receipts.test.cjs`
- `simulation/evaluation/2026-11/agent20-rank5-gengar-tempo-aba.cjs`
- `simulation/evaluation/2026-11/agent36-rank5-held-forest-stone-50801-aba.cjs`
- `simulation/evaluation/2026-11/agent43-native-attack-damage-carryover.cjs`
- `tests/2026-11/agent36-rank5-held-forest-stone-50801-aba.test.cjs`
- `.github/workflows/agent44-rank5-m4-paper-source-native.yml`
