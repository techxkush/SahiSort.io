/**
 * Configured waste-management guide. Passages include both national statutory frameworks
 * and campus/locality-specific guides. Retrieval prioritizes local rules when both match.
 */

export type DisposalCategory =
  | "Dry Waste"
  | "Wet Waste"
  | "Domestic Hazardous"
  | "E-Waste"
  | "Sanitary";

export type GuidePassage = {
  id: string;
  title: string;
  category: DisposalCategory;
  source: string;
  section: string;
  url: string;
  topic?: string;
  keywords: string[];
  text: string;
  prep_steps?: string[];
  scope: "national" | "local";
};

export const GUIDE_META = {
  locality: "Green Campus / Powai Locality",
  guide_title: "Campus & Locality Waste Segregation and Disposal Guide",
  guide_source: "https://cpcb.nic.in/uploads/MSW/SWM_2016.pdf",
  last_updated: "October 2026",
  name: "Campus & National Waste Segregation Rules",
  jurisdiction:
    "India — National Framework with Local Campus & Municipal Priorities",
  note: "Local campus rules take precedence over general national guidelines. Passages are statutory and official verbatim rules.",
};

const SWM = "Solid Waste Management Rules, 2016 (MoEFCC)";
const SWM_URL = "https://cpcb.nic.in/uploads/MSW/SWM_2016.pdf";
const PWM = "Plastic Waste Management Rules, 2016 (as amended 2021–2022)";
const PWM_URL = "https://cpcb.nic.in/plastic-waste/";
const EW = "E-Waste (Management) Rules, 2022";
const EW_URL = "https://cpcb.nic.in/e-waste/";
const BW = "Battery Waste Management Rules, 2022";
const BW_URL = "https://cpcb.nic.in/battery-waste/";

export const GUIDE: GuidePassage[] = [
  // =========================================================================
  // LOCAL GUIDE PLACEHOLDERS (Campus / Locality Specific)
  // TODO: paste verbatim from supplied guide. Do not invent local rules, bin colours, or schedules.
  // =========================================================================
  {
    id: "local-dry-waste",
    title: "Local Dry Waste Segregation",
    category: "Dry Waste",
    source: "Campus & Locality Waste Management Directive",
    section: "Section 3.1: Dry Recyclables",
    url: GUIDE_META.guide_source,
    topic: "Local Dry Waste",
    keywords: [
      "dry",
      "paper",
      "cardboard",
      "plastic",
      "bottle",
      "can",
      "tin",
      "glass",
      "carton",
      "box",
      "packaging",
      "wrapper",
    ],
    text: "// TODO: paste verbatim from supplied guide",
    prep_steps: [
      "// TODO: paste verbatim prep step from supplied guide",
    ],
    scope: "local",
  },
  {
    id: "local-wet-waste",
    title: "Local Wet & Organic Waste Management",
    category: "Wet Waste",
    source: "Campus & Locality Waste Management Directive",
    section: "Section 3.2: Biodegradable Streams",
    url: GUIDE_META.guide_source,
    topic: "Local Wet Waste",
    keywords: [
      "wet",
      "food",
      "organic",
      "peel",
      "vegetable",
      "fruit",
      "leftovers",
      "compost",
      "biodegradable",
    ],
    text: "// TODO: paste verbatim from supplied guide",
    prep_steps: [
      "// TODO: paste verbatim prep step from supplied guide",
    ],
    scope: "local",
  },
  {
    id: "local-hazardous-waste",
    title: "Local Domestic Hazardous & Chemical Waste",
    category: "Domestic Hazardous",
    source: "Campus & Locality Waste Management Directive",
    section: "Section 4.1: Hazardous Materials",
    url: GUIDE_META.guide_source,
    topic: "Local Hazardous Waste",
    keywords: [
      "hazardous",
      "chemical",
      "paint",
      "pesticide",
      "cfl",
      "bulb",
      "mercury",
      "medicine",
      "aerosol",
      "spray",
      "battery",
    ],
    text: "// TODO: paste verbatim from supplied guide",
    prep_steps: [
      "// TODO: paste verbatim prep step from supplied guide",
    ],
    scope: "local",
  },
  {
    id: "local-e-waste",
    title: "Local Electrical & Electronic Equipment Disposal",
    category: "E-Waste",
    source: "Campus & Locality Waste Management Directive",
    section: "Section 4.2: Electronic Drop-off",
    url: GUIDE_META.guide_source,
    topic: "Local E-Waste",
    keywords: [
      "electronic",
      "phone",
      "charger",
      "cable",
      "laptop",
      "appliance",
      "e-waste",
      "battery-powered",
    ],
    text: "// TODO: paste verbatim from supplied guide",
    prep_steps: [
      "// TODO: paste verbatim prep step from supplied guide",
    ],
    scope: "local",
  },
  {
    id: "local-sanitary-waste",
    title: "Local Sanitary & Medical Hygiene Protocol",
    category: "Sanitary",
    source: "Campus & Locality Waste Management Directive",
    section: "Section 5: Sanitary Hygiene",
    url: GUIDE_META.guide_source,
    topic: "Local Sanitary Waste",
    keywords: [
      "sanitary",
      "diaper",
      "pad",
      "tampon",
      "tissue",
      "hygiene",
    ],
    text: "// TODO: paste verbatim from supplied guide",
    prep_steps: [
      "// TODO: paste verbatim prep step from supplied guide",
    ],
    scope: "local",
  },

  // =========================================================================
  // NATIONAL STATUTORY PASSAGES (India SWM, PWM, E-Waste, Battery Waste Rules)
  // =========================================================================
  {
    id: "swm-segregation",
    title: "Segregation at Source",
    category: "Dry Waste",
    source: SWM,
    section: "Rule 4(1)(a): Duties of waste generators",
    url: SWM_URL,
    topic: "Segregation at source",
    keywords: ["segregate", "wet", "dry", "hazardous", "household", "bin", "general"],
    text: "Every waste generator shall segregate and store the waste generated by them in three separate streams namely bio-degradable, non bio-degradable and domestic hazardous wastes in suitable bins and handover segregated wastes to authorised waste pickers or waste collectors as directed or notified by the local authorities from time to time.",
    prep_steps: [
      "Segregate into wet, dry and domestic hazardous at source",
      "Keep containers uncontaminated by other streams",
    ],
    scope: "national",
  },
  {
    id: "swm-wet",
    title: "Biodegradable & Organic Waste",
    category: "Wet Waste",
    source: SWM,
    section: "Rule 4(1)(b) & Schedule I",
    url: SWM_URL,
    topic: "Wet / biodegradable waste",
    keywords: [
      "food",
      "organic",
      "peel",
      "vegetable",
      "fruit",
      "leaf",
      "garden",
      "compost",
      "biodegradable",
      "wet",
      "tea",
      "coffee",
      "wood",
      "bamboo",
      "leftovers",
    ],
    text: "Bio-degradable waste including food leftovers, vegetable and fruit peels, kitchen scraps, leaves, and garden waste must be segregated into the green/wet stream. Generators are encouraged to compost or bio-methanate organic waste at source where feasible.",
    prep_steps: [
      "Drain excess liquids before placing in wet waste",
      "Do not wrap or bag in plastic unless certified compostable",
    ],
    scope: "national",
  },
  {
    id: "swm-dry",
    title: "Dry Non-Biodegradable Recyclables",
    category: "Dry Waste",
    source: SWM,
    section: "Rule 4(1)(c) & Rule 3(1)(37)",
    url: SWM_URL,
    topic: "Dry / non-biodegradable waste",
    keywords: [
      "paper",
      "cardboard",
      "plastic",
      "glass",
      "metal",
      "aluminium",
      "tin",
      "can",
      "bottle",
      "jar",
      "carton",
      "dry",
      "recyclable",
      "textile",
      "rubber",
      "newspaper",
      "plate",
      "ceramic",
    ],
    text: "Non-biodegradable waste comprising paper, cardboard, plastics, glass, metals, rubber, ceramics and textiles shall be collected separately in a dry state and handed over to registered recycling facilities or authorised dry waste collection centers.",
    prep_steps: [
      "Rinse and clean to remove all food or chemical residue",
      "Ensure material is completely dry before binning",
      "Flatten cartons, boxes and containers to conserve collection space",
    ],
    scope: "national",
  },
  {
    id: "swm-hazardous",
    title: "Domestic Hazardous Waste",
    category: "Domestic Hazardous",
    source: SWM,
    section: "Rule 3(1)(17) & Rule 4(1)(c)",
    url: SWM_URL,
    topic: "Domestic hazardous waste",
    keywords: [
      "paint",
      "pesticide",
      "bulb",
      "cfl",
      "tube",
      "light",
      "thermometer",
      "mercury",
      "chemical",
      "aerosol",
      "spray",
      "medicine",
      "syringe",
      "hazardous",
      "cleaner",
      "strip",
    ],
    text: "Domestic hazardous waste means discarded paint drums, pesticide cans, compact fluorescent lamps (CFL), tube lights, expired medicines, broken mercury thermometers, used batteries, aerosol cans and other toxic chemicals. These must be stored separately and handed over at designated collection centers or to authorised hazardous waste collectors.",
    prep_steps: [
      "Store separately from dry and wet household streams",
      "Keep in original labelled packaging where available",
      "Do not puncture, crush or incinerate aerosol cans or pressurized containers",
    ],
    scope: "national",
  },
  {
    id: "swm-sanitary",
    title: "Sanitary and Hygiene Waste",
    category: "Sanitary",
    source: SWM,
    section: "Rule 4(1)(b) & Rule 3(1)(41)",
    url: SWM_URL,
    topic: "Sanitary waste",
    keywords: [
      "diaper",
      "nappy",
      "sanitary",
      "pad",
      "tampon",
      "condom",
      "tissue",
      "bandage",
      "hygiene",
    ],
    text: "Used sanitary waste such as diapers, sanitary towels, tampons and bandages shall be wrapped securely in the pouches provided by manufacturers or suitable wrapping paper and placed in the designated compartment of the dry-waste stream or sanitary bin, kept segregated from recyclable dry fractions.",
    prep_steps: [
      "Wrap securely in original pouch or newspaper",
      "Do not flush down toilets or drainage systems",
    ],
    scope: "national",
  },
  {
    id: "swm-no-burn",
    title: "Prohibition of Open Burning and Littering",
    category: "Dry Waste",
    source: SWM,
    section: "Rule 4(2)",
    url: SWM_URL,
    topic: "No burning or dumping",
    keywords: ["burn", "dump", "litter", "drain", "street", "general"],
    text: "No waste generator shall throw, burn or burry the solid waste generated by him, on streets, open public spaces outside his premises or in the drain or water bodies.",
    scope: "national",
  },
  {
    id: "swm-bulky",
    title: "Construction, Demolition and Bulky Waste",
    category: "Dry Waste",
    source: SWM,
    section: "Rule 4(3) & 4(4)",
    url: SWM_URL,
    topic: "Bulky and construction waste",
    keywords: [
      "construction",
      "debris",
      "brick",
      "tile",
      "cement",
      "furniture",
      "garden",
      "bulky",
      "demolition",
    ],
    text: "All resident welfare and market associations shall ensure that construction and demolition waste and horticulture waste are stored separately on their premises and disposed of in accordance with the Construction and Demolition Waste Management Rules.",
    scope: "national",
  },
  {
    id: "pwm-sup",
    title: "Single-Use Plastic Prohibition",
    category: "Dry Waste",
    source: PWM,
    section: "Rule 4(2) & Notification GSR 571(E)",
    url: PWM_URL,
    topic: "Banned single-use plastics",
    keywords: [
      "straw",
      "cutlery",
      "spoon",
      "fork",
      "plate",
      "cup",
      "earbud",
      "stirrer",
      "thermocol",
      "polystyrene",
      "balloon",
      "flag",
      "candy",
      "single-use",
      "plastic",
    ],
    text: "The manufacture, import, stocking, distribution, sale and use of identified single-use plastic commodities, including polystyrene and expanded polystyrene commodities (earbuds with plastic sticks, plastic sticks for balloons, plastic plates, cups, glasses, cutlery, straws, trays, wrapping films around sweet boxes) have been prohibited. Existing waste items must be deposited with non-biodegradable dry waste for channelization.",
    prep_steps: [
      "Ensure free of food grease or wash lightly",
      "Channel to dry waste; do not reuse for food contact",
    ],
    scope: "national",
  },
  {
    id: "pwm-mlp",
    title: "Multilayered Packaging & Extended Producer Responsibility",
    category: "Dry Waste",
    source: PWM,
    section: "Rule 9 & Schedule II (EPR Guidelines)",
    url: PWM_URL,
    topic: "Multilayer packaging and producer responsibility",
    keywords: [
      "wrapper",
      "chips",
      "sachet",
      "pouch",
      "multilayer",
      "laminated",
      "tetra",
      "pak",
      "carton",
      "packaging",
      "film",
      "foil",
      "bag",
      "greasy",
      "pizza",
    ],
    text: "Multi-layered plastic packaging (e.g. chip wrappers, flexible laminate sachets, drink cartons) is subject to Extended Producer Responsibility (EPR). Generators must keep multilayer packaging clean and dry and hand it over to designated dry-waste collectors or brand-authorized takeback drop points.",
    prep_steps: [
      "Empty completely and shake out dry crumbs or solids",
      "Separate detachable components (e.g. plastic lids or straws) where applicable",
      "Keep dry and clean",
    ],
    scope: "national",
  },
  {
    id: "pwm-carry-bag",
    title: "Plastic Carry Bags Regulation",
    category: "Dry Waste",
    source: PWM,
    section: "Rule 4(1)(c)",
    url: PWM_URL,
    topic: "Plastic carry bags",
    keywords: ["carry bag", "polythene", "bag", "shopping bag"],
    text: "Plastic carry bags made of virgin or recycled plastic shall not be less than one hundred and twenty (120) microns in thickness. Used carry bags should be kept clean and segregated with dry recyclables.",
    prep_steps: ["Ensure bag is empty and free from wet garbage"],
    scope: "national",
  },
  {
    id: "ew-consumer",
    title: "Consumer Electronic Waste Takeback",
    category: "E-Waste",
    source: EW,
    section: "Rule 6: Responsibilities of Consumers or Bulk Consumers",
    url: EW_URL,
    topic: "Electronic waste",
    keywords: [
      "electronic",
      "phone",
      "charger",
      "cable",
      "laptop",
      "computer",
      "keyboard",
      "earphone",
      "headphone",
      "tv",
      "appliance",
      "e-waste",
      "circuit",
      "battery-powered",
      "remote",
      "router",
    ],
    text: "Consumers or bulk consumers of electrical and electronic equipment shall ensure that e-waste generated by them is channelised through registered collection centres, dealer take-back, or producer takeback systems, and not mixed with regular household municipal solid waste.",
    prep_steps: [
      "Do not dismantle or crack electronic components",
      "Separate external charging cables or batteries if detachable",
      "Deposit with authorised e-waste collection centre or brand return point",
    ],
    scope: "national",
  },
  {
    id: "bw-consumer",
    title: "End-of-Life Battery Waste",
    category: "Domestic Hazardous",
    source: BW,
    section: "Rule 4: Responsibilities of Consumers",
    url: BW_URL,
    topic: "Batteries",
    keywords: [
      "battery",
      "batteries",
      "cell",
      "aa",
      "aaa",
      "lithium",
      "power bank",
      "button cell",
      "used battery",
    ],
    text: "Consumers shall ensure that waste batteries of any chemistry (lead-acid, lithium-ion, nickel-cadmium, alkaline) are discarded separately from other waste streams and handed over to registered entities or collection points established by producers under Extended Producer Responsibility.",
    prep_steps: [
      "Tape contact terminals with non-conductive electrical tape if terminals are exposed",
      "Never puncture, submerge in water, or incinerate",
      "Deposit at dedicated battery collection bin or drop box",
    ],
    scope: "national",
  },
];

const STOP = new Set([
  "the",
  "a",
  "an",
  "of",
  "and",
  "or",
  "with",
  "for",
  "to",
  "in",
  "on",
  "is",
  "it",
  "my",
  "this",
  "that",
]);

export function buildQuery(parts: (string | undefined | null)[]): string[] {
  return Array.from(
    new Set(
      parts
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .split(/[^a-z0-9-]+/)
        .filter((t) => t.length > 2 && !STOP.has(t)),
    ),
  );
}

export type ScoredPassage = {
  p: GuidePassage;
  score: number;
};

export const MIN_RETRIEVAL_SCORE = 2;

export function retrieveScored(terms: string[]): ScoredPassage[] {
  return GUIDE.map((p) => {
    const hay = (
      p.keywords.join(" ") +
      " " +
      p.text +
      " " +
      (p.topic ?? "") +
      " " +
      p.title +
      " " +
      p.category
    ).toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (p.keywords.some((k) => k === t || k.startsWith(t) || t.startsWith(k))) {
        score += 3;
      } else if (hay.includes(t)) {
        score += 1;
      }
    }
    // Local scope passages take priority when both match
    if (score > 0 && p.scope === "local") {
      score += 10;
    }
    return { p, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Keyword retrieval with scope-prioritization.
 * When local passages match the search terms, they receive priority over national ones.
 */
export function retrieve(terms: string[], limit = 5): GuidePassage[] {
  const scored = retrieveScored(terms);
  const top = scored.slice(0, limit).map((s) => s.p);
  const seg = GUIDE.find((p) => p.id === "swm-segregation");
  if (seg && top.length && !top.includes(seg)) top.push(seg);
  return top;
}
