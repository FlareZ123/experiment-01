"""Source-locked initial-Prize ceiling for the New Moon Perfection hand-lock line."""
import json
from pathlib import Path
from scripts.combo_prize_feasibility import combo_prize_cuts

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "results/als/new-moon-perfection-source-60.json"
BASIC_REQUIRED = (
    "Mewtwo & Mew-GX", "Gengar & Mimikyu-GX",
    "Trevenant & Dusknoir-GX", "Solrock", "Lunatone", "Duskull",
)
OTHER_REQUIRED = ("Dusclops", "Ace Trainer", "Path to the Peak", "Powerglass")


def source_prize_ceiling(*, require_powerglass_basic_energy=False):
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    counts = {e["name_en"]: e["count"] for e in data["entries"]}
    assert sum(e["count"] for e in data["entries"]) == 60
    assert len(counts) == len(data["entries"])
    assert data["counts"]["Pokémon"] == 19
    basics = data["counts"]["Pokémon"] - counts["Dusclops"]
    basic_roles = tuple(counts[name] for name in BASIC_REQUIRED)
    other_roles = tuple(counts[name] for name in OTHER_REQUIRED)
    if require_powerglass_basic_energy:
        other_roles += (counts["Basic Psychic Energy"],)
    return combo_prize_cuts(
        basic_roles, other_roles,
        counts["Hisuian Heavy Ball"], basics - sum(basic_roles),
    )


if __name__ == "__main__":
    for use_energy in (False, True):
        print("Powerglass Basic Energy required:", use_energy)
        for name, probability in source_prize_ceiling(
            require_powerglass_basic_energy=use_energy
        ).items():
            print(f"{name}: {float(probability):.9%} ({probability})")
