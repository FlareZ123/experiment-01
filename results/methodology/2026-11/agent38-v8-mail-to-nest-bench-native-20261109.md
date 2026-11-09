# Mail-selected Nest Ball converts an early Pass into a real Basic-to-Bench line

**Agent 38, 9 November 2026.** Native developmental evidence, not a competitive paper-game result.

## Native result

Manual [GitHub Actions run 42539971631](https://github.com/FlareZ123/experiment-01/actions/runs/42539971631), head `e2e70cbe810fcf0c52bb13c92ad43f69c3dde19a`, succeeded on the existing shared `agent43-v8-snaptrap-owner-root-diagnostic.yml`. Uploaded artifact: `13641510175`, ZIP SHA256 `aa144bcf04f2120458dd550f0ff5e1cac4834f8171a763254d0b37b8ce66e747`.

The frozen [four-arm registration](../../aichi-2026/registrations/agent38-v8-mail-to-nest-physical-bench-four-arm-20261108.json) holds the exact original rank-3 Snorlax and rank-1 Shadow Rider 60-card lists, seeds `2404595552` and `948758444`, both physical seats, and a 260-root cap. The control enables actor-owned Mail after canonical Pass; the sole added treatment is `followMailNestBall:true`. The preceding Mail Item and top-four Trainer selection had already been natively accepted in [the initial four-arm test](agent38-v8-first-real-pass-to-mail-four-arm-native-20261108.md).

Native log summary:

- `actualNestFromMailPlays = 2`; `nativeNestOffers = 2`; `actualNativeNestPlays = 2`.
- `realBasicPokemonBenchedFromNest = 2`: the native `Nest Ball SVI` search selected an original Basic from the owner's deck and transferred that same object into an open Bench slot.
- `continuationAfterMailPresent = true` across the four trials; all four report the earlier Mail's meaningful opponent response and later own-turn root. The runner does not yet separately prove a reply *after the later Nest action*.
- `status = MAIL_TO_NEST_TO_BENCH_NATIVE_SETTLED`; runner `error = null`.

| Original registered trial | Source seat | First treatment divergence | Settled Basic-to-Bench event | Native endpoint | Control -> treatment remaining Prizes |
| --- | ---: | --- | --- | --- | --- |
| `3:312:B:champion-reference` | 0 | Pass -> PlayCard | Turn 27: `Galarian Stunfisk SSH` | cap -> cap | 6/3 -> 6/3 |
| `3:312:A:champion-reference` | 1 | none | none | native terminal -> same | 6/6 -> 6/6 |
| `3:213:A:champion-reference` | 1 | none | none | cap -> cap | 6/6 -> 6/6 |
| `3:213:B:champion-reference` | 0 | Pass -> PlayCard | Turn 2: `Articuno-GX CES` | cap -> cap | 6/5 -> 6/5 |

## Executable scope and next improvement

- Owner-only opt-in native adapter: `simulation/twinleaf/agent38-v8-four-arm-owner-mail-native.cjs`. The card must have been selected through a genuinely settled Mail prompt and remain the identical physical card in the acting player's hand before the current common policy passes. Real native Store accepts the `Nest Ball SVI` action, its own search prompt and Basic-to-Bench movement.
- Matched native reporter: `simulation/evaluation/agent38-v8-mail-to-nest-bench-four-arm.cjs`. No upstream engine modifications; default common v8 remains unchanged.
- Exact result advances from *search into hand* to *playing the searched Item and putting a Pokémon into play*. It demonstrates a concrete executable gameplay chain, although the choice is currently simply the first native-eligible Basic in the deck. Strategic Basic selection and downstream attack/control payoff are open. The two affected arms reached the same 260-root cap and same Prize counts, so no result supports a stronger deck or match win.
- A useful successor should preferentially play cards that complete an actual board-to-attack/control line and require a native opponent response after the exact meaningful action. The isolated original-rank-3 treatment cannot establish all-32 field performance.

**Admission:** zero competitive paper games; no selected fixed 60; the exact Aichi ranks 23, 25 and 28 remain unavailable. No 99.5% claim.
