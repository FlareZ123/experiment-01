# Hood Shield candidate-second rank-8 experiment

Agent 15, 17 October 2026. The source-locked Hood Shield v1 60 plays from physical B against rank-8 Yusuke Kobayashi's published Absol/Garbodor 60 in `full-decklists.json`.

## Registered start rule

**V1 failed on the first CI run:** all 16 adjacent seeds 4168858074 through 4168858089 yielded the candidate going first. The four regression tests passed; the match runner failed closed before a full-game claim. The adjacent-integer schedule was inappropriate for the pinned xorshift PRNG, as already analyzed in `scripts/aichi-decorrelated-seeds.cjs`.

**V2 preregistered correction:** use the established SHA-256 `decorrelated-slots-v3` schedule `deriveSlotSeeds(20261016, 'pilot', 8, repeat).B` for repeats 1 through 16, in ascending repeat order, with 40-action bounded runs. Select the first draw-log-confirmed candidate-second seed. Winner, hands, attacks, and Prize results never influence selection. Missing start proof and budget exhaustion are hard failures. Replay the selected seed independently for up to 800 actions with the same frozen decks and policy settings.

## Acceptance

The narrow deliverable is a natural game starting with the candidate second, plus ordered public Tool, Ability, attack, Energy development, and Stadium actions. The prior six-game rank-8 pilot had zero verified candidate-second starts and one invalid prompt. A completion is not qualified competitive evidence. Test any supposed Hood benefit against a realistic opponent answer before altering the fixed-deck decision.

Implementation: `simulation/twinleaf/hood-rank8-second-source.cjs`, tests `tests/hood-rank8-second-source.test.cjs`, existing manual `aichi-hood-interaction.yml` opt-in.

V1 compiled CI https://github.com/FlareZ123/experiment-01/actions/runs/39052216396 at source SHA `6a48ffd70fc8f9041d9a96dac57fa380d128aaac`: **failed at the declared 16-seed start-order gate**; all four selector tests passed. No candidate-second game was run. Preserve this negative result in any later roll-up.

## Compiled v2 execution

Manual CI: https://github.com/FlareZ123/experiment-01/actions/runs/39052628800
Research SHA: eb9ccd99825ad32af5c606fba2369ae85f8ef3a9
Raw JSON artifact: https://github.com/FlareZ123/experiment-01/actions/runs/39052628800/artifacts/12108009060

The first v3 repeat-1 seed was 10367207. The repeat-2 seed 1260748957 was the first that made physical player A start first. Hood Shield was physical B and genuinely started second, proved against the first draw log. All four selector tests passed. The game completed at 214 actions, 20 turns. The engine reported Hood candidate victory: opponent had six Prizes remaining, candidate had zero. Each player announced five attacks.

Hood played Stealthy Hood on turn 4. Two Shadow Rider VMAX Evolutions preceded it on the same turn. Underworld Door was used twice on turn 8; rank8 evolved Trubbish into Garbodor only on turn 9. That means the observed Doors do not prove Hood enabling Underworld Door through active Garbotoxin. The actual Hood attachment destination and Garbodor Tool status require live board inspection.

The opponent announced Terminal Period on turns 9, 11, 13 and 15 and Venomous Fang on turn 17; it never announced Claw of Darkness. Its source 60 includes four Dark Patch but the game logged zero Dark Patch plays. The opponent played two Darkness Energy and two Lightning Energy and took no Prizes. Terminal Period only KOs a defending Active with exactly six damage counters, so the repeated effect-only attacks require a resource and decision audit.

**Evidence classification:** source-locked, first/second coverage completed. One unqualified generic-bot game, with suspected opponent decision problems. No demonstrated competitive win probability. A separate action-resource observer was committed for follow-up.
