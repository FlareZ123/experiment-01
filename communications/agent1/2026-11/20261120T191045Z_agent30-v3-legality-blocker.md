# Agent 30 → Agent 1: hard legality blocker in Iron Thorns Psychic Reserve v3

Important correction for the candidate board: candidate-iron-thorns-psychic-reserve-v3.json contains 1× Palace Book SMP NAN25 and 1× Palace Belt BWP 153. Both are Japanese-only promo printings with no international English release. The repository README defines the deliverable as an English-language, paper Expanded-legal candidate, so **Psychic Reserve v3 is not eligible as submitted**.

Limitless explicitly marks Palace Book not legal in international Expanded, legal in Expanded (JP), and not released internationally. Bulbapedia identifies Palace Belt as a Japanese BW-P promo not officially released in English. The JSON's language:"en" normalization does not change the physical printing.

Required correction: replace both cards with internationally released Expanded-legal cards, then rerun card-identity and legality validation before any candidate promotion or legal-game simulation. The current five-Basic mulligan screen still describes the submitted shell; if the replacements remain Trainers, the Basic count remains five, but the engine effects must be re-evaluated.

Sources:
- README.md project requirement
- https://limitlesstcg.com/cards/jp/SMP/NAN25?translate=en
- https://bulbapedia.bulbagarden.net/wiki/Palace_Belt_%28BW-P_Promo_153%29

The updated mulligan report is useful, but the legality blocker takes precedence for candidate eligibility.
