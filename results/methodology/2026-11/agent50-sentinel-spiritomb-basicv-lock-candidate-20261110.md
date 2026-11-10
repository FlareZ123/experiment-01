# One-slot Spiritomb/Relicanth-preserving Sentinel Control: registered fixed 60

**Agent50 | 10 November 2026 | candidate hypothesis / independent competitive admission = 0 games**

## Full fixed list

`results/aichi-2026/candidates/agent50-sentinel-spiritomb-basicv-lock-60-v1.json` is the complete fixed 60-card list. It uses Takahiro Ando's original authenticated Aichi rank-2 Vileplume Control 60 with exactly **one removal: Mr. Mime PLF #47** and **one addition: Spiritomb PAL #89**. All other quantities and original card printings remain unchanged.

## Why this is structurally different from the Alolan Muk two-card variant

**Spiritomb PAL89** is a Basic Pokémon with passive `Fettered in Misfortune`: Basic Pokémon V in play on both sides have no Abilities. Unlike Alolan Muk SUM58's all-Basic Power of Alchemy, it leaves the original **Relicanth TEF Memory Dive**, **Fan Rotom SCR Fan Call**, and non-V Basic setup Abilities enabled. Spiritomb itself requires no Stage 1 evolution, making it a live same-turn Bench option when found. Rank2's original **Active Stoutland BCR Sentinel** limits opponent Supporters, and Benched **Vileplume AOR Irritating Pollen** prevents both players from using Item cards. The full proposed board can therefore impede an opponent's Item/Supporter/Basic-V Ability channels while retaining the original control deck's Stage2, Relicanth and Tool resources.

This narrow V-only lock is especially relevant to Mew Genesect's **Genesect V Fusion Strike System**, which is a Basic Pokémon V Ability. It also suppresses eligible Basic Pokémon V engines such as Crobat V when they are in play; it does **not** suppress Basic Pokémon ex, GX, ordinary non-V Basics, Stage1/Stage2 Pokémon, or the opponent's Active attacks. Consequently **Iron Thorns ex Initialization is unaffected**, while the Spiritomb cannot replace the broader theoretical Muk lock. The comparison is about achievable useful effects under real opening constraints and preserved original deck ALS, rather than maximizing theoretical locks on paper.

The new Spiritomb occupies one Bench slot. With Stoutland Active, Vileplume, Pidgeot ex, Relicanth and Bunnelby contending for existing Bench slots, an additional Spiritomb forces planning around transient Fan Rotom and other setup Pokémon. A singleton Spiritomb itself is Prized in exactly 10% of six-Prize partitions; original Gladion and Peonia may supply delayed recovery. The 1-for-1 swap retains Counter Gain but removes Mr. Mime's Basic Bench Barrier; unlike the Muk proposal, Spiritomb does not inherently suppress the Mr. Mime's Ability if it were kept instead.

## Executable material evidence

The original 29 source decks plus candidate are resolved from authentic name/count/printing records, subject to explicit pre-existing same-set Basic Energy collector number equivalence for the rank-2 Grass Energy. The pinned native Spiritomb implementation exists as a real `Spiritomb PAL` class with matching name/set/collector #89; its opponent-V lock is implemented through native `HANDLE_ABILITY_LOCK` and its actual printed category is Basic Pokémon.

The two-seat actual Store test `tests/2026-11/agent50-sentinel-spiritomb-basicv-lock.native.test.cjs` stages Stoutland, Vileplume, Relicanth, and optionally Spiritomb. It requires opposing genuine Genesect V ability rejection with Spiritomb, the same actual action accepted without Spiritomb, and preserved original owner Relicanth's `Memory Dive` Ability. The 60-card construction and live native tests run through the existing manual Agent50 native workflow.

The prospective matched 12-native-attempt development script `tests/2026-11/agent50-sentinel-spiritomb-bounded-original-field.native.test.cjs` freezes source ranks 5/6/10, both physical seats, one deterministic prespecified seed per source-seat, common pinned native policy and a 180-root cap. Its seed formula is `0x50a11c00+rank*257+seat`, matching the previous Muk experiment. Every arm is explicitly censored or blocked where applicable, and none is published as paper-qualified or given a field win-rate. The corresponding baseline tests are already archived with [Muk cohort CI 42732759330](https://github.com/FlareZ123/experiment-01/actions/runs/42732759330).

## Decision and evidence boundary

This Spiritomb variant is a **proposed one-slot structural improvement**, not the strongest nominated fixed 60 or proof against the 32 original top finishers. It needs new verified full-paper games, official-clock adjudication, real owner-info policies, prize custody, and independent admission; the published available 29/32 original sources are insufficient for a 32/32 empirical claim. Compare first to the original rank2 on the frozen three-rank source development cohort, then broaden only if genuine setup/lock benefits appear.

## Completed first native observation (10 November, manually dispatched)

[Compiled pinned native run 42733976061](https://github.com/FlareZ123/experiment-01/actions/runs/42733976061) **passed** the fixed source 60, two-seat Spiritomb Store tests and all 12 registered first native game attempts. In both physical seats, an opposing Genesect V Fusion Strike System action was rejected with Spiritomb on Bench, accepted when Spiritomb was absent, and the owner's Relicanth Memory Dive Ability remained present. This preserves the key ALS functionality that Muk suppresses.

The actual fixed 12 attempts, ranks 5/6/10, one frozen seed and two seats for source original and Spiritomb, had *identical original source-deal fingerprints in all six matched arm pairs*. No native Store errors occurred. The original rank2 60 produced **three completed native terminals and three 180-root-capped attempts**. Spiritomb produced **two completed native terminals and four 180-root-capped attempts**. Spiritomb was on the final Bench in **three of six** candidate attempts. Among finished Spiritomb games, rank5 seat0 ended with an owner win, and rank6 seat0 ended with an opposing Iron Thorns win. Other pairs were censored and are **not losses/wins**. The original-rank2 native finished rank5 seat0 with its own win, rank6 seat1 with an opposing Iron Thorns win, and rank10 seat1 with its own win.

These data show **no defensible ordering between original rank2 and Spiritomb**, and are too small and censored to support any field win-rate estimate. The conservative conclusion is that the one-slot Spiritomb can materially suppress a real opponent engine while retaining our own Relicanth, and it does not yet demonstrate a stronger aggregate game outcome. The next high-value work is owner-policy realistic access and physical paper-qualified paired games, rather than more uncontrolled native matches. Existing single-deck decision board should remain unchanged.
