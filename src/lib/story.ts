import brusselsImg from "@/assets/scene-brussels.jpg";
import coastImg from "@/assets/scene-coast.jpg";
import riverImg from "@/assets/scene-river.jpg";
import innerImg from "@/assets/scene-inner.jpg";

export type Phase = "I. The Contract" | "II. The Coast" | "III. The River" | "IV. The Inner Station" | "Coda";

export type Stats = {
  humanity: number;   // 0-100 — moral standing
  efficiency: number; // 0-100 — Company favor
  health: number;     // 0-100 — crew & body
  sanity: number;     // 0-100 — psyche
};

export type Effect = Partial<Stats>;

export type Choice = {
  label: string;
  detail?: string;
  next: string;
  effect?: Effect;
};

export type Node = {
  id: string;
  phase: Phase;
  title: string;
  image: string;
  paragraphs: string[];
  pullquote?: string;
  choices?: Choice[];
  ending?: { kind: "disillusioned" | "lost" | "complicit" | "claimed" | "witness"; title: string; coda: string };
};

export const INITIAL_STATS: Stats = { humanity: 60, efficiency: 50, health: 70, sanity: 80 };

export const STORY: Record<string, Node> = {
  start: {
    id: "start",
    phase: "I. The Contract",
    title: "The Sepulchre City",
    image: brusselsImg,
    paragraphs: [
      "Brussels in the autumn of 1890 is a city that always makes you think of a whited sepulchre. The cobblestones are scrubbed; the windows are scrubbed; even the air is scrubbed of any honest sound. You climb the narrow stair to the offices of the Company, and the door opens before you knock.",
      "Two women in black sit knitting black wool, their needles ticking like clock hands measuring out a sentence. A clerk waves you through to the inner room, where the Great Man waits behind a desk of mahogany and a map pricked all over with little flags of bright color.",
      "He does not look up. He slides a contract across the leather. \"You will go to the Interior. You will assist in the orderly extraction of ivory. You will, of course, comport yourself as a gentleman of Europe.\" His pen hovers. \"What is it that brings a man like you to a place like the Congo?\"",
    ],
    pullquote: "It was the biggest, the most blank, so to speak — that I had a hankering after.",
    choices: [
      { label: "Wealth.", detail: "Speak plainly of fortune. The ivory; the share; the house in Antwerp.", next: "doctor", effect: { efficiency: +10, humanity: -5 } },
      { label: "Exploration.", detail: "Confess that the white spaces on the map have called you since boyhood.", next: "doctor", effect: { sanity: -3 } },
      { label: "Duty to civilization.", detail: "Recite the lines about uplift, light, and the noble Mission.", next: "doctor", effect: { humanity: +5, sanity: -5 } },
    ],
  },

  doctor: {
    id: "doctor",
    phase: "I. The Contract",
    title: "The Doctor's Calipers",
    image: brusselsImg,
    paragraphs: [
      "Down the hall, the Company doctor measures your skull with a cold pair of calipers. He smiles thinly. \"In the tropics, what one must observe is the changes that take place inside.\"",
      "He pours you a small glass of bitter spirit and asks, almost as an afterthought, whether there has been madness in your family. You answer; he writes nothing down. \"Adieu,\" he says. \"It is interesting for science to watch the mental changes of individuals on the spot. Try to keep calm. Avoid irritation more than exposure to the sun.\"",
      "On the boat south, you carry a single trunk and a letter of introduction. The continent comes up out of the sea like a low cloud, and then resolves itself into a green wall.",
    ],
    choices: [
      { label: "Sail with the French steamer down the coast.", next: "arrival", effect: { health: -3 } },
      { label: "Pay a passing captain to put you ashore early.", detail: "You will lose a fortnight, but arrive on your own terms.", next: "arrival", effect: { efficiency: -8, humanity: +3 } },
    ],
  },

  arrival: {
    id: "arrival",
    phase: "II. The Coast",
    title: "The Outer Station",
    image: coastImg,
    paragraphs: [
      "You disembark into a clearing that the Company calls a Station. A boiler wallows in the grass. An overturned railway-truck lies on its back with its wheels in the air. From the edge of the path comes the clink — clink — clink of iron.",
      "Six black men advance in a file, toiling up the path. They walk erect and slow, balancing small baskets full of earth on their heads, and the clink kept time with their footsteps. Black rags are wound round their loins; each had an iron collar on his neck, and all are connected together with a chain whose bights swing between them.",
      "An overseer with a Winchester rifle nods at you in greeting, as if you were neighbors meeting on a quiet boulevard.",
    ],
    pullquote: "They were called criminals, and the outraged law had come to them, an insoluble mystery from the sea.",
    choices: [
      { label: "Look the overseer in the eye and walk on.", detail: "Note it in your journal tonight. Do nothing now.", next: "grove", effect: { humanity: -8, efficiency: +5 } },
      { label: "Demand the chains be loosed for water.", detail: "He may comply; he may laugh; he will remember.", next: "grove", effect: { humanity: +10, efficiency: -10, health: -2 } },
      { label: "Ask, casually, after the Inner Station.", next: "grove", effect: { sanity: -2 } },
    ],
  },

  grove: {
    id: "grove",
    phase: "II. The Coast",
    title: "The Grove of Death",
    image: coastImg,
    paragraphs: [
      "You step aside from the path and into a shadow under the trees. The shadow is full of shapes. Black shapes, crouched, lying, sitting between the trees, leaning against the trunks, clinging to the earth — half coming out, half effaced within the dim light.",
      "They are not enemies, not criminals — nothing earthly now — nothing but black shadows of disease and starvation, lying confusedly in the greenish gloom. Brought from all the recesses of the coast in all the legality of time contracts, lost in uncongenial surroundings, fed on unfamiliar food, they sicken, become inefficient, and are then allowed to crawl away and rest.",
      "A young man near you lifts his head. You have a biscuit in your pocket — good, hard Swedish ship's biscuit — given to you that morning by the Company accountant.",
    ],
    choices: [
      { label: "Place the biscuit in his hand.", next: "manager", effect: { humanity: +12, sanity: -4 } },
      { label: "Walk on. There is nothing you can do for one of them.", next: "manager", effect: { humanity: -10, efficiency: +3, sanity: -6 } },
      { label: "Sit with him in silence until he sleeps.", next: "manager", effect: { humanity: +6, health: -4, sanity: -8 } },
    ],
  },

  manager: {
    id: "manager",
    phase: "II. The Coast",
    title: "The Manager's Smile",
    image: coastImg,
    paragraphs: [
      "At the Central Station you meet the Manager. He is a common, ordinary man — neither tall nor short, neither fat nor lean, with eyes the color of a cold winter sky. He inspires neither love nor fear, nor even respect. He inspires uneasiness.",
      "\"Mr. Kurtz,\" he tells you, almost in confidence, \"is the best agent we have. An exceptional man. He sends in as much ivory as all the others put together.\" He pauses. \"He has been ill. The steamer that was to fetch him has been wrecked at the bottom of the river. You will help us raise her.\"",
      "Three weeks pass. Rivets do not arrive. The pilgrims, as the agents call themselves, stroll about with absurd long staves. At last the boat is patched. The Manager wishes to leave at once.",
    ],
    choices: [
      { label: "Press to depart immediately, ill-equipped or not.", next: "fog", effect: { efficiency: +10, health: -8 } },
      { label: "Insist on another week to provision properly.", next: "fog", effect: { efficiency: -8, health: +8 } },
      { label: "Quietly ask the brickmaker what became of Kurtz's last report.", detail: "It is said he wrote a treatise. It is said he wrote, at the end, only three words.", next: "fog", effect: { sanity: -5, humanity: +2 } },
    ],
  },

  fog: {
    id: "fog",
    phase: "III. The River",
    title: "Going Up That River",
    image: riverImg,
    paragraphs: [
      "Going up that river was like travelling back to the earliest beginnings of the world, when vegetation rioted on the earth and the big trees were kings. An empty stream, a great silence, an impenetrable forest. The air was warm, thick, heavy, sluggish.",
      "The reaches opened before us and closed behind, as if the forest had stepped leisurely across the water to bar the way for our return. We penetrated deeper and deeper into the heart of darkness. It was very quiet there.",
      "On the second morning, a white fog comes down upon the river, warmer and more blinding than the night. It does not shift; it stands all round you like something solid. Somewhere on the bank, a cry rises — a complaining clamor, modulated in savage discords — and then nothing. The pilgrims cock their rifles.",
    ],
    pullquote: "We were wanderers on a prehistoric earth, on an earth that wore the aspect of an unknown planet.",
    choices: [
      { label: "Drop anchor. Wait for the fog to lift.", detail: "Speed will not save a ship she cannot see.", next: "snag", effect: { efficiency: -5, health: +5, sanity: +3 } },
      { label: "Steam on, slowly, and order the pilgrims to hold their fire.", next: "snag", effect: { humanity: +6, efficiency: +3, sanity: -3 } },
      { label: "Steam on. Tell the pilgrims to fire at any sound from the bank.", next: "snag", effect: { humanity: -15, efficiency: +6, sanity: -8 } },
    ],
  },

  snag: {
    id: "snag",
    phase: "III. The River",
    title: "The Snag and the Helmsman",
    image: riverImg,
    paragraphs: [
      "Eight miles below the Inner Station, arrows fall from the bank like a shower of nothing. Sticks, little sticks, were flying about — thick: they were whizzing before my nose, dropping below me, striking behind me against my pilot-house.",
      "Your helmsman — a fine fellow, a Kru from the coast, who had taken to standing in his pilot-house with an air — leaves the wheel to fire a rifle through the shutter. A long cane spear flies upward and through the opening, and he falls upon your feet. The shaft of the spear touches your shoes.",
      "The blood pools in the bottom of the wheelhouse. You have to put a hand on the wheel before the steamer goes broadside into the bank.",
    ],
    choices: [
      { label: "Stop the boat and bury him on shore with what dignity is possible.", next: "station", effect: { humanity: +10, efficiency: -8, sanity: -4 } },
      { label: "Tip the body overboard. The current is brown and quick.", detail: "It is what the Manager would do.", next: "station", effect: { humanity: -8, efficiency: +5, sanity: -10 } },
      { label: "Carry him on as far as the Inner Station.", next: "station", effect: { humanity: +3, health: -6, sanity: -6 } },
    ],
  },

  station: {
    id: "station",
    phase: "IV. The Inner Station",
    title: "Posts in the Clearing",
    image: innerImg,
    paragraphs: [
      "The bush around the Inner Station is silent in a way the river never was. A long, decaying building on the summit is half buried in the high grass. Through your glass, you make out a row of slender posts in line, with their upper ends ornamented with round carved balls.",
      "Then you bring the glass to your eye and the posts resolve. They are not balls. They are heads — black, dried, sunken, with closed eyelids. Heads on the stakes. They face inward, toward the house, except for one which faces outward, as if for greeting.",
      "A gaunt Russian in a coat of patched motley scrambles down the bank, waving both arms. \"You don't understand,\" he says, before you have spoken a word. \"He is a remarkable man. He has enlarged my mind.\"",
    ],
    choices: [
      { label: "Demand to see Kurtz at once.", next: "kurtz", effect: { sanity: -4 } },
      { label: "Ask the Russian, plainly, what Kurtz has done here.", next: "kurtz", effect: { humanity: +4, sanity: -6 } },
      { label: "Order the steamer made ready to depart at first light, with or without him.", next: "kurtz", effect: { efficiency: -5, humanity: +3 } },
    ],
  },

  kurtz: {
    id: "kurtz",
    phase: "IV. The Inner Station",
    title: "The Voice",
    image: innerImg,
    paragraphs: [
      "They carry him out on a stretcher — a long, thin shadow of a man, all bone, with a head like an ivory ball. His eyes shine, large and lustrous, with an eager, wide gaze. A deep voice, astonishingly strong for a body so wasted, rises out of him: \"I am glad.\"",
      "In the night, you find his stretcher empty. You follow a trail through the grass, lit by the distant fires of the camp. You find him crawling on all fours, perhaps fifty yards from the boat, going back to the drum and the chanting and whatever it is that has made him a god to these people.",
      "He raises himself to face you. He is no taller than a child, but his shadow on the grass is enormous. \"I had immense plans,\" he whispers. \"I was on the threshold of great things.\" Behind him the fires move. Before him, the river. Between you, only a choice.",
    ],
    pullquote: "His soul was mad. Being alone in the wilderness, it had looked within itself, and, by heavens! I tell you, it had gone mad.",
    choices: [
      { label: "Bring him back to the steamer by force.", detail: "Report the atrocities at Brussels. Let the Company answer for him.", next: "ending_witness", effect: { humanity: +15, sanity: -10 } },
      { label: "Leave him to the fires. Walk back alone to the boat.", detail: "He has chosen. So have you.", next: "ending_disillusioned", effect: { humanity: -5, sanity: -8 } },
      { label: "Kneel beside him and ask what he has seen.", detail: "Stay until the chanting ends.", next: "ending_lost", effect: { humanity: -20, sanity: -25 } },
      { label: "Strike a bargain. Take the ivory; burn the heads; tell Brussels nothing.", next: "ending_complicit", effect: { humanity: -25, efficiency: +25 } },
    ],
  },

  ending_witness: {
    id: "ending_witness",
    phase: "Coda",
    title: "The Horror, The Horror",
    image: riverImg,
    paragraphs: [
      "You wrestle him aboard. The boat slips downstream and the chanting fades into the trees. He dies in the night, in his cabin, with the candle guttering. His last cry is no louder than a breath: \"The horror! The horror!\"",
      "Brussels welcomes you back as it welcomes the rain — politely, briefly, then without notice. The Company files your report and loses it. His Intended receives you in a room hung with black, and asks, weeping, what his last word was. You tell her it was her name.",
      "You have lied for him. You will lie, in smaller ways, for the rest of your life. But you have brought back the only true thing the Interior would let you keep: the knowledge of what was done there in your name.",
    ],
    ending: {
      kind: "witness",
      title: "The Reluctant Witness",
      coda: "You return disillusioned but not silent. The hypocrisy of the Mission has a name now, and you carry it.",
    },
  },

  ending_disillusioned: {
    id: "ending_disillusioned",
    phase: "Coda",
    title: "Downstream",
    image: riverImg,
    paragraphs: [
      "You leave him to the dark. By morning the steamer is twenty miles downriver and there is nothing behind you but green walls closing one upon the other. The Manager nods, pleased; an inconvenient man has solved himself.",
      "Months later, in a Brussels café, you cannot finish your coffee. The waiters are too clean, the cups too white, the laughter too easy. You hear ivory in every word the men at the next table speak — ivory and rubber and progress and light.",
      "You do not write the report. You do not need to. The Company already knows.",
    ],
    ending: {
      kind: "disillusioned",
      title: "Returning Home Disillusioned",
      coda: "You survive the Interior, but Europe will never look the same. The white sepulchre is whiter than ever — and you can see through it.",
    },
  },

  ending_lost: {
    id: "ending_lost",
    phase: "Coda",
    title: "The Threshold",
    image: innerImg,
    paragraphs: [
      "You kneel. He speaks to you for hours, in a voice that is not always his. The fires draw nearer, then nearer still. Somewhere behind you, the steamer's whistle calls — once, twice, a third time — and then is silent.",
      "When morning comes, the clearing is empty and your boots are gone. You do not remember when you took them off. The river has carried the steamer away without you.",
      "The Russian finds you by the posts at noon, smiling at nothing, and runs.",
    ],
    ending: {
      kind: "lost",
      title: "Losing Oneself in the Interior",
      coda: "You crossed the threshold Kurtz spoke of. There is no report you can write that the Company would understand.",
    },
  },

  ending_complicit: {
    id: "ending_complicit",
    phase: "Coda",
    title: "An Excellent Agent",
    image: coastImg,
    paragraphs: [
      "You take the ivory. There is a great deal of it. You order the heads taken down, washed, and buried in a pit beyond the clearing. By dusk, the posts are bare and the Russian is gone.",
      "Your tonnage that quarter exceeds the Company's most optimistic forecast. In Brussels, the Great Man rises from behind his mahogany desk to shake your hand. \"An exceptional agent,\" he says, in the same voice with which he once spoke of Kurtz.",
      "You sleep poorly. But you sleep in linen sheets, and the linen is very fine.",
    ],
    ending: {
      kind: "complicit",
      title: "The Efficient Imperialist",
      coda: "You are everything the Company hoped for. The hollow at the core of the Mission is now the hollow at the core of you.",
    },
  },

  ending_claimed: {
    id: "ending_claimed",
    phase: "Coda",
    title: "The Jungle Has Claimed You",
    image: riverImg,
    paragraphs: [
      "The fever comes on slowly, then all at once. The Manager has the pilgrims roll you in your blanket and lay you on the foredeck, where the river breeze can find you. It does not.",
      "Your last clear thought is of the doctor in Brussels, smiling, asking after the madness in your family. There was none. There is now.",
      "A small notation is added to the Company's ledger: one agent, lost to climate. The line is ruled in black ink and the page is turned.",
    ],
    ending: {
      kind: "claimed",
      title: "The Jungle Has Claimed You",
      coda: "The Interior takes its toll without ceremony. Another name, another line, another ruled page.",
    },
  },
};

export function applyEffect(stats: Stats, effect?: Effect): Stats {
  if (!effect) return stats;
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  return {
    humanity: clamp(stats.humanity + (effect.humanity ?? 0)),
    efficiency: clamp(stats.efficiency + (effect.efficiency ?? 0)),
    health: clamp(stats.health + (effect.health ?? 0)),
    sanity: clamp(stats.sanity + (effect.sanity ?? 0)),
  };
}

/** If health or sanity collapses on the river, the jungle claims you. */
export function checkFailure(stats: Stats, currentNodeId: string): string | null {
  if (currentNodeId.startsWith("ending_")) return null;
  if (stats.health <= 0 || stats.sanity <= 0) return "ending_claimed";
  return null;
}