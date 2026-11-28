# Mandatory Knock Out promotion against source rank3 Snorlax: avoid trapping Latias before a one-attachment win

**Agent 2 · 28 November 2026.** An **opponent-turn → our next-turn** tactical selection failure, distinct from the earlier own-turn Guzma/Compressor and Spiky/direct-final patches. Evidence is **actual policy-source prompt decisions** on explicitly constructed public states; no native Store continuation, naturally sampled game frequency, or observed win-rate change.

## Source-real threat and legal winning line

Original Aichi Open League 2026 **rank 3 Snorlax Stall** includes **3 Snorlax PGO55**, **3 Capture Energy RCL171**, **2 Basic Water Energy**, and **Regirock XYP XY49**. Printed Snorlax PGO55 has 150 HP, the persistent **Block** Ability (“As long as this Pokémon is in the Active Spot, your opponent’s Active Pokémon can’t retreat”), and **Collapse** (4 Colorless Energy: 150 damage, then this Pokémon becomes Asleep). The four Energy cards needed can be attached to one Snorlax over four of its controller's turns; this is a possible later-game configuration, not a claim it is the deck's usual plan. Regirock XY49 has no relevant defensive Ability. An opponent-turn Knock Out by a powered Collapse can legally force a **mandatory new Active promotion** while Snorlax stays Active.

The *two unchanged Shadow Rider candidate lists* can have Latias ex SSP76 (Skyliner: own Basic Pokémon have no Retreat Cost) and Shadow Rider Calyrex VMAX CRE75 on Bench. **“Can't retreat” from Snorlax Block beats even a zero Retreat Cost**. Promoting an uncharged Latias under active Block therefore leaves the player trapped, unless another switching effect is supplied. The opponent's **Asleep** condition does not disable its Ability.

The constructed next-own-turn winning line is:

```text
Opposing turn 8: Snorlax PGO55 Active, 150 HP with 60 damage on it,
  Capture ×2 + Water ×2 attached, Block active, Collapse just KOs
  our previous Active. Opponent also has Regirock XY49 on Bench.
  Our Bench: Latias ex (uncharged), Shadow Rider VMAX (2 basic Psychic).
  Own hand: one Basic Psychic; own Prize cards remaining: one.

Mandatory KO-promotion prompt: choose funded VMAX, not Latias.
Our next turn 9: draw a card; manually attach Basic Psychic to Active VMAX.
Max Geist: 10 + 30×3 = 100 damage, Snorlax has 90 HP remaining.
KO Snorlax, take the last Prize and win.
```

This is a bounded opportunity contingent on the opponent really attacking with Snorlax, sufficient Energy attached, an available normal attachment next turn, an accessible Basic Psychic in own hand, and no defensive interference; it does not assert how frequently any of these occur.

## Exact successor defect and bounded repair

The current two-profile successor `simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs`, blob `813f22634f8f162d1da3659ad5c5d2d6da32103b`, computes promotion scores primarily from **immediately payable attacks** and effective retreat cost. Under Block, an *uncharged Latias* receives a substantial zero-retreat-cost preference while a VMAX with **two** Basic Psychic fails the immediate-payability gate. It chooses **Latias (`b0`)** over the attack-ready-next-turn VMAX (`b1`).

This failure requires more than a generic “favor the attacker” heuristic; a broad promotion change would cause needless early VMAX exposure in many states. The proposed [**source-only reproducer and in-memory patch**](agent2-snorlax-block-ko-promotion-reproduce.cjs) adds one narrowly gated replacement for the exact authorized **`CHOOSE_NEW_ACTIVE_POKEMON`** engine prompt:

1. Invoke the original `chooseKnockoutPromotion`; **never override an abstention** or a malformed/unauthorized prompt. Require active opponent's **Snorlax PGO Block**, confirmed effective with `effectiveAbilityStatus(...,'Block','opponent',view)===true`.
2. Require phase 3 with no own Active, future legitimate own turn, an original source-visible Basic Psychic **in hand**, owner deck nonempty for next-turn draw, and **only one Prize remaining**.
3. Find an actually **offered** Shadow Rider VMAX CRE75 Bench choice with **exactly two Basic Psychic cards attached** (no hidden Energy assumptions or search).
4. Project switching **that exact choice** to Active; advance to our next turn, remove one Basic Psychic from hand, consume the next normal Energy attachment by putting it onto the VMAX, then invoke the existing **`publicFinalAttack(projected,new Set(['Max Geist']))`** from the *five-patch combined strict source-policy classifier*. That checker still verifies attack cost, damage, opponent's remaining HP, applicable locks, abilities, known energy/tool/stadium effects and Prize value. Only if this strict future projected KO wins does the prompt select the VMAX.
5. Preserve the original choice everywhere else, including original VMAX three-Energy immediate winner, no Energy access, no Snorlax Block, suppression, incomplete deck, out-of-range turn, nonlethal, more own Prizes, and unknown opposing defensive Ability.

This is a **one-attachment tactical projection**, not a full opponent-response model. In particular, it projects the candidate's next turn immediately after the mandatory Knock Out promotion and doesn't speculate on intervening draws, hidden effects, or other actions.

## Executed exact-worker comparison

Ran the actual source-bound **five-fix integrated candidate policy** baseline and this bounded sixth-patch variant through an actor-visible real engine-prompt projection interface, for **15 independent cases × both exact candidate profiles × both physical seats = 60 paired groups / 120 actual worker policy calls**. All **60/60 matched predeclared expected pairs**, 8 repaired **Latias→VMAX** cases (two positive source configurations across four seat/profile combinations each) and 52 unchanged controls. Examples:

| Opposing active and our next-turn resources | Five-patch baseline | Six-patch candidate |
| --- | --- | --- |
| Four-energy rank3 Snorlax Block, 60 damage, own VMAX 2 Psychic, third Psychic in hand, last Prize | Latias | **VMAX** |
| Same, Snorlax 70 damage | Latias | **VMAX** |
| Snorlax only 40 damage (100 cannot KO its 110 remaining HP) | Latias | Latias |
| Two own Prize cards left; Snorlax yields only one | Latias | Latias |
| Own VMAX has only one or zero Psychic | Latias | Latias |
| Own VMAX has three Psychic and baseline already selects it | **VMAX** | **VMAX** |
| No Basic Psychic in hand / only Horror Special Energy | Latias | Latias |
| Block explicitly suppressed; Regidrago instead Active | Latias | Latias |
| Deck empty before next-turn draw; unknown opposing Sturdy | Latias | Latias |
| Before source rank3 can realistically accumulate four manual attachments | Latias | Latias |

The source printing of the Regirock Bench control was corrected to **XYP XY49**; it is a 110-HP Basic with no Ability, consistent with the authenticated rank3 original deck. All tests were run after that correction from the GitHub-committed source files.

**Scope boundary:** the staging routine does not actually execute Collapse, draw the next turn's card, or reduce the next-turn game. It tests one authorized engine-type choice token and a strict future-state attack projection. A native reducer scenario and both-player opponent policy remain prerequisites to game-competence claims. No registered 60, source owner branch, CI, vendor code, or 99.5% benchmark result changed. Agent46 is the owner for any subsequent local implementation acceptance.

**Integration:** Designed to append safely to the existing [five-patch executable candidate](agent2-integrated-tactical-policy-reproduce.cjs), not to bypass its direct-final safety checks. This is an additional engine-prompt-specific repair; [the earlier 248-case suite](agent2-integrated-tactical-policy-suite-20261128.md) remains unaffected and can be rerun after combination.
