"""Exact static initial-Prize feasibility for the photographed May Aichi48 60.

Counts indispensable distinct Water *cards* at one instant: five in the
deck for Aqua Storm and three attached to Kyogre. Excludes Prize-taking,
extra recovery, shuffle sequencing, board legality, draw consistency,
opponent decisions, and game-win estimations.
"""
from __future__ import annotations

import itertools
import json
from fractions import Fraction
from math import comb
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = (
    ROOT / "results/aichi-2026"
    / "agent2-archie-baxcalibur-may48-photo-english-proxy-60.json"
)


def category_sizes(manifest: dict) -> tuple[int, ...]:
    actual = {row["name"]: row["count"] for row in manifest["cards"]}
    assert len(actual) == len(manifest["cards"]) == 35
    assert sum(actual.values()) == 60
    for name, expected in (
        ("Water Energy", 9), ("Kyogre", 1), ("Pidgeot V", 1),
        ("Telescopic Sight", 1), ("Hisuian Heavy Ball", 1),
        ("Archie's Ace in the Hole", 2), ("Baxcalibur", 2),
    ):
        assert actual[name] == expected, f"{name} count changed"
    designated = [
        "Water Energy", "Pidgeot V", "Kyogre", "Telescopic Sight",
        "Hisuian Heavy Ball", "Archie's Ace in the Hole", "Baxcalibur",
    ]
    other = 60 - sum(actual[name] for name in designated)
    return (
        actual["Water Energy"], actual["Pidgeot V"],
        actual["Kyogre"], actual["Telescopic Sight"],
        actual["Hisuian Heavy Ball"],
        actual["Archie's Ace in the Hole"],
        actual["Baxcalibur"], other,
    )


def exact_prize_gate(sizes: tuple[int, ...]) -> dict:
    if sizes != (9, 1, 1, 1, 1, 2, 2, 43):
        raise ValueError(f"Unexpected source-60 group sizes: {sizes}")
    total = comb(60, 6)
    water_only = immediate = heavy_ball_recoverable = 0
    for water, pidgeot, kyogre, sight, heavy, archie, bax in itertools.product(
        range(7), range(2), range(2), range(2), range(2),
        range(3), range(3),
    ):
        other = 6 - sum(
            (water, pidgeot, kyogre, sight, heavy, archie, bax)
        )
        vector = (water, pidgeot, kyogre, sight, heavy, archie, bax, other)
        if not (0 <= other <= 43) or any(
            taken > available
            for taken, available in zip(vector, sizes, strict=True)
        ):
            continue
        ways = 1
        for available, taken in zip(sizes, vector, strict=True):
            ways *= comb(available, taken)
        if water > 1:
            continue
        water_only += ways
        if sight > 0 or archie > 1 or bax > 1:
            continue
        if pidgeot == 0 and kyogre == 0:
            immediate += ways
        elif pidgeot + kyogre == 1 and heavy == 0:
            heavy_ball_recoverable += ways

    assert water_only <= total
    assert immediate + heavy_ball_recoverable <= water_only
    return {
        "total_six_prize_configurations": total,
        "water_8_or_more_not_prized": {
            "count": water_only,
            "fraction": Fraction(water_only, total),
        },
        "without_any_prize_rescue": {
            "count": immediate,
            "fraction": Fraction(immediate, total),
        },
        "extra_one_prized_basic_rescuable_by_heavy_ball": {
            "count": heavy_ball_recoverable,
            "fraction": Fraction(heavy_ball_recoverable, total),
        },
        "with_one_heavy_ball_prize_swap": {
            "count": immediate + heavy_ball_recoverable,
            "fraction": Fraction(
                immediate + heavy_ball_recoverable, total
            ),
        },
    }


if __name__ == "__main__":
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    result = exact_prize_gate(category_sizes(manifest))
    print(
        json.dumps(
            {
                k: (
                    {"configurations": v["count"],
                     "probability": float(v["fraction"]),
                     "fraction": str(v["fraction"])}
                    if isinstance(v, dict) else v
                )
                for k, v in result.items()
            },
            indent=2,
        )
    )
