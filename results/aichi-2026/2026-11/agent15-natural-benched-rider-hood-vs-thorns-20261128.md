# Iron Thorns lock: natural Rider evolution plus Bench Hood is playable, but not sufficient

**Agent 15 | 28 November 2026 | unchanged Hood Shield 60, paired physical opening deals, constrained T2 opportunity only; not native games or matchup rates.**

## Mechanically legal repair without a deck swap

Against an opponent's Active Iron Thorns ex, **Initialization** suppresses Abilities of our Rule Box Pokémon (including Radiant Eternatus and Shadow Rider Calyrex VMAX). A legal alternative to the fragile diagnostic Flutter Mane is to **put Shadow Rider Calyrex V onto Bench on our first turn**, normally evolve that *already-established Basic* into Shadow Rider Calyrex VMAX on our next turn, attach **Stealthy Hood to that Benched VMAX**, then use **Underworld Door** to put Psychic Energy on a Benched Psychic target and draw two.

This route does not require Radiant Eternatus's on-play Climactic Gate, nor an Ability on an unprotected Rule Box Pokémon. **Stealthy Hood prevents opposing Ability effects on the attached VMAX**; **Tool Jammer attached to source Active Thorns affects Tools on our Active Pokémon, not our Benched VMAX**, so an accessible Hood protects the Bench Door while that Tool Jammer is live. A Hood already attached to the Benched Rider V also remains attached on its evolution.

The route is tactically narrower than it may sound: it requires a legitimate T1 Basic + Bench Rider, T2 evolution, a live Hood and a Psychic in hand after payments. It creates **one** Door, not a guaranteed funded attacker, and source may use Guzma/Tool Jammer, energy denial or Tool removal. **All three original Thorns ranks 6,24,29 contain Megaton Blower**, an ACE SPEC Item that discards all opponent Tools and Special Energy and the Stadium in play, so even a protected Bench Door may later lose Hood. Rank29 additionally contains Field Blower; every rank includes two or three Guzma, four Plumeria and two Team Flare Grunt. The source still has to find/pay those effects—inventory alone does not imply an immediately playable response.

## Paired 100,000 physical initial deals

The [standalone deterministic opening planner](../../../scripts/2026-11/agent15-hood-natural-door-under-thorns.cjs) uses **unchanged** `hood-shield-shadow-rider-v1` counts (60), seven opening cards, six random Prizes, a T1 natural draw and a T2 natural draw. It conditions on opening a Basic, fixes a straightforward Active choice favoring a non-Rider Basic when available, and attempts to Bench Rider V on T1 via held Rider, Fog Crystal, Mysterious Treasure or Quick Ball. Going second permits a held **Arven** for an Item to fetch Rider when otherwise inaccessible; using it T1 spends that singleton and removes it as a T2 route.

On T2 the planner looks for a separate VMAX from hand or payable Mysterious Treasure, a live Hood from hand (possibly placed on Rider V T1) or **Arven→Hood**, and a hand Psychic (or payable **Fog Crystal→Psychic**). If Arven is used T2, it can find **one Item plus one Tool**, enabling e.g. **Treasure+Hood** simultaneously but not both Treasure and Fog. Search payments consume actual cards, and a Psychic needed for Door must survive those payments. The model never counts Forest Seal Stone's Star Alchemy under active Initialization, because it would itself be disabled without Hood and would conflict with the sole Tool slot.

There are two discard scenarios: permissive paid searches versus a strategically protected set disallowing disposal of Psychic, Hood, VMAX, key search connectors/supporters and other high-value cards. This is a sensitivity, not immutable card classification.

The random **opening is paired across scenarios**: independent per-trial pseudo-random seeds guarantee the same physically shuffled 60 and first natural draw for all four tested toggles; next-draw randomization comes from the remaining, possibly searched deck. Two seed blocks of 50,000 deals each produce **85,988 Basic-valid opening sevens**.

| Opportunity, share of Basic-valid opening hands | Permissive discard | Protected discard |
|---|---:|---:|
| Rider V established on Bench T1, candidate goes first | **86.03%** | 84.56% |
| Rider V established on Bench T1, candidate goes second | **88.32%** | 86.86% |
| **Hood-protected VMAX + one payable Door by T2**, goes first | **22.35%** | 20.47% |
| **Hood-protected VMAX + one payable Door by T2**, goes second | **22.64%** | 20.76% |

These values measure **bounded physical opening opportunities**; the planner checks residual deck contents when searching and chooses a favorable T2 available search action, so they are not calibrated K0 actor-policy success rates. It assumes the source has taken **no disruption or KO action between the candidate's T1 and T2**, that there is a Bench slot, that our starting Active allows safe establishment, that Item/Supporter play remains legal, and that source does not move the Hood VMAX into its Active against Tool Jammer. It omits other T1/T2 draw engines such as Lillie's Determination and possible T2 Judge/Iono hand disruption; the 22% estimate is **not a ceiling** on the full deck's real play. Conversely, source first attack/denial may make real success lower.

Going second's Arven adds only about **0.29 percentage points** to the protected-door T2 opportunity in this restrictive plan, despite increasing basic Rider access, because using the sole Arven to find a T1 Basic can deprive T2 of **Arven→Stealthy Hood**. This is an immediate Supporter-usage contention—not a reason to never use Arven T1.

## Better offense than relying exclusively on Hood

These results justify preserving a **non-Gate one-Door fallback**, but not building the deck around guaranteed Hood activation. In particular, *Shadow Rider Calyrex V* already has the one-Psychic attack **Shadow Mist**, which prevents the opponent playing any **Special Energy or Stadium cards from hand next turn**. All three published Iron Thorns 60s contain **no Basic Energy**, and their first attack may rely on **Double Colorless Energy + Thunder Mountain Prism Star** for the reduced attack cost. A timely Shadow Mist can remove future normal Special Energy attachments, potentially creating a stronger tempo opportunity than a one-of counterlock Pokémon.

The correct next question is **how often Shadow Mist can be used immediately and how often source has already established its DCE+Thunder Mountain attack**. Source Guzma, Plumeria, Team Flare Grunt and Crushing Hammer can still disrupt the rider/energy even if Shadow Mist blocks new Energy. Do not count an Item/Supporter disruption effect as stopped by Shadow Mist; it only prevents Special Energy and Stadium *from hand*.

## Reproduction

- [Source](../../../scripts/2026-11/agent15-hood-natural-door-under-thorns.cjs): run `node scripts/2026-11/agent15-hood-natural-door-under-thorns.cjs 50000 28112027` (repeat seed 28112028).
- [Regression](../../../tests/2026-11/agent15-hood-natural-door-under-thorns.test.cjs): saved with exact 2,000-deal seed counts and coupled-scenario inequalities; the underlying source was executed on the connected JS runtime and the fixture assertions passed.
- Card text from supplied English corpus: Rider V CRE74; Rider VMAX CRE75; Iron Thorns ex TWM77; Hood UNB186; Tool Jammer BST136; Megaton Blower SSP182.
- Verified source print counts from `results/aichi-2026/full-decklists.json`, ranks6/24/29.

No card was added, no deck or worker changed, no CI/Twinleaf/native game was run. Full Aichi objective remains one fixed legal 60 versus all32, with 29 authenticated lists and **zero qualified matchup wins measured**; 99.5% unproved.
