"""Read-only audit of original rank-6 Volt Cyclone public damage and Prizes.

This frozen-profile printed baseline audit cannot qualify competitive games.
"""
from collections import Counter
from hashlib import sha256
import json
from pathlib import Path
import sys
from zipfile import ZipFile

NATIVE_SHA = "cb23422028015e88d8d701d5d6ffe46de137bdcf22abfe4e5e80abe20a33bd4b"
CARD_SHA = "c39af257e60a79a485aad09c7d7723b6afbb42eae1ba74e280b8a3f77581350a"
ENGINE_PIN = "a9905a76a6c4103ba4b6cb9a49e86bad795c5c05"
PROTOCOL = "agent22-original-rank6-volt-damage-prize-screen-v1"


def verify_zip_hash(path, expected):
    digest = sha256(Path(path).read_bytes()).hexdigest()
    if digest != expected:
        raise ValueError("original ZIP SHA256 mismatch")
    return digest


def get_card_index(archive):
    cards = {}
    for filename in archive.namelist():
        if filename.startswith("cards/en/") and filename.endswith(".json"):
            for card in json.loads(archive.read(filename)):
                if card["id"] in cards:
                    raise ValueError("duplicate card ID")
                cards[card["id"]] = card
    codes = {}
    for entry in json.loads(archive.read("sets/en.json")):
        if entry.get("ptcgoCode"):
            codes.setdefault(entry["ptcgoCode"], []).append(entry["id"])
    return cards, codes


def printed_source_card(name, printing, cards, codes):
    set_code = printing["set"]
    number = str(printing["number"])
    set_ids = ["smp"] if set_code == "SMP" else codes.get(set_code, [])
    if not set_ids:
        raise ValueError("unknown source set: " + set_code)
    number = ("SM" + number) if set_code == "SMP" else number
    matches = [cards[f"{sid}-{number}"] for sid in set_ids
               if f"{sid}-{number}" in cards
               and cards[f"{sid}-{number}"]["name"] == name]
    if len(matches) != 1:
        raise ValueError("source print missing or ambiguous: " + name)
    return matches[0]


def candidate_card_maps(root, cards, codes):
    source = json.loads((root / "results/aichi-2026/full-decklists.json").read_text(encoding="utf-8"))
    rank1 = next(deck for deck in source["decks"] if deck["rank"] == 1)
    champion = {
        row["name"]: printed_source_card(row["name"], row["printing"], cards, codes)
        for row in rank1["cards"] if row["category"] == "Pokémon"
    }
    newmoon = json.loads((root / "results/als/new-moon-lockbreak-english-proxy-60.json").read_text(encoding="utf-8"))
    proxy = {}
    for row in newmoon["entries"]:
        if row["type"] != "Pokémon":
            continue
        card = cards.get(row["english_proxy_card_id"])
        if card is None or card["name"] != row["name_en"]:
            raise ValueError("New Moon mechanical proxy ID mismatch")
        proxy[row["name_en"]] = card
    return {"champion-reference": champion, "new-moon-lockbreaker-v1": proxy}


def prize_value(card):
    subtype = set(card.get("subtypes", []))
    if "TAG TEAM" in subtype or "VMAX" in subtype:
        return 3
    if subtype.intersection({"GX", "ex", "V", "VSTAR"}):
        return 2
    return 1


def check_transition(attack, source_seat, target_card):
    """Independently compare the public pre/post attack to the printed baseline."""
    before = attack["publicBoardBefore"][1-source_seat]["active"]
    after = attack["publicBoardAfter"][1-source_seat]["active"]
    if before is None or before["name"] != target_card["name"]:
        raise ValueError("defender printed identity mismatch")
    if not isinstance(before["damage"], int) or before["damage"] < 0:
        raise ValueError("invalid native damage observation")
    if any(entry["type"] == "Lightning" for entry in
           (target_card.get("weaknesses") or []) + (target_card.get("resistances") or [])):
        raise ValueError("unmodeled Lightning Weakness/Resistance")
    hp = int(target_card["hp"])
    predicted_ko = before["damage"] + 140 >= hp
    observed_ko = after is None or after["name"] != before["name"]
    if observed_ko != predicted_ko:
        raise ValueError("printed HP/KO threshold mismatch")
    remaining = attack["prizesBefore"][source_seat]
    actual_prizes = remaining - attack["prizesAfter"][source_seat]
    printed_prizes = min(prize_value(target_card), remaining) if observed_ko else 0
    if actual_prizes != printed_prizes:
        raise ValueError("printed Prize award mismatch")
    if not observed_ko and after["damage"] - before["damage"] != 140:
        raise ValueError("printed 140 damage mismatch")
    return "ko-prize-" + str(actual_prizes) if observed_ko else "survived-140"


def screen_frozen(native_archive, card_archive, repo_root):
    cards, codes = get_card_index(card_archive)
    card_maps = candidate_card_maps(repo_root, cards, codes)
    native = json.loads(native_archive.read("agent41-frozen-bilateral-development-v2-native.json"))
    if native.get("attempted") != 32 or len(native["rows"]) != 32 or native["nativePin"] != ENGINE_PIN:
        raise ValueError("frozen original run identity mismatch")
    seen_trials = set()
    rank6_trials = 0
    categories = Counter()
    for row in native["rows"]:
        trial = row["trial"]
        if trial["id"] in seen_trials:
            raise ValueError("duplicate trial")
        seen_trials.add(trial["id"])
        if trial["rank"] != 6:
            continue
        rank6_trials += 1
        defender_printings = card_maps[trial["candidateId"]]
        for attack in row["sourceAttackSettlement"]["attacks"]:
            if attack["attackName"] != "Volt Cyclone" or not attack["settledPromptChain"]:
                raise ValueError("unexpected unsettled source attack")
            seat = row["sourceSeat"]
            old = attack["publicBoardBefore"][1-seat]["active"]
            defender = defender_printings.get(old["name"])
            if defender is None:
                raise ValueError("unresolved original defender printing")
            categories[check_transition(attack, seat, defender)] += 1
    if len(seen_trials) != 32 or rank6_trials != 16 or sum(categories.values()) != 50:
        raise ValueError("original 32/16/50 denominator mismatch")
    return {
        "protocol": PROTOCOL,
        "native_attempts": len(seen_trials),
        "original_rank6_trials": rank6_trials,
        "printed_baseline_attacks_checked": sum(categories.values()),
        "classes": dict(sorted(categories.items())),
        "mismatches": 0,
        "scope": "printed HP, 140 damage, Active KO and Prize side only",
        "competitive_qualified_games": 0,
    }


def run(native_path, card_path, repo_root):
    native_hash = verify_zip_hash(native_path, NATIVE_SHA)
    card_hash = verify_zip_hash(card_path, CARD_SHA)
    with ZipFile(native_path) as native, ZipFile(card_path) as cards:
        summary = screen_frozen(native, cards, Path(repo_root))
    summary["native_archive_sha256"] = native_hash
    summary["card_archive_sha256"] = card_hash
    return summary


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: agent22_original_rank6_volt_damage_prize.py NATIVE.zip CARDS.zip")
    repo_root = Path(__file__).resolve().parents[1]
    print(json.dumps(run(sys.argv[1], sys.argv[2], repo_root), indent=2, sort_keys=True))
