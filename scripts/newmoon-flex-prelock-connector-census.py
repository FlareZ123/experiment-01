#!/usr/bin/env python3
"""Exact optimistic first-eight Item-window access for one New Moon flex.

Compare Sky Field #2 -> Boss's Orders versus -> Tool Jammer, with 59
otherwise identical cards. This is an *access topology*, not legal play,
good discards, a complete turn, or a match outcome.
"""
from collections import defaultdict
from fractions import Fraction
from functools import lru_cache
from itertools import product
from math import comb, perm
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent.parent
DECK = ROOT / "results/als/new-moon-tool-jammer-v2-60.json"
SINGLE = ("flex", "lele", "articuno", "fss", "bag", "box")
ZONES = ("H", "P", "D", "O")  # initial 7; Prizes 6; first own draw; unseen deck
CAP = {"H": 7, "P": 6, "D": 1, "O": 46}
# Cards after removing six labeled singletons:
# 15 other Basics, 4 Fog Crystal, 2 Mysterious Treasure,
# 4 Battle VIP Pass, 29 other non-Basics.
REST = (15, 4, 2, 4, 29)
KEYS = ("valid", "direct", "post_boss", "post_tool",
        "pre_boss", "pre_tool", "pre_boss_no_box",
        "pre_tool_no_box", "pre_boss_fog_path")


def validate_input():
    entries = json.loads(DECK.read_text(encoding="utf-8"))["entries"]
    rows = {row["name"]: row["count"] for row in entries}
    assert sum(rows.values()) == 60
    assert sum(row["count"] for row in entries if row["type"] == "Pokémon") == 19
    assert sum(row["count"] for row in entries if row["type"] == "Trainer") == 35
    assert sum(row["count"] for row in entries if row["type"] == "Energy") == 6
    for name in ("Tool Jammer", "Tapu Lele-GX", "Galarian Articuno V",
                 "Forest Seal Stone", "Adventure Bag", "Secret Box"):
        assert rows.get(name) == 1, (name, rows.get(name))
    assert rows.get("Fog Crystal") == 4
    assert rows.get("Mysterious Treasure") == 2
    assert rows.get("Battle VIP Pass") == 4
    assert rows.get("Dusclops") == 2
    assert sum(row["count"] for row in entries if row["type"] == "Pokémon"
               and row["name"] not in ("Dusclops", "Tapu Lele-GX",
                                      "Galarian Articuno V")) == 15


@lru_cache(None)
def hand_rest(h):
    result = []
    for b in range(min(15, h)+1):
        for fog in range(min(4, h-b)+1):
            for mt in range(min(2, h-b-fog)+1):
                for vip in range(min(4, h-b-fog-mt)+1):
                    other = h-b-fog-mt-vip
                    if 0 <= other <= 29:
                        row = (b, fog, mt, vip, other)
                        weight = 1
                        for n, k in zip(REST, row):
                            weight *= comb(n, k)
                        result.append((row, weight))
    assert sum(weight for _, weight in result) == comb(54, h)
    return result


def census():
    outcomes = defaultdict(Fraction)
    states = 0
    for placement in product(ZONES, repeat=6):
        place = dict(zip(SINGLE, placement))
        used = {z: placement.count(z) for z in ZONES}
        if any(used[z] > CAP[z] for z in ZONES):
            continue
        s_weight = 1
        for z in ZONES:
            s_weight *= perm(CAP[z], used[z])
        h, d = 7-used["H"], 1-used["D"]
        denominator = perm(60, 6)*comb(54, h)*(54-h if d else 1)
        subtotal = defaultdict(int)

        for (other_basic, fog_h, mt_h, vip_h, other_h), hand_weight in hand_rest(h):
            remaining = tuple(n-k for n, k in zip(
                REST, (other_basic, fog_h, mt_h, vip_h, other_h)))
            for j in range(5 if d else 1):
                draw_weight = remaining[j] if d else 1
                if draw_weight == 0:
                    continue
                basic_h = (other_basic + (place["lele"] == "H")
                           + (place["articuno"] == "H"))
                if basic_h < 1:
                    continue  # legal seven-card opening required
                w = hand_weight * draw_weight
                fog = fog_h > 0 or (d and j == 1)
                mt = mt_h > 0 or (d and j == 2)
                vip = vip_h > 0 or (d and j == 3)
                seen = lambda n: place[n] in ("H", "D")
                flex_deck = place["flex"] == "O"
                direct = seen("flex")
                lele_hand = (place["lele"] == "H" and basic_h >= 2) or (
                    place["lele"] == "D")
                lele_from_item = place["lele"] == "O" and (fog or mt)
                art_direct = seen("articuno")
                art_from_item = place["articuno"] == "O" and (
                    fog or mt or vip)
                fss_direct = seen("fss") and art_direct
                fss_item = seen("fss") and (art_direct or art_from_item)
                box = seen("box")
                bag = seen("bag")

                post_boss = direct or (
                    flex_deck and (lele_hand or fss_direct))
                post_tool = direct or (flex_deck and fss_direct)
                pre_boss_no_box = direct or (
                    flex_deck and (lele_hand or lele_from_item or fss_item))
                pre_tool_no_box = direct or (
                    flex_deck and (fss_item or bag))
                events = {
                    "valid": True, "direct": direct,
                    "post_boss": post_boss, "post_tool": post_tool,
                    "pre_boss": pre_boss_no_box or (flex_deck and box),
                    "pre_tool": pre_tool_no_box or (flex_deck and box),
                    "pre_boss_no_box": pre_boss_no_box,
                    "pre_tool_no_box": pre_tool_no_box,
                    "pre_boss_fog_path": direct or (
                        flex_deck and (lele_hand or
                                       (place["lele"] == "O" and fog)))
                }
                for key in KEYS:
                    if events[key]:
                        subtotal[key] += w
                states += 1

        for key in KEYS:
            outcomes[key] += Fraction(s_weight * subtotal[key], denominator)

    assert outcomes["valid"] == 1-Fraction(comb(43, 7), comb(60, 7))
    # Previous independently committed limited-channel exact results.
    assert abs(float(outcomes["post_boss"]/outcomes["valid"])-
               .2405685736) < 1e-9
    assert abs(float(outcomes["post_tool"]/outcomes["valid"])-
               .1426901294) < 1e-9
    assert outcomes["pre_boss"] > outcomes["pre_tool"]
    return outcomes, states


if __name__ == "__main__":
    validate_input()
    values, states = census()
    valid = values["valid"]
    print(json.dumps({
        "schema": "new-moon-flex-first8-prelock-optimistic-item-connectivity-v1",
        "source": str(DECK.relative_to(ROOT)),
        "conditional": "17-Basic-valid opening seven, six Prizes, first own draw",
        "prelock": "Assume all Items playable, Secret Box discard-3 and "
                   "Mysterious Treasure discard-1 payable, Bench and Abilities live",
        "not": "legal-play/optimal-action/full search/win-rate result",
        "enumerated_rest_draw_states": states,
        "percent_given_valid_seven": {
            name: round(float(value/valid)*100, 8)
            for name, value in values.items() if name != "valid"
        },
        "boss_minus_jammer_prelock_pp": round(
            float((values["pre_boss"]-values["pre_tool"])/valid)*100, 8),
        "boss_minus_jammer_no_secret_box_pp": round(
            float((values["pre_boss_no_box"]-
                   values["pre_tool_no_box"])/valid)*100, 8)
    }, indent=2))
