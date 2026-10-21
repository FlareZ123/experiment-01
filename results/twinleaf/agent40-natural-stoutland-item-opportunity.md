# Agent40: native opportunity and discard cost of held Item under naturally Active Stoutland

**20 October 2026, Agent40. Pre-registered before native Item outcome inspection.**

## Background and target
The [unchanged eight-deal original-source audit](agent40-natural-stoutland-owner-opportunity.md) found a naturally Active rank2 `Stoutland BCR` at global turn6 (seed `20261102`, physical rank2 seat A), and rank1 owner chose `PassTurnAction` at global turn7 native root98. The owner had `Carmine TWM`, `Tulip PAR`, `Mysterious Treasure FLI`, `Unfair Stamp TWM`, and `Tapu Lele-GX GRI` in hand; unused Supporter quota0 and a five-Pokémon Bench. The Carmine root was native-denied as a Supporter under the existing Stoutland lock. The remaining strategically distinct question is whether an **actually owned non-Supporter Item** offers a mechanically legal action under this same source state, and what follow-up discard opportunity cost arises.

## Frozen replay and falsification
- Reuse **exact original source rank2 60**, opponent rank1 60, seed `20261102`, source physical seat A and rank1 seat B; pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, current frozen source profile, strict prompts, 300 native-root cap. Neither early deal nor source decisions may be forced.
- Run the original whole game control and require root-ledger SHA256 `f5364941c7799c9fb44acf143bd095ec9a04f09119f6ce92991a91c33a7cab09`, original turn7 first owner action `PassTurnAction`, and the exact previously observed five-card owner hand. This control remains 300-root censored and not a game win/loss sample.
- In an explicitly **selected after observation** second arm, only substitute root98 original owner `PassTurnAction` with native `PlayCardAction` of owner-physically-held **`Mysterious Treasure FLI`**. Record the immediate actual Store return or rejection, physical card identity, owner hand/board changes, native prompt status/required choices, and follow-up actions if they occur. Do not hide failed or canceled prompts, quote a successful Item from an unaccepted dispatch, or claim any new competitive game.
- This diagnostic intentionally probes technical and strategic **active-move realism**: a playable Item may demand a discard from a hand of consequential singleton or lock-suppressed cards. Mechanically accepted Item alone does not establish a good play or a policy fault, and does not show its eventual search resolution without a real prompt completion.
- If this alternate action is denied, preserve exact native error and distinguish whether the Item was blocked by printed lock, by its own cost, by a malformed prompt, or remains unclassified. Only count what the actual engine certifies.
- Compare owner and public pre-action state between arms, exact ordinal98. Never consult hidden source hand/deck for action selection.

Deliver a separate versioned source runner/test and compiled manual artifact under the *existing* `aichi-tm-attack-policy.yml` workflow. Strictly label counterfactual as a development-only single-state diagnostic. This must not displace the shared rank6/rank11 two-player policy campaign.

## Executed pinned-Store initial Item decision result

The existing manual [Actions 39423428049](https://github.com/FlareZ123/experiment-01/actions/runs/39423428049) compiled the frozen rank2/rank1 source profile and delivered [artifact `12264763122`](https://github.com/FlareZ123/experiment-01/actions/runs/39423428049/artifacts/12264763122), ZIP SHA256 `f5485a919d381c7694ceb7ad5335d18ff174bb442a8b7b07f89b73339fc1f77d`, JSON SHA256 `ce6abde96c4997756dcf6422c5ed69da4dfd2da13d037680cee55fdd431eae78`. CI checkout SHA `fcff1bfeeded3813bfd502690fa814d0f805ea98`. No source/owner printing substitutions or prior action overrides.

- The original native `PassTurnAction` game re-executed without error and retained exact **whole** native-root SHA `f5364941c7799c9fb44acf143bd095ec9a04f09119f6ce92991a91c33a7cab09`, proper actual starting slot1, turn7 pre-choice physical rank1 own hand/board.
- Under the identical turn7 **root98** owner hand/public Stoutland Active state, substituting genuine `PlayCardAction` for **owner-held Mysterious Treasure FLI** was **accepted** by the native Store; its printed physical Item card departed the owner's hand, native logs gained **one** entry, and owner Supporter quota remained **0**. At the exact post-dispatch root the Store had a live **`ChooseCardsPrompt`** pending. This is evidence of real native initial Item play and offered selection, **not yet evidence of which physical card was selected/discarded or what search resolved**.
- The accepted-Item alternate then continued under the original ordinary bot without throwing, reaching the 300-action **cap** with remaining Prizes `[3,3]` and distinct ledger digest `0d6a13c281b0bd3addce7f35fa9b4b35c1aef052095b0607b38ed9af472ae182`. The original controlled game also capped with `[1,6]`. Neither is a completed game. **Do not interpret changing Prize counts as improvement**: prompt resolution, shuffle, later bot actions and opponent response create multiple confounders.

Interpretation: The native source Stoutland position **did deny direct held Carmine Supporter** in the separate prior test, while at least one held search Item was **mechanically playable** at the original Pass. It remains entirely plausible that preserving important resources was rational for the ordinary bot; a legal Item with a mandatory discard is **not** automatically advantageous or realistic. The required discard and selected subsequent search still need a prompt/zone-level witness before assigning card-access benefit. No competitive-game count changes.

### Preregistered direct follow-up: actual owner Item discard and search

Reuse **the exact same original source seat×seed and single natural root98 Item intervention**. Add only read-only root observer fields around its actual native `ChooseCardsPrompt` and subsequent owner selections: prompt class, native choice card printing where owner-visible, actual owner discard change, searched-card identity if public or owner-selected, and a bounded immediate post-Item action chronology. Preserve the frozen original control digest and identical pre-intervention owner/public state. The alternate post-Item root digest `0d6a13c2...` must also remain unchanged if the probe is read-only. If no true prompt resolution is observed, mark incomplete. This is a resource opportunity diagnostic with one retrospectively selected intervention, **not** a competitive experiment.

## Follow-up: actual native prompt choices and physical resource deltas (21 October audit)

The already dispatched manual [CI run 39424535527](https://github.com/FlareZ123/experiment-01/actions/runs/39424535527) **succeeded**, at source SHA `061aa61fdb3e4d4a672e062c5a13a5078506281c`. Its original archive artifact is [12264983333](https://github.com/FlareZ123/experiment-01/actions/runs/39424535527/artifacts/12264983333), named `agent40-natural-stoutland-owner-item-native`. Independent download on 21 October: ZIP SHA256 `f84f02702ae3f837ca9a424e7e4789257b6edd262503f600fac1df48098a5e00`; contained JSON SHA256 `eff6a2004980c771b8ca410dbd34d9d2044f06bb634a47cecbbd7d13c835b548`. The small archive contains eight owner-root events (ordinals 98–105), despite the telemetry field name `firstSixteenActualOwnerRoots`.

The original owner-visible turn-7 state is unchanged. With source `Stoutland BCR` Active, rank-1 owner has `Latias ex SSP` Active, **all five Bench slots occupied**, and the held `Mysterious Treasure FLI`, `Carmine TWM`, `Tapu Lele-GX GRI`, `Unfair Stamp TWM`, `Tulip PAR`. Relative to the original root-98 `PassTurnAction`, the one retrospective intervention produces the following native observations:

| Native root | Actual selected action or owner prompt | Physical owner result |
| --- | --- | --- |
| 98 | `PlayCardAction` for held `Mysterious Treasure FLI` | Accepted; Item leaves hand; `ChooseCardsPrompt` begins |
| 99 | `ChooseCardsPrompt` selects **`Carmine TWM`** | Carmine leaves hand and enters own discard as search cost |
| 100 | `ChooseCardsPrompt` selects **`Girafarig LOT`** | Girafarig enters own hand and deck count changes 30 to 29 |
| 101–103 | Remaining native prompt, `ShuffleDeckPrompt`, `WaitPrompt` | All accepted; Item later enters discard, no additional own-hand selection |
| 104 | `PassTurnAction` | Accepted; no owner Pokémon entered Bench during this bounded window |
| 105 | `WaitPrompt` | Accepted |

These are **real owner-prompt choices and matching zone deltas**, beyond mere initial Item acceptance. The archive's conservative summary still says `completedCardSearchEffectProven:false`; do not override its scope with an unqualified claim about complete card resolution or ultimate search payoff. The physical hand/deck/discard changes are independently readable from each root snapshot. Both whole-game arms still end at the native root cap, original `[1,6]` and retrospective Item `[3,3]`, without a completed match.

**Strategic implication, bounded:** the fallback prompt policy discarded a currently Stoutland-locked Supporter, preserving `Tapu Lele-GX`, `Unfair Stamp`, and `Tulip`, then obtained a Psychic Basic while Bench was full. It did **not** create an immediate usable Bench place or proven attack improvement. The more general consequence is that an Item's initial legal availability is insufficient to score its value; an actor policy must account for its required discard, the card actually retrieved, and room to convert access into an active line. This result is a single selected owner position, with actual source continuation but no performance counterfactual, and therefore must stay outside any qualified win-rate denominator.

Next decision work should stay inside the shared canonical bilateral executable. Re-running this diagnostic adds little unless a specific transferable common-policy choice is at issue.
