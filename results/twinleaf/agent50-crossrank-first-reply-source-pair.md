# Frozen rank6/rank11 panel: exact source-line pairing and immediate candidate replies

**Agent 50, 19 October 2026.** Secondary read-only audit of Agent41's preregistered exploratory partition 0. No simulator rerun, deck edit, source action intervention, or competitive inference. This note adds source-line and reply-specific facts absent from the earlier CI aggregate. The [original registration](../aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json) governs all 48 planned arms; this note examines only the first 24 run.

## Evidence integrity

Frozen [compiled run 39193837824](https://github.com/FlareZ123/experiment-01/actions/runs/39193837824), artifact [12161805529](https://github.com/FlareZ123/experiment-01/actions/runs/39193837824/artifacts/12161805529), `agent41-crossrank-observed.json`. Retrieved actual ZIP through GitHub's artifact service and decoded the JSON without invoking the engine. ZIP SHA-256 `59f79ff8be5fe50b19ad701614c7051b21183563f492a16d87c8b1a72aeba627`, inner JSON 111,811 bytes, SHA-256 `098efa1da50a3a3152abda50001ab3071b3ff3a99cc2e9ab63902c8c0d64960a`. Source head `16ed358b5f0324dba10762e67f9bf286c833af49`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

All 24 first-partition arms are retained (12 unique rank/repeat/physical candidate-slot streams each applied to two frozen candidate rosters). There were 13 engine terminals, 10 action caps or unfinished games, one Store-rejected action. There are 11/12 strata with equal **first recorded source hand + actual first player**, but equality of later source attack/lock opportunities is a separate gate.

## The only matched completed source opening across two candidate rosters

The pair `6:0:A:champion-reference` vs `6:0:A:new-moon-lockbreaker-v1`, source rank6 Iron Thorns (source physically B/1, actually going second), has both source opener policy audits `turn2.started:true`, `turn2.completed:true`, and `abortReason:null`. The observable first source hand, reported actual start, and complete source-policy event sequence are identical. In both, the owner-visible source policy executes:

`Guzma & Hala → discard Player's Ceremony + Team Flare Grunt → search Thunder Mountain Prism Star + Double Colorless Energy → play Stadium → attach DCE → announce Volt Cyclone`.

This establishes a real source **action sequence**, under the registered constrained policy. Source attack-log declarations are recorded, but neither printed damage nor independent paper/clock correctness is certified by this archive.

The candidate's **first actual post-attack turn 3** differentiates the frozen rosters:

| Arm | First candidate reply after the same source opener | Later archived engine result |
| --- | --- | --- |
| Champion Shadow Rider | Bench Tapu Lele-GX, attach Psychic Energy, play Sky Field, use Lillie's Determination and support Basics, then announce **Pale Moon-GX on turn 3** | Candidate slot A engine terminal winner on turn prior to action 93, three logged candidate attack declarations |
| New Moon Lockbreaker v1 (English proxy) | Attach **Telepathic Psychic Energy**, resolve its prompt, then **Pass turn 3**; first later logged candidate attack is **Hidden Power on turn 5** | Source slot B engine terminal winner after 240 actions, one logged candidate attack declaration |

The first candidate reply is directly recorded in the 12-item post-source response selection, with a real `AttackAction` or `PassTurnAction`. The larger source attack declaration totals later diverge 1 vs 7, showing how the candidate's changing board and responses alter the game. These are **two distinct candidate structures and unqualified generic-policy continuations**. This paired source opportunity is a high-value **decision-quality review target**, not a causal estimate of inventory advantage or win probability.

## Two unmatched source signature arms with additional decision evidence

- **Rank6 repeat2 candidate-slot A:** New Moon's source opponent successfully begins on global turn3 with a genuine `Tag Call → Guzma & Hala` line, discarding Enhanced Hammer and Team Rocket's Handiwork, searching DCE, playing Thunder Mountain and announcing Volt Cyclone. New Moon's next global turn4 attaches Psychic Energy, plays Lillie's Determination and **passes**. The paired champion arm **fails at root 33** with `PlayCardAction BLOCKED_BY_EFFECT` before a complete source opportunity record exists. This is a **missing paired mechanical outcome**, and that error must never be encoded as a champion loss.
- **Rank11 repeat2 candidate-slot B:** Against champion Shadow Rider, the source rank11 (actual second) completes its global-turn2 direct `Boost Shake` and legal Garbodor-search and target steps; next turn its audit records `equippedGarbodor:true`. The candidate's first turn3 response develops with VMAX/Psychic Energy/Hisuian Heavy Ball/Dialga-GX/Guzma then **passes**; another Pass follows at turn5. Against New Moon on the **same source first recorded hand and actual starting player**, rank11 direct signature has **`opportunityTurn:null`** and never executes. New Moon later chooses an owner-visible Field Blower to remove a real Garbodor Float Stone at global turn35. That legitimate later Tool response cannot be presented as a response to the same early rank11 Boost Shake line. New Moon's game reaches the root-action cap with zero candidate logged attacks.

Across 12 registered pair strata, only **one** has the policy's special signature **completed in both candidate arms** (rank6 repeat0 slotA). Two other strata exhibit the signature in only one candidate arm, one because the counterpart ended with an exception. The remaining nine strata have no registered special-source signature in either arm. This is a *source-policy exposure comparability count*; routine source attacks also occurred elsewhere and remain distinct.

## Specific next falsification

Audit the **turn-3 New Moon Pass after the verified source Volt Cyclone** with its *own observed hand*, attached Energy, Active/Bench, GX-used state, actual legal alternative attacks and opponent next reply. Ask whether the Pass was inevitable under the frozen 60's real available actions, a consequence of the registered generic bot policy, or avoidable through legitimate source-visible decisions. Use the pinned Store's actual accepted candidate actions and effect logs. One selected seed is a mechanical diagnostic; do not reclassify it as confirmatory strength evidence. The rank11 matched-start but unmatched-lock pair should be separately traced for what public/own-hand state prevented the opening trigger, rather than counted as comparative lock success.

**Current gate:** no 60-card list promoted, three exact Aichi ranks still missing (23, 25, 28), zero competitively qualified games, 99.5% unproven. Full tournament timing, paper legality and autonomously competent bilateral policy remain unresolved.
