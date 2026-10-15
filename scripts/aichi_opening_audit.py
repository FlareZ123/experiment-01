"""Exact opening-hand combinatorics for source-verified Aichi decks.

Uses printed Pokémon stages from the bundled English set data. No gameplay
simulation or mulligan replacement model is implied.
"""
import json
import math
import os
import tempfile
import unicodedata
from collections import defaultdict
from pathlib import Path

from filelock import FileLock

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "results/aichi-2026/full-decklists.json"
OUT = ROOT / "results/aichi-2026/opening-hand-audit.json"


def number_key(s):
    s = str(s).upper().strip()
    for prefix in ("SWSH", "SM", "XY", "BW"):
        if s.startswith(prefix) and s[len(prefix):].isdigit():
            s = s[len(prefix):]
            break
    return s.lstrip("0") or "0"


def normalized_name(value):
    """Verify source printing identity without punctuation/glyph mismatch."""
    return "".join(c for c in unicodedata.normalize("NFKC", value).casefold() if c.isalnum())


def stages():
    sets = json.loads((ROOT / "resources/sets/en.json").read_text(encoding="utf-8"))
    aliases = defaultdict(set)
    index = defaultdict(list)
    for info in sets:
        set_id = info["id"]
        for alias in (set_id, info.get("ptcgoCode")):
            if alias:
                aliases[alias.upper()].add(set_id)
        file = ROOT / f"resources/cards/en/{set_id}.json"
        if not file.exists():
            continue
        for card in json.loads(file.read_text(encoding="utf-8")):
            if card.get("supertype") == "Pokémon":
                index[(set_id, number_key(card["number"]))].append(card)
    return aliases, index


def audit():
    aliases, index = stages()
    field = json.loads(SRC.read_text(encoding="utf-8"))
    denominator = math.comb(60, 7)
    results = []
    for deck in field["decks"]:
        basic = low_hp = 0
        unresolved = []
        basics = []
        for entry in deck["cards"]:
            if entry["category"] != "Pokémon":
                continue
            printing = entry["printing"]
            candidates = [
                c for set_id in aliases.get(printing["set"].upper(), [])
                for c in index.get((set_id, number_key(printing["number"])), [])
                if normalized_name(c["name"]) == normalized_name(entry["name"])
            ]
            attributes = {(tuple(c.get("subtypes", [])), int(c.get("hp") or 0)) for c in candidates}
            if len(attributes) != 1:
                unresolved.append({
                    "name": entry["name"], "set": printing["set"],
                    "number": printing["number"], "candidate_count": len(candidates),
                })
                continue
            subtypes, hp = next(iter(attributes))
            if "Basic" in subtypes:
                basic += entry["count"]
                if hp <= 60:
                    low_hp += entry["count"]
                basics.append({"name": entry["name"], "count": entry["count"], "hp": hp})
        probabilities = None
        if not unresolved:
            assert basic > 0
            p0 = math.comb(60-basic, 7)/denominator if 60-basic >= 7 else 0.0
            p1 = basic*math.comb(60-basic, 6)/denominator if 60-basic >= 6 else 0.0
            p_low = low_hp*math.comb(60-basic, 6)/denominator if 60-basic >= 6 else 0.0
            probabilities = {
                "mulligan_initial": p0,
                "exactly_one_basic_initial": p1,
                "exactly_one_basic_given_valid": p1/(1-p0),
                "lone_hp_at_most_60_given_valid": p_low/(1-p0),
            }
        results.append({
            "rank": deck["rank"], "player": deck["player"],
            "archetype": deck["archetype"],
            "basic_count_known": basic, "basic_hp_at_most_60_known": low_hp,
            "unresolved_pokemon": unresolved, "basics": basics,
            "probabilities": probabilities,
        })
    return {
        "scope": "29 published Aichi 2026 decks, initial uniformly sampled seven-card hands; not a win-rate prediction",
        "assumptions": "Every printed Basic is an eligible opening Active; excludes mulligan replacement, opponent bonus draws, prize setting and voluntary benching.",
        "decks": results,
        "fully_resolved": sum(not x["unresolved_pokemon"] for x in results),
    }


def main():
    report = audit()
    with FileLock(str(OUT)+".lock"):
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8",
            dir=OUT.parent, prefix=".opening-audit-", suffix=".tmp", delete=False) as file:
            json.dump(report, file, ensure_ascii=False, indent=2)
            file.write("\n")
            tmp = file.name
        os.replace(tmp, OUT)
    print(f"Fully resolved: {report['fully_resolved']}/29")
    for row in report["decks"]:
        p = row["probabilities"]
        if p is None:
            print(f"{row['rank']} UNRESOLVED {row['unresolved_pokemon']}")
        else:
            print(f"{row['rank']:2d} Basic={row['basic_count_known']:2d}"
                  f" Mulligan={p['mulligan_initial']:.5f}"
                  f" LoneGivenValid={p['exactly_one_basic_given_valid']:.5f}"
                  f" LowHP={p['lone_hp_at_most_60_given_valid']:.5f}")


if __name__ == "__main__":
    main()
