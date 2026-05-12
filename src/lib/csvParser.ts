/**
 * CSV Parser for Story Nodes
 * 
 * Converts CSV data into the STORY object format.
 * 
 * CSV Format:
 * nodeId,phase,title,image,paragraph1,paragraph2,paragraph3,pullquote,
 * choice1_label,choice1_detail,choice1_next,choice1_humanity,choice1_efficiency,choice1_health,choice1_sanity,
 * choice2_label,choice2_detail,choice2_next,choice2_humanity,choice2_efficiency,choice2_health,choice2_sanity,
 * choice3_label,choice3_detail,choice3_next,choice3_humanity,choice3_efficiency,choice3_health,choice3_sanity,
 * endingKind,endingTitle,endingCoda
 */

import { Node, Choice, Effect } from "./story";

interface CSVRow {
  [key: string]: string;
}

/**
 * Parse CSV text into story nodes
 */
export function parseStoryCSV(csvText: string, imageMap: Record<string, string>): Record<string, Node> {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());
  const nodes: Record<string, Node> = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const row = parseCSVLine(line, headers);
    const node = buildNode(row, imageMap);
    
    if (node) {
      nodes[node.id] = node;
    }
  }

  return nodes;
}

/**
 * Parse a single CSV line into a row object
 * Handles quoted fields with commas
 */
function parseCSVLine(line: string, headers: string[]): CSVRow {
  const row: CSVRow = {};
  let current = "";
  let inQuotes = false;
  let fieldIndex = 0;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row[headers[fieldIndex]] = current.trim().replace(/^"|"$/g, "");
      current = "";
      fieldIndex++;
    } else {
      current += char;
    }
  }

  if (fieldIndex < headers.length) {
    row[headers[fieldIndex]] = current.trim().replace(/^"|"$/g, "");
  }

  return row;
}

/**
 * Build a Node from a CSV row
 */
function buildNode(row: CSVRow, imageMap: Record<string, string>): Node | null {
  const nodeId = row.nodeId?.trim();
  const phase = row.phase?.trim() as any;
  const title = row.title?.trim();
  const imageKey = row.image?.trim();

  if (!nodeId || !phase || !title) {
    console.warn("Skipping invalid row:", row);
    return null;
  }

  const image = imageMap[imageKey] || "";

  // Build paragraphs
  const paragraphs: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const para = row[`paragraph${i}`]?.trim();
    if (para) paragraphs.push(para);
  }

  const pullquote = row.pullquote?.trim();

  // Build choices
  const choices: Choice[] = [];
  for (let i = 1; i <= 4; i++) {
    const label = row[`choice${i}_label`]?.trim();
    if (!label) continue;

    const detail = row[`choice${i}_detail`]?.trim();
    const next = row[`choice${i}_next`]?.trim();

    if (!next) continue;

    const effect: Effect = {};
    const humanity = parseNumber(row[`choice${i}_humanity`]);
    const efficiency = parseNumber(row[`choice${i}_efficiency`]);
    const health = parseNumber(row[`choice${i}_health`]);
    const sanity = parseNumber(row[`choice${i}_sanity`]);

    if (humanity !== 0) effect.humanity = humanity;
    if (efficiency !== 0) effect.efficiency = efficiency;
    if (health !== 0) effect.health = health;
    if (sanity !== 0) effect.sanity = sanity;

    choices.push({
      label,
      ...(detail && { detail }),
      next,
      ...(Object.keys(effect).length > 0 && { effect }),
    });
  }

  // Build ending (if this is an ending node)
  let ending: Node["ending"] = undefined;
  const endingKind = row.endingKind?.trim();
  if (endingKind) {
    ending = {
      kind: endingKind as any,
      title: row.endingTitle?.trim() || title,
      coda: row.endingCoda?.trim() || "",
    };
  }

  return {
    id: nodeId,
    phase,
    title,
    image,
    paragraphs,
    ...(pullquote && { pullquote }),
    ...(choices.length > 0 && { choices }),
    ...(ending && { ending }),
  };
}

/**
 * Parse a number from a string, return 0 if invalid
 */
function parseNumber(value?: string): number {
  if (!value) return 0;
  const num = parseInt(value.trim(), 10);
  return isNaN(num) ? 0 : num;
}
