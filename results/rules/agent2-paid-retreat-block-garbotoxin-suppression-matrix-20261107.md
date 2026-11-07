# Paid-retreat permission and the Snorlax Block / Garbotoxin interaction

**Agent 2, 7 November 2026 | developmental pinned native fixtures.** This result concerns retreat permission and the weaknesses of a conservative owner-visible policy screen. Both native fixtures stage exact printed Pokémon and Energy. They are **synthetic public board states**, not authentic natural original-60 Aichi matches.

## Source inventory and rule basis

The preceding [BW-onward retreat prohibition inventory](../rules/agent2-expanded-public-ability-retreat-prohibition-matrix-20261105.md) found original Aichi rank3 Snorlax Stall contains **three Snorlax PGO** and **one Stealthy Hood UNB**; rank7 Snorlax Stall has **two Snorlax PGO**. Original rank11 and rank16 Absol Garbodor lists contain Garbodor BKP. These are authenticated source name-count facts for 29 original 60s; ranks23,25,28 remain missing.

Snorlax PGO Block prevents the opposing Active Pokémon from retreating while Snorlax is Active. Garbodor BKP Garbotoxin suppresses other Pokémon Abilities while Garbodor has a Pokémon Tool attached. Stealthy Hood protects its attached Pokémon from the effects of opposing Abilities. The **Hood vs Garbotoxin vs Block** combined interaction was not tested in these fixtures and remains an explicit open question.

## Policy options

The original generic [multi-Basic paid retreat frontier](../../simulation/twinleaf/agent2-actor-multi-basic-paid-retreat-frontier.cjs) accepts an exactly funded printed retreat fee consisting of 2 to 4 Basic Energy on the Active Pokémon, followed by a funded positive-printed-damage Bench attacker under a deck deficit. It checks owner temporary restrictions but did not check an opponent Active continuous Block Ability.

The new **opt-in** guarded variant calls the existing owner-visible opponent Active lock screen and excludes Bench attacks inconsistent with a visible only-allowed-attack restriction. Default historical v1 behavior remains unchanged. The conservative guard retains paperVerified=false in all proposed intents. [Pure CI 42333841576](https://github.com/FlareZ123/experiment-01/actions/runs/42333841576) PASS including four additional guarded negative/positive cases.

## Native both-seat matrix

The [initial native attempt 42333982864](https://github.com/FlareZ123/experiment-01/actions/runs/42333982864) failed on a **test assertion format error**: Twinleaf throws an object with message BLOCKED_BY_EFFECT, which a Node assert.throws regex stringified as [object Object]. After switching to the error.message property, [native CI 42334167752](https://github.com/FlareZ123/experiment-01/actions/runs/42334167752) PASS for both-seat Block rejection.

A second test added a Tool-equipped owner Garbodor BKP on the Bench, in an otherwise matched staged state. [Native CI 42334369444](https://github.com/FlareZ123/experiment-01/actions/runs/42334369444) **PASS** for both seats, including suppression and actual physical payment. Engine revision: a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.

In every tested state, owner Active was **Dialga-GX UPR** with exactly **three Basic Psychic**, the target Bench attacker was **Shadow Rider Calyrex V CRE** with two Basic Psychic, opponent Active was **Snorlax PGO**, owner deck count was 19 and opponent deck count was 30. This is a constructed eligible midgame board, without a naturally shuffled 60, official match clock, or opponent-decision audit.

| Source-printed public board state | Historical generic paid retreat | Opt-in public lock screen | Native Store |
| --- | --- | --- | --- |
| Opponent Active Snorlax PGO with Block; no suppressor | Nominal offer | Declines | **Rejects** paid RetreatAction as BLOCKED_BY_EFFECT, seat0 and seat1 |
| Same state with owner Benched Garbodor BKP equipped with Float Stone BKT | Nominal offer | Declines | **Accepts** paid RetreatAction after confirming opponent Snorlax Block is suppressed, all three Basic Psychic cards discarded, seat0 and seat1 |

Native CheckRetreatCostEffect reports **3 Energy fee in both rows**. The fee remains exactly payable in the blocked row, demonstrating that fee and permission are separate dimensions. In the Garbotoxin row, the conservative guarded planner produces a **false negative**: a legal native retreat is declined because the public printed Block is present without evaluating the effective Ability state.

## Research implications and caveats

An optimized mobility policy needs **effective retreat permission** (confirmed blocked, confirmed free to retreat, unresolved), separately from effective Energy fee and projected attack value. A printed Block veto is a useful fail-closed partial screen, but all suspected disabling effects and protective Tools must be resolved before declaring permission.

Before promoting an unconditional Garbotoxin exception, stage **Stealthy Hood on Snorlax**, possible Tool lock, and relevant Ability suppression matrix controls. Original rank3 contains Stealthy Hood; an assumed override that ignores it could issue an illegal retreat. The present pair of matched native fixtures is neither a complete paper-law proof nor evidence of a successful Aichi matchup, and the native game engine itself requires further paper validation.

**Collective acceptance state:** 29/32 original registered source lists authenticated; no selected fixed 60; zero competitively qualified games; no established 99.5% win rate.
