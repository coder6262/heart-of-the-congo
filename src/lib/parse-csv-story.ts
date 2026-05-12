import { Node, Phase, Choice, Effect } from "./story";

export interface CSVRow {
  nodeId: string;
  phase: string;
  title: string;
  image: string;
  paragraphs: string; // JSON array string: ["para1", "para2", "para3"]
  pullquote?: string;
  choice1Label?: string;
  choice1Detail?: string;
  choice1Next?: string;
  choice1Humanity?: string;
  choice1Efficiency?: string;
  choice1Health?: string;
  choice1Sanity?: string;
  choice2Label?: string;
  choice2Detail?: string;
  choice2Next?: string;
  choice2Humanity?: string;
  choice2Efficiency?: string;
  choice2Health?: string;
  choice2Sanity?: string;
  choice3Label?: string;
  choice3Detail?: string;
  choice3Next?: string;
  choice3Humanity?: string;
  choice3Efficiency?: string;
  choice3Health?: string;
  choice3Sanity?: string;
  choice4Label?: string;
  choice4Detail?: string;
  choice4Next?: string;
  choice4Humanity?: string;
  choice4Efficiency?: string;
  choice4Health?: string;
  choice4Sanity?: string;
  endingKind?: string; // "witness" | "disillusioned" | "lost" | "complicit" | "claimed"
  endingTitle?: string;
  endingCoda?: string;
}

/**
 * Parse a single effect from CSV columns
 */
function parseEffect(
  humanity?: string,
  efficiency?: string,
  health?: string,
  sanity?: string
): Effect | undefined {
  const effect: Effect = {};
  if (humanity !== undefined && humanity !== "") {
    effect.humanity = parseInt(humanity, 10);
  }
  if (efficiency !== undefined && efficiency !== "") {
    effect.efficiency = parseInt(efficiency, 10);
  }
  if (health !== undefined && health !== "") {
    effect.health = parseInt(health, 10);
  }
  if (sanity !== undefined && sanity !== "") {
    effect.sanity = parseInt(sanity, 10);
  }

  return Object.keys(effect).length > 0 ? effect : undefined;
}

/**
 * Parse a single choice from CSV columns
 */
function parseChoice(
  label?: string,
  detail?: string,
  next?: string,
  humanity?: string,
  efficiency?: string,
  health?: string,
  sanity?: string
): Choice | undefined {
  if (!label || !next) return undefined;

  return {
    label,
    detail: detail && detail !== "" ? detail : undefined,
    next,
    effect: parseEffect(humanity, efficiency, health, sanity),
  };
}

/**
 * Convert a CSV row into a Node
 */
export function csvRowToNode(row: CSVRow, imageMap: Record<string, string>): Node {
  // Parse paragraphs (expects JSON array string)
  let paragraphs: string[] = [];
  try {
    paragraphs = JSON.parse(row.paragraphs);
  } catch {
    // Fallback: treat as single paragraph
    paragraphs = [row.paragraphs];
  }

  // Parse choices
  const choices: Choice[] = [];
  for (let i = 1; i <= 4; i++) {
    const label = row[`choice${i}Label` as keyof CSVRow] as string | undefined;
    const detail = row[`choice${i}Detail` as keyof CSVRow] as string | undefined;
    const next = row[`choice${i}Next` as keyof CSVRow] as string | undefined;
    const humanity = row[`choice${i}Humanity` as keyof CSVRow] as string | undefined;
    const efficiency = row[`choice${i}Efficiency` as keyof CSVRow] as string | undefined;
    const health = row[`choice${i}Health` as keyof CSVRow] as string | undefined;
    const sanity = row[`choice${i}Sanity` as keyof CSVRow] as string | undefined;

    const choice = parseChoice(label, detail, next, humanity, efficiency, health, sanity);
    if (choice) choices.push(choice);
  }

  const node: Node = {
    id: row.nodeId,
    phase: row.phase as Phase,
    title: row.title,
    image: imageMap[row.image] || row.image,
    paragraphs,
    pullquote: row.pullquote && row.pullquote !== "" ? row.pullquote : undefined,
    choices: choices.length > 0 ? choices : undefined,
  };

  // Add ending if present
  if (row.endingKind && row.endingTitle && row.endingCoda) {
    node.ending = {
      kind: row.endingKind as "disillusioned" | "lost" | "complicit" | "claimed" | "witness",
      title: row.endingTitle,
      coda: row.endingCoda,
    };
  }

  return node;
}

/**
 * Parse CSV data into story nodes
 * This function expects CSV data parsed as an array of objects
 */
export function parseCSVStory(
  csvData: CSVRow[],
  imageMap: Record<string, string>
): Record<string, Node> {
  const story: Record<string, Node> = {};

  for (const row of csvData) {
    const node = csvRowToNode(row, imageMap);
    story[node.id] = node;
  }

  return story;
}
