/**
 * Форматирует группу студента в единый формат: {курс}{факультет}-{группа}
 *
 * Примеры:
 *   group_type="F4", course_year=3  →  "3F-4"
 *   group_type="D1", course_year=2  →  "2D-1"
 *   group_type="F1", course_year=3  →  "3F-1"
 *
 * Формат: {курс}{факультет}-{группа}
 *   курс:      1 / 2 / 3
 *   факультет: D (не-IT) | F (IT/технический)
 *   группа:    1-2 для D, 1-4 для F
 */
export function formatGroup(
  groupType: string | null | undefined,
  courseYear: number | null | undefined
): string | null {
  if (!groupType && !courseYear) return null;

  // Парсим "F4" → faculty="F", group="4"
  const match = groupType?.match(/^([DF])(\d+)$/);
  if (match) {
    const faculty = match[1];
    const group = match[2];
    return courseYear ? `${courseYear}${faculty}-${group}` : `${faculty}-${group}`;
  }

  // Fallback: неожиданный формат
  if (groupType && courseYear) return `${courseYear}${groupType}`;
  return groupType ?? (courseYear ? `Курс ${courseYear}` : null);
}

/**
 * Возвращает только факультет из group_type.
 * "F4" → "F", "D1" → "D"
 */
export function getFaculty(groupType: string | null | undefined): string | null {
  if (!groupType) return null;
  const match = groupType.match(/^([DF])/);
  return match ? match[1] : null;
}

/**
 * Номер группы из group_type.
 * "F4" → "4", "D1" → "1"
 */
export function getGroupNumber(groupType: string | null | undefined): string | null {
  if (!groupType) return null;
  const match = groupType.match(/^[DF](\d+)$/);
  return match ? match[1] : null;
}

/**
 * Отображение курса в читаемом виде.
 * 2 → "2-й курс", 3 → "3-й курс"
 */
export function formatCourseYear(courseYear: number | null | undefined): string | null {
  if (!courseYear) return null;
  return `${courseYear}-й курс`;
}
