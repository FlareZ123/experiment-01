#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <numeric>
#include <random>
#include <string>
#include <vector>

// Exact card identities/counts for a 60-card hypothetical sensitivity:
// Hood Shield Shadow Rider v1 + 1 Enamorus V, cutting Pokemon Ranger.
// No candidate list or policy is changed by this model.
enum Cat {
  ENAMORUS, HOOD, SRV, VMAX, CLEFAIRY, TAPU_LELE, TREV_DUSK, LATIAS,
  DIALGA, MIMIKYU, GIRAFARIG, MARSHADOW, RADIANT_ETERNATUS,
  LILLIES_DETERMINATION, IONO, TEAMMATES, RAIHAN, ACEROLA, GUZMA,
  MYSTERIOUS_TREASURE, FOG_CRYSTAL, VS_SEEKER, QUICK_BALL, HEAVY_BALL,
  BATTLE_COMPRESSOR, FIELD_BLOWER, NIGHT_STRETCHER, UNFAIR_STAMP,
  FLOAT_STONE, FOREST_SEAL_STONE, SKY_FIELD, DIMENSION_VALLEY,
  PSYCHIC_ENERGY, ARVEN, N_CATS
};

static const std::array<int, N_CATS> C = {
  1,2,4,4,2,1,1,1,1,1,1,1,1,2,1,1,1,1,1,
  4,4,2,1,1,1,1,1,1,1,1,1,1,11,1
};
static const std::array<const char*, N_CATS> NAMES = {
  "Enamorus V","Stealthy Hood","Shadow Rider Calyrex V",
  "Shadow Rider Calyrex VMAX","Lillie's Clefairy ex","Tapu Lele-GX",
  "Trevenant & Dusknoir-GX","Latias ex","Dialga-GX","Mimikyu",
  "Girafarig","Marshadow","Radiant Eternatus","Lillie's Determination",
  "Iono","Teammates","Raihan","Acerola","Guzma","Mysterious Treasure",
  "Fog Crystal","VS Seeker","Quick Ball","Hisuian Heavy Ball",
  "Battle Compressor","Field Blower","Night Stretcher","Unfair Stamp",
  "Float Stone","Forest Seal Stone","Sky Field","Dimension Valley",
  "Psychic Energy","Arven"
};

static bool is_basic(int c) {
  return c==ENAMORUS || c==SRV || c==CLEFAIRY || c==TAPU_LELE ||
         c==TREV_DUSK || c==LATIAS || c==DIALGA || c==MIMIKYU ||
         c==GIRAFARIG || c==MARSHADOW || c==RADIANT_ETERNATUS;
}

static bool strict_duplicate_candidate(int c) {
  return c==HOOD || c==SRV || c==VMAX || c==MYSTERIOUS_TREASURE ||
         c==FOG_CRYSTAL || c==VS_SEEKER || c==LILLIES_DETERMINATION;
}

static bool can_discard(const std::array<int,N_CATS>& seen, int policy) {
  // 0: duplicate key engine/search cards only.
  // 1: any duplicate non-Energy card.
  // 2: policy 1 plus Energy recoverable by spending Night Stretcher.
  // 3: any-other-card ceiling; intentionally unrealistic.
  for (int c=0;c<N_CATS;++c) {
    if (seen[c] < 2) continue;
    if (policy==0 && strict_duplicate_candidate(c)) return true;
    if ((policy==1 || policy==2) && c!=PSYCHIC_ENERGY) return true;
  }
  if (policy==2 && seen[PSYCHIC_ENERGY]>0 && seen[NIGHT_STRETCHER]>0) return true;
  if (policy==3) {
    int total=0; for(int x:seen) total+=x;
    return total>=2;
  }
  return false;
}

struct Result {
  bool valid=false, core=false, base_anchor=false, base_anchor_no_fss=false;
  bool dci_anchor=false, dci_anchor_no_fss=false, mt_or_qb_payable=false;
  bool mt_payable=false, qb_payable=false;
};

static Result evaluate(const std::array<int,N_CATS>& hand,
                       const std::array<int,N_CATS>& prizes,
                       const std::array<int,N_CATS>& draw1,
                       const std::array<int,N_CATS>& draw2,
                       bool going_second, int dci_policy) {
  std::array<int,N_CATS> seen{}, deck{};
  int basics=0;
  for(int c=0;c<N_CATS;++c) {
    seen[c]=hand[c]+draw1[c]+draw2[c];
    deck[c]=C[c]-hand[c]-prizes[c]-draw1[c]-draw2[c];
    if(is_basic(c)) basics += hand[c];
  }
  if (basics==0) return {};

  const bool discardable=can_discard(seen,dci_policy);
  const bool mt_payable=seen[MYSTERIOUS_TREASURE]>0 && discardable && deck[ENAMORUS]>0;
  const bool qb_payable=seen[QUICK_BALL]>0 && discardable && deck[ENAMORUS]>0;
  const bool dci_search_in_hand=mt_payable || qb_payable;

  // Keep the published core event natural-only; MT/QB are not credited with
  // finding Shadow Rider V or VMAX in this extension.
  const int v_by_t1=hand[SRV]+(going_second?draw1[SRV]:0);
  const int vmax_by_t2=hand[VMAX]+draw1[VMAX]+draw2[VMAX];
  const bool core=v_by_t1>0 && vmax_by_t2>0;

  const bool enamorus_direct = seen[ENAMORUS]>0 ||
      (deck[ENAMORUS]>0 && seen[FOG_CRYSTAL]>0) ||
      (prizes[ENAMORUS]>0 && seen[HEAVY_BALL]>0) ||
      dci_search_in_hand;
  const bool hood_direct=seen[HOOD]>0;
  const bool arven=seen[ARVEN]>0;
  const bool fss_hand=seen[FOREST_SEAL_STONE]>0;
  const bool fss_deck=deck[FOREST_SEAL_STONE]>0;
  const bool sr_v_by_t2=seen[SRV]>0; // preserve the prior model's FSS carrier restriction

  const bool hood_target=deck[HOOD]>0;
  const bool tool_remains=deck[HOOD]+deck[FLOAT_STONE]+deck[FOREST_SEAL_STONE]>0;
  const bool arven_hood=arven && hood_target;

  const bool base_item_for_enamorus_in_deck =
      (deck[ENAMORUS]>0 && deck[FOG_CRYSTAL]>0) ||
      (prizes[ENAMORUS]>0 && deck[HEAVY_BALL]>0);
  const bool item_for_enamorus_in_deck =
      (deck[ENAMORUS]>0 && (deck[FOG_CRYSTAL]>0 ||
       (discardable && (deck[MYSTERIOUS_TREASURE]>0 || deck[QUICK_BALL]>0)))) ||
      (prizes[ENAMORUS]>0 && deck[HEAVY_BALL]>0);
  const bool enamorus_target_for_fss =
      deck[ENAMORUS]>0 || (prizes[ENAMORUS]>0 && deck[HEAVY_BALL]>0);

  // Reproduce Agent43's published no-DCI route before adding MT/QB.
  const bool base_enamorus_direct = seen[ENAMORUS]>0 ||
      (deck[ENAMORUS]>0 && seen[FOG_CRYSTAL]>0) ||
      (prizes[ENAMORUS]>0 && seen[HEAVY_BALL]>0);
  const bool base_arven_dual = arven && tool_remains && base_item_for_enamorus_in_deck;
  const bool base_anchor_no_fss =
      (base_enamorus_direct || base_arven_dual) &&
      (hood_direct || arven_hood);

  // DCI extension without Star Alchemy: paid MT/QB can search Enamorus,
  // either already in hand or fetched by Arven as its Item target.
  const bool dci_arven_dual = arven && tool_remains && item_for_enamorus_in_deck;
  const bool dci_anchor_no_fss =
      (enamorus_direct || dci_arven_dual) &&
      (hood_direct || arven_hood);

  // Preserve the published FSS assumptions: one VSTAR search, Shadow Rider V
  // by T2, an open Tool slot, and an unused VSTAR Power.
  const bool fss_ready=(fss_hand || (arven && fss_deck)) && sr_v_by_t2;
  const bool fss_fetched_by_arven=arven && fss_deck;
  bool base_anchor=base_anchor_no_fss;
  bool dci_anchor=dci_anchor_no_fss;

  if (fss_ready && fss_hand) {
    if (base_enamorus_direct && hood_target) base_anchor=true;
    if ((hood_direct || arven_hood) && enamorus_target_for_fss) base_anchor=true;
    if (enamorus_direct && hood_target) dci_anchor=true;
    if ((hood_direct || arven_hood) && enamorus_target_for_fss) dci_anchor=true;
  }

  if (fss_ready && fss_fetched_by_arven) {
    if (base_enamorus_direct && hood_target) base_anchor=true;
    if (hood_direct && enamorus_target_for_fss) base_anchor=true;
    if (!base_enamorus_direct && !hood_direct && hood_target &&
        base_item_for_enamorus_in_deck) base_anchor=true;

    if (enamorus_direct && hood_target) dci_anchor=true;
    if (hood_direct && enamorus_target_for_fss) dci_anchor=true;
    if (!enamorus_direct && !hood_direct && hood_target &&
        item_for_enamorus_in_deck) dci_anchor=true;
  }

  return {true,core,base_anchor,base_anchor_no_fss,dci_anchor,dci_anchor_no_fss,
          dci_search_in_hand,mt_payable,qb_payable};
}

struct Stats {
  uint64_t valid=0, core=0, base=0, base_no_fss=0, base_joint=0;
  std::array<uint64_t,4> anchor{}, joint{}, incremental{}, incremental_joint{},
                         anchor_no_fss{}, mtqb_payable{}, mt_payable{}, qb_payable{};
};

static void add(Stats& s, const Result& r, int policy) {
  if(!r.valid) return;
  if(policy==0) {
    s.core+=r.core; s.base+=r.base_anchor;
    s.base_no_fss+=r.base_anchor_no_fss; s.base_joint+=(r.base_anchor && r.core);
  }
  s.anchor[policy]+=r.dci_anchor;
  s.joint[policy]+=(r.dci_anchor && r.core);
  s.incremental[policy]+=(r.dci_anchor && !r.base_anchor);
  s.incremental_joint[policy]+=(r.dci_anchor && r.core && !r.base_anchor);
  s.anchor_no_fss[policy]+=r.dci_anchor_no_fss;
  s.mtqb_payable[policy]+=r.mt_or_qb_payable;
  s.mt_payable[policy]+=r.mt_payable;
  s.qb_payable[policy]+=r.qb_payable;
}

static void print_rate(const char* label, uint64_t k, uint64_t n) {
  const double p=double(k)/double(n);
  const double se=std::sqrt(p*(1.0-p)/double(n));
  std::cout<<std::left<<std::setw(36)<<label<<std::right<<std::fixed<<std::setprecision(4)
           <<100*p<<"% ("<<k<<"/"<<n<<")  95% CI ["
           <<100*(p-1.96*se)<<", "<<100*(p+1.96*se)<<"]\n";
}

int main(int argc,char**argv) {
  const uint64_t trials=argc>1?std::stoull(argv[1]):20000000ULL;
  const uint64_t seed=argc>2?std::stoull(argv[2]):2026111905ULL;
  std::vector<int> deck;
  for(int c=0;c<N_CATS;++c) for(int k=0;k<C[c];++k) deck.push_back(c);
  if(deck.size()!=60) { std::cerr<<"deck size="<<deck.size()<<"\n"; return 2; }
  std::mt19937_64 rng(seed);
  Stats s[2];
  const int policies=4;
  std::array<int,N_CATS> hand{},prizes{},draw1{},draw2{},no_draw{};
  uint64_t valid_deals=0;
  while(valid_deals<trials) {
    std::shuffle(deck.begin(),deck.end(),rng);
    hand.fill(0); prizes.fill(0); draw1.fill(0); draw2.fill(0);
    int basics=0;
    for(int i=0;i<7;++i) { ++hand[deck[i]]; if(is_basic(deck[i])) ++basics; }
    if(basics==0) continue; // conditional sample: reject invalid opening sevens
    ++valid_deals;
    for(int i=7;i<13;++i) ++prizes[deck[i]];
    ++draw1[deck[13]]; // first natural draw after setup
    ++draw2[deck[14]]; // second natural draw after setup
    for(int seat=0;seat<2;++seat) {
      for(int p=0;p<policies;++p) {
        Result r= seat==0 ? evaluate(hand,prizes,no_draw,draw1,false,p)
                          : evaluate(hand,prizes,draw1,draw2,true,p);
        add(s[seat],r,p);
      }
      ++s[seat].valid;
    }
  }
  std::cout<<"deck_size="<<deck.size()<<" valid_trials="<<trials<<" seed="<<seed<<"\n";
  std::cout<<"valid_opening_probability_exact=88.2499205% (15 Basic among 60; conditioned sample, no mulligan bonus)\n";
  std::cout<<"hypothetical_deck=Hood_Shadow_Rider_v1_plus_Enamorus_minus_Pokemon_Ranger\n";
  std::cout<<"Policies: 0 strict duplicate-only; 1 any duplicate non-Energy; 2 policy1 + Energy recoverable via Night Stretcher; 3 optimistic any-card ceiling.\n\n";
  for(int seat=0;seat<2;++seat) {
    const char* seatname=seat==0?"GOING_FIRST":"GOING_SECOND";
    std::cout<<"=== "<<seatname<<" ===\n";
    print_rate("natural SRV V by T1 + VMAX by T2",s[seat].core,s[seat].valid);
    print_rate("baseline anchor no FSS",s[seat].base_no_fss,s[seat].valid);
    print_rate("baseline anchor incl. FSS",s[seat].base,s[seat].valid);
    print_rate("baseline joint with natural core",s[seat].base_joint,s[seat].valid);
    for(int p=0;p<policies;++p) {
      std::string name="DCI policy "+std::to_string(p)+" anchor incl. FSS";
      print_rate(name.c_str(),s[seat].anchor[p],s[seat].valid);
      name="DCI policy "+std::to_string(p)+" joint with natural core";
      print_rate(name.c_str(),s[seat].joint[p],s[seat].valid);
      name="DCI policy "+std::to_string(p)+" incremental anchor";
      print_rate(name.c_str(),s[seat].incremental[p],s[seat].valid);
      name="DCI policy "+std::to_string(p)+" incremental joint";
      print_rate(name.c_str(),s[seat].incremental_joint[p],s[seat].valid);
      name="DCI policy "+std::to_string(p)+" anchor no FSS";
      print_rate(name.c_str(),s[seat].anchor_no_fss[p],s[seat].valid);
      name="DCI policy "+std::to_string(p)+" MT or QB payable";
      print_rate(name.c_str(),s[seat].mtqb_payable[p],s[seat].valid);
    }
    std::cout<<"\n";
  }
}
