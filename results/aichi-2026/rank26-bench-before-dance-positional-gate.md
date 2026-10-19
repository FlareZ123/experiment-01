# Rank26 Meloetta first-turn: bench-before-Dance positional necessary condition

**Agent 4, 19 October 2026.** Evidence class: exact source 60-card inventory + printed card rules + state-transition necessity. No engine wins, no confirmed successful first-turn Crisis Punch from a random source opening.

## Source cards and necessary attack resource

The exact [rank26 published source](full-decklists.json) has one **Meloetta ex BLK 44**, one **Tapu Koko Prism Star TEU 51**, two Basic Lightning, one **Double Colorless Energy SUM 136**, two **Technical Machine: Crisis Punch PAF 90**, one **Float Stone BKT 137**, one **Escape Rope BST 125** and one **Dowsing Machine PLS 128**. The source does not contain Energy Switch, another Energy accelerator, Switch, Field Blower or Tool Scrapper. No card is silently substituted.

* Printed [Crisis Punch](https://asia.pokemon-card.com/ph/card-search/detail/11180/) costs **three Colorless** and can be used only when the opposing player has **exactly one Prize remaining**. A Tool user must be able to attack, and the Tool must occupy its sole Tool slot.
* [Meloetta ex](https://limitlesstcg.com/cards/BLK/44)'s Debut Performance permits first-player attacks, conditional on its Ability working; it does not supply Energy or alter the printed Crisis Punch cost.
* [Tapu Koko Prism Star](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/sm9/51) / [printed transcription](https://www.serebii.net/card/teamup/051.shtml) can attach one Lightning Energy from discard to each of **two selected Benched Pokémon** when its Dance of the Ancients Ability resolves. It cannot attach that Lightning directly to an Active Meloetta.
* [Advanced Player Rulebook](../../resources/advanced-players-rulebook.md), sections C (Energy), A-03 (Retreat) and B-02 (Tools): one normal manual Energy attachment per turn, one retreat per turn, and one attached Pokémon Tool per Pokémon without freely replacing it. Card-text exceptions must be checked individually.

In the **ordinary printed-source first-player Crisis Punch line**, the source's single DCE must be the manual attachment to Meloetta (supplying two of the three required Energy), and the third Energy must come from Koko's Dance. Since Koko targets Benched Pokémon, **Meloetta must be on the Bench when Dance resolves** and must later occupy the Active Spot to attack with Crisis Punch.

This is a necessity statement for the identified first-turn DCE + Koko line. It does not assert that enough Lightning was discarded, a legal second recipient exists, Koko's Ability survives opposing locks, the DCE is available, the opponent is at one Prize, or the attacking Tool can be reached.

## Opening-position and Tool-slot consequences

| State or choice | First-turn implication |
| --- | --- |
| Meloetta already Benched when Dance is used | Positionally eligible to receive Koko Lightning; afterwards needs **one** Bench-to-Active transition and the other attack requirements |
| Meloetta chosen as starting Active | Must move Active → Bench **before** Dance and Bench → Active **after** Dance; at least **two** position transitions, costing switch/retreat resources |
| Float Stone attached to a nonattacking pivot | Can make a normal retreat into a powered Meloetta possible, provided the pivot is Active and other restrictions are met |
| Float Stone attached directly to the intended Meloetta | Occupies the same Tool slot required by Crisis Punch. With **no printed source Tool-removal card** it obstructs the immediate TM attack, even if retreat becomes free |
| Dance blocked by opposing active Iron Thorns ex | Must first find and execute a legal unlock such as the source's single Canceling Cologne and account for Meloetta's first-turn attack permission as well |

One illustrative *resource-conditional* starting-Meloetta route is **Escape Rope to move Meloetta off Active; Koko Dance to the now-Benched Meloetta; give Float Stone to the replacement Active; retreat the replacement back to Meloetta; attach TM to Meloetta**. This requires appropriate Bench targets, cards, Energy, attachment sequencing and attack conditions, and may fail when a lock or retreat prohibition applies. Another possible route could use Dowsing Machine to reuse a discarded switch Item, consuming the only ACE SPEC. Neither is certified as a complete first-turn win line.

For a non-Meloetta starter, one successful Active-position transition may be enough. Thus choosing Meloetta as the setup Active **solely because it is the desired first-turn attacker is an unsound heuristic** for the Koko-centered 60. The game-state policy must plan the Dance recipient, tool recipient and eventual Active promotion jointly.

## Why this matters for the ongoing source studies

The registered [24-deal first-turn exposure cohort](rank26-firstturn-prospective-policy-exposure.md) treated opening Meloetta in play as a useful initial descriptor. That is a legitimate descriptive statistic, but **initial Active Meloetta is not equivalent to attacker readiness**. The newer [48-deal integrated policy protocol](rank26-integrated-seed-correction-v2.md) observes firstturn Meloetta card placement, Quick Ball, Dowsing and root attacks. It should interpret any real attack in light of this explicit **Bench-at-Dance + Tool-slot + move-to-Active** resource chain. Adding hand-only search improvements does not prove the chain.

Useful falsification tests for a future native Store/source-policy fork: capture source owner-visible and public board at Dance resolution, verify Meloetta's actual position, exact recipient card references and placed Lightning, Tool on Meloetta, DCE attachment, final Active transition, one-Prize condition, then a printed first-player attack and the real next opposing decision. Preserve both eligible and negative source seeds. No result from the existing weak-bot four-case panel or first-turn readiness calculation is a qualified win-rate denominator.

**Status remains 29/32 exact published opposing 60s and zero qualified competitive games.**
