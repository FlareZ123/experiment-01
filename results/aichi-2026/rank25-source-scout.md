# Rank 25 Raichu Electrode: source-backed adversarial-policy scout

**Agent 14, 16 October 2026.** Status: *qualitative pilot account, incomplete deck source*. This note is a test-design input, not a 60-card opponent list or matchup-win estimate.

## Identity and source confidence

The ranked [Aichi Top 32 field](field.csv) identifies rank 25 as Kazuki Kumegawa, Raichu Electrode Combo, but its exact 60 cards are unavailable in the [29-list importer](full-decklists.json). A Japanese Top-32 compilation connects the **kume** player to a Raichu one-shot archetype and links his [May 14 tournament account](https://note.com/kume_pokeca/n/n6cfd126f5774). The account explicitly states qualifying **25th** at 7-1 and losing the first Top-32 match to Mega Absol/Garbodor. This is strong rank/archetype attribution but *not* proof of the precise registered card list or printings.

Sources:
- [Tournament-scout compilation, page 2](https://pokekameshi.com/cl2026aichidec-extra/2/)
- [kume's first-person tournament account, published 14 May 2026](https://note.com/kume_pokeca/n/n6cfd126f5774)
- [Published source-card inventory](full-decklists.json)

The detailed deck-construction section of the source account is behind a payment boundary. No exact 60-card inventory or Pokémon official deck code was verified. Rank 25 must remain **missing** under the raw-evidence validator and 32-placement readiness ledger. Another published Raichu list is not a transparent substitute.

## Directly reported tournament encounters

The first-person account describes these Swiss games, in sequence:

| Round | Opponent described by pilot | Pilot went | Outcome |
| --- | --- | --- | --- |
| 1 | Regidrago | First | Win |
| 2 | Regidrago | Second | Win |
| 3 | Lightning toolbox | First | Win |
| 4 | Regidrago | Second | Loss |
| 5 | Regidrago | First | Win |
| 6 | Roaring Moon | Second | Win |
| 7 | Regidrago | First | Win |
| 8 | ADP / Dragonite | First | Win |

Top-32 elimination: Mega Absol / Garbodor, pilot **second**, loss.

Thus the author *reports* 4-1 against five Swiss Regidrago opponents. These are self-reported historical tournament outcomes with unknown opponent lists, policies, and validation; they cannot be treated as independent identical-matchup simulations or a 80% predictive win probability.

## Pilot-described counterplay that automated policies must acknowledge

The Japanese account explicitly frames the opposing Regidrago lines as:
1. **Regidrago player first:** use fast draw/discard, Bench Regidrago V, attach Energy, then consider an Active Wobbuffet/other lock; threaten evolving and attacking with Apex Dragon on the next turn.
2. **Regidrago player second:** establish Budew and use Itchy Pollen as immediate Item disruption while developing Regidrago.
3. **Raichu pilot first:** consider Active Ability suppression to disable opponent's Basic Latias ex / Tapu Lele-GX access early, while preparing a way to answer a later Itchy Pollen.
4. **Raichu pilot second:** develop under existing Wobbuffet/Ability lock/Path to the Peak; plan to survive or prevent an early Regidrago VSTAR attack.

These are **reported planning principles**, not mechanically verified policies. The pilot explicitly discusses Klefki, Wobbuffet and early Garbodor as lock approaches and the opportunity costs of each. The narrative supports *considering* Basic-Ability lock as part of the rank-25 adversarial threat model. It does not certify any particular card copy is in rank 25's registered deck.

### Concrete policy-evaluation requests

- In a seeded full-game test with a *published* Raichu list, confirm the bot can take meaningful setup actions before attempting its damage-combo finishing line. Mere play-card volume or a completed match is inadequate.
- Use a real Klefki-active board fixture and verify Tapu Lele-GX/Latias ex access is conditionally suppressed, while non-Ability or evolved routes remain evaluated correctly. Check printed effect and game rules before generalizing.
- Test the candidate's response to going-second Budew Item lock when the Supporter for the turn is contested. A Pokémon Ranger line must compete with other Supporter needs.
- For Wobbuffet boards, validate suppression and turn-order transitions at the actual Active position before inferring setup capability from a source-list inventory.
- Do not merge or pool rank-25 outcomes with ranks 4 and 17 until card identities and policy comparability have been established.

## Limitation and next source target

The first-person record validates **adversarial questions worth testing** and the rank/strategic identity. It does not resolve the unavailable exact 60-card opponent source. Attempt to obtain a public Pokémon official deck-code link or complete visible registered image attributed directly to the rank-25 player; otherwise preserve the rank as unknown in full-field statistical bounds.
