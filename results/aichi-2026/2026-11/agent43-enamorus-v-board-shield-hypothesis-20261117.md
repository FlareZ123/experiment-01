# Enamorus V as a non-Tool board-wide Ability shield for Shadow Rider

**Agent 43 · 17 November 2026 · Hypothesis, not a tested interaction**

## Why this is worth testing

The current Hood Shield candidate uses two Stealthy Hoods to protect individual Pokémon from effects of the opponent's Pokémon Abilities. The Expanded-legal Enamorus V (Lost Origin 82; repository card ID swsh11-82) has a potentially broader protection ability that is not itself a Pokémon Tool:

> Prevent all effects of your opponent's Pokémon's Abilities done to each of your Pokémon that has any Psychic Energy attached to it, except any Enamorus V.

This is a potentially useful fit for Shadow Rider because:

- Shadow Rider Calyrex VMAX is Psychic type, and Underworld Door naturally attaches Psychic Energy to Benched Psychic Pokémon.
- The current candidate has 11 Psychic Energy, 4 Fog Crystal and 4 Mysterious Treasure. Fog Crystal searches a Basic Psychic Pokémon; Mysterious Treasure searches a Psychic or Dragon Pokémon. Enamorus V is a Basic Psychic Pokémon and can be reached by existing search cards.
The fixed list currently has 18 Pokémon and 14 Basics. Adding Enamorus while cutting a Trainer/Energy would make 19 Pokémon and 15 Basics; replacing a Basic Pokémon would keep 18/14; replacing a non-Basic Pokémon would keep 18 Pokémon but raise the Basic count to 15. The displaced slot and revised mulligan distribution must be recorded in any variant.
- Guardian of Love is not a Tool and is not conditional on Enamorus V being Active. If it functions as written, it can protect every one of the candidate's Pokémon that has Psychic Energy attached, rather than only the Pokémon carrying an individual Stealthy Hood.
- Enamorus V itself is expressly excluded from its own protection. A Stealthy Hood attached to Enamorus V may therefore be the relevant way to keep the shield active against an opposing global Ability-lock effect.

This suggests a different allocation of the existing two-Hood package: one Hood on Enamorus V to protect the board-wide shield, with the second Hood retained as a reserve. It is a structural hypothesis, not evidence that the candidate should add Enamorus V.
Do not assume Enamorus must always carry a Hood. The anchor Hood is relevant when the opponent's Ability effect would suppress or directly affect Enamorus itself (notably Initialization / Garbotoxin); against an Ability effect aimed only at another Psychic-Energy-attached Pokémon, Guardian of Love may work from an unhooded Enamorus. Enamorus is excluded from its own protection, so it remains a valid target for effects such as Dusknoir's Cursed Blast. The test matrix separates these states.

## Field relevance

Agent17's exact field-pressure inventory identifies ranks **6, 24 and 29** as Iron Thorns lists with Initialization, and ranks **8 and 22** as Absol/Garbodor lists. Those are direct reasons to test this architecture: the candidate's main acceleration is Shadow Rider's Underworld Door, and Guardian of Love may protect Psychic-Energy-attached Shadow Riders from the opponent's Ability suppression. This is distinct from the direct Tool-removal threat: Enamorus does not stop Field Blower, Megaton Blower or Faba.

For Iron Thorns specifically, Enamorus V is itself a Rule Box Pokémon and would be subject to Initialization. A Hood on Enamorus is therefore the proposed anchor. Agent17's evidence reconciliation now records a successful pinned native Store/effect test of Stealthy Hood on Shadow Rider VMAX under Active Iron Thorns (workflow run 38829270890, pinned Twinleaf revision a9905a76a6c4103ba4b6cb9a49e86bad795c5c05), plus the official Mega Clefable ex Q&A for the identical prevention clause. That existing test validates the Hood/Initialization mechanism on Shadow Rider, not the Enamorus architecture. The new, untested extension is whether Guardian of Love prevents Initialization from suppressing the other Psychic-Energy-attached Pokémon while Enamorus itself is protected by Hood. Do not rerun or duplicate the existing Hood test; test the Enamorus layer separately.
 
Rank 31 adds a second concrete target: its Dusknoir Chimecho list contains three Dusknoir and one Field Blower. The official Japanese [Dusknoir Cursed Blast Q&A](https://www.pokemon-card.com/rules/faq/search.php?sc_group_id=917) rules that Cursed Blast may select a Pokémon protected by Mega Clefable ex's Luminous Wing, but places no damage counters on that Pokémon; Dusknoir is still Knocked Out and processing ends. This is strong analogous support for Guardian of Love preventing Cursed Blast damage counters on a Shadow Rider with Psychic Energy attached, but no direct Enamorus/Cursed Blast ruling was found. The board-wide shield could therefore be relevant to rank31 as well as ranks 6/24/29 and 8/22.

## Critical interaction to resolve

The repository card text for Garbodor (Breakpoint 57; xy9-57) says that while it has a Pokémon Tool attached, each Pokémon in play, in each player's hand and in each player's discard pile has no Abilities except Garbotoxin.

That creates a precise interaction question:

1. Enamorus V is explicitly excluded from Guardian of Love's own protection.
2. Garbotoxin's text includes Enamorus V among the Pokémon whose Abilities are suppressed.
3. Stealthy Hood prevents effects of an opponent's Pokémon's Abilities done to the Pokémon it is attached to.
4. If a Hood on Enamorus prevents Garbotoxin from suppressing Enamorus, does Guardian of Love then prevent Garbotoxin's suppression effect on the other of the candidate's Pokémon that have Psychic Energy attached?

The official Pokémon Asia [Enamorus V Q&A](https://asia.pokemon-card.com/ph/rules/search/?keyword=Enamorus) confirms the general prevention scope: it rules that Hatterene VMAX's Ability can be activated but its effect on a protected Pokémon is prevented, and that Radiant Charjabug's Ability effect is prevented when Psychic Energy is attached to a protected Pokémon. The Q&A does **not** address Garbotoxin specifically.
The official Japanese [Stealthy Hood Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E9%9A%A0%E5%AF%86%E3%83%95%E3%83%BC%E3%83%89) separately confirms that Quick Shooter cannot place damage counters on a Hooded Pokémon. Its Garbotoxin example also shows the boundary: a Hood attached to your Garbodor does not protect an opposing Slaking from Garbotoxin. The proposed architecture is different—the Hood protects Enamorus itself, and Enamorus's own Guardian of Love would protect the other Psychic-Energy-attached Pokémon. No direct official Hood-on-Enamorus / Garbotoxin ruling was found.


The wording and official Q&A strongly motivate the proposed test, but the continuous-effect / prevention interaction with Garbotoxin has **not** been confirmed here by a specific paper ruling or a validated Twinleaf test. Do not treat the combo as established until it is tested. In particular, do not assume Guardian of Love protects itself; the card explicitly excludes Enamorus V.

## Boundaries and costs

- Guardian of Love protects only against effects of the opponent's Pokémon's Abilities. It does not prevent Item, Supporter, Stadium, attack or Tool effects.
- Each protected Pokémon must actually have Psychic Energy attached. A Shadow Rider VMAX without Psychic Energy is not covered.
- Spreading Psychic Energy across every Pokémon you want protected competes with attack setup and hand resources. Underworld Door can supply Psychic Energy to Benched Psychic Pokémon, but the policy must measure whether the energy distribution needed for protection delays attacks or leaves a key target uncovered.
- Enamorus V itself is excluded. It may need a Stealthy Hood to survive a global Ability lock such as Garbotoxin.
- Stadium effects such as Silent Lab or Path to the Peak are not Pokémon Abilities and are not stopped by Guardian of Love or Stealthy Hood. Enamorus V itself is vulnerable to those Stadiums: it is both a Basic Pokémon and a Rule Box Pokémon V, so Silent Lab or Path to the Peak can shut off its Ability.
- Enamorus V is a 210-HP, two-Prize Basic Pokémon V with a two-Energy retreat cost. It adds a gust/KO target and a deck slot; the candidate's existing 2-Prize map must be reassessed.
- Guardian of Love works from the Bench, but Enamorus consumes one Bench slot. The current 60 has only Sky Field ×1 and Dimension Valley ×1; Agent17's field inventory counts Stadium-removal cards in 20/29 exact lists. If Sky Field is removed, the Bench limit returns to five and the player must discard excess Benched Pokémon, potentially forcing a choice between Enamorus, Shadow Rider engine pieces and other support. Measure the actual Bench plan with and without Sky Field rather than assuming the extra slot is free.
- The variant's displaced card matters to setup math: replacing a non-Basic card raises the candidate from 14 to 15 Basics; replacing a Basic keeps it at 14. Recompute paired mulligans and opening consistency from the actual 60, rather than carrying the baseline 14-Basic distribution forward.
- If Enamorus V is Knocked Out, the board-wide protection disappears. Night Stretcher can recover a Pokémon, but it does not recover a discarded Hood.
- The candidate already has Acerola ×1 and VS Seeker ×2. If Enamorus has damage counters, Acerola can return Enamorus and all attached cards (including its Hood) to hand before it is Knocked Out; VS Seeker can later recover Acerola. This preserves the Tool but costs the Supporter turn and temporarily removes the board-wide shield, so test it as a tempo / resource line rather than assuming it is free.
- Field Blower and Megaton Blower can still remove the Hood attached to Enamorus V. The second Hood is a reserve, not immunity to repeated removal.
- The card's attack can attach up to two Basic Energy from discard to Benched Pokémon, but that attack is not assumed to be a meaningful substitute for the candidate's current energy engine.

## Energy distribution and Stadium trade-off (18 November correction)

The printed effects make Psychic Energy distribution **damage-neutral at fixed total Energy**, not a one-for-one trade between Max Geist damage and protection:

- Let (E) be the number of Psychic Energy cards attached to all of your Pokémon. Max Geist deals (10+30E), regardless of which Pokémon carry those Energy cards. Psychic Energy attached to Enamorus V still adds 30 damage even though Enamorus V is excluded from Guardian of Love.
- Guardian of Love requires a Pokémon to have **any Psychic Energy attached**; it does not require that Pokémon itself to be Psychic type. Underworld Door has the narrower target restriction: it can attach only to a Benched Psychic Pokémon. A non-Psychic Pokémon can therefore be protected if Psychic Energy reaches it by the manual attachment or another effect, but Underworld Door cannot seed it.
- For a turn on which a Shadow Rider Calyrex VMAX actually uses Max Geist, the attack's Energy cost limits how many distinct Pokémon can receive the shield. This candidate contains only Basic Psychic Energy. Let (m) be the number of non-Enamorus Pokémon in play that could be protected, including the Active Shadow Rider attacker. Without Dimension Valley, the attacker needs 3 Psychic Energy; one qualifies it for Guardian of Love and the other two are attack-payment overhead. The ideal upper bound is therefore (C_{max}=min(m,E-2)), for (Ege3). With Dimension Valley, Max Geist costs one Colorless Energy less, so two Psychic Energy suffice and (C_{max}=min(m,E-1)), for (Ege2). If no Max Geist attack is required that turn, the pure allocation bound is (min(m,E)). These are allocation ceilings, not setup probabilities or proof that every target can be reached in time.
- Sky Field and Dimension Valley are mutually exclusive Stadiums. With Enamorus on the Bench, the normal five-Bench limit leaves at most (m=5) non-Enamorus Pokémon in play; Sky Field raises the limit to eight Bench Pokémon and thus at most (m=8). Dimension Valley saves one Energy for Max Geist but retains the five-Bench limit. At full board capacity:

| Total Psychic Energy (E) | Max Geist damage | Sky Field: maximum protected | Dimension Valley: maximum protected |
|---:|---:|---:|---:|
| 3 | 100 | 1 | 2 |
| 4 | 130 | 2 | 3 |
| 5 | 160 | 3 | 4 |
| 6 | 190 | 4 | 5 |
| 7 | 220 | 5 | 5 |
| 8 | 250 | 6 | 5 |
| 9 | 280 | 7 | 5 |
| 10 | 310 | 8 | 5 |
| 11 | 340 | 8 | 5 |

  If the actual board has five or fewer non-Enamorus Pokémon, Dimension Valley is never worse for this protection ceiling and can be one target better when Energy is the binding constraint. Sky Field becomes valuable when the plan genuinely needs more than five non-Enamorus Pokémon in play; it does not reduce Max Geist's cost. The table assumes the Energy can be distributed to the intended targets. Underworld Door cannot directly seed non-Psychic targets, and the Sky Field board must survive the Stadium-removal / forced-discard line already described above.
- **Connector cost remains real.** Fog Crystal's Enamorus line competes with Shadow Rider V and Psychic Energy; Mysterious Treasure's line competes with the other Psychic/Dragon targets and consumes a discard. Enamorus should be accessed when the observed Ability-lock threat and current resource state justify it, not automatically because a search route exists. This is the candidate-specific connector-domination issue, not free access.

One additional interaction is worth retaining as an **unverified consequence**, not a claim: if a Hooded Enamorus keeps Guardian of Love active through Garbotoxin or Initialization, a manual Psychic attachment to the Active Shadow Rider may make that attacker eligible for protection immediately; its Underworld Door could then seed a Benched Psychic Pokémon, which may itself become protected and regain access to its own Underworld Door. Whether this seed-and-spread sequence works under the exact continuous-effect timing must be established by a direct ruling or a native test after the existing V3 first-trace stopline. Do not use it as current deck-strength evidence.

## Controlled interaction matrix

Do not add Enamorus V to the nominated 60 before the V3 acceptance and first natural-terminal trace stopline clears. Afterward, test this as a separate one-card candidate variant, retaining both Hoods initially and recording which card is displaced.

| Scenario | Required observation |
|---|---|
| Enamorus V in play, Hood attached to Enamorus, Garbotoxin active; Shadow Rider has Psychic Energy | Does Hood preserve Enamorus's Guardian of Love, and does Guardian of Love prevent Garbotoxin from suppressing the protected Shadow Rider? |
| Same board, then Field Blower removes Hood from Enamorus | Does Guardian of Love cease protecting the Shadow Rider? Can the reserve Hood restore the shield on the same turn? |
| Enamorus V in play without a Hood, Garbotoxin active | Confirm that Enamorus is suppressed because it is excluded from its own protection. |
| Opponent's Basic Ability lock / Wobbuffet | Check whether Enamorus remains active under the exact Ability text and whether the protected Shadow Riders remain covered. |
| Silent Lab or Path to the Peak | Confirm these Stadium effects are not prevented by Guardian of Love; record the candidate's Stadium answer. |
| Shadow Rider with no Psychic Energy attached | Confirm that the Pokémon is not protected until Psychic Energy is attached. |
| Rank31 Dusknoir Cursed Blast targets a Shadow Rider with Psychic Energy | Are damage counters prevented by Guardian of Love while Dusknoir still self-KOs, matching the official Luminous Wing Q&A? |
| Dusknoir targets Enamorus V itself | Confirm that Enamorus is excluded from its own protection and that Hood is required to protect it. |
| Enamorus V damaged, Acerola used before KO | Does Acerola preserve Enamorus and its attached Hood; what Supporter/tempo cost and rebench timing result? |
| Enamorus V Knocked Out or gusted | Measure the two-Prize cost and loss of the board-wide shield. |
| Field Blower / Megaton Blower / Faba | Distinguish discard, full attached-Tool sweep and Lost Zone placement; do not conflate their recovery options. |

## Evidence status

- **Card-text facts:** repository card database entries for Enamorus V (swsh11-82), Stealthy Hood (sm10-186), Garbodor (xy9-57), Fog Crystal (swsh6-140), Mysterious Treasure (sm6-113), and Shadow Rider Calyrex VMAX (swsh6-75).
- **Candidate facts:** current fixed 60-card JSON; 11 Psychic Energy, 4 Fog Crystal, 4 Mysterious Treasure, 2 Stealthy Hoods.
- **Hypothesis:** a Hood-protected Enamorus V may provide a board-wide ability shield to the candidate's Psychic-Energy-attached Pokémon. The separate Stealthy Hood / Iron Thorns mechanism on Shadow Rider already has a pinned native test; the Enamorus extension does not.
- **Unresolved:** whether Guardian of Love prevents Garbotoxin's continuous suppression effect on the protected Pokémon while Stealthy Hood preserves Enamorus itself. Also unresolved are simulator support, field-wide value, slot cost and win-rate effect.

This is a high-value interaction to test, not a deck change or a claim of competitive improvement.
