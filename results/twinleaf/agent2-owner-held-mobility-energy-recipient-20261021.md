# Owner-held mobility as an opt-in Basic Energy recipient tie-breaker

**Agent 2, 21 October 2026 UTC.** Scope: one experimental owner-observation-only Basic Energy planner, not a candidate win-rate result. Paper Expanded Aichi Top32 benchmark remains 29/32 exact published opponent 60s and zero competitively qualified games.

## Motivation and actual native antecedent

The [rank11 source-first Marnie then held-Guzma native replay](../aichi-2026/agent43-sourcefirst-held-guzma-native-20261021.md) physically accepted source T9 Guzma and resolved both switch prompts, moving untooled Garbodor out and Oranguru V into Active. Yet the source made zero attacks and the retrospective candidate still won. Independent [source Energy-recipient audit](../aichi-2026/agent17-rope-source-energy-diversion-audit-20261021.md) found an important causal-looking difference in the historical Rope/no-Rope paths: attachments in the Rope arm went to the newly Active Garbodor instead of the Oranguru investment. These remain one selected diagnostic deal, never evidence of a competitive win probability.

## Change

Two existing research-side modules were updated:

- `simulation/twinleaf/agent44-actor-energy-recipient.cjs` accepts `{mobilityAware:true}` as an additional argument.
- `simulation/twinleaf/agent34-actor-only-root-policy.cjs` passes the option when `mobilityAwareRecipient` is enabled through the explicit dependency flag or `AGENT2_MOBILITY_ENERGY_RECIPIENT_DEV=true`. It also includes the flag in its diagnostic audit and version tag.

**Default OFF.** The flag is useful only with the existing `energyRecipientFrontier` flag. If the actor owns a held, still potentially playable printed Switch/ Escape Rope, or an unspent and not locked Guzma with opposing Benched Pokémon, the comparison evaluates post-attachment printed Basic Energy cost deficits before Active/Bench ties. It protects an immediate payable Active attack above an equally close Bench attack, and otherwise prioritizes a smaller deficit, with Bench winning positive-deficit ties. Without a supported mobility connector, the previous Active-first behavior is unchanged. Exact-name print regexes exclude Switch Cart, Switch Raft and Guzma & Hala from this claim.

Only own held printings, own publicly observable usage/locks, and opponent public Bench geometry enter the new signal. The Store remains the sole legality authority. Having a held card does not mean the opponent can be escaped or that using it is tactically correct. The algorithm does **not** play the switching card, settle prompts, account for future Supporter opportunity cost, or certify any actual damaging attack.

## Verification and limits

- `tests/agent2-owner-held-mobility-recipient.test.cjs`: ten deterministic pure decision scenarios, including Switch, Escape Rope, Guzma availability, negative aliases, Item/Supporter locks, exhausted Supporter turn, immediate Active funding, opponent-hidden-identity parity, and excluded GX attacks.
- A source-bound, restricted V8 CommonJS evaluation of the **actual GitHub source contents** (with injected narrow module/Node assert adapters) initially passed **9/10**; it exposed an immediate-Active-versus-Bench cost tie flaw. After changing the comparator, **10/10** passed. This is a source-level unit check, **not an executed Node test file on native Twinleaf**.
- Existing [manual actor-root regression workflow run 39690663695](https://github.com/FlareZ123/experiment-01/actions/runs/39690663695) completed **success** at head `940aac207f4e7fb4e3320f6ba9ad7f74cd3533e9`, compiling the pinned engine and running its historical actor-root tests. Its head includes the initial mobility implementation but precedes the later tie fix `6ca3bc1b`. The workflow **did not execute the new ten tests**, and no mobility opt-in was active in those historical games. Thus native impact remains unverified.
- An attempt to add the test to existing manually dispatched CI was blocked by the GitHub write tool's safety check. No workflow was created or altered.

## Counter-semantics reconciliation (23:23 UTC)

Agent41 independently discovered and corrected our original interpretation of `owner.supporterTurn` (main commit `96ca4aeb`). It is the **number of Supporters played in the owner's current turn**, rather than the last global turn of a Supporter. The attached held-Guzma mobility signal now requires `supporterPlayedTurn===0`, and the new unit scenarios were repaired to model **0 available, 1 spent** in commit `a2a2a175`. A fresh source-bound execution against the latest committed recipient/actor modules again passed **10/10** checks. The earlier source-bound 10/10 was against the superseded count comparator, so this fresh result supersedes its precise code-revision interpretation. Native pinned gameplay for the experimental mobility opt-in is still unverified.

## Next qualified falsification

Execute `node --test tests/agent2-owner-held-mobility-recipient.test.cjs` under Node 20 (or later), then use the existing canonical four-arm source-first policy and paired seed/deal controls with both `energyRecipientFrontier` OFF/ON and `mobilityAwareRecipient` OFF/ON, while keeping the source 60, candidate 60, engine revision, physical deals and independent opponent reply policy unchanged. A meaningful native outcome requires actual accepted targeted Energy attachment, correctly settled mobility action and funded attack under source continuation, not simply a different proposed Bench index. The same owner-visible algorithm must be tested in both seats and new, preregistered physically independent starts. Report all caps, failures and changes; historical Rope paths cannot enter the competitive denominator.

No competitive game, 60-card nomination, 99.5% claim or projected match win was established by this work.
