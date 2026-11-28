# Rank 30: terminal Full Moon Rondo can justify Bench-playing protected source Basics

**Agent 8 — 28 November 2026; source-level opponent-policy improvement, not a game result.**

## Decision changed

The rank-30 Clefairy worker classified eight source Basic printing families as potential Bench bodies but omitted four real, exact-source Basic families from its `BENCH_BASIC` router: **Tapu Lele-GX GRI 60, Mimikyu GRI 58, Empoleon V BST 40, and Dialga-GX UPR 100**. This made an otherwise offered full-field knockout line invisible. Those cards also have valuable tactical uses, so unconditional Bench deployment would be wrong.

The revised worker accepts those four as **protected Bench fillers** only if (1) a legal native Full Moon Rondo root is offered; (2) the current actor-visible Bench-body actions can supply *every* missing body to reach damage threshold; (3) there is Bench capacity; and (4) knocking out the current Active would end the game by taking the final Prize(s) or leaving the opponent with no Pokémon. Existing role priorities continue to favor ordinary lower-opportunity-cost bodies first.

A concrete constructed actor-visible state: own five Pokémon on Bench, opponent two on Bench, own Active Clefairy already has two Psychic Energy, an opponent VMAX has 220 HP remaining, and three source protected Basics plus Sky Field are in hand. Before Sky Field, projected Rondo is `20 × (1 + 5 + 2) = 160`. After Sky Field permits three additional Bench bodies, projected Rondo is `20 × (1 + 8 + 2) = 220`. With three own Prizes remaining and no damage-blocker flags, the offered sequence is Sky Field, the three offered Basic actions, then Full Moon Rondo. The previous role filter did not see this sequence; the revised policy does. It does not force a hypothetical Basic if the native frontier omits it.

## False-terminal protection

A second defect in the same decision was treating a three-Prize target as an unconditional three-Prize knockout even when a visible Prize-modifying attached card could reduce the actual award. The worker now computes a conservative **visible lower bound** for attack-KO Prizes when the target has Legacy Energy or one of Life Dew, Hero's Medal, Ribbon Badge, and Island Challenge Amulet. Distinct Tool and Special Energy reductions can stack. Legacy Energy's once-per-game use status is not independently certified here, so it is conservatively treated as possibly live.

For example, a VMAX with Legacy Energy is no longer taken to guarantee three Prizes, so a three-Prize-left protected-body Rondo plan is withheld unless the target is the opponent's final Pokémon. The same lower bound applies to terminal direct Rondo and the Guzma target score. This is **not** a complete Prize/KO adjudicator: continuous or hidden effects, other modifiers, damage-reduction mechanics, and exact Legacy spent-state remain future native/paper checks.

## Reproducible local decision checks

- Implementation: `simulation/evaluation/2026-11/agent8-rank30-clefairy-opponent-policy.cjs`.
- New regression: `simulation/evaluation/2026-11/agent8-rank30-terminal-rondo-protected-filler.test.cjs`.
- Direct execution of fetched source and test text in isolated JavaScript V8 with minimal CommonJS `node:test`/`assert` shims: **15/15 constructed both-seat decisions passed**. The sequence test actually feeds each selected Basic root back into the next synthetic observation before testing the final attack. Additional helper-only checks cover visible reductions.
- Branch-only commits: `2559f97f4042491a37fdbd3354a64153f5ba7056`, `7567891405a5be8ce2a1a1ecf7c5bb92613b61e0`, `2c1d61f3fc723562a8610b11185c67e93e7ac6c9`, `2127d7b8cabd0f87c7dfd429401569759218979a`.

**Scope:** Original Aichi rank-30 source 60 and candidate decklists remain unchanged. No pinned Twinleaf Store transition, actual source-list playing-policy competence, native CI, fixture, competitive matchup, win rate, V3 admission, or merge is claimed or authorized by these tests. The independent source/prompt review and current owner/Critic execution gates continue to apply.

## Next decision test

Exercise a same-Store native non-game rank-30 Bench-root → Sky Field → Full Moon Rondo continuation **only if separately authorized**, preserving both actual root offers and final Prize-award output. Include a Legacy Energy negative control. Confirm the engine correctly handles each protected Basic's on-play Ability before any policy qualification. Unresolved Copycat and Raihan prompt paths remain separate blockers; this patch does not simulate or bypass them.

## 28 November follow-on: native-projector alignment and stranded-Mimikyu attacks

The initial report's regression total of 15 was superseded. The four related rank30 worker test files now pass **201/201 constructed decisions**, run directly from the fetched JavaScript sources in a V8 CommonJS test harness. Existing protocol fixtures were corrected to include real Supporter/energy-action metadata. There is **no** native Store/game replay or matchup estimate in that number.

**Raihan blocker fixed in the worker:** the current Agent46 opt-in Raihan `AttachEnergyPrompt` projector exposes destination `active` or `bench` only in `choices[].publicMetadata.zone`. The rank30 worker incorrectly required a made-up prompt-level `zone:'bench,active'` and therefore would abstain on every actual projected Raihan attachment. The worker now requires source-bound Raihan, actor-owned Basic Energy discard, noncancellable 1-of-1 assignment and a genuinely fresh opponent-KO receipt; it then ranks legal choice-level destinations. The rank30 protocol test now passes a V3-valid `AttachEnergyPrompt` fixture using the **exact projector metadata shape**, with both physical seats and stale-KO negative controls. This makes the rank30 branch compatible with that particular subsequent opt-in projector once installed; it does not install or authorize the projector itself.

**Mimikyu attack fallback:** the original 60 contains one Mimikyu GRI 58 with Filch (draw 2) and Copycat. The policy now plays native-offered Filch from a stranded Active when at least two cards remain in deck, rather than returning unsupported. It can choose a deterministic immediate knockout using native-offered Copycat only when an actor-bound, immediately preceding turn-stamped, eligible non-GX, non-copycat attack receipt and source card are available, currently limited to observed **Max Geist** and **Full Moon Rondo**. Max Geist's lower bound counts only visible Basic Psychic Energy on the actor's board and never invents Special Energy supply. Source **Copycat→Apex Dragon** remains unadmitted because the pinned Twinleaf source refuses copying an attack flagged `copycatAttack`; selecting it would produce an invalid strategic promise. The new focused Mimikyu test file passes 16/16 both-seat constructed cases.

**Prize Tool category correction:** the bundled card database restricts Hero's Medal to VMAX, Ribbon Badge to Sylveon Pokémon V, Island Challenge Amulet to older Pokémon-GX/EX (not modern lowercase ex), and Life Dew to Pokémon generally. These restrictions now apply in the conservative attack-KO Prize lower bound; the prior generic subtraction would unnecessarily veto some genuine winning lines.

**Turn-owned KO context:** the isolated Store observer `simulation/twinleaf/agent8-ko-turn-tracker.cjs` now records the actual actor of every completed turn and exposes a fail-closed `snapshotLastOpponentTurn` for consecutive turns. Its focused tests pass **13/13**, including an empty extra opponent turn superseding an earlier KO, and own extra turns retaining the last completed opponent-owned KO. This owner-aware evidence has not crossed the shared V3 event-receipt contract; the worker's ordinary Raihan/Copycat paths still conservatively use the immediately preceding numbered turn until that handoff is approved.

**Operational status:** Source rank30 exact 60 unchanged, no competitive games, no win-rate evidence, no mainline merge, no owner-gated native execution. Worker/adapter code and tests remain confined to `agent8/rank30-gust-psychic-weakness-20261128`; relevant integration requests have been sent to Agent17 and Agent46.
