# Agent36: Original rank6 Volt Cyclone pays, deals 140 damage, and receives an actual opponent reply

**5 November 2026, paper Expanded research. Developmental native experiment only. Zero competitively qualified games.**

## Research problem and lineage

Steward-selected Issue25 v4 has no settled original-source attacks across the original eight rank6/rank11 trial IDs. Separate original-source v9 owner play physically paid Guzma & Hala (discarding Tool Jammer BST and Team Rocket's Handiwork FCO) and attached the source's sole **Double Colorless Energy** to Active Iron Thorns ex TWM, then passed while holding Thunder Mountain ◇. Agent5's [pre-registered v10 counterfactual](../aichi-2026/registrations/agent5-rank6-post-dce-thunder-volt-v10-20261105.json) keeps both original 60-card decks, source/candidate seat assignment, actual initial two-player physical deal, source v9 accepted root prefix through DCE attachment, and 48-root cap intact within each registration. Its only targeted change is to intercept an otherwise original source Pass and propose genuine Thunder Mountain → Volt Cyclone actions under the pinned native Store.

The decisive [completed, all-eight **native CI 42106359764**](https://github.com/FlareZ123/experiment-01/actions/runs/42106359764) compiled **SUCCESS** on research head `92a33c3dca22f19b12de003a0ced35fe2af3ef36`, pinned Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, job **127522122144**. **5/5 pure tests PASS** and eight native original source attempts returned. Locked full-control/treatment [artifact 13453110356](https://github.com/FlareZ123/experiment-01/actions/runs/42106359764/artifacts/13453110356) has provider ZIP SHA256 `2bb446348eda27642c64b0ceb20552550688a1eef452f02ab97620acde703f5f`. Source original 60s and contender 60s were unchanged; the two positive target registrations have separately authenticated same-ID physical initial deals and full accepted root prefixes through DCE.

An important prior flaw was fixed before this definitive run. The original hook incorrectly counted the source-owned mandatory Energy movement as an opponent response merely because the active turn advanced. Agent36's patched [source-native hook](../../simulation/twinleaf/agent5-source-paid-dce-thunder-volt.cjs) now requires an actual settled opponent Store action and its [pure tests](../../tests/agent5-source-paid-dce-thunder-volt.test.cjs) cover both the false positive and a real opponent Pass. The [v10 runner](../../simulation/evaluation/agent5-rank6-paid-dce-thunder-volt-v10.cjs) was also repaired to preserve the actual `sourceAttackSettlement` reporter and read its `declarations` field, rather than silently dropping the object and reading a nonexistent count field. The native [same-epoch reporter](../../simulation/evaluation/agent37-candidate-attack-settlement.cjs) audits attack declarations, settled prompt chains, pre/post public damage and Prize, and the next actual candidate nonprompt action without a clock-reset join. These repairs were compiled and demonstrated by the above definitive CI, rather than assumed from static code.

## Full eight-arm trial denominator

| Frozen trial ID | Original source seat | Disposition | Source attack settlement |
| --- | ---: | --- | --- |
| `6:100:A:champion-reference` | 1 | 48-root censored | no v10 target; zero source attacks |
| `6:100:A:new-moon-lockbreaker-v1` | 1 | 48-root censored | no v10 target; zero source attacks |
| `6:101:B:champion-reference` | 0 | 48-root censored | **1 fully settled Volt Cyclone** |
| `6:101:B:new-moon-lockbreaker-v1` | 0 | 48-root censored | **1 fully settled Volt Cyclone** |
| `11:102:A:champion-reference` | 1 | 48-root censored | zero source attacks |
| `11:102:A:new-moon-lockbreaker-v1` | unknown after abort | **engine error** | unqualified and source attacks unknown |
| `11:103:B:champion-reference` | 0 | 48-root censored | zero source attacks |
| `11:103:B:new-moon-lockbreaker-v1` | 0 | 48-root censored | zero source attacks |

## Exact verified physical payoff

| Native event | Champion-reference | New Moon |
| --- | --- | --- |
| Source attack declaration | Original Iron Thorns ex, **Volt Cyclone**, root **31**, global turn2 | Same, root **38**, global turn2 |
| Attack settlement | Genuine Store with resolved prompts, completion root **35** | Genuine Store with resolved prompts, completion root **42** |
| Opponent Active | **Latias ex**, originally 0 damage | **Mewtwo & Mew-GX**, originally 0 damage |
| Opponent damage after attack | **140** | **140** |
| Prize counts before → after | **[6,6] → [6,6]** | **[6,6] → [6,6]** |
| Source Active Energy before → after | Sole **DCE → none** | Sole **DCE → none** |
| Own Benched Iron Thorns Energy before → after | **none → exact physical DCE** | **none → exact physical DCE** |
| Public source Stadium after attack | Thunder Mountain ◇ remains in play | Thunder Mountain ◇ remains in play |
| Next opponent accepted nonprompt root | **PlayCardAction Psychic Energy**, root **36**, turn3 | **PlayCardAction Psychic Energy**, root **43**, turn3 |
| Follow-on opponent action | PassTurnAction root **37** | PassTurnAction root **44** |
| Reporter same-epoch proof | `nextSourceSameEpochProven=true` | `nextSourceSameEpochProven=true` |
| Matched original v9 control | Source Pass root30, opponent Psychic Energy root33 and Pass root34 | Source Pass root37, opponent Psychic Energy root40 and Pass root41 |

The native source-owned AttackAction is independently recorded in the real Store root ledger and is joined to its actual `sourceAttackSettlement.attacks[]` entry. Both have `settledPromptChain=true` and a verified contiguous immediate next candidate Store root in the **same game epoch**. In this symmetric reporter the field named `nextSourceRoot` refers to the candidate/opponent when the audited attacker is the original source. The attachment recipient for the opponent's next Psychic Energy card was not determined from this abbreviated public root table.

**Strategic interpretation:** The source attack produced meaningful 140 damage without a KO or Prize. On the immediately following turn the candidate selected Psychic Energy then Pass in both the attacked treatment and the original no-attack control, so the early opponent *action types* are identical, despite changed public damage. This does not establish candidate competence or later payoff. The original rank6 source has only **one DCE** among its eight Energy cards; both native attacks move that card onto the own Bench and strand Active Iron Thorns at zero Energy. One ordinary attachment of a remaining one-unit Energy card cannot alone fund another 2-Colorless Volt Cyclone on that same Active the next turn. An Energy-movement effect or Bench-to-Active pivot may change this, but no repeated attack was proved in the current fixed horizon.

The other six registered arms are retained as negative/censored/error outcomes, with zero falsely counted wins. Each of the two target original physical starts is authenticated only *within* its own opponent 60 comparison. The two different contenders can produce different source physical openings despite using the same seed and rank.

## Qualification and ongoing needs

This is a reproducible **P3 printed attack payoff plus P4 actual first opponent response** within the development gate. It is not evidence of a full legal paper game, a strong optimal opponent policy, correct independent shuffle and coin streams, official clock adjudication, a tournament win, or any win percentage. A useful next test should examine the original source's next voluntary turn after moving away its sole DCE, compare the attack-now opportunity cost against a credible rival action, and audit full owner-safe payment/lock semantics. The current **selected** developmental Issue25 release remains v4; v10 is a separate retrospective policy.

Whole field: **29/32** authenticated original opposing 60s; missing ranks23,25,28. **No fixed best single 60 selected, zero competitively qualified games, and no demonstrated 99.5% win rate.**
