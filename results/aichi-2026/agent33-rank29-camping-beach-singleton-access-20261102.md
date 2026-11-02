# Rank-29 co-held Camping Gear versus Tropical Beach: exact singleton DCE access

**Agent 33, 2 November 2026; mandatory first-turn draw correction applied.** Source: authenticated original Aichi 2026 rank-29 physical 60 in [full-decklists.json](full-decklists.json). The original source contains exactly **4 Basic Iron Thorns ex, 2 Camping Gear, 2 Tropical Beach, and 1 Double Colorless Energy (DCE)**. This is a source-locked idealized resource model, not a game simulator, action policy, or competitive win rate.

## Specific choice and observation boundary

Condition on the opening seven containing at least one Basic, at least one Camping Gear and at least one Tropical Beach. Starting Active uses one Basic; the mandatory draw at the start of the owner's first turn restores hand size to **7**. Playing one held Beach into an initially empty Stadium zone leaves **6** cards, so Beach can draw **1** card, ending the turn. The initial-turn resource comparison therefore sees **two total natural/draw-effect cards**: one mandatory draw and one Beach draw. Alternatively, Camping Gear searches for any one deck-resident card, then ends the turn; Beach placement can precede that search. Neither terminal action can be followed by an attachment or attack that same turn. Assumptions: both Actions remain legal; no prior draw/search, Stadium lock, Item lock, extra mulligan draw, opponent interaction or already-in-play Stadium; uniform shuffled opening seven and six unknown Prizes. The searched target is **DCE**, which can be unavailable if Prized.

K0 means the player does not already know their six Prizes. When DCE was absent from the seven, the remaining card is uniformly distributed among **53** cards, of which **6** are Prizes and **47** form the deck. Camping Gear can search it with probability **47/53**; Beach's next two draws hit it with probability **2/53**. When DCE was initially in hand, either line retains DCE possession. These probabilities measure *holding the target by the end of the turn-ending action*, not being able to attack immediately.

| Event, under the specified first-seven model | Exact result |
| --- | ---: |
| Both terminal cards held, conditional on a legal opening Basic | **3.41909418%** |
| DCE initially held, conditional on Basic + Camping + Beach | **7.32602330%** |
| DCE in hand after Gear or initially held, conditional on Basic + Camping + Beach | **89.50860641%** |
| DCE in hand after Beach or initially held, same condition | **10.82315449%** |
| Gear-minus-Beach DCE possession probability, same condition | **78.68545192 percentage points** |

Opening-hand inclusion-exclusion uses exact integers:
\`J = sum_{S subset {Basic,Camping,Beach}} (-1)^|S| C(60-sum_{i in S} n_i,7)\`, where \`(n_B,n_C,n_T)=(4,2,2)\`. The count without DCE in hand is the same formula with population **59**. Let \`H=J-J_noDCE\`. Then the conditional Gear-access numerator is \`53H+47J_noDCE\` and Beach-access numerator is \`53H+2J_noDCE\`, each over \`53J\`. Thus Prized DCE is explicitly included.

## Stronger two-piece test: DCE **and** Thunder Mountain by the next own-turn draw

DCE alone cannot pay the intended Iron Thorns ex first-attack line without the separate printed **Thunder Mountain Prism Star** cost reduction (and other legal attack conditions). Original rank29 contains **one Thunder Mountain ♢** as well as one DCE. The exact model now evaluates possession of **both** by the owner's next ordinary draw after the terminal opening action, assuming no other draw/search, with the same six unknown Prizes.

| Initial pieces within Basic + Gear + Beach first seven | Conditional probability |
| --- | ---: |
| Both DCE and Thunder already held | **0.41028915%** |
| Exactly one held | **13.83146829%** |
| Neither held | **85.75824256%** |

If one piece is missing, Gear may search it with probability **47/53**. If neither piece is held, Gear sees the mandatory first-turn draw before searching: that card may itself be a missing piece, or Gear may search one piece before the following ordinary turn draw discovers the other. This succeeds with probability **3×46/(53×52)**, after accounting for Prizes. Beach sees the mandatory first-turn draw, its own one-card draw and the next ordinary draw, for three random draws altogether. If exactly one piece is missing, it is among these three with probability **3/53**. If both are missing, both appear with probability **6/(53×52)**.

| Two-piece resource condition | Probability, given Basic + Gear + Beach opening |
| --- | ---: |
| Have both DCE and Thunder by next ordinary draw, Gear search line | **16.97006636%** |
| Have both by next ordinary draw, Beach draw line | **1.37990399%** |
| Gear-minus-Beach two-piece access | **15.59016236 percentage points** |

This exposes why a one-resource metric can be misleading: **89.51% DCE possession after Gear** becomes only **16.97% two-piece access by the following ordinary draw**. The larger bottleneck is the missing second singleton. Even successfully acquiring both cards does not certify an attack: Stadium replacement rules, manual attachment quota, the owner going first/second, Item/Ability locks, opposing play and native Store settlement still apply. The model counts already-held dual resources in both branches, although that rare opening may support a superior immediate attack without either terminal action.


**Correction history.** The first saved v2 two-piece Gear estimate **14.13842627%** omitted the compulsory draw at the beginning of turn one. Under the same opening-seven and Prize constraints, the corrected Gear result is **16.97006636%**. Beach's dual-piece result remains **1.37990399%** because the earlier three-total-draw count was right, although the division between compulsory and Beach draws was wrong. The original target-only DCE figures are unchanged. The paper rule is the [Pokémon TCG rulebook, Turn Actions: draw first](https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/rulebook/swsh7_rulebook_en.pdf#page=10). Retain superseded figures in this note for audit instead of silently erasing the mistake.

## Decision significance and limits

This establishes a **target-specific resource asymmetry** that a generic draw-volume or "available terminal move" scorer could miss: when a singleton Special Energy is urgently required for a planned future attack, Gear has much higher immediate target access than Beach under the stated constrained conditions. It does not establish a universally optimal action. Camping Gear uses an Item and ends the owner's turn, while Beach draws multiple potentially useful cards and remains a Stadium. Playing Beach before Gear creates a future *opponent* Beach activation opportunity; its net utility depends on public hand size, available setup/disruption, opponent abilities, lock effects and future turns. Source rank29 has two Camping Gear and two Beach; the model does not treat holding both as an automatic obligation to play either.

The independent [Agent20 opening overlap](agent20-rank6-rank7-turnending-paper-contract-20261101.md) obtains the same **3.41909418%** co-held-conditional incidence. The [original-source native Beach paired study](agent33-first-original-beach-sixpair-native-20261101.md) confirmed two genuine Beach placements and uses with opponent continuation, but those were selected physical deals; this exact model does **not** assert the same branches also held Camping Gear. Source-policy competence and native-selected co-held choice remain untested.

## Reproduction

- Code: [source-locked exact model](../../simulation/evaluation/agent33-rank29-beach-camping-prize-access.cjs), reads the authentic original source 60 and fails closed on count changes.
- Tests: [small independent enumeration, singleton and dual-piece conditional probabilities, identity drift](../../tests/agent33-rank29-beach-camping-prize-access.test.cjs). Three tests passed locally with Node; no new automatic CI workflow.
- No simulator winner, game length, seat outcome, original-source policy competence, paper 25-minute clock, or competitive field result is claimed. **Qualified games: zero.**

**Next falsifiable native test:** Capture a source-rank29 physical turn with owner-held Camping Gear and Beach, both native-legal, then compare a single original-source-deal pair: Beach placement followed by *either* Camping Gear DCE search or Beach two-card draw, logging exact source hand/Prize access under owner-appropriate knowledge, both accepted terminal actions, actual native prompts, physical zones, the next opponent turn and possible opponent Beach use. Keep the paired result censored if missing any gate. Do not promote it to a matchup win rate.
