// utils/priority.ts

export function calculateDynamicPriority(content: string, createdAt: string, updatedAt: string): number {
  if (!content) return 100;

  const match = content.match(/\[PRIORITY:(\d+)\]/);
  
  if (!match) {
    return 100; // Старые заметки с бекенда (без тега)
  }

  const basePriority = parseInt(match[1], 10);

  // ==========================================
  // 🟢 ИСПРАВЛЕНИЕ: ОТКЛЮЧАЕМ СТАРЕНИЕ ДЛЯ 100
  // Если юзер выбрал "Назавжди" (100 баллов), 
  // мы просто возвращаем 100 и пропускаем математику.
  if (basePriority === 100) {
    return 100;
  }
  // ==========================================

  const now = new Date().getTime();
  const created = new Date(createdAt).getTime();
  const updated = new Date(updatedAt).getTime();

  // (Здесь твой тестовый делитель / 1000 или реальный / (1000 * 3600 * 24))
  const daysSinceCreation = (now - created) / 1000; 
  const daysSinceLastView = (now - updated) / 1000;

  const score = basePriority - (daysSinceCreation * 0.5) - (daysSinceLastView * 2.0);

  return Math.max(0, Math.round(score));
}

export function cleanContent(content: string): string {
  if (!content) return '';
  return content
    .replace(/\[PRIORITY:\d+\]/g, '')
    .replace(/\[TTL:\d+\]/g, '') // на всякий случай чистим старый мусор
    .trim();
}