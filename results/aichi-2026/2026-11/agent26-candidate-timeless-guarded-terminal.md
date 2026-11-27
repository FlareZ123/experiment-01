# Candidate terminal planning: reserve Guzma across protected Apex and the Timeless bonus turn

**Conditional card-text decision model; not a deck nomination, native game or win-rate result.** Complement to Agent26's opponent-side [denial model](agent26-regidrago-get-lost-denial.md) and Agent8's [post-Timeless follow-up](agent8-post-timeless-mimikyu-followup-policy-20261113.md). Rather than retest the Copycat mechanic or simply compare second attacks, optimize the first and second Supporter allocation against adversarial promotion.

## Material distinction between the fixed profiles

The original nine authenticated Regidrago inventories have Rolling Iron (Hisuian Goodra VSTAR LOR 136) in ranks 10/14/18/21/32 and Covert Flight (Noivern ex PAL 153) in 12/13/14/20/21/27/32. Their union is all nine. This identifies possible effects, not frequency or current attack history. Hood has Pokémon Ranger STS 104, Lockbridge does not; both have Guzma BUS 115, two VS Seeker and the same Mimikyu/Dialga/Radiant Eternatus core. Neither list is changed.

Constructed state: candidate needs 4 Prizes, has paid Mimikyu, actual prior outer Apex Dragon, Dialga-GX in own discard and unused GX, live Fairy Zone, five attached Psychic Energy and a paid Max Geist pivot. Opponent has full 280-HP Regidrago VSTAR Active with the known Rolling Iron or Covert Flight effect, another full VSTAR and a 30-HP Budew on Bench. All three are consistent with the nine inventories. Assume real legal Guzma own-side positioning (including return to the intended attacker if needed) and no unmodeled suppression or modifiers. This is not a natural reachability assertion.

- Timeless-GX hits 300 against a full unprotected Dragon with Fairy Zone. Against Rolling Iron it hits 220, not enough. Against Covert Flight it does zero because Mimikyu is Basic. Both are temporary attack effects on the defending Pokémon and expire by the end of the current candidate turn; switching it to Bench also removes them (manual I-A-03, II-C-03/C-05, E-01). Ranger removes them immediately. Do not infer that having the donor in the list proves the effect is live.
- With just one executable Guzma, first gust to the unprotected VSTAR takes 2, but opponent can promote Budew and deny the second two-Prize KO. Worst-case guarantee is 3, not 4. Spending the initial attack on the protected Active cannot produce two KOs in two attacks here.
- **Hood:** use Ranger first (actual accessible Supporter; no simultaneous Guzma), then Copycat→Apex→Timeless against protected Active for 2, retaining Guzma for the bonus turn. If the opponent promotes Budew, gust the second VSTAR; otherwise no gust needed. With the certified Max Geist pivot, four Prizes are guaranteed in this constructed state. The prior opponent turn remains the only Copycat-history source; do not grant a fresh opponent attack during Timeless.
- **Lockbridge:** two actually executable Guzma uses, one per turn, recover the same guarantee by first gusting the unprotected VSTAR and then gusting the other if Budew is promoted. Merely listing VS Seeker is not enough; test hand/discard access, locks, own-switch route, and Supporter capacity. If there is no decoy, a single gust suffices (mandatory promotion). This is a candidate-policy planning distinction, not evidence Hood is globally better.
- If choosing Full Moon Rondo as the bonus-turn finish, recalculate both benches **after** the first KO and replacement promotion. At 5 combined Benched Pokémon damage against the full Dragon is 240; at 6 it is 280. With a fixed own bench and initially two opposing benched Pokémon, the total drops by one following the KO. Do not use the pre-Timeless count. Allow real additional benching if independently available; the model assumes fixed own bench count.
- Second Copycat→Apex→Power Beam can KO the remaining VSTAR at 400 with Fairy Zone if the Radiant Eternatus donor is actually in discard and Copycat is payable/eligible. Max Geist does 320 at five Psychic Energy; Shred ignores damage-prevention effects on the target but retains Weakness and does only 160 with Fairy Zone. Direct terminal non-GX attacks should be considered before spending GX.

## Actual solution and tested output

[Planner](./agent26-candidate-timeless-guarded-terminal.cjs), [reproducer](./agent26-candidate-timeless-guarded-terminal.test.cjs), [12 raw check receipts](./agent26-candidate-timeless-guarded-terminal.json). The planner enumerates initial Supporter use and attack, then every possible opposing promotion and best certified bonus-turn attack/target. It maximizes the minimum Prize conversion over opponent promotions. The twelve cases passed in isolated JavaScript V8 with an assert shim (not Node CLI, not native worker). Run `node results/aichi-2026/2026-11/agent26-candidate-timeless-guarded-terminal.test.cjs` from repo root for actual Node reproduction.

| Constructed conditional case | Guaranteed Prizes |
|---|---:|
| Rolling Iron, one Guzma, no Ranger | 3 |
| Ranger then reserved Guzma | 4 |
| Two executable Guzma uses | 4 |
| Ranger available, bonus gust unavailable | 3 |
| Fairy Zone off | 2 |
| Covert Flight, one Guzma, no Ranger | 3 |
| Covert Flight, Ranger first | 4 |
| No decoy, one Guzma | 4 |
| GX already spent | 1 |
| Rondo-only follow-up, five combined post-KO Bench | 3 |
| Rondo-only follow-up, six combined post-KO Bench | 4 |
| Radiant donor and live second Copycat | 4 |

## Integration boundary

Provide to Agent46/31 as a concrete two-profile decision case under their approved scope. No new actor schema, worker, workflow, native fixture or frozen deck changes. The model is strictly conditional: first Copycat and Dialga access are preconditions, certified branch-specific mobility/payment is abstracted by booleans, and there are no other damage modifiers, resistance/weakness except the specified Fairy Zone, protection beyond the modeled effects, new cards drawn, future attachments, responses, bench-out terminal calculation, or side effects on own Pokémon. The second attacker flags presume the correct branch-specific own positioning and resources have been established; one must not apply the guarantee directly to arbitrary actor observations. The nested Timeless line is strongly supported but not an exact direct official adjudication (Agent50's existing evidence note); the native production Copycat path is still gated. No game or competitive performance inference. Ranks 23/25/28 missing; 29/32 original source inventories, 0/32 qualified matchups, no fixed champion and no 99.5% result.
