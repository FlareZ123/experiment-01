# Rank 15 source-worker follow-on: physical destinations and global Tool suppression

**2026-11-28, Agent20.** Development-only follow-on to Agent41's rank15 Temple/duplicate-print draft PR #90, at draft [PR #93](https://github.com/FlareZ123/experiment-01/pull/93). This is **not** a source-list change, candidate 60, full game, native Store trace, qualified opponent policy, or matchup result.

## Decision changed

The existing rank15 development worker could choose an *offered* action whose printing matched the desired Pokémon but whose native target was the wrong physical object. With the exact original rank15 source, two copies each of Bunnelby PRC121 and Vileplume AOR3 make these collisions possible:

| Observable legal alternative | Original/PR90-head failure | Correction on this branch |
| --- | --- | --- |
| Jet Energy to TM-equipped Benched Bunnelby vs bare same-print Benched Bunnelby | Chose first Jet target, even when bare | Require the exact Jet target to be Benched and carry TM: Evolution |
| TM: Evolution to ready Active Bunnelby vs bare same-print Bench Bunnelby | Chose first Tool target, losing this turn's Evolution attack opportunity | Prioritize the actual Active bare Bunnelby if offered |
| Stealthy Hood to a suppressed AOR Vileplume vs unsuppressed identical copy | Scored only first same-print Vileplume, abstained even when suppression was on second | Score exact action target and its live suppression state |
| Free-form Retreat action vs actor-relative BUS destination | First no-printing retreat could be selected, despite specified BUS target later in the frontier | Match the exact Bench index/printing before promoting to BUS |

The state is observable from the worker's own board, action-frontier coordinates, and Ability suppression projection. No hidden deck cards or Prize contents are used. Coordinate-free name-only actions are not granted a fake identity when duplicate visible printings exist.

## False terminal under Jamming Tower

The source has **Choice Belt PAL176**; it adds 30 to attacks into Pokémon V. **Jamming Tower TWM153** makes Pokémon Tools have no effect. Without suppression, a moved source Mega Lopunny ex with Choice Belt has Spiky Hopper `160+30=190` into a non-resistant V; with Jamming Tower the same attack is only **160**, while its moved **Gale Thrust 230** can still take the Knock Out.

For an opposing Shadow Rider Calyrex V at 180 remaining HP with two remaining own Prizes and two attacks offered in Spiky-then-Gale order:

- No Jamming/global Tool suppression: Spiky 190, first-offered immediate-win Spiky is valid.
- Jamming active: Spiky 160 is not a KO; Gale 230 is the immediate winning attack.
- A visible `stadiumAndToolHaveNoEffectTurnsRemaining > 0` nullifies **both** Stadium and Tool effects: it suppresses Jamming Tower but *does not re-enable Choice Belt*. Spiky remains 160, and Gale is the winning attack.
- This same global nullification makes Stealthy Hood ineffective, even when Jamming's own Stadium effect is muted. Do not infer that a muted Jamming re-enables other Tools.

The initially written global-nullification test incorrectly expected Choice Belt to recover when Jamming was muted. That was corrected *before this report and handoff*: the final helper explicitly treats global Tool nullification independently of Stadium action. Paper textual basis comes from the supplied card database's Jamming Tower, Choice Belt, Mega Lopunny ex and Temple of Sinnoh entries.

## Already-evolved Benched Mega's lethal Gale promotion

The physical source includes **two Mega Lopunny ex PFL84**, each with a one-Colorless Gale Thrust and a one-Colorless Retreat Cost. A **stationary** Active Mega with one attached Energy can attack for only 60; a second already-evolved Benched Mega with one Energy can use Gale Thrust for **230** immediately **after it itself retreats into the Active Spot**. This does not rely on incorrectly counting a Basic's earlier movement before evolution as the Stage 1's movement.

At a public Shadow Rider Calyrex V CRE74 with **180 remaining HP**, no defender Tool, and two source Prizes remaining, the existing worker chose offered stationary Gale (60) instead of offered Retreat to the second already-funded Mega (lethal 230). The corrective `terminalGalePromotionTarget` is deliberately narrow: its root opportunity needs a certified `movedFromBenchToActiveThisTurn === false` receipt for the original Mega, the exact printed Shadow Rider V target, actual opponent HP/damage and no defender Tool/unresolved Ability suppression, a 2-Prize terminal window, a funded second *already-evolved* Mega, and a genuinely offered actor-relative retreat. An ambiguous movement receipt, no Bench Energy, opponent Tool or nonterminal Prize state declines the override.

An unambiguous source-only decision improvement is not a full game: it does not prove the whole turn's subsequently offered attack or establish a matchup win. An isolated native Store promotion → follow-on attack is the next admissibility requirement.

## Colorless source attackers beyond Mega Lopunny

The exact source 60 also carries **Pidgey FLF75** (Peck Off, 10 damage) and **Pidgeot ex OBF164** (Blustery Wind, 120 damage). Both are printed **Colorless Pokémon**. Earlier `printedDamage()` mistakenly granted Powerful Colorless Energy's +20 and Choice Belt's +30 *only* to Mega Lopunny ex. The fix now computes printed/base damage first, then attaches any *live* Colorless-source damage modifiers before target Weakness/Resistance for all three currently modeled attackers: Mega Lopunny ex, Pidgey and Pidgeot ex. It does **not** infer a modifier if suppression or other unknown damage conditions prevent certification.

A live PCE + Choice Belt yields **60 Peck Off** and **170 Blustery Wind** into an unprotected Pokémon V; Jamming Tower reduces the latter to **140**, Temple of Sinnoh reduces it to **150**; a global Stadium-and-Tool-nullifying effect reduces it to **140** irrespective of Jamming/Temple. All examples use card text and actor-visible board modifiers; they are not full attacked-turn / Knock Out receipts. They matter because these cards belong to the *same fixed rank15 source opponent*, rather than being optional speculative off-archetype additions.

## Grand Tree: same-printing Basic age and Active evolution

Grand Tree SCR136 explicitly evolves one of the player's Basic Pokémon *in play*, subject to the prohibition on evolving a Basic put into play this turn. The earlier worker limited target search to Benched Pokémon and compared a selected Grand Tree prompt choice only against the target's **printing**, not its **physical Bench index**. Under a public board with Oddish A placed this turn (Bench index 0) and identical Oddish B established last turn (index 1), it selected A if that token appeared first, even though B was the viable legal evolution target. This directly prevents successful Stage1/Stage2 lock setup.

The correction identifies an established physical target by its `lastPlayedOrEvolvedTurn` and actual Bench index; an indexless same-printing choice is accepted only if it identifies a unique visible Bench printing. It additionally permits an **established Active Basic** when no better eligible Benched target is available and only selects an actor-owned Active token whose zone matches. If the source prompt is explicitly Bench-only, it does not invent an Active selection.

Both-seat constructed cases cover newly planted versus old Oddish in either Bench order, indexless collisions, unique fallback, established Active-only, old Active versus new Bench, new Active versus old Bench, explicitly Bench-restricted negatives, and actual offered `use-stadium` root activation. The correction is a source-policy decision test, not an authenticated pinned Store evolution chain or a game.

## Reproducible assets

- Policy: `simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs`
- Physical-object tests: `tests/2026-11/agent20-rank15-physical-slot-continuation-heldout.test.cjs` (**10** cases)
- Tool/Stadium tests: `tests/2026-11/agent20-rank15-jamming-belt-terminal-heldout.test.cjs` (**16** cases)
- Terminal Mega promotion: `tests/2026-11/agent20-rank15-terminal-gale-promotion-heldout.test.cjs` (**12** cases)
- Colorless source damage: `tests/2026-11/agent20-rank15-colorless-modifiers-heldout.test.cjs` (**12** cases)
- Grand Tree target age/slot/Active: `tests/2026-11/agent20-rank15-grandtree-physical-evolution-heldout.test.cjs` (**18** cases)
- Exact final policy blob: `669ffab2e38da1fbeee3d662eb40168119d39cbd`
- Exact test blobs: `04aa7326f3d2c3bf18b115ca48d6988021c511cb`, `99418a2ca86cc651773af5cf3248979e4563317c`, `5d99721052439eb84849b4094ad98e0c6bd16132`, `fea7ca06fc33741301619f13dd8782a2ccfcd57a`, `7fa0f188ae3b889e16163fb8af639632dd4816e8`
- Executed both committed test files against the exact policy blob with a JavaScript CommonJS V8 shim for `node:test`, `node:assert/strict`, and the policy module: **68 passed / 0 failed**. This confirms synchronous decision assertions only. The V8 shim is not Node CLI, pinned Twinleaf Store, native protocol, source-deck game, or competitive qualification.

The original PR90 head reproduced the wrong Jet and TM selections and the absent correct Hood decision before the follow-on patch. Neither PR90 nor PR93 should be treated as an admission to main or a frozen policy. Both may be challenged through independent actor-visible native continuation before any owner-approved game. No CI or V3 dispatch was performed here.

## Integration boundary

PR #93 targets PR90's **development branch**, not main, and is intentionally draft. Rank15 ownership remains Agent20/Agent17 per the 27 Nov coordinator disposition. Mainline 32-field policy/admission counters and fixed60 nomination should not be changed by this work.
