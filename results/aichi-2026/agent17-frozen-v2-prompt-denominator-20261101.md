# Agent 17: frozen v2 original-Store prompt denominator and paper-verdict boundary

**1 November 2026 | read-only audit of the existing common bilateral profile; 0 competitive-qualified games.**

## Input and reproducibility

This report audits **the complete original frozen v2 32-arm archive**, rather than a new retrospectively selected game:

- Original archived native CI: [41279242584](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584), artifact [13072623187](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584/artifacts/13072623187), ZIP SHA-256 \`cb23422028015e88d8d701d5d6ffe46de137bdcf22abfe4e5e80abe20a33bd4b\`.
- Original research head \`86e0410847a953a73fdef7f76865493e75ac1c7f\`, Twinleaf pin \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\`.
- Reusable read-only parser: [\`scripts/agent17_frozen_native_prompt_portfolio.py\`](../../scripts/agent17_frozen_native_prompt_portfolio.py). Synthetic fail-closed tests: [\`tests/test_agent17_frozen_native_prompt_portfolio.py\`](../../tests/test_agent17_frozen_native_prompt_portfolio.py).
- Strict preflight checks **32/32 unique IDs**, each \`actionCount == rootActionCount == length(rootActionLedger)\`, contiguous root ordinals, each typed ChooseCards/SelectOption root having an aligned choice receipt, and all AttachEnergy roots having counted energy-sidecar events. These are *archive-internal consistency checks*, not replay attestation.
- The archive retained **19 engine terminals, 13 260-root action caps, no competitively qualified games**. All 32 rows remained in the denominator.

## Prompt-family portfolio: actual native Store resolutions

Every row below is **\`PAPER_PROMPT_UNVERIFIED\`** until a separate independent printed-card contract verifies the actual submitted payload and settled effect. The zeros in the paper-invalid column mean *no independent verdict was attempted*, not that all resolutions were legal.

| Native prompt family | Total resolved | Original source seat | Fixed candidate seat | Exact played-card printing linked | Independent paper-verdict audit |
| --- | ---: | ---: | ---: | ---: | --- |
| WaitPrompt | 3,431 | 1,642 | 1,789 | 105 | 0/3,431 |
| ChooseCardsPrompt | 271 | 116 | 155 | 158 | 0/271 |
| ShuffleDeckPrompt | 241 | 120 | 121 | 105 | 0/241 |
| ShowCardsPrompt | 87 | 72 | 15 | 78 | 0/87 |
| ChoosePokemonPrompt | 69 | 31 | 38 | 15 | 0/69 |
| ChoosePrizePrompt | 54 | 38 | 16 | 0 | 0/54 |
| ConfirmPrompt | 48 | 22 | 26 | 16 | 0/48 |
| ShowMulliganPrompt | 44 | 22 | 22 | 0 | 0/44 |
| CoinFlipPrompt | 32 | 16 | 16 | 0 | 0/32 |
| AttachEnergyPrompt | 27 | 27 | 0 | 0 | 0/27 |
| SelectPrompt | 21 | 3 | 18 | 0 | 0/21 |
| SelectOptionPrompt | 4 | 4 | 0 | 4 | 0/4 |
| OrderCardsPrompt | 2 | 0 | 2 | 0 | 0/2 |
| **Total** | **4,331** | **2,113** | **2,218** | **481** | **0/4,331** |

These are **4,331 prompt-resolution actions**, embedded in **6,314 Store-accepted root/prompt actions** across 32 developmental games, and are heavily correlated inside games. Neither the 4,331 resolutions nor 481 printing links represent independent paper-legality tests.

### Prompt-denominator triage for the common pre-dispatch release contract

The 4,331 native resolutions divide cleanly into **3,431 \`WaitPrompt\` animation/wait replies**, **448 interactive selection/target/order/attachment replies** (\`ChooseCards\`, \`ChoosePokemon\`, \`ChoosePrize\`, \`AttachEnergy\`, \`Select\`, \`SelectOption\`, \`OrderCards\`) and **452 other shuffle/reveal/acknowledgement/coin responses**. This is an observational grouping, **not** a rule that wait or visibility effects are automatically paper legal. A compact integrated release audit should prioritize exact target/zone/card-move checks on the 448 interactive replies, plus independent shuffle/randomness, information disclosure and game-start contracts where applicable. This is much more discriminating than counting thousands of animation waits as independently validated game actions. All families still retain their original full-denominator counts and unknown paper status in the machine output.

### Specific observed receipt gaps

1. **ChooseCards cardinality:** 271 native ChooseCards roots have exactly 271 aligned \`nativePromptChoices\` receipts. **247** retain selected-card arrays whose lengths fall inside native-recorded \`min/max\`. The other **24** retain neither selected cards nor selected indices. All 24 occur in the one censored game `11:2:A:champion-reference`, after repeated candidate-seat `Get Lost` attacks. Further inspection shows **all 24 had zero cards in the opponent discard source zone** (`sourceZoneCardCountBefore=0`) and `nativePromptAllowCancel=true`, despite native min/max `2..2`. These are **empty-discard cancellation-compatible** prompts, rather than demonstrated missing selections from a nonempty pool. The archive does not prove whether the native reply used Cancel or an empty no-op, so paper effect settlement remains unverified. **0** recorded nonempty selected-array cardinalities fall outside *native* bounds. Native bounds do not establish paper legality.
2. **SelectOption:** all **four** \`SelectOptionPrompt\` roots have aligned choice receipts. All four have a native PlayCard parent with exact public \`Guzma & Hala CEC\` printing, and select the printed Tool+Special Energy option. These are native selections with no independent paper cost or follow-through verdict.
3. **AttachEnergy:** all **27** prompts arise from original rank-6 Iron Thorns **Volt Cyclone** attacks; each has an accepted energy-sidecar event and reported public-board change, with **0** public delta missing. Native accepted plus changed board is *still not* a paper recipient legality test.
4. **Linked original played-card printings for ChooseCards:** 73 \`Fog Crystal CRE\`, 30 \`Plumeria BUS\`, 19 \`Team Flare Grunt XY\`, 16 \`Capture Energy RCL\`, 10 \`Telepath [P] Energy M3\`, 8 \`Guzma & Hala CEC\`, 2 \`Tag Call CEC\`. The link uses the same archived trial's \`nativeAcceptedTargetSidecar.declared.ownerHandPrinting\`, keyed by actual parent root ordinal; other families' attack initiators or null parents are left unresolved rather than guessed. A printed parent is not itself a validated prompt contract.

## 1 November supplemental public Volt Cyclone transfer shape audit

The original rank-6 \`Iron Thorns ex TWM\` printed **Volt Cyclone** effect is: *"Move an Energy from this Pokémon to 1 of your Benched Pokémon."* The bundled \`sv6\` set confirms this exact printing. I added a **same-native-archive, root-bound, two-seat public transition screen** in the existing parser and a synthetic valid/invalid movement regression. For each \`AttachEnergyPrompt\` event, it independently looks at publicly visible before/after Energy multisets for the acting seat and requires exactly one **matching physical Energy printing** removed from that seat's unchanged Active Iron Thorns and attached to an already-existing Pokémon on that seat's Bench. Native changes to an opponent's board are retained but not misattributed to the Energy-transfer prompt itself.

**27/27** real source-rank6 \`Volt Cyclone\` prompt sidecar events match this specific printed single-Energy movement shape, with **0 observed opposite-side Energy transfers and 0 donor or recipient identity changes** in these source-prompt deltas. Every event matches an actual live prompt root's owner seat and turn and links to a genuine parent \`AttackAction: Volt Cyclone\`. **13/27** native sidecars also include another player's visible board change, such as an Active loss, in the same dispatch; this extra state change is **excluded from the Energy movement predicate**.

**Evidence join caution:** \`nativeAcceptedEnergyPromptSidecar.events[].dispatchOrdinal\` is consistently **root-ledger ordinal + 3** for the 27 observed events, rather than equal to the corresponding \`rootActionLedger[].actionOrdinal\`. This is a distinct ordinal namespace in this archive; a naive same-integer join would associate the wrong native prompt. The auditor records the offset histogram and uses in-trial prompt-sequence order, matching owner seat, turn and parent attack. A future integrated portfolio needs a common explicit native dispatch-to-ledger key for robust cross-run provenance rather than hardcoding +3.

This supports a **specific externally printed effect-transition shape** for 27 native original-source responses. It does **not** certify attack cost, the preceding 140-damage resolution and all side effects, timing/Prize adjudication, game-clock fidelity, or other prompt families. The records remain \`PAPER_PROMPT_UNVERIFIED\` at complete-effect scope, with a more precise \`PRINTED_VOLT_CYCLONE_MOVE_SHAPE_MATCH\` annotation.

## Release and deck-decision implications

The existing v2 games **do not contain source rank-1 Shadow Rider CRE74 or rank-31 Radiant Alakazam SIT59 opponent turns**; this archive cannot measure natural-field exposure to the newly reported Astral Barrage or Painful Spoons anomalies. Both remain appropriate separate original-source exposure tasks. The only source ranks here are 6/11.

The highest-leverage next integrated paper-contract work is exact native \`ChooseCardsPrompt\` bounds/identity/card-zone legality under these original played printings, \`ChoosePokemonPrompt\` target legality and the candidate's repeated \`Get Lost\` selection visibility. \`AttachEnergyPrompt\` has a bounded 27-instance original attack sample to compare against printed Volt Cyclone. Other families require explicit independent contract scope and must remain \`PAPER_PROMPT_UNVERIFIED\`.

The reproducible script emits **aggregates only**; it does not serialize selected private owner-hand cards, opponent hidden hands, or hidden Prize identities. It is intended as an **input to Agent 41's single shared paper-prompt contract portfolio and frozen profile**, not a competing runner, a new CI workflow, or an argument for promoting 19 developmental engine terminals to competitive wins.

**Research qualification:** 29/32 authenticated original 60s, 0 competitive-qualified games, no evidence-backed fixed winning deck, no demonstrated 99.5% win rate.
