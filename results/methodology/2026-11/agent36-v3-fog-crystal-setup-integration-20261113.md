# Agent36 V3 Fog Crystal setup-policy integration — superseded before execution

**SUPERSEDED — DO NOT USE AS THE CURRENT V3 POLICY**

**Status:** this was an unexecuted intermediate policy revision. Its opening-hand inference was wrong because it omitted the pre-shuffle coin-flip RNG draw. The v16 Fog integration has been removed from the current V3 runner and replaced by candidate-only Quick Ball policy v17.

## Correction

The supplied paper rulebook's setup sequence (page 15) performs the coin flip before deck shuffling. The exact pinned Twinleaf setup reducer at commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` likewise creates the `CoinFlipPrompt` first, then the `GO_FIRST` prompt when needed, and only then the seat-ordered deck-shuffle prompts ([pinned setup reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/setup-reducer.ts)). The fixture runner consumes the physical RNG for the coin flip before the two deck permutations.

The earlier Agent36 offset-0 reconstruction omitted that draw and is invalid. Agent49's offset-1 reconstruction is consistent with both the paper rulebook and pinned Twinleaf order. It reproduces the candidate's exact opening hand as Psychic Energy ×3, Arven, Quick Ball, Shadow Rider Calyrex V and Float Stone. Shadow Rider Calyrex V is the only Basic in that hand; Quick Ball is the missed first-turn setup route. See [Agent49's reproducible opening-hand reconstruction](agent49-v3-fixture-opening-hand-reconstruction-20261113.md).

## Disposition

- The Fog Crystal policy v16 was never executed and produced no game result.
- The v16 Fog wrapper was removed from the current V3 runner; it is not part of the active policy identity or prompt chain.
- No card interaction, deck legality, matchup result or win-rate claim was established by the abandoned inference.
- The active direction is candidate-only Quick Ball root opt-in with Agent49's source-bound physical payment/search continuation, while leaving the rank-1 opponent policy unchanged. The same fixed 60-card lists and deterministic seed are retained for the paired comparison.
- The existing Quick Ball continuation currently proves exact physical payment and target retrieval to hand, but not yet that the same selected Card object reaches Bench. That distinction must be preserved: hand retrieval is not a completed setup line. Agent48 requested explicit Bench follow-through audit before the next native run.

See the current [Agent36 V3 Quick Ball integration report](agent36-v3-quick-ball-candidate-policy-integration-20261113.md). The only encrypted fixture dispatch so far, [run 43492137408](https://github.com/FlareZ123/experiment-01/actions/runs/43492137408), failed before compilation because `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` was empty. No native game or artifact was produced. Do not redispatch until the owner configures the RSA public-key variable; keep the private key offline.
