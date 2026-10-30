# Agent 42: original Store winner reverses under reactive Bench Energy attachment

**30 October 2026.** Evidence category: preregistered, bounded **synthetic** original-Store matched-action counterfactual in **both physical player seats**, plus native policy input-contract regression. **Competitively qualified games: zero.** No naturally dealt opening, source opponent field match, 60-card game, metagame strength comparison or tournament win-rate estimate.

## Question and pre-outcome registration

The existing opt-in Agent41 owner-root arbiter can replace an already payable attack with a public-context Bench Special Energy attachment, provided an occupied Bench Pokémon has a printed attack and the normal Energy quota is open. It conservatively protects an attack at one remaining Prize, but the original v1 has no unconditional protection for two remaining Prizes.

The experiment was registered **before native execution** at [agent42-two-prize-buddy-pulse-20261030.md](../aichi-2026/registrations/agent42-two-prize-buddy-pulse-20261030.md), commit `ec6557508f29b905ea7bf1281c75fdd596215680`. The registration specifies the exact state, native attack-first/attachment-first fork, both owner seats, decisive opponent Buddy Pulse effect, strict failure retention and no win-rate claims.

## Fixed state and predicted paper interaction

Both branches for each owner seat begin with the **same detached actor-visible observation** and the same staged physical Store:

| Field | Frozen stage |
| --- | --- |
| Owner Active | `Miraidon ex SVI`, three attached `Lightning Energy SVE`, Photon Blaster printed **220** |
| Owner Bench index 1 | `Regidrago V SIT`, **210 damage / 220 HP**, no Energy |
| Owner hand index 0 | `Double Dragon Energy ROS`, normal Energy attachment unused |
| Opponent Active | Undamaged `Dedenne GX UNB`, **160 HP**, printed GX gives **two Prizes** |
| Opponent Bench | `Minun PAR` with Buddy Pulse, plus `Plusle PAR` |
| Remaining Prizes | Exactly **two for each player** |
| Native turn, setup | Global turn 2, real `PLAYER_TURN`, five actual Bench slots per player |

The original card database spells the target `Dedenne-GX`; Twinleaf's pinned **`fullName` is `Dedenne GX UNB`**. The printed Buddy Pulse condition is met by Plusle in play. It places **two 10-damage counters** on an opponent's Pokémon when that player attaches Energy from hand, including Special Energy. With the staged damage, **210 + 20 = 230**, enough to KO Regidrago V and award the opponent their final two Prizes. The other fork can attack for 220 against Dedenne GX's 160 HP, taking the owner's final two Prizes. These printed-mechanics expectations are tested against native outcomes below.

[Actual pinned `Minun PAR` reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-paradox-rift/minun.ts) checks Plusle presence, hand Energy origin and Ability blocking before applying a real `PlaceDamageCountersEffect`. The test uses the **unmodified pinned original Store** and compiles the pinned engine through the repository's existing manual workflow.

## Actual native results, both physical seats

[Manual workflow **40998043115**](https://github.com/FlareZ123/experiment-01/actions/runs/40998043115) ran successfully with checkout `af665c6885c597df36958cf7bffcc3660e1e6770`. Its pure tests passed, and the explicit **“Validate complete two-seat native winner reversal and reactive KO”** step passed. Full native receipts are in [Actions artifact 12951774949](https://github.com/FlareZ123/experiment-01/actions/runs/40998043115/artifacts/12951774949). Independently downloaded ZIP SHA-256 `70a415891b40531f1813f693f4963ff84670ef2a0fefbf77251a7c0e04e6c150`; inner `agent42-buddy-pulse-two-prize-native.json` SHA-256 `62283cfeb3f0315b65f1b2b4aa6b161dbcb7b7afca2cdd7efdd1b0a7b72bb4f3`.

| Owner physical seat | Attack first: winning seat / owner's Prizes left | Attach first: winning seat / opponent's Prizes left | Both true winner outcomes? |
| --- | --- | --- | --- |
| 0 | **0 / 0** | **1 / 0** | Yes |
| 1 | **1 / 0** | **0 / 0** | Yes |

**Four genuine Store forks, zero dispatch/prompt errors.** Each owner-seat fork's baseline first-return intent was `attack Photon Blaster`. Unguarded v1 arbitration chose `attach-special-energy` to `Regidrago V SIT`, Bench index 1. Native Store consumed the exact Double Dragon Energy from hand, put both that Energy and Regidrago V into the owner's discard after the reactive KO, emptied the owner Bench slot and ended the game with the opponent as winner **before the owner could attack**. The attack-first fork settled a genuine native WaitPrompt, emptied the owner's two Prize cards, KOed Dedenne GX and recorded the **owner** as winner. The attachment-first fork emptied the opponent's two Prize cards and recorded the **opponent** as winner.

This directly refutes any unconditional claim that inserting the Bench Energy before a payable attack preserves winning opportunity. It also demonstrates an explicit **discrete terminal effect** that a one-step energy-deficit improvement metric misses.

### A live actor-view identity defect in the proposed two-Prize safeguard

Agent35 had already contributed an optional `potentialTwoPrizeAttackVeto` helper, originally unit-tested against **`Dedenne-GX UNB`**. The [first original-Store run 40997213011](https://github.com/FlareZ123/experiment-01/actions/runs/40997213011), artifact `12951733043`, stopped before dispatch in **both seats** because the helper returned `protect:false, reason:unverified-two-prize-target`. The authentic actor observation exposes `opponentPrinting:'Dedenne GX UNB'`, with **numerical attack damage 220 and numerical opponent HP 160**. This is a native printing-alias failure, **not** a number/string type failure.

The [second native run 40997577377](https://github.com/FlareZ123/experiment-01/actions/runs/40997577377), artifact `12951209119`, retained both actual native winner reversals after the hard assertion on the helper was removed; an initially incorrect telemetry field counted Prize *slot objects*, rather than cards remaining in those slots. The final run corrects Prize counts using `sum(slot.cards.length)` and validates the actual zero-remaining-Prizes winners.

The compatibility fix in [agent35-potential-two-prize-attack-veto.cjs](../../simulation/twinleaf/agent35-potential-two-prize-attack-veto.cjs) now recognizes both `-GX` and a word-boundary ` GX ` native fullName. The new [pure regression](../../tests/agent35-potential-two-prize-attack-veto.test.cjs) fixes this exact alias, and the full native final run verified **guarded chooser selects attack** while unguarded chooser selects Bench attachment on both seats. The helper's descriptive `VERSION` string was advanced to v2 after this final CI run; only the identifier changed afterward, and the preceding final run's behavior is fixed by its exact tested checkout SHA.

## Reproducibility and practical conclusion

Code: [original-Store both-seat probe](../../simulation/twinleaf/agent42-buddy-pulse-two-prize-native.cjs); [Agent41 arbiter](../../simulation/twinleaf/agent41-owner-root-arbitration.cjs); [Agent35 optional warning](../../simulation/twinleaf/agent35-potential-two-prize-attack-veto.cjs); [manual compiled workflow](../../.github/workflows/agent5-owner-root-native.yml). Run native through the existing manual workflow; there is **no added push trigger** and no upstream/vendor code change. Staging the state bypasses normal 60-card dealing but all four decision effects, Knock Outs, Prizes and final game winners were resolved by the actual pinned Store.

**Integration recommendation to Agent41:** include a genuinely owner-visible, supported, state-dependent terminal-danger veto before automatically replacing an attack with an attachment. Treat the exact real-engine printing format as part of the policy input contract. Extend the architecture toward actual Rule Box/Prize metadata and reactive opponent-public Ability effects, rather than depending indefinitely on card-name substrings. Retain negative/hold states and all source-dealt failures in any future cohort. A Stage-only counterexample is insufficient to certify the complete chooser or any competitive outcome.

**Benchmark remains unchanged:** exact field `29/32` complete original opposing 60-card registrations, original ranks 23, 25 and 28 incomplete, **zero** competitively qualified games, **no** demonstrated fixed-60 deck with 99.5% wins.
