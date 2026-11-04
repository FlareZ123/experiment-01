"""SFT: exact ADP-active first-turn enhanced-GX resource availability.

Requires the immutable Agent5 v2 roster. No opponent or game outcomes.
"""
from collections import Counter
from fractions import Fraction
from math import comb, sqrt
from pathlib import Path
import hashlib
import json
import random

PATH = Path(__file__).resolve().parents[1] / "results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json"
SHA = "bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b"
SEED = 12051408
TRIALS = 900000


def roster():
    data = json.loads(PATH.read_text(encoding="utf-8"))
    rows = data["cards"]
    raw = json.dumps([{"count": c["count"], "id": c["id"], "name": c["name"]}
                      for c in rows], ensure_ascii=False, separators=(",", ":"))
    assert hashlib.sha256(raw.encode()).hexdigest() == data["canonicalCardsSha256"] == SHA
    ids = {c["id"]: c["count"] for c in rows}
    a = ids["sm12-156"]
    b = sum(ids[k] for k in ("swsh12-135", "sm2-60", "swsh3-104"))
    d, g, t = (ids[k] for k in ("xy6-97", "sm12-193", "sm12-206"))
    c = (a, b, d, g, t, 60-a-b-d-g-t)
    assert c == (2, 5, 4, 3, 4, 42) and sum(x["count"] for x in rows) == 60
    return c


def vectors(sizes, n):
    if len(sizes) == 1:
        if n <= sizes[0]:
            yield (n,)
    else:
        for x in range(min(sizes[0], n)+1):
            for suffix in vectors(sizes[1:], n-x):
                yield (x,) + suffix


def count_exact(c):
    prize = comb(52, 6)
    all_d_prized = comb(48, 2)
    all_g_prized = comb(49, 3)
    result = Counter()
    for seven in vectors(c, 7):
        ways = 1
        for size, selected in zip(c, seven):
            ways *= comb(size, selected)
        for j, size in enumerate(c):
            remaining = size-seven[j]
            if not remaining:
                continue
            eight = list(seven)
            eight[j] += 1
            factor = ways*remaining
            result["all"] += factor*prize
            if seven[0]+seven[1] == 0:
                continue
            result["basic"] += factor*prize
            if seven[0] == 0:
                continue
            result["adp"] += factor*prize
            if eight[2]:
                result["direct"] += factor*prize
            elif eight[3]:
                result["gh"] += factor*(prize-all_d_prized)
            elif eight[4]:
                result["tag"] += factor*(prize-all_d_prized-all_g_prized)
    assert result["all"] == comb(60, 7)*53*prize
    assert result["basic"] == (comb(60, 7)-comb(53, 7))*53*prize
    assert result["adp"] == 92290059159217920
    assert [result[k] for k in ("direct", "gh", "tag")] == [
        37606562218854720, 18751154685007360, 16241591574433680]
    return result


def count_deals(c):
    physical = [kind for kind, n in enumerate(c) for _ in range(n)]
    rng = random.Random(SEED)
    result = Counter()
    for _ in range(TRIALS):
        deal = rng.sample(range(60), 14)
        seven = [physical[i] for i in deal[:7]]
        if 0 not in seven and 1 not in seven:
            continue
        result["basic"] += 1
        if 0 not in seven:
            continue
        result["adp"] += 1
        eight = seven + [physical[deal[7]]]
        prized = [physical[i] for i in deal[8:]]
        if 2 in eight:
            result["direct"] += 1
        elif prized.count(2) < 4:
            if 3 in eight:
                result["gh"] += 1
            elif 4 in eight and prized.count(3) < 3:
                result["tag"] += 1
    return result


if __name__ == "__main__":
    c = roster()
    exact = count_exact(c)
    sample = count_deals(c)
    print("Verified frozen 60:", SHA, "group counts:", c)
    print("Physical deals:", TRIALS, "Basic-valid:", sample["basic"], "seed:", SEED)
    for route in ("adp", "direct", "gh", "tag", "total"):
        keys = ("direct", "gh", "tag") if route == "total" else (route,)
        p = Fraction(sum(exact[k] for k in keys), exact["basic"])
        observed = sum(sample[k] for k in keys)
        q = observed/sample["basic"]
        z = abs(float(p)-q)/sqrt(float(p)*(1-float(p))/sample["basic"])
        print(f"{route}: exact {100*p:.11f}% ({p.numerator}/{p.denominator}), "
              f"observed {observed}/{sample['basic']} ({100*q:.8f}%), z={z:.3f}")
        assert z < 5, (route, z)
    print("PASS: exact counting and independent literal-60 physical sampling")
