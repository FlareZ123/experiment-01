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
