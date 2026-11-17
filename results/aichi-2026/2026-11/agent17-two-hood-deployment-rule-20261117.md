# Two-Hood deployment rule across Aichi Tool-removal matchups

**Agent 17 · 17 November 2026**

## Conclusion

Hood Shield v1 has two Stealthy Hood copies, but the correct deployment is opponent-dependent. Do not attach both Hoods to different Pokémon while a known one-copy Field Blower remains available unless the board requires immediate two-target protection. Against the Aichi rank1 and rank31 lists, one Field Blower can discard both attached Tools in a single play. Rank7 is more hostile: it has Field Blower ×1, Megaton Blower ×1 (which discards all attached Tools), and Faba ×2 with VS Seeker/Lusamine recovery. Keeping the second Hood in the deck/hand preserves a reserve against a single answer, but does not create a durable lock against rank7's removal suite.

This is a resource-allocation heuristic, not a guarantee that the opponent will draw or play Field Blower, and not a matchup win-rate claim.

## Exact list facts

| Seat / rank | Relevant Tools and counters |
|---|---|
| Hood Shield v1 | Stealthy Hood ×2; Field Blower ×1; Arven ×1; Acerola ×1; VS Seeker ×2 |
| Rank 1 Shadow Rider | Field Blower ×1 |
| Rank 3 Snorlax Stall | Tool Jammer ×1; Faba ×1; Snorlax PGO 55 ×3 |\n| Rank 7 Snorlax Stall | Tool Jammer ×1; Field Blower ×1; Megaton Blower ×1; Faba ×2; VS Seeker ×3; Lusamine ×2; Snorlax PGO 55 ×2 |
| Rank 15 Lopunny Vileplume | Stealthy Hood ×2; no Field Blower or Faba |
| Rank 31 Dusknoir Chimecho | Field Blower ×1 |

Field Blower discards up to two Pokémon Tools and/or Stadiums in play. If both candidate Hoods are attached when the opponent plays it, the opponent can remove both at once. The rank31 report specifically identifies this as the opening for Dusknoir PRE Cursed Blast; the rank1 mirror report identifies the same one-card two-Hood answer.

## Rank7 multi-layer Tool-removal suite

Rank7 is not a single-Field-Blower matchup. Its published list has Tool Jammer ×1, Field Blower ×1, Megaton Blower ×1, Faba ×2, VS Seeker ×3, and Lusamine ×2. Megaton Blower discards **all** Pokémon Tools attached to all of the candidate's Pokémon in one play; Faba can remove one attached Tool and is recyclable through the Supporter recovery package. Holding the second Hood avoids exposing both to one Field Blower, but Megaton Blower can remove every attached Hood and Faba can continue stripping later copies. The candidate's own Field Blower can remove the Active Tool Jammer to enable the immediate Hood escape, but it does not answer the opponent's subsequent Megaton/Faba package.

Rank7's Wobbuffet PHF36 Bide Barricade removes Abilities from non-Psychic Pokémon while Wobbuffet is Active. Hood Shield's core Psychic Pokémon—including Shadow Rider VMAX and Latias ex—are exempt, so do not spend Hood merely to protect Underworld Door or Skyliner from Wobbuffet. Rank7's Mimikyu PAL97 Safeguard prevents damage from attacks by Pokémon V and Pokémon ex; Shadow Rider VMAX and Lillie's Clefairy ex cannot damage it, so the candidate needs a non-V/non-ex attacker such as Trevenant & Dusknoir-GX or its own Mimikyu. See the [rank7 Snorlax/Megaton Blower matchup audit](agent17-rank7-snorlax-megaton-blower-hood-resource-war-20261117.md).

## Rank31 same-turn Cursed Blast caveat

The reserve-Hood heuristic is **not** a same-turn rescue against rank31. Agent44's pinned-source audit shows that Dusknoir PRE Cursed Blast places 13 damage counters (130 damage) on an opponent's Pokémon that already has damage counters, then self-KOs even if prevention applies. The opponent can play its singleton Field Blower, remove the one attached Hood, and use Cursed Blast on that same turn. Holding the second Hood preserves future protection after Field Blower is spent, but cannot be attached during the opponent's turn and does not save a currently damaged target that is already within the 130-damage KO range. Rank31's Dusknoir BCR / Radiant Alakazam MoveDamage effects can also rearrange damage counters; the exact source/prompt audit is Agent44's `agent44-rank31-dusknoir-field-prompt-and-hood-counterline-20261115.md`.

Therefore, against rank31, the deployment policy must track each Pokémon's printed HP H and existing damage D: after Hood is removed, Cursed Blast is lethal when D + 130 ≥ H (and the target already has at least one damage counter). For Hood Shield v1's exact printings:

| Candidate Pokémon | HP | Existing damage needed for a Cursed Blast KO |
|---|---:|---:|
| Shadow Rider Calyrex VMAX | 320 | 190 |
| Trevenant & Dusknoir-GX | 270 | 140 |
| Shadow Rider Calyrex V | 210 | 80 |
| Latias ex | 210 | 80 |
| Lillie's Clefairy ex | 190 | 60 |
| Dialga-GX UPR 100 | 180 | 50 |
| Tapu Lele-GX | 170 | 40 |
| Radiant Eternatus | 170 | 40 |
| Girafarig | 90 | any existing damage (at least 10) |
| Marshadow | 80 | any existing damage (at least 10) |
| Mimikyu | 70 | any existing damage (at least 10) |

The second Hood is a reserve against later turns, not a complete answer to Field Blower + Cursed Blast on one turn. Damage-counter movement from Dusknoir BCR / Radiant Alakazam can change these thresholds before Cursed Blast resolves.

## Acerola as proactive Cursed Blast target denial

Hood Shield v1 also contains Acerola ×1 and VS Seeker ×2. Against rank31, if a high-value Pokémon already has damage counters and would be in range of Cursed Blast after Field Blower removes its Hood, the candidate can use Acerola on its own turn to return that damaged Pokémon and all cards attached to it to hand. This removes that Pokémon as a Cursed Blast target because Cursed Blast requires damage counters. The opponent cannot respond with Field Blower + Cursed Blast until its next turn, so this must be proactive rather than a response to the opponent's sequence.

This is not blanket protection: Cursed Blast can target any of the candidate's damaged Pokémon, so other damaged targets remain legal. Acerola consumes the Supporter for the turn (competing with Arven, Guzma, and draw Supporters), costs tempo, and returns the Pokémon's attachments; the candidate must re-establish the Pokémon and its Energy/Tools. It is one copy, though the two VS Seeker can recover it later because rank31 has no persistent Item lock. This is a conditional target-denial line, not a tested matchup result.

## Deployment policy

1. **Ranks 1 and 31:** while the opponent's Field Blower remains unspent, attach only the Hood needed for the current protected line and preserve the second. If the opponent uses its single Field Blower on that Hood, the second copy can be attached afterward; the published list has no second Field Blower. Do not treat this as absolute: if two protected Pokémon are both necessary to avoid an immediate loss, the board may justify exposing both.
2. **Rank 3:** Arven can search Field Blower + one Hood together. Remove the Active Snorlax's Tool Jammer, attach Hood to the trapped Active, and retreat immediately. Preserve the second Hood for Faba; the opponent has Faba ×1, plus VS Seeker ×3 and Lusamine ×2, so the reserve is not infinite.
3. **Rank 7:** the reserve-Hood heuristic is much weaker because Megaton Blower removes all attached Tools and Faba ×2 is recyclable via VS Seeker/Lusamine; use the candidate's Field Blower to clear Tool Jammer for the immediate escape, but do not treat two Hoods as persistent protection. Acerola remains an emergency bypass if the trapped Active is damaged.\n4. **Rank 15:** the opponent's published list has no Field Blower or Faba. AOR3 locks Item cards, not Pokémon Tools: Stealthy Hood can be attached after the lock, and Arven remains playable as a Supporter to search Hood + Field Blower during the lock (Hood can be attached; Field Blower remains unplayable). The pre-lock window matters only if Field Blower is needed to remove an active Path to the Peak/Silent Lab or attached opposing Hoods.
5. **Mirror use of the candidate's own Field Blower:** it can remove the opponent's attached Hoods, but the decision should be based on which protected Ability is currently carrying the opponent's engine, not simply on maximizing the number of Tools discarded.

## Evidence boundary

- Candidate and opponent counts are direct facts from `results/aichi-2026/full-decklists.json`.
- Field Blower's two-Tool mode and the Hoods' protection text are printed-card facts.
- The rank1 one-Field-Blower warning is recorded in Agent50's DCI/AMR policy spec; rank31's exact two-Hood removal and resulting Cursed Blast route are recorded in Agent44's rank31 source/prompt audit.
- Rank3's Field Blower + Hood escape has a staged native sequence (CI 43369854490, 4/4), but Arven source-dealt access remains untested.
- This report does not establish the probability of drawing/playing Field Blower, the probability of retaining both Hoods, or any matchup win rate. No new fixture, policy, deck variant, or CI run was created.

## Follow-up after the V3 acceptance gate

A source-dealt policy evaluation should record the opponent's remaining Field Blower/Faba counts and the candidate's Hood zones. It should compare (a) one Hood held in reserve, (b) both Hoods deployed, and (c) the second Hood attached only after the one-copy Field Blower has been spent. Do not dispatch that evaluation while the current shared freeze remains active.
