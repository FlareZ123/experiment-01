# Rank-11 turn-23 Crobat Stone / Dark Patch counterattack frontier

**Correction (Agent 35, 19 October 2026):** The six-Prize figure below is an observer error: it counted six Prize *containers*, including those already emptied. The genuine source owner had **two occupied Prize cards** at turn23, confirmed in [compiled corrected census and Store branch](rank11-turn23-crobat-stone-terminal-counterfactual.md). The source-owned Shopping Center, Forest Seal Stone, Dark Patch, retreat and Venomous Fang sequence completed via real Store actions and changed the selected-seed engine winner to rank11 on turn23. The original six-Prize / nonterminal KO interpretation in this historical report is superseded. This selected deal remains outside matchup win-rate inference.

**Agent 29, 19 October 2026.** A source-conserved prerequisite audit, followed by a deliberately marked **unqualified counterfactual hypothesis**. This report is not a win-rate estimate, a claim of optimal play, or a paper-qualified game. It uses the identical retrospectively selected rank-11 versus New Moon game already under review by Agents 8, 13 and 35.

## Exact source and replay

- Published opponent: rank 11, Wataru Yano, **Absol/Garbodor**, unchanged registered 60 in `results/aichi-2026/full-decklists.json`.
- Candidate: fixed **New Moon Lockbreaker English mechanics proxy 60**, physical B (seat 1); source rank11 physical A (seat 0), **actually first**.
- Frozen full-match seed: **`1111464409`**, selected retrospectively after a favorable candidate engine outcome. Frozen engine: Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Underlying nonterminal copied Poltergeist, authentic next source actions and opponent Bench contraction: [Agents 35/8 compiled source run 39158329417](https://github.com/FlareZ123/experiment-01/actions/runs/39158329417), artifact **12147813055**.
- **New reproducible source-zone test:** `simulation/twinleaf/rank11-turn23-crobat-stone-frontier.cjs`, existing *manual-only* `.github/workflows/aichi-lock-board-tests.yml`, [compiled successful CI run 39179161163](https://github.com/FlareZ123/experiment-01/actions/runs/39179161163), archived **artifact 12155722192** (`rank11-crobat-stone-counterfrontier`). Observer-on/off full root-action ledger, final Prizes and winner were asserted identical. The snapshot is taken after the actual bot selects an action, never used to change its decision.
- The source snapshot is taken at the genuine next rank11 decision **after Shopping Center replaced Sky Field and its Bench-reduction prompts resolved**, before the generic policy's subsequent Marnie.

## Actual physical prerequisite audit

| Source-visible or retrospective physical fact | Measured at authentic source turn23 |
| --- | --- |
| Source VSTAR Power previously used | **No**, `usedVSTAR=false` |
| Registered rank11 Dark Patch copies | **3** total |
| Dark Patch still in the physical deck | **2** |
| Dark Patch already in discard | **1** |
| Dark Patch in hand, Prizes, Lost Zone | **0 / 0 / 0** |
| Basic Darkness Energy in the discard | **3**, from previous Mega Absol knockout |
| Source's Benched Crobat V DAA | **1 basic Darkness**, **no Tool** |
| Source's Benched Latias ex SSP | **Forest Seal Stone SIT attached** |
| Source's Benched Garbodor BKP | **no Tool**, so its Tool-dependent Garbotoxin is inactive |
| Shopping Center EVS in play | **Yes**, newly played this turn |
| Opponent's Active Mewtwo & Mew-GX UNM | **200 preexisting damage**, with Powerglass |
| Opponent Mewtwo & Mew-GX printed HP | **270**, according to supplied card pool |
| Source Prizes remaining | **6** |

**Correction of an observer-field pitfall.** The generic `source-zone-checkpoint.cjs` snapshot's `PokemonCardList.hp` field reports `0`; this field is *not* the Pokémon card's printed maximum HP. The first version's `targetReachableBy70` predicate therefore had an unreliable HP operand even while recording the correct 200 damage. The corrected research script explicitly reads `state.players[1].active.getPokemonCard().hp` and asserts the exact Mewtwo printing and **270 HP**. An additional manual compiled run is needed to certify the corrected implementation; the 270 printed figure is independently checked against `card-list.zip`.

From the supplied printed cards, Crobat V's **Venomous Fang** costs one Darkness and one Colorless Energy and deals **70 damage**. Dark Patch can attach a basic Darkness Energy from discard to a **Benched Darkness Pokémon**, including Crobat V. The target has **70 remaining HP** before modifiers (270 − 200), exactly the attack's printed damage. The TAG TEAM knockout would ordinarily take **three Prizes**, reducing rank11 from six to three, so this is a significant response but **not an immediate game win**. Printed final-damage prevention/modifier fidelity must still be audited.

## Specific legal-action candidate to falsify the baseline policy

The baseline source turn23 played Float Stone at ordinal 217, Shopping Center at 218, resolved opponent Bench contraction at 219, played Marnie at 220 and eventually passed at ordinal 223. A strong-source-policy counterfactual can change the choice at ordinal220 while conserving the initial deal and all prior actions:

1. Activate Shopping Center's once-per-turn Stadium effect; return the existing Forest Seal Stone from source Latias ex to source hand.
2. Attach that Stone to the already-Benched Crobat V, a Pokémon V with an empty Tool slot.
3. If the actual power remains available, invoke Crobat's Tool-granted **Star Alchemy**, legally search one of the **two currently decked Dark Patch** copies, then shuffle.
4. Play Dark Patch; attach one of the three discarded basic Darkness Energy cards to the Benched Crobat. It then has two Darkness Energy cards, satisfying Darkness + Colorless.
5. Retreat the original Active Mega Absol ex to Crobat V. Its original source Float Stone remains attached and may reduce retreat costs; Latias ex's Skyliner can also support a zero-Retreat-Cost Basic under applicable conditions.
6. Declare **Venomous Fang** into the original 200-damaged Mewtwo & Mew-GX; record real Store attack declaration, damage/Knockout, Prize transition and the candidate's ensuing legal response.

**Executable fork** now exists at `simulation/twinleaf/rank11-turn23-crobat-stone-store-fork.cjs`. It uses actual `UseStadiumAction`, `PlayCardAction`, `UseAbilityAction`, `ResolvePromptAction`, `RetreatAction` and `AttackAction` through the pinned Store. It reads the full own deck **only after a Star Alchemy search prompt is legitimately issued**, preserving information-set correctness at the original decision. A labeled manual workflow invocation has been dispatched as [run 39179931821](https://github.com/FlareZ123/experiment-01/actions/runs/39179931821). **Results pending at the time of this report; do not describe the attack as completed until that run and its action artifact are examined.**

## Interpretation, blockers and next proof

The new census closes the narrow question of **actual physical Energy, Dark Patch and unused VSTAR availability** at this retrospective source decision. It directly strengthens the case for testing opponent-policy competence rather than accepting the generic bot's Pass. It does not establish the complete line's attack legality, final Store outcome, paper rules, best use of Star Alchemy, adversarial candidate reply or official 25-minute event result.

Preserve any unsuccessful action/prompt result as a real negative control. If an actual source action is illegal, specify the first failed prompt or rule. If the fork reaches a KO, measure both sides' Prize trajectories and realistic subsequent response, and only then consider whether this is a better source policy on other, prospectively chosen deals. The existing selected seed must **never** enter the field win-rate denominator.

**Collective target status remains 29/32 exact source opponent lists; zero independently qualified competitive games; no demonstrated 99.5% fixed deck.**
