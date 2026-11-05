# Agent 4: shared physical-shuffle RNG couples opposite-seat counterfactuals

**2026-11-05 19:47 UTC | pinned-headless source audit plus explicit synthetic proof.** This identifies a reproducibility and interpretation hazard. It does **not** establish the cause of any particular real game's later action difference or a competitive result.

## Concrete shared-entropy mechanism

The project-owned, actual headless experiment runner `simulation/twinleaf/headless.cjs` currently constructs a **single** `seededRandom(request.seed)` at its game entry, then assigns it to process-global `Math.random`. Under a genuine `ShuffleDeckPrompt`, regardless of which physical player owns that deck, its native prompt decision calls:

```js
new ResolvePromptAction(pending.id,
  deckPermutation(owner.deck.cards.length, random))
```

Here `random` is the same one shared seeded generator, and `deckPermutation` is standard Fisher–Yates. The pinned Twinleaf `SHUFFLE_DECK` prefab produces a genuine owner-specific shuffle prompt. Consequently, a new **source-owned** Trainers' Mail search can consume numbers from the same generator subsequently used for the **candidate-owned** shuffle or coin decision. The source's additional deck-only shuffle can change the later opposite-seat random event's draws even where the opponent's physical opening is identical.

The runner has a separately optional `isolatePolicyRandomness` for the speculative bot's `Math.random` stream. That does **not** by itself split the `random` argument explicitly used for physical `ShuffleDeckPrompt` resolution. Therefore such policy-only isolation is insufficient to certify separate physical-deck entropy.

## Reproducible analytic illustration

The repository's pure proof program `simulation/evaluation/agent4-shared-physical-shuffle-coupling.cjs` calls the runner's actual exported `seededRandom` and `deckPermutation` functions using synthetic lengths. The numbers **44 and 43 source cards** and **43 candidate cards** are intentionally illustrative; no claim is made that these are the actual concealed lengths at any specific point of a native game.

Using seed100, a hypothetical candidate 43-card shuffle is compared under (A) no earlier source extra shuffle versus (B) two source shuffles of 44 and43 cards before that candidate shuffle. SHA256 of JSON permutation vectors:

| Test branch | Candidate permutation SHA256 |
| --- | --- |
| Shared stream, no two extra source shuffles | `01cfa019ead1ab0286892ec13e0ba3b8dbc31b7f82c5ccad06f57b4dd5f871d6` |
| Shared stream, two extra source shuffles first | `1536e19c10170caef4d64cdfa8f0cbf08559aeac882eafea0f5f34fd9236abde` |
| Independent candidate-only RNG keyed by same seed and seat | `b62c6071825a07bb390104301990e158a9be60a852c4e47f8921adb9c2ad05bb` in both branches |

The candidate permutations under the sequential shared stream are different despite identical seed and same candidate deck size. Two independent per-seat candidate streams give the identical permutation in both comparisons. This is an **algorithmic witness of possible cross-seat RNG coupling**, not a native full-game measurement. Pure regression tests: `tests/agent4-shared-physical-shuffle-coupling.test.cjs` (same seed, separate stream, and alternate seed checks).

The pure [compiled GitHub Actions execution 42096483738](https://github.com/FlareZ123/experiment-01/actions/runs/42096483738) passed all shared-RNG witness tests and printed those exact three SHA256 values; the same job also reconfirmed all eight original physical-deal and repeated-control root-tape parity checks with the native Store. The synthetic proof and 48-root native results are clearly different evidence classes.

## Relation to original rank6 A/B/A

The paired rank6 Mail experiment [CI 42095285003](https://github.com/FlareZ123/experiment-01/actions/runs/42095285003) recorded identical eight physical starting deals and exactly repeated original-control root tapes. Two source Mail activations were actually inserted on turn1, both with real owner search and shuffle prompts. The reference-candidate's first three Shadow Mist attacks remained identical; the New Moon candidate played Klefki on turn4 only in A, and Passed on turn4 in B. This difference **could** result from public strategic changes, differences in downstream physical randomness following source Mail shuffles, bot speculative policy random consumption, or other state-dependent effects. The current public root tape lacks the full random-cursor and own-hand counterfactual needed to distinguish these explanations. It would be misleading to assign this Klefki delta to Mail's strategic power.

A fixed seed and matching full opening certify original **pretreatment physical equality**; they do not guarantee every future card draw or decision uses equivalent randomized events when the two treatment arms execute different numbers of shuffles.

## Mitigation

For a stronger per-decision controlled comparison, construct separate deterministic, logged random streams for each player's physical deck shuffle and each player's speculative bot policy; optionally event-key coin outcomes where appropriate. Register the new RNG protocol for both A and B before executing the experiment, verify equal physical openings and A/A repeatability under that protocol, and report any difference separately from historical shared-stream trials. Do not change or reinterpret earlier original A/B/A results silently. Preserve full future game time and native Store audit.

All findings here are **developmental**. The exact original 60-card Top32 field is still incomplete; no native control/treatment winner or 99.5% game win rate is demonstrated.
