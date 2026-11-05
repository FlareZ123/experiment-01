// Agent11: independent physical-permutation check of the exact joint setup
// calculation. C++17, mt19937_64, explicitly printed category counts.
// Models ONLY first-turn resource access and a restrictive opening screen.
// It does not drive Twinleaf, play opponents, or produce win-rate estimates.
#include <algorithm>
#include <array>
#include <cstdint>
#include <cstdlib>
#include <iostream>
#include <random>
#include <stdexcept>

using Deck = std::array<uint8_t, 60>;

bool validSource(const Deck& deck) {
  for (int i = 0; i < 7; ++i) if (deck[i] == 0) return true;
  return false;
}

bool validCandidate(const Deck& deck) {
  for (int i = 0; i < 7; ++i) if (deck[i] <= 1) return true;
  return false;
}

void fill(Deck& deck, const std::array<int, 7>& counts) {
  int at = 0;
  for (int category = 0; category < 7; ++category)
    for (int n = 0; n < counts[category]; ++n)
      deck[at++] = static_cast<uint8_t>(category);
  if (at != 60) throw std::runtime_error("Deck category counts must sum to 60");
}

// Exactly one vulnerable Basic present among opening seven; no other Basic
// or direct rescuer in combined starting seven + all bonus cards + first draw.
// No both Compressor and Carrier. Prizes are at physical positions 7..12.
bool candidateScreen(const Deck& deck, int bonus) {
  int held[7] = {};
  for (int at = 0; at < 7; ++at) ++held[deck[at]];
  for (int at = 13; at <= 13 + bonus; ++at) ++held[deck[at]];
  return held[0] == 1 && held[1] == 0 && held[2] == 0 &&
    !(held[3] > 0 && held[4] > 0);
}

// Source categories: 0 Thorns; 1 G&H; 2 Tag Call; 3 Mountain;
// 4 DCE; 5 Trainers' Mail; 6 other.
// Source hand is physical 0..6, 13..13+bonus; Prize positions 7..12.
// Every miss on Mail returns all four viewed cards and shuffles afresh.
// Drawing Mail is not a native action here; this is an offline access screen.
bool sourceAccess(const Deck& deck, int bonus, std::mt19937_64& rng) {
  int held[7] = {}, remaining[7] = {};
  for (int i = 0; i < 7; ++i) ++held[deck[i]];
  for (int i = 13; i <= 13 + bonus; ++i) ++held[deck[i]];
  for (int i = 14 + bonus; i < 60; ++i) ++remaining[deck[i]];
  const bool connector = held[1] > 0 ||
    (held[2] > 0 && remaining[1] > 0);
  if ((held[3] > 0 || (connector && remaining[3] > 0)) &&
      (held[4] > 0 || (connector && remaining[4] > 0))) return true;
  if (held[5] == 0 || held[3] + remaining[3] == 0 ||
      held[4] + remaining[4] == 0) return false;
  const int eligible =
    (remaining[1] > 0 ? remaining[1] + remaining[2] : 0) +
    (held[4] > 0 && held[3] == 0 ? remaining[3] : 0);
  if (eligible == 0) return false;
  const int deckSize = 46 - bonus;
  for (int mail = 0; mail < held[5]; ++mail) {
    int drawnPositions[4] = {-1, -1, -1, -1};
    for (int draw = 0; draw < 4; ++draw) {
      int index;
      bool seen;
      do {
        index = std::uniform_int_distribution<int>(0, deckSize - 1)(rng);
        seen = false;
        for (int j = 0; j < draw; ++j)
          if (drawnPositions[j] == index) { seen = true; break; }
      } while (seen);
      drawnPositions[draw] = index;
      const uint8_t card = deck[index + 14 + bonus];
      if ((remaining[1] > 0 && (card == 1 || card == 2)) ||
          (held[4] > 0 && held[3] == 0 && card == 3)) return true;
    }
  }
  return false;
}

int main(int argc, char** argv) {
  // Inputs: physical trials, DCE, Mail, PRNG seed, sourceTakeAll, candidateTakeAll.
  // Optional flags default to one, preserving all frozen 200m main runs.
  const int iterations = argc > 1 ? std::atoi(argv[1]) : 2000000;
  const int dce = argc > 2 ? std::atoi(argv[2]) : 1;
  const int mails = argc > 3 ? std::atoi(argv[3]) : 3;
  const uint64_t seed = argc > 4
    ? std::strtoull(argv[4], nullptr, 0) : 0xA11C2026D00DULL;
  const int sourceTakeAll = argc > 5 ? std::atoi(argv[5]) : 1;
  const int candidateTakeAll = argc > 6 ? std::atoi(argv[6]) : 1;
  if ((sourceTakeAll != 0 && sourceTakeAll != 1) ||
      (candidateTakeAll != 0 && candidateTakeAll != 1) ||
      iterations < 1 || !(dce == 1 || dce == 3) ||
      mails < 2 || mails > 4 || dce + mails > 51)
    throw std::invalid_argument("invalid trial count or source categories");
  std::mt19937_64 rng(seed);
  Deck source{}, candidate{};
  fill(source, {4, 2, 2, 1, dce, mails, 51 - dce - mails});
  fill(candidate, {5, 12, 16, 2, 2, 23, 0});

  int64_t both = 0, sourceBonusCount = 0, candidateBonusCount = 0;
  int64_t candidateScreenCount = 0, sourceAccessCount = 0, joint = 0;
  std::array<int64_t, 3> branchN{}, branchScreen{},
    branchAccess{}, branchJoint{};
  for (int trial = 0; trial < iterations; ++trial) {
    bool sourceValid, candidateValid;
    int sourceBonus = 0, candidateBonus = 0;
    do {
      std::shuffle(source.begin(), source.end(), rng);
      std::shuffle(candidate.begin(), candidate.end(), rng);
      sourceValid = validSource(source);
      candidateValid = validCandidate(candidate);
    } while (!sourceValid && !candidateValid);
    if (sourceValid && !candidateValid) {
      do {
        ++sourceBonus;
        std::shuffle(candidate.begin(), candidate.end(), rng);
        candidateValid = validCandidate(candidate);
      } while (!candidateValid);
    } else if (candidateValid && !sourceValid) {
      do {
        ++candidateBonus;
        std::shuffle(source.begin(), source.end(), rng);
        sourceValid = validSource(source);
      } while (!sourceValid);
    } else {
      ++both;
    }
    // The exact model proves the excluded long tails are below displayed
    // precision. Skipped extreme trials still remain in the denominator.
    if (sourceBonus > 30 || candidateBonus > 30) continue;
    const bool screened = candidateScreen(candidate,
      candidateTakeAll ? candidateBonus : 0);
    const bool available = sourceAccess(source,
      sourceTakeAll ? sourceBonus : 0, rng);
    const int branch = sourceBonus > 0 ? 2 : candidateBonus > 0 ? 1 : 0;
    ++branchN[branch];
    if (screened) ++branchScreen[branch];
    if (available) ++branchAccess[branch];
    if (screened && available) ++branchJoint[branch];
    if (screened) ++candidateScreenCount;
    if (available) ++sourceAccessCount;
    if (screened && available) ++joint;
    if (sourceBonus > 0) ++sourceBonusCount;
    if (candidateBonus > 0) ++candidateBonusCount;
  }
  std::cout.precision(11);
  std::cout << "iterations=" << iterations
    << " dce=" << dce << " mail=" << mails
    << " bothValid=" << double(both) / iterations
    << " sourceBonus=" << double(sourceBonusCount) / iterations
    << " candidateBonus=" << double(candidateBonusCount) / iterations
    << " candidateScreen=" << double(candidateScreenCount) / iterations
    << " sourceAccess=" << double(sourceAccessCount) / iterations
    << " joint=" << double(joint) / iterations
    << " jointCount=" << joint << " seed=" << seed
    << " sourceTakeAll=" << sourceTakeAll
    << " candidateTakeAll=" << candidateTakeAll;
  for (int i = 0; i < 3; ++i)
    std::cout << " branch" << i << "N=" << branchN[i]
      << " branch" << i << "Screen=" << branchScreen[i]
      << " branch" << i << "Access=" << branchAccess[i]
      << " branch" << i << "Joint=" << branchJoint[i];
  std::cout << '\n';
}
