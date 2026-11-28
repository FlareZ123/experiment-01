# Rank-30 original source: four non-Clefairy attacker roles and finishing sequences

**Agent 8 · 2026-11-28 · decision policy implementation, NOT native game strength evidence**

## Strategic problem solved

The original Aichi rank-30 60 includes one each of **Latias ex SSP 76**, **Tapu Lele-GX GRI 60**, **Fezandipiti ex ASC 142** and **Mimikyu GRI 58** alongside three Clefairy ex. An opponent policy that recognizes Clefairy's Full Moon Rondo but treats the other attackers as mere utility cards systematically misses immediate winning attacks, especially against Regidrago/Dragon, a heavily Energy-loaded VMAX, or a low-health Benched support Pokémon. These omissions were actual branch-level missing decision paths, not a hypothetical weakness of graph connectivity.

The source worker now supports the following *native-offer-bound* strategies:

| Source attacker | Recognized payoff | Requirements; what is deliberately not assumed |
|---|---|---|
| Latias ex | **Eon Blade 200 Psychic**; **400 vs Dragon** with a certified live Bench Clefairy Fairy Zone | Three attached Energy, at least two Psychic units (native attack offer certifies payable direct attack), exact actor-visible Ability suppression row, no unknown damage protection. Going through a real offered free retreat or manually attaching the third Energy can construct the finisher |
| Tapu Lele-GX | **Energy Drive** floor of **20× visible attached Energy *cards*** on both Active; high payoff versus a VMAX stacked with Energy | Two attached Energy for the attack; physically observed cards rather than silently counting hypothetical multi-Energy units; do not infer a KO through unknown defensive Tools; ignores Weakness/Resistance per print. Actor can attach a second Energy and/or make an already offered zero-cost retreat into Lele |
| Fezandipiti ex | **Cruel Arrow** targets either Active or Bench for 100; when the Active has certified Darkness ×2 Weakness, 200 | Source Fez Active and native-offered attack. Target choice is a **separate V3-valid `ChoosePokemonPrompt`** with actor-visible opposing board target indices, not an invented root argument. Prioritize game-ending KOs, then Prize count; abstain when there is no certified KO. Bench targets do not apply Weakness/Resistance |
| Mimikyu | **Filch** draws 2 rather than passing when Active; **Copycat** to copy a certified final-turn Max Geist or Rondo KO | Copycat requires actor-bound compatible last-opponent-turn event receipt, immediate previous numbered turn stamp, exactly one known non-GX non-copy source attack and no unknown damage protection; original rank30 Copycat→Apex Dragon remains excluded as unsupported by pinned source. Filch only when at least two deck cards remain |

## Concrete constructed decision sequences

1. **Latias against Dragon:** Actor Unown Active, Bench has a 2-Psychic Latias with Skyliner certified live and a Clefairy with Fairy Zone certified live. Regidrago VSTAR has 280 HP, no damage. With one Basic Psychic in hand, the worker selects the actual offered Bench attachment to Latias, then the actual offered zero-cost retreat to that Latias, then an offered Eon Blade. Damage calculation 200×2=400; the same root is withheld if Fairy Zone is suppressed or the retreat is not offered.

2. **Lele against Energy-loaded VMAX:** Actor Unown Active, Bench has live Skyliner Latias and one-Psychic Tapu Lele-GX. Opponent VMAX has 320 HP, 180 damage and **five visible attached Energy cards**. With one Basic Psychic in hand, the worker selects the offered attachment to Lele, the offered zero-cost retreat to Lele, then offered Energy Drive. Two Lele + five VMAX Energy cards imply conservative 20×7=140, matching VMAX's 140 HP remaining. Absent the legal native retreat or if the VMAX has unknown prevention, the completion is not claimed.

3. **Fez target-choice:** Fez Active with three payable Energy; opponent Active VMAX has 320 HP, 140 damage, printed Darkness Weakness ×2; opposing Bench holds a 60-HP Unown and a damaged 180-HP Crobat V with 70 HP remaining. Three knockouts appear possible. The worker chooses the native Cruel Arrow attack root, then the *actual projected* opposing Active Pokémon choice, taking the three-Prize VMAX over the two-Prize Crobat and one-Prize Unown. If the Active lacks Darkness Weakness and two Prizes remain, it chooses the Crobat Bench target. Exact V3 `selectionType:'pokemon'` and legal `select-choices` contract tested for both physical seats.

## Implementation and evidence

- Source worker: `simulation/evaluation/2026-11/agent8-rank30-clefairy-opponent-policy.cjs`.
- New attack/retreat/attachment chain regression: `simulation/evaluation/2026-11/agent8-rank30-source-attacks.test.cjs`: **24/24** constructed tests across both physical seats, including full three-step transitions manually updating actor-visible state after each action. Source-root, no-retreat, no-FairyZone, unknown protection, actual Bench index and attack not offered negative controls.
- New Fez prompt proof: `simulation/evaluation/2026-11/agent8-rank30-cruel-arrow-targets.test.cjs`: **12/12** constructed tests, including actual shared V3 protocol `validatePrompt` and `validateDecision` with `ChoosePokemonPrompt`.
- **All six rank30 worker test files combined: 237/237** pass under the same direct JavaScript V8 CommonJS harness against fetched repository source; owner-turn Store observer separately **13/13**. This is **constructed-policy decision evidence, not a runnable native Twinleaf outcome or game count.**
- Core commits: `16d427ae` (Lele root), `0cd50ada` (Latias root), `d9c606ea` (attack test), `35085c4d` (retreat finishing policy), `16a71598` (retreat tests), `34e3e197` (manual attachment), `1f0813dc` (three-stage decision tests), `2fcf0e2d` (Fez attack/prompt), `ab801af5` (Fez V3 tests). The original Aichi rank30 source 60 is **unchanged**.

## Limits and next meaningful gate

The worker is isolated on `agent8/rank30-gust-psychic-weakness-20261128` pending Agent17/policy-owner independent review. No native same-Store attack+prompt replay, automatic runner integration, fixture, game, two-seat competitive comparison, qualified Aichi matchup, merge, or target win rate is claimed. These three-step decision tests demonstrate how the worker *would choose* if supplied those native-legal roots—not that Twinleaf can actually produce and resolve those roots in the same Store. Native prompt class/source for Cruel Arrow must be checked on the pinned engine before admission.

The direct next permission-sensitive test is **one narrowly approved pinned-native no-game** Fez `Cruel Arrow` root→`ChoosePokemonPrompt`→target resolution and a separate Latias or Lele attach→retreat→attack witness with a prohibition negative control; request separate independent approval. Until then, improve actual root/prompt coverage, not competitive claims. The existing source benchmarks remain **0/32 qualified**.

## Follow-on: source Tapu Cure-GX healing continuation

The initial attacker coverage was extended with a **fifth distinct tactical role** on the same original Tapu Lele-GX, separate from its Energy Drive. The source printed `Tapu Cure-GX` heals *all* damage from two Benched Pokémon and spends the once-per-game GX attack. The rank30 worker now chooses an **actually offered** Tapu Cure-GX root only when two different currently damaged friendly Bench Pokémon together have at least 150 damage, one has at least 60, and both remain healable under the known public restrictions. It preferentially protects damaged Clefairy/Latias engines and declines the attack for trivial healing.

The continuation accepts only source-bound, actor-owned **two-choice** `ChoosePokemonPrompt` with `minimumCount=maximumCount=2`, matches the *exact* two board indices and printings, and uses V3-valid `select-choices`; it rejects opponent-seat spoofing, missing or invalidated targets, and malformed prompt shape. Both seats pass `simulation/evaluation/2026-11/agent8-rank30-tapu-cure-gx.test.cjs` (**12/12 constructed tests**; commit `36773769`), following the worker commit `0bcec681`. Aggregate current source-policy checks are **249/249 constructed decisions** across seven test files in the direct V8 CommonJS harness; owner-turn KO observer remains **13/13**. Neither figure is a native engine replay, qualified game, or win estimate.

The implementation does not assume Tapu Cure-GX is always preferable to a damaging attack. It is a source-list conditional resource-conservation line, not a claim that the rank30 list is competitive or the once-per-game GX should always be spent at the numeric threshold. Native source attack payment and prompt emission still require permission and direct verification.
