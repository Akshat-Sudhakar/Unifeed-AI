import fs from 'fs/promises';
import path from 'path';
import { IdeaCard } from './types';

const HISTORY_DIR = path.join(process.cwd(), '.data');
const HISTORY_FILE = path.join(HISTORY_DIR, 'history.json');
const MAX_HISTORY = 30;

export interface HistoryEntry {
  id: string;
  created_at: string;
  persona: string;
  pillar: string;
  format: string;
  funnel_stage: string;
  title: string;
}

async function ensureHistoryFile() {
  try {
    await fs.mkdir(HISTORY_DIR, { recursive: true });
    try {
      await fs.access(HISTORY_FILE);
    } catch {
      await fs.writeFile(HISTORY_FILE, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Failed to initialize history store:', error);
  }
}

export async function getHistory(): Promise<HistoryEntry[]> {
  await ensureHistoryFile();
  try {
    const data = await fs.readFile(HISTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read history:', error);
    return [];
  }
}

export async function addHistoryEntries(ideas: IdeaCard[]) {
  const currentHistory = await getHistory();
  
  const newEntries: HistoryEntry[] = ideas.map(card => ({
    id: card.id,
    created_at: new Date().toISOString(),
    persona: card.idea.persona,
    pillar: card.idea.pillar,
    format: card.idea.format,
    funnel_stage: card.idea.funnel_stage,
    title: card.idea.title
  }));

  const updatedHistory = [...newEntries, ...currentHistory].slice(0, MAX_HISTORY);
  
  try {
    await fs.writeFile(HISTORY_FILE, JSON.stringify(updatedHistory, null, 2));
  } catch (error) {
    console.error('Failed to write history:', error);
  }
}

export async function getFormattedRecentHistory(limit: number = 10): Promise<string> {
  const history = await getHistory();
  const recent = history.slice(0, limit);
  
  if (recent.length === 0) return '';
  
  return recent.map((entry, index) => 
    `Entry ${index + 1}:
- Title: ${entry.title}
- Persona: ${entry.persona}
- Pillar: ${entry.pillar}
- Format: ${entry.format}
- Funnel Stage: ${entry.funnel_stage}`
  ).join('\n\n');
}
