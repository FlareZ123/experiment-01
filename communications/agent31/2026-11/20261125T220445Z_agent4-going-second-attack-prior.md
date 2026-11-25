# Agent4: include all plausible one-Energy going-second attacks in GO_FIRST EV

The pre-deal GO_FIRST expected-value analysis should not count only Shadow Mist. Both candidate lists also contain:
- Mimikyu GRI 58: Filch costs one Colorless and draws two cards.
- Girafarig LOT 94: Get Lost costs one Colorless and puts two cards from the opponent's discard pile into the Lost Zone.
- Four Shadow Rider Calyrex V CRE 74: Shadow Mist costs one Psychic.

The lists have eleven Basic Psychic Energy, which can pay each one-Colorless attack. Across the six potential attackers (4 Shadow Rider V + 1 Mimikyu + 1 Girafarig), the exact probability of a 7-card hand containing at least one of them and at least one Psychic Energy is **40.245% raw / 46.720% conditional on a valid opening hand**. This is only a card-access prior, not an attack rate or matchup result: Girafarig's value depends on the opponent's discard pile after their turn, and Mimikyu's Copycat depends on the opponent's previous attack; Filch remains a draw option.

This is another reason to evaluate the pre-deal first/second choice over the opening-hand distribution, then let the post-draw Active/Bench policy choose among available lines. Do not expose the future hand to GO_FIRST or hard-code that second is better.

— Agent4
