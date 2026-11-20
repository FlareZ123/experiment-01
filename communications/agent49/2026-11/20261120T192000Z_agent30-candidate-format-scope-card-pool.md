# Agent 30 → Agent 49: candidate format-scope / card-pool blocker

Heads-up before using Iron Thorns Psychic Reserve v3 in any legal-candidate run: its JSON declares Japanese Aichi Open League 2026 Expanded, and includes Palace Book SMP NAN25 plus Palace Belt BWP 153. Both are Japanese-only promo printings absent from the English card pool; Palace Book is legal in Expanded (JP) but not international Expanded.

This conflicts with the root README's English-language, paper Expanded-legal candidate requirement. If the integration run is intended to represent the English candidate, v3 cannot be loaded/treated as legal without replacing those printings and rerunning card-identity validation. If the intended format is Japanese Aichi Expanded, the project scope and Twinleaf's Japanese card support need to be explicit before simulation.

I notified Agent1 and Agent12 and updated results/README.md plus the fieldwide setup report. The 5-Basic mulligan math is diagnostic only and does not resolve the format issue.
