"""Reproducible conditional hand-only rank8 Secret Box K0 opportunity model.

This is a deterministic theoretical opening proxy, not a Pokemon game simulator.
The source is the original rank8 printed60 (full-decklists.json, 2026-05-10).
Assumptions: uniform seven-card initial hand conditional on >=1 Basic,
choose Active by priority, optionally Bench all or no other initial Basics,
place six random Prizes, draw one ordinary first-own-turn card, and perform
no other actions. No opponent Item lock or additional mulligan-card draws.
K1 means relevant search targets remain unprized and in deck. Actual native
bot choice, Searcher payment, native validation and opponent response differ.
"""

from collections import Counter
import json
import math
import random

SOURCE_SHA256 = "6d955f821a0ae206110189adf53621a29c2d49afdeade1206dee46a2a50f8541"
SEED = 44110207
TRIALS = 200_000

COUNTS = {
    "Mega Absol ex": 2, "Trubbish": 2, "Garbodor": 2,
    "Tapu Koko Prism": 1, "Dedenne-GX": 1, "Crobat V": 1,
    "Squawkabilly ex": 1, "Tapu Lele-GX": 1, "Budew": 1,
    "Lillie's Determination": 1, "Carmine": 1, "Iono": 1,
    "Roxanne": 1, "Guzma": 1, "Crispin": 1, "Wally": 1,
    "Karen": 1, "Quick Ball": 4, "Dark Patch": 4, "VS Seeker": 3,
    "Battle Compressor": 2, "Ultra Ball": 2, "Battle VIP Pass": 2,
    "Boost Shake": 1, "Secret Box": 1, "Night Stretcher": 1,
    "Super Rod": 1, "Pokémon Communication": 1,
    "Hisuian Heavy Ball": 1, "Field Blower": 1, "Adventure Bag": 1,
    "Float Stone": 4, "Muscle Band": 1, "Forest Seal Stone": 1,
    "Temple of Sinnoh": 2, "Darkness Energy": 5,
    "Lightning Energy": 2,
}
BASICS = {
    "Mega Absol ex", "Trubbish", "Tapu Koko Prism", "Dedenne-GX",
    "Crobat V", "Squawkabilly ex", "Tapu Lele-GX", "Budew",
}
ACTIVE_PRIORITY = [
    "Mega Absol ex", "Tapu Koko Prism", "Squawkabilly ex",
    "Budew", "Trubbish", "Dedenne-GX", "Crobat V", "Tapu Lele-GX",
]


def condition(hand, in_play, live_deck, flexible):
    """Return K0 physical offer and K1 unprized-target viability."""
    cards = Counter(hand)
    if not cards["Secret Box"] or cards["Boost Shake"]:
        return False, False

    if not flexible:
        if (not cards["Trubbish"] or
            not (cards["Float Stone"] or cards["Muscle Band"]) or
            in_play["Trubbish"]):
            return False, False

    tool = (
        "Float Stone" if cards["Float Stone"] else
        "Muscle Band" if cards["Muscle Band"] else None
    )
    mode = (
        "already-in-play" if in_play["Trubbish"] else
        "held-basic" if cards["Trubbish"] else "held-searcher"
    )
    searcher = (
        "Quick Ball" if cards["Quick Ball"] else
        "Ultra Ball" if cards["Ultra Ball"] else None
    ) if mode == "held-searcher" else None
    if mode == "held-searcher" and searcher is None:
        return False, False
    if mode != "already-in-play" and sum(in_play.values()) >= 6:
        return False, False

    reserved = Counter({"Secret Box": 1})
    if mode == "held-basic":
        reserved["Trubbish"] += 1
    if tool:
        reserved[tool] += 1
    if searcher:
        reserved[searcher] += 1

    payment = 1 if searcher == "Quick Ball" else (
        2 if searcher == "Ultra Ball" else 0
    )
    if sum((cards - reserved).values()) < 3 + payment:
        return False, False

    targets = Counter(live_deck)
    k1 = bool(
        targets["Boost Shake"] and targets["Garbodor"] and
        (tool or targets["Float Stone"] or targets["Muscle Band"]) and
        (mode != "held-searcher" or targets["Trubbish"])
    )
    return True, k1


def wilson95(successes, n):
    """Nominal Bernoulli Wilson interval, ignoring real simulator errors."""
    z = 1.959963984540054
    p = successes / n
    d = 1 + z * z / n
    center = (p + z * z / (2 * n)) / d
    half = z * math.sqrt(
        p * (1 - p) / n + z * z / (4 * n * n)
    ) / d
    return [center - half, center + half]


def run():
    deck = [
        name for name, copies in COUNTS.items() for _ in range(copies)
    ]
    assert len(deck) == 60
    rng = random.Random(SEED)
    valid = 0
    counts = {
        "bench-none": Counter(),
        "bench-all-other-basics": Counter(),
    }
    for _ in range(TRIALS):
        cards = rng.sample(deck, 14)
        opening = cards[:7]
        if not any(name in BASICS for name in opening):
            continue
        valid += 1

        active = next(
            name for name in ACTIVE_PRIORITY if name in opening
        )
        other = opening.copy()
        other.remove(active)
        remaining = list(
            (Counter(deck) - Counter(cards)).elements()
        )
        turn_draw = cards[13]

        for bench_strategy, outcomes in counts.items():
            bench = (
                [name for name in other if name in BASICS][:5]
                if bench_strategy == "bench-all-other-basics" else []
            )
            hand = [
                name for name in other if name not in bench
            ] + [turn_draw]
            in_play = Counter([active] + bench)
            for profile in ("strict", "flexible"):
                k0, k1 = condition(
                    hand, in_play, remaining,
                    flexible=profile == "flexible"
                )
                outcomes[f"{profile}-K0"] += int(k0)
                outcomes[f"{profile}-K1-live"] += int(k1)

    return {
        "schema": "agent44-rank8-conditional-firstturn-opening-proxy-v1",
        "sourcePrinted60Sha256": SOURCE_SHA256,
        "seed": SEED,
        "attemptsIncludingMulliganHands": TRIALS,
        "validNoMulliganOpeners": valid,
        "assumptions": "7 initial conditional Basic; scripted Active preference; all/zero other Basics Benched; six random Prizes; first turn draw; no prior owner actions; no opponent locks; no real native opponent",
        "outcomes": {
            strategy: {
                key: {
                    "count": n,
                    "conditionalValidOpeningFrequency": n / valid,
                    "nominalWilson95": wilson95(n, valid),
                } for key, n in values.items()
            } for strategy, values in counts.items()
        },
        "competitiveQualifiedGames": 0,
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2, ensure_ascii=False))
