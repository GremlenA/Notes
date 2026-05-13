// utils/priority.ts

export function calculateDynamicPriority(content: string, createdAt: string, updatedAt: string): number {
  if (!content) return 100;

  const match = content.match(/\[PRIORITY:(\d+)\]/);
  
  // Если тега [PRIORITY:X] нет — это старая заметка с бекенда.
  // Даем ей 100 баллов, и ОНА НЕ СТАРЕЕТ (время не вычитается).
  if (!match) {
    return 100; 
  }

  const basePriority = parseInt(match[1], 10);

  const now = new Date().getTime();
  const created = new Date(createdAt).getTime();
  const updated = new Date(updatedAt).getTime();

  // Расчет времени для новых заметок
  const daysSinceCreation = (now - created) / (1000 * 3600 * 24);
  const daysSinceLastView = (now - updated) / (1000 * 3600 * 24);

  // Формула деградации (только для заметок с тегом)
  const score = basePriority - (daysSinceCreation * 0.5) - (daysSinceLastView * 2.0);

  return Math.max(0, Math.round(score));
}

export function cleanContent(content: string): string {
  if (!content) return '';
  // Очищаем и от нового тега приоритета, и на всякий случай от старого TTL
  return content
    .replace(/\[PRIORITY:\d+\]/g, '')
    .replace(/\[TTL:\d+\]/g, '')
    .trim();
}