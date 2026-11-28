#!/usr/bin/env python3
"""Exact restricted-channel first-eight access comparison for New Moon flex slot.

Compare replacing Sky Field copy #2 by Boss's Orders or Tool Jammer.
Count direct flex sightings, hand-play Tapu Lele-GX -> Boss, and
Galarian Articuno V + Forest Seal Stone -> either flex. An observed
connector is not a legal action or a win. No opponent-play model is used.
"""
from fractions import Fraction
from itertools import product
from math import comb
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent.parent
FROZEN = ROOT / "results/als/new-moon-tool-jammer-v2-60.json"


def check_source():
    entries = json.loads(FROZEN.read_text(encoding="utf-8"))["entries"]
    counts = {e["name"]: e["count"] for e in entries}
    assert sum(counts.values()) == 60
    assert sum(e["count"] for e in entries if e["type"] == "Pokémon") == 19
    assert sum(e["count"] for e in entries if e["type"] == "Trainer") == 35
    assert sum(e["count"] for e in entries if e["type"] == "Energy") == 6
    assert sum(e["count"] for e in entries if e["type"] == "Pokémon"
               and e["name"] != "Dusclops") == 17
    for name in ("Tapu Lele-GX", "Galarian Articuno V",
                 "Forest Seal Stone", "Tool Jammer", "Sky Field"):
        assert counts.get(name) == 1, (name, counts.get(name))
    assert "Boss's Orders" not in counts


def fall(n, k):
    v = 1
    for i in range(k):
        v *= n - i
    return v


def census():
    # Four distinguished singleton positions: proposed flex, Lele, Articuno, FSS.
    # Other 56: 15 Basics and 41 non-Basics, as checked against the frozen 60.
    # Seven-card hand, six unseen Prizes, one mandatory own first-turn draw,
    # and the remaining 46 unseen deck cards.
    capacities = {"H": 7, "P": 6, "D": 1, "O": 46}
    sums = {k: Fraction(0) for k in
            ("valid", "direct", "boss", "tool", "lele_increment",
             "fss_increment", "flex_prized")}
    denominator = fall(60, 4)
    for flex, lele, articuno, fss in product(capacities, repeat=4):
        slots = (flex, lele, articuno, fss)
        counts = {z: slots.count(z) for z in capacities}
        if any(counts[z] > capacities[z] for z in capacities):
            continue
        probability = Fraction(1, denominator)
        for z, capacity in capacities.items():
            probability *= fall(capacity, counts[z])
        rest_hand = 7 - counts["H"]
        other_basic = 1 - Fraction(comb(41, rest_hand), comb(56, rest_hand))
        valid = Fraction(1) if lele == "H" or articuno == "H" else other_basic

        # Hand-play Wonder Tag requires Lele not to have been forced Active
        # as the only Basic from the opening 7. A drawn-on-turn Lele is fine.
        lele_usable = (
            (Fraction(1) if articuno == "H" else other_basic)
            if lele == "H" else
            (valid if lele == "D" else Fraction(0))
        )
        direct = flex in ("H", "D")
        in_deck = flex == "O"  # exclude flex in initial Prizes
        lele_route = in_deck and lele in ("H", "D")
        fss_route = (in_deck and articuno in ("H", "D")
                     and fss in ("H", "D"))
        boss = (valid if direct or fss_route else
                lele_usable if lele_route else Fraction(0))
        tool = valid if direct or fss_route else Fraction(0)
        sums["valid"] += probability * valid
        sums["direct"] += probability * valid * direct
        sums["boss"] += probability * boss
        sums["tool"] += probability * tool
        sums["lele_increment"] += probability * (boss - tool)
        sums["fss_increment"] += probability * valid * (
            fss_route and not direct)
        sums["flex_prized"] += probability * valid * (flex == "P")
    assert sums["valid"] == 1 - Fraction(comb(43, 7), comb(60, 7))
    assert sums["boss"] - sums["tool"] == sums["lele_increment"]
    assert sums["boss"] > sums["tool"] > sums["direct"]
    return sums



def named_prize_gate(nonbasic, basic, valid_probability):
    """Exact chance all specified physical cards avoid six Prizes,
    conditioned on Basic-valid opening seven from a 17-Basic 60.

    nonbasic and basic distinguish named required cards; correlation
    with opening-mulligan screening matters. Never equate with a line
    being *playable*: Heavy Ball, Prize-taking, recovery and opponent
    action may alter access later.
    """
    n = nonbasic + basic
    none_prized = Fraction(comb(60-n, 6), comb(60, 6))
    invalid_and_none_prized = sum((
        Fraction(comb(nonbasic, h)*comb(43-nonbasic, 7-h),
                 comb(60, 7))
        * Fraction(comb(53-n+h, 6), comb(53, 6))
        for h in range(nonbasic+1) if 0 <= 7-h <= 43-nonbasic
    ), Fraction(0))
    result = (none_prized-invalid_and_none_prized)/valid_probability
    assert 0 < result < 1
    return result


def triple_stage1_prize_gate(valid_probability):
    return named_prize_gate(3, 0, valid_probability)


if __name__ == "__main__":
    check_source()
    result = census()
    print(json.dumps({
        "source": str(FROZEN.relative_to(ROOT)),
        "model": "Basic-valid opening 7 + six Prizes + first own draw; restricted direct/Lele/FSS channels",
        "qualification": "No game, legal-play, matchup or win-rate inference",
        "basicValidSeven": float(result["valid"]),
        "twoDusclopsAndToolUnprizedGivenValidSevenPercent": round(
            float(triple_stage1_prize_gate(result["valid"])) * 100, 7),
        "twoDuskullTwoDusclopsAndToolUnprizedGivenValidSevenPercent": round(
            float(named_prize_gate(3, 2, result["valid"])) * 100, 7),
        "oneClefairyAndHoodUnprizedGivenValidSevenPercent": round(
            float(named_prize_gate(1, 1, result["valid"])) * 100, 7),
        "conditionalPercent": {k: round(float(v / result["valid"]) * 100, 7)
                               for k, v in result.items() if k != "valid"},
        "exactUnconditional": {k: str(v) for k, v in result.items()}
    }, indent=2))
