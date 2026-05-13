import { Node, Phase, Choice, Effect } from "./story";

/**
 * Parser for CSV story data
 * 
 * CSV Format:
 * nodeId,phase,title,image,paragraphs,pullquote,choice1_label,choice1_detail,choice1_next,choice1_humanity,choice1_efficiency,choice1_health,choice1_sanity,choice2_label,choice2_detail,choice2_next,choice2_humanity,choice2_efficiency,choice2_health,choice2_sanity,choice3_label,choice3_detail,choice3_next,choice3_humanity,choice3_efficiency,choice3_health,choice3_sanity,endingKind,endingTitle,endingCoda
 * 
 * Notes:
 * - Separate multiple paragraphs with ||| (triple pipe)
 * - Leave pullquote empty for nodes without one
 * - Leave choice fields empty to skip that choice
 * - Leave ending fields empty for non-ending nodes
 * - Effects are signed integers (+10, -5, etc.)
 */

export interface CSVRow {
  nodeId: string;
  phase: string;
  title: string;
  image: string;
  paragraphs: string;
  pullquote: string;
  // Choices (up to 5)
  [key: string]: string;
}

export function parseEffect(
  humanity?: string,
  efficiency?: string,
  health?: string,
  sanity?: string
): Effect | undefined {
  const effect: Effect = {};
  if (humanity && humanity.trim()) effect.humanity = parseInt(humanity, 10);
  if (efficiency && efficiency.trim()) effect.efficiency = parseInt(efficiency, 10);
  if (health && health.trim()) effect.health = parseInt(health, 10);
  if (sanity && sanity.trim()) effect.sanity = parseInt(sanity, 10);
  return Object.keys(effect).length > 0 ? effect : undefined;
}

export function parseChoice(
  label: string,
  detail: string,
  next: string,
  humanity: string,
  efficiency: string,
  health: string,
  sanity: string
): Choice | null {
  if (!label || !label.trim() || !next || !next.trim()) {
    return null;
  }

  const choice: Choice = {
    label: label.trim(),
    next: next.trim(),
  };

  if (detail && detail.trim()) {
    choice.detail = detail.trim();
  }

  const effect = parseEffect(humanity, efficiency, health, sanity);
  if (effect) {
    choice.effect = effect;
  }

  return choice;
}

export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

export function csvToStory(csvText: string): Record<string, Node> {
  const lines = csvText.split("\n");
  const headers = parseCSVLine(lines[0]);
  const story: Record<string, Node> = {};

  // Create a map of image names to imports
  const imageMap: Record<string, string> = {
    brussels: "brusselsImg",
    coast: "coastImg",
    river: "riverImg",
    inner: "innerImg",
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    const nodeId = row.nodeId?.trim();
    if (!nodeId) continue;

    const paragraphs = row.paragraphs
      .split("|||")
      .map((p) => p.trim())
      .filter((p) => p);

    const choices: Choice[] = [];
    for (let choiceNum = 1; choiceNum <= 5; choiceNum++) {
      const choice = parseChoice(
        row[`choice${choiceNum}_label`],
        row[`choice${choiceNum}_detail`],
        row[`choice${choiceNum}_next`],
        row[`choice${choiceNum}_humanity`],
        row[`choice${choiceNum}_efficiency`],
        row[`choice${choiceNum}_health`],
        row[`choice${choiceNum}_sanity`]
      );
      if (choice) choices.push(choice);
    }

    const node: Node = {
      id: nodeId,
      phase: row.phase as Phase,
      title: row.title,
      image: row.image, // You'll need to handle this separately
      paragraphs,
      pullquote: row.pullquote || undefined,
      choices: choices.length > 0 ? choices : undefined,
    };

    // Add ending if this is an ending node
    if (row.endingKind && row.endingKind.trim()) {
      node.ending = {
        kind: row.endingKind.trim() as any,
        title: row.endingTitle || "",
        coda: row.endingCoda || "",
      };
    }

    story[nodeId] = node;
  }

  return story;
}
