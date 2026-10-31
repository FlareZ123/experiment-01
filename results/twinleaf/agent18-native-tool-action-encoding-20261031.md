# Native Tool-action encoding equivalence at original Aichi source first roots

**Agent18 | 31 October 2026 | genuine original native Store receipt, prior protocol.**

## Question and preregistration

Can a purely detached, owner-visible candidate Tool and target be encoded to the **same native action object** as an independently successful original `SimpleTacticsAi` Tool play, without reading a concealed Prize, deck card, future state or changing the actual game? This matters because our earlier [29-source proposal census](./agent18-original29-k0-same-root-source-exposure-20261031.md) found 56 structural Tool/recipient pairs, but those were only observed and not dispatched. Previous native positive controls already proved rank2's **Stealthy Hood UNB** and rank10's **Muscle Band XY** were physically attached to actual original source recipients after Store acceptance.

[Precommitted prediction](../../agents/agent18/20261031-original-source-tool-typed-action-equivalence-protocol.md) was strict deep object equivalence for those native-positive targets, under authentic original printed 60s and fixed seed 4246551499, with a failed experiment on any mismatch. Tool action input comes from [actor-visible frontier](../../simulation/twinleaf/agent18-actor-tool-candidate-frontier.cjs) and [pure typed encoder](../../simulation/twinleaf/agent18-native-tool-play-action.cjs). The encoder checks matching owner hand index and printing, public TrainerType.TOOL identity, unlocked Tool play, existing unoccupied active/bench recipient and slot indices, and creates a new native `PlayCardAction(ownerId,handIndex,{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE|BENCH,index})`.

The original native `SimpleTacticsAi` action is decoded once, dispatched unchanged; a passive Store observer checks the resulting attached exact Tool and then constructs and `assert.deepStrictEqual` compares the fresh owner candidate encoding to the original native bot action object. All original observer-off versus observer-on outcomes must match. Rank2/rank10 positive controls are separately enforced in the six-source runner. No other Tool offer is dispatched.

## Failure and correction, retained for auditability

Initial compiled [CI 41162701979](https://github.com/FlareZ123/experiment-01/actions/runs/41162701979) failed in the first full source K0 observer at a genuine first Tool `Forest Seal Stone SIT` to Active `Mega Absol ex M1L`. The candidate list **already contained exactly that printing/hand index and Active recipient**. The new assertion mistakenly compared `candidate.printing === attached.printing`, although `attached` was a native observer's wrapper with fields `{slot,index,pokemon}` and **no printing field**. It therefore looked for an absent value and produced a false candidate-missing error. The narrowly scoped corrective commit `1a3f3bea5dfc4cac010955212b0e174abe23436e` uses the held original `beforeHandCard.fullName` for the printed Tool match and restricts diagnostics to minimal actor-visible context. This was **an audit bug**, with no evidence of changed native Store behavior.

## Compiled positive result

[CI 41163218889](https://github.com/FlareZ123/experiment-01/actions/runs/41163218889), head `a85261e377c0be768b5559b1ec4b83098b308610`, **PASS**:

- Pure `tests/agent18-native-tool-play-action.test.cjs` and `tests/agent18-same-root-tool-offer.test.cjs`, including wrong card index/printing, Tool locks, occupied targets, valid Active and Bench encoding, no observer mutations.
- Genuine original rank1/rank11 native first owner source orientation tests, with owner-local K0 hidden-world swap invariant and observer/nonobserver original game parity. Native first-Tool action `Forest Seal Stone SIT` to the observed Active was accepted, attached and its newly constructed owner-only action object compared equal to the original native action.
- Registered six original source ranks 2,6,10,11,24,29 **all passed** their two physical first-owner roots; rank2 and rank10 matched exact positive native Tool action/recipient printings and had `nativeStoreToolActionEncodingEquivalent=true`, enforced in `agent18-aichi-k0-stratified-native.cjs`.
- The native full-60 source Store makes unchanged first actions; the observer adds no Tool action. No early win-rate or policy-effect claims.

The exact original Store-positive attached Tool instances have a reusable typed action **encoding**. This does not certify engine legality of any **other** one of the 56 structurally enumerated Tool recipients, benefits of Tool choice, card-specific restrictions, future turns, opponent reply, or competitive winning strength. In particular, the original native bot's attachment of `Forest Seal Stone SIT` to a `Mega Absol ex` illustrates why the existence of native accepted actions cannot substitute for evaluating the Tool's printed effect: its VSTAR Power is granted to an attached **Pokémon V**, and `Mega Absol ex` is a Mega Evolution Pokémon ex. The engine may accept the attachment while the printed Star Alchemy use condition is unmet. That misuse pattern is already studied in the repo by [Forest Seal Stone V-recipient policy](../../simulation/twinleaf/forest-stone-v-recipient-policy.cjs); this experiment independently exposes another original source occurrence, not a new optimization proof.

## Next indispensable evidence

A native-competing Tool proposal must be run under a fully actor-safe and bilateral owner action selector with protected Tool-resource valuation, actual Store dispatch, native prompt settlement, unchanged repeated roots and real opponent replies. This experiment supplies a positively checked encoding primitive and two source-native target controls, not an action-selection or match-strength outcome. Full published original opponent coverage remains 29/32; exact ranks23/25/28 unavailable. Competitive-qualified games: **zero**.
