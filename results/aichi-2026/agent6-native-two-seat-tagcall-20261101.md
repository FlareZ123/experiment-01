# Two-seat owner-K0 Tag Call to genuine K1 Guzma & Hala: pinned Store positive controls

**Agent 6 | 1 November 2026 | retrospective development replay, original source sixties unchanged.** No qualified competitive games, game-win-rate estimate or new deck recommendation.

## Question and implementation

Can one source-agnostic, own-registered-sixty, first-turn Tag Call to G&H offer execute through the **original Twinleaf Store** for either physical seat, with the Item action, genuine owner-deck search prompt, typed native response and physical hand custody actually confirmed?

The earlier [rank6 source-only Tag Call hook](agent6-source-first-tagcall-native-six-deal-20261030.md) demonstrated the interaction in six selected deals. The new method uses a distinct owner-view K0 selector and an authenticated native owner-prompt receipt. The same six prior deals were reused deliberately for mechanic regression, so they do not constitute fresh population evidence.

- Vendor Twinleaf pin: **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**.
- Research executable head: **b38eb07f5ef38d04a4fddda25a11d96dfcd02161**.
- Manual existing setup workflow [CI 41273156763](https://github.com/FlareZ123/experiment-01/actions/runs/41273156763) **SUCCESS** with existing agent6_tagcall option; no new automatic trigger.
- [Reversible two-seat original Store hook](../../simulation/twinleaf/agent6-owner-tagcall-hala-native.cjs), commit 13c54bb, calls the [pure owner-visible K0 offer](../../simulation/twinleaf/agent6-owner-tagcall-hala-offer.cjs) using the current actor's registered 60, actual hand and detached owner-public board. It cannot read actual deck or Prizes before an owner-authenticated native deck-search prompt.
- The typed native PlayCardAction must first be accepted. A real subsequent pending ChooseCardsPrompt must refer to the same owner, native owner deck and accepted root origin, after which the K1 selector receives only the legitimate [native prompt menu](../../simulation/twinleaf/agent41-actor-owner-single-search.cjs). A real native ResolvePromptAction is then dispatched with original prompt validation. Hand gain is checked after the original Store dispatch.
- [Complete six-deal paired original Store runner](../../simulation/evaluation/agent6-owner-tagcall-bothseat-native.cjs), commit 14acdcd, compares opt-in versus original default across two physical rank6 source seats against the unchanged rank1 champion reference, with source-first and a 110-action cap. Failed attempts would remain in the rows.
- Full original Store artifact [13069384092](https://github.com/FlareZ123/experiment-01/actions/runs/41273156763/artifacts/13069384092) is a 2,725-byte ZIP, published GitHub SHA-256 **8e292736cbe5d770fa70e67f46725c94fb89b04b2071214298e369ad5d3e2a50**, independently checked byte-for-byte. Internal JSON size **32,131 bytes**.

## Full paired source-deal table

| Source physical seat | Original seed | Paired source deal matched? | Accepted Tag Call root | Accepted native G&H deck-search prompt | Physical G&H hand gain |
| --- | ---: | --- | ---: | ---: | ---: |
| A / 0 | 531384326 | Yes | 0 | 0 | 0 |
| **A / 0** | **2341469307** | **Yes** | **1** | **1** | **1** |
| A / 0 | 3030747015 | Yes | 0 | 0 | 0 |
| **B / 1** | **516187842** | **Yes** | **1** | **1** | **1** |
| **B / 1** | **2411836147** | **Yes** | **1** | **1** | **1** |
| B / 1 | 492959857 | Yes | 0 | 0 | 0 |

**12/12 native arms completed without a Store error, 6/6 baseline/intervention pairs retained their exact original source-deal fingerprints, 3/3 genuine Tag Call roots were accepted, 3/3 real G&H deck prompts were accepted and 3/3 physically placed G&H into the own hand.** The root chain included real PlayCardAction, ChooseCardsPrompt, ShuffleDeckPrompt and PassTurnAction events.

The bridge's audit retains the **first accepted root-to-prompt witness independently for both physical seats**, without a top-N truncation blind spot. The source-A positive is seed 2341469307 with native prompt ID 12. The source-B first positive is seed 516187842 with prompt ID 15, and the full result includes seed 2411836147 with another positive. Each accepted witness records the same printed G&H selection and the root's already-fixed K0 view digest.

## Interpretation and remaining work

This demonstrates a functioning native two-seat root-to-own-deck-prompt bridge for one real source family, with no deck or Prize peek before native authorization. The unchanged baseline Pass behavior and forced Tag Call treatment are **not a strategic value comparison**. The test uses retrospectively selected hands, an intentionally narrow source-first start, an incomplete opponent bot and no certified paper clock. A first-turn Tag Call can bank G&H yet fail the desired later line if another singleton such as Thunder Mountain is Prized, as the prior source K1 witness already established.

The native wrapper is **development-opt-in**, outside Agent41's shared same-root chooser. Integrating this route as a competitive policy requires comparison with competing Item uses, resource discards, future Supporter contention, Item locks and opponent counterplay. The independent [five-source exact opener census](agent6-five-source-tagcall-k0-access-20261101.md) identifies additional ranks 2,15,24,29 with the same G&H+Tag infrastructure, but has not certified their native responses.

**Benchmark remains 29/32 exact original opposing 60s, zero competitively qualified games and no demonstrated fixed-deck 99.5% win rate.**
