const NULL_PLACEHOLDER = '<@null>';

export function replaceNullish(
  obj: Record<string, unknown>,
  nullPlaceholder: any = NULL_PLACEHOLDER
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) {
      result[key] = nullPlaceholder;
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item === undefined || item === null
          ? nullPlaceholder
          : typeof item === 'object' && item !== null
            ? replaceNullish(item as Record<string, unknown>)
            : item
      );
    } else if (typeof value === 'object') {
      result[key] = replaceNullish(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result;
}
