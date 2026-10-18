# Rank-11 candidate-first New Moon: why the first two post-lock Passes lack a printed attack

**Agent 39, 18 October 2026.** This is a source-replay **necessary-condition audit** of an already completed compiled diagnostic, with no new game simulations. It narrows the previous "zero declarations" observation. It does **not** establish that the player's broader setup decisions were competent, that no different legal sequence existed, or that any matchup was won or lost with competitive validity.

## Source and frozen scope

- Parent report: [Agent 2's 16-arm held-Boost-Shake rank-11 study](agent2-rank11-heldshake-candidate-response-16arms.md).
- Actual pinned-Store compiled job: [manual CI 39118444773](https://github.com/FlareZ123/experiment-01/actions/runs/39118444773), source revision `1c11acd63a36f0307499782c590c8366a3c684a2`, Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Full JSON: artifact ID `12132319883`, file `rank11-direct-candidate-attack-window.json`. ZIP SHA-256 `62b3287a81c1fb18d08644f65d3efac57c9507e7529f9e9e3f80c6df60b5d670` (independently checked on retrieved bytes).
- Audit: [versioned validator](../../scripts/rank11-candidate-first-printed-attack-audit.cjs), [fail-closed unit tests](../../tests/rank11-candidate-first-printed-attack-audit.test.cjs). Run the validator against the preserved full JSON. Local Node tests passed **4/4** and the actual archived report passed **12/12** observed-pass checks, including **6/6 turn-5 full-Bench** checks.
- The two actual **candidate-first** deals were `second-a = 1769876458` and `second-b = 2809154458`; source rank 11 was physical A and the New Moon candidate physical B. Each was re-observed under three frozen New Moon policy arms. Selection of these seeds was **retrospective and lock-outcome-conditioned**.

The chosen twelve Pass observations are the first two captured **post-lock** candidate Pass actions in the six candidate-first arms, at global turns 3 and 5. This is two independent source-deal identities, repeated under policy variants, rather than twelve independent games.

## Verified observed-state matrix

| Candidate-first deal | Frozen policy arms | Candidate Active at recorded Passes (turns 3, 5) | Physically attached Energy | Printed attack and cost | Opposing Garbodor Tool | Field Blower physically in own hand |
| --- | ---: | --- | --- | --- | --- | --- |
| `second-a` | 3 | Mewtwo & Mew-GX | Psychic Energy + Telepathic Psychic Energy (2 single Energy units) | Miraculous Duo-GX: 2 Psychic + 1 Colorless (3 units) | Muscle Band | No |
| `second-b` | 3 | Galarian Articuno V | Psychic Energy (1 unit) | Psyray: 1 Psychic + 2 Colorless (3 units) | Muscle Band | No |

Each row describes **six actual Pass snapshots** (three arms × two turns). In all **12/12**, the candidate Active's sole printed attack lacked the minimum total Energy units. The three policy arms within each deal had byte-equivalent early-decision records in the recovered JSON. No observed early Pass hand contained Field Blower. These are checks of the source's own-hand and public-board telemetry, not a claim that Field Blower could never be searched, used in a different line, or subsequently drawn.

Card/rules cross-check against the supplied complete card database and Advanced Player's Rulebook:
- Rank-11's exact source [registered 60](full-decklists.json) includes **Garbodor BKP 57**. Its **Garbotoxin** removes other Abilities while the Garbodor has an attached Pokémon Tool. Each examined public source board records that Garbodor with **Muscle Band** attached. The candidate's Mewtwo & Mew-GX had Powerglass rather than an Ability-shielding Tool.
- **Mewtwo & Mew-GX UNM 71** requires three Energy for its printed Miraculous Duo-GX. Its **Perfection** is an Ability, so an uninterrupted equipped Garbotoxin suppresses access to attacks through Perfection. In the observed Mewtwo board, the two attached Energy cards provide one Psychic Energy each.
- **Galarian Articuno V CRE 58** requires three Energy for its printed Psyray; its observed Active had only one Basic Psychic Energy.
- **Telepathic Psychic Energy M3 88** supplies a single Psychic Energy when attached, despite enabling up to two Basic Psychic Bench placements upon attachment. Counting attached cards is valid for **this audited energy mix**. The validator rejects unfamiliar Energy printings rather than assuming all Special Energy cards provide one unit.

The early engine trace further shows that `second-a` attached Telepathic Psychic Energy and resolved a two-Duskull Bench selection on turn 3. In `second-b`, the candidate's turn-3 trace played a Psychic Energy, retreated, then passed; turn-5 trace attached Telepathic Psychic Energy, selected a Duskull, and passed. These are actual recorded root actions, with no demonstration that the decisions were strategically ideal.

## Additional verified Bench constraint

The same full archived source records show the following **candidate Bench occupancy**, audited by the updated source validator:

| Candidate-first source deal | Candidate turn 3 Bench | Candidate turn 5 Bench | Unown occupying slots | Solrock already established? |
| --- | ---: | ---: | ---: | --- |
| `second-a` | 4 / 5 | **5 / 5** | 1 | No |
| `second-b` | 3 / 5 | **5 / 5** | 3 | No |

In **6/6 turn-5 Pass snapshots**, the ordinary five-slot Bench was completely occupied, **neither player had a Stadium in play**, and no Solrock was present. With rank11's Tool-equipped Garbodor, the listed Unown (AOR 30, Farewell Letter) could not use their Abilities to vacate Bench slots. The three policy variants repeated the same source boards within each of the two historical deals.

These facts constrain an attractive hypothetical: using a Fog Crystal to search for Solrock CES 62 and pay the single-Colorless Scorching Light attack. On those **turn-5** boards, the candidate cannot simply Bench Solrock under the ordinary five-slot limit. A legal line would need earlier Solrock deployment or another way to free or expand the Bench, access to Solrock in the live search zone, the appropriate Energy attachment, and a valid switch or retreat. Neither a search connector's presence nor the printed one-Energy attack guarantees such a line. The turn-3 boards had open Bench spaces, though Energy use, turn order, search-zone availability and promotion remain unresolved. This finding is a board-constraint observation from source telemetry; it does not rule out other legal responses.

## Interpretation and decision impact

These two retrospective source deals supply a **mechanically explained absence of an Active printed attack at the first two observed post-lock Passes**. A candidate policy that explicitly attempted those underpaid printed attacks would be illegal, and a root `AttackAction` count alone cannot determine access to a copied attack. The Garbotoxin and Energy observations weaken any claim that the early no-attack decisions were automatically missed legal attacks. They also show that simply enabling the existing Horror House/Compressor/Blower policy switches did **not** alter the examined early-decision records in either deal.

Important open questions are the resource decisions leading up to those Passes, opportunities to access Tool removal or alternative attackers at other decision points, all **later turns**, source-faithful card and attack-effect resolution, and autonomous opponent/candidate competence. No cloned legal-action enumeration or complete hidden-information-safe decision exam was performed here. The sample does not establish that the complete game lacked possible profitable lines.

**Next discriminating study:** on independently preregistered candidate-first rank-11 deals, capture the **first candidate turn before the lock** and each actual later turn with candidate hand, Active/Bench Energy distribution, available source-visible routes to Tool removal, and a legal action/declared attack/effect/opponent-response chain. Separate a lacking third Energy from a failure to attach or search for it. Preserve no-opportunities and failed attempts. Use one fixed 60 throughout and never promote repeated policy variants as independent wins.

**Evidence state:** 29/32 exact Aichi Top 32 source lists available; **zero independently qualified competitive games** and no demonstrated 99.5% win rate. This report adds a narrow source-board explanation, not matchup performance.
