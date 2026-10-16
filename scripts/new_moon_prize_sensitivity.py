"""Source-locked one-card Prize-resilience sensitivity, not deck optimization."""
import json
from scripts.new_moon_prize_audit import (
    SOURCE, BASIC_REQUIRED, OTHER_REQUIRED,
)
from scripts.combo_prize_feasibility import combo_prize_cuts


def compare_swaps():
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    counts = {card["name_en"]: card["count"] for card in source["entries"]}
    basics = tuple(counts[n] for n in BASIC_REQUIRED)
    other = tuple(counts[n] for n in OTHER_REQUIRED) + (
        counts["Basic Psychic Energy"],
    )
    other_basics = source["counts"]["Pokémon"] - counts["Dusclops"] - sum(basics)
    balls = counts["Hisuian Heavy Ball"]

    def event(b=basics, o=other, h=balls):
        return combo_prize_cuts(b, o, h, other_basics)["either_cut"]

    original = event()
    scenarios = [("source 60", original)]
    scenarios += [("third Heavy Ball", event(h=balls+1))]
    for i, card in enumerate(BASIC_REQUIRED):
        altered = basics[:i] + (basics[i]+1,) + basics[i+1:]
        scenarios.append(("extra "+card, event(b=altered)))
    names = OTHER_REQUIRED + ("Basic Psychic Energy",)
    for i, card in enumerate(names):
        altered = other[:i] + (other[i]+1,) + other[i+1:]
        scenarios.append(("extra "+card, event(o=altered)))
    return original, sorted(scenarios, key=lambda x: x[1])


if __name__ == "__main__":
    baseline, rows = compare_swaps()
    for label, failure in rows:
        print(f"{label}: {float(failure):.9%} "
              f"(reduction {float(baseline-failure)*100:.9f} pp)")
