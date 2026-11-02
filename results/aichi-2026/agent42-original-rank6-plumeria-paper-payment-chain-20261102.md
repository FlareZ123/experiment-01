# Agent42: original rank6 source Plumeria payment physically verified in native four-arm parity comparison

**2 November 2026 | retrospective registered source-dealt development comparison | 0 competitively qualified games.**

## What is new

The previously uncertain source-hand custody for the **naturally reached original Aichi rank6 Plumeria BUS** in [Agent20's frozen four-arm canary](agent20-frozen-bilateral-rank6-canary-release-v1-20261102.md) is now **physically observed at the real Store dispatch**, not merely inferred from a temporary `ChooseCardsPrompt` holding selected names.

[GitHub Actions 41484575174](https://github.com/FlareZ123/experiment-01/actions/runs/41484575174) **SUCCESS**, upload [the complete four-pair artifact 13162630179](https://github.com/FlareZ123/experiment-01/actions/runs/41484575174/artifacts/13162630179), selected checkout `7aeb35c8e698beb6813d36d4a696052f85db8526`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Actual comparison and native lineage

The [research-owned comparison runner](../../simulation/evaluation/agent42-plumeria-sourcechain-paired.cjs) replayed the exact four preexisting Agent20 rank6 candidate/source trial registrations **twice**, once with paper Plumeria guard off, once with [the reversible physical owner-payment guard](../../simulation/twinleaf/agent42-plumeria-paper-payment-guard.cjs) on. Same registered source/candidate lists and same historical seeds were used. The old frozen release profile remained unchanged.

**All four** baseline-versus-guarded pairs had exactly matching `sourceDealFingerprint`, `fullPhysicalDealFingerprint` and the complete ordered `rootActionLedger` JSON. Eight actual native games executed. Guard audit tagged **four** genuine `AddPlayerAction` Stores, with exactly **one** accepted Plumeria source-marked payment.

The only naturally reached Plumeria belongs to:

| Field | Observation |
| --- | --- |
| Registered trial | `6:1:B:new-moon-lockbreaker-v1` |
| Opposing source | Original rank6 Kazuma Kashi Iron Thorns ex |
| Source's physical seat | A / index `0` |
| Natural Supporter play | `PlayCardAction`, root ordinal **57**, global turn **8** |
| Native owner payment prompt | `ChooseCardsPrompt`, ordinal **58**, `min=max=2` |
| Prompt list classification | `unclassified`, source list player `-1` |
| Actual physical selected payment | **Cynthia & Caitlin CEC** and **Enhanced Hammer TWM** |
| Owner-hand membership just before resolution | **both selected actual Card objects present** |
| Owner-discard membership just before resolution | **neither selected Card object present** |
| Owner-discard membership after real Store resume | **both selected Card objects present** |
| Owner-hand membership after real Store resume | **neither selected Card object present** |
| Actual `ChooseCardsPrompt` settled? | **yes** |
| Physical payment receipt native Store ordinal | **4 of 4** |
| Control versus guard physical deals/roots | **identical** |
| Whole-match competitive qualification | **no** |

The owner-hand payment check was performed on actual object identity and live `Store.state.players`, directly around `ResolvePromptAction`. The selected prompt's temporary card-list identity being `unclassified` did **not** mean the cards were foreign to the payer. The earlier frozen canary already contained the named two-card selection and subsequent 2→1 attached opposing Energy count observation. The added evidence specifically closes the **physical own-hand→own-discard mandatory payment** part of this one real Plumeria line.

## Scope, versioning, and why this does not prove a competitive win

- **Historical selected sample:** these are four registered trials previously run and examined by Agent20 and Agent30; the same-source replay tests behavioral noninterference and physical transaction custody. It is **not** a new blind prospective evaluation or any win-rate sample.
- **Guard and revision boundary:** this specific CI used the `plumeria-paper-cost-v2` default-off guard extended with physical post-payment receipts. The updated source now also has an optional `requireLiveStore` setting and a pinned original-roster hash check, which will require a separate selected CI execution to validate. Do not transfer the v2 result automatically to the newer code.
- **Remaining paper-chain unknowns:** downstream opponent target and Energy card object custody, other Supporter/Item contracts, owner-only policy read safety, policy decision competence, realistic opponent continuation and full game rules still require independent checks. One paper-correct payment does not qualify an entire game.
- **No tournament field closure:** the original published full 60s for ranks 23,25,28 are still absent, 29/32 authenticated. There are **zero** competitively qualified game outcomes toward the fixed 60-deck 99.5% target.

The independent [prepared Store negative proof](agent42-plumeria-physical-shortpayment-20261102.md) still demonstrates **one-card underpayment can illegitimately discard opponent Energy** in the unguarded engine, both seats; the natural source line here paid its cost correctly. Preserve both results: the engine has an exploitable payment path in adversarial input, while this specific observed real source game did not take it.

## Reproducibility

Source code: [paired original source runner](../../simulation/evaluation/agent42-plumeria-sourcechain-paired.cjs), [paper payment guard](../../simulation/twinleaf/agent42-plumeria-paper-payment-guard.cjs), [stage+adversarial physical tests](../../tests/agent42-plumeria-paper-payment-guard.native.test.cjs). Pinned vendor source [Plumeria BUS reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-burning-shadows/plumeria.ts). CI job `rank6-plumeria-sourcechain-pair` was added as a separate, **manual-only** boolean in the existing native workflow, preserving all eight outcomes as a downloadable machine-readable JSON artifact.

The follow-up newest-code variant is a separate execution and should report its own checkout, source roster hash, Store scope, statuses and full pair evidence.
