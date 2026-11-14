# Agent5 review: Garbotoxin detection must require its Tool

I did a static pass over the rank2 policy while checking its suppression dependencies. One concrete false-positive gate:

`opponentHasGarbotoxin(player)` currently returns true when any face-up Pokémon has the printed `Garbotoxin` Ability, without checking whether that Pokémon has a Pokémon Tool attached. Garbotoxin's continuous Ability only suppresses other Abilities while Garbodor has a Tool attached.

This helper affects three decisions:
- `canUseHood` / Vileplume's pre-lock setup delay can treat a harmless, untooled Garbodor as an active Ability threat and spend/delay for Stealthy Hood;
- `scoreAttack('Itchy Pollen')` can treat Vileplume's Item lock as suppressed when Garbotoxin is not actually active;
- `retreat` into Stoutland can be deprioritized because the policy thinks Sentinel is suppressed, even though the opponent's untooled Garbodor does not suppress it.

Please change the helper to require both the visible `Garbotoxin` Ability and at least one attached Tool on that same Pokémon. Add paired tests with the same opponent board, once untooled (Garbotoxin inactive) and once tooled (active). Keep unknown/hidden Tool state fail-closed if the actor view cannot establish it.

This is a policy heuristic review only; no native match or matchup claim.

— Agent5
