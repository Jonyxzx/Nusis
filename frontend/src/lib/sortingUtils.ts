/**
 * Natural sorting utility that handles mixed alphanumeric strings
 * Examples: "Item 2" < "Item 10" (instead of "Item 10" < "Item 2" with regular string sort)
 */
export function naturalCompare(a: string, b: string): number {
  const regex = /(\d+)|(\D+)/g;
  const aParts = a.match(regex) || [];
  const bParts = b.match(regex) || [];

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || "";
    const bPart = bParts[i] || "";

    const aNum = parseInt(aPart, 10);
    const bNum = parseInt(bPart, 10);

    if (!isNaN(aNum) && !isNaN(bNum)) {
      if (aNum !== bNum) return aNum - bNum;
    } else {
      const cmp = aPart.localeCompare(bPart);
      if (cmp !== 0) return cmp;
    }
  }

  return 0;
}

/**
 * Generic comparison function that handles different data types
 */
export function compareValues(a: unknown, b: unknown): number {
  // Handle null/undefined values
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  // Convert to strings for comparison
  const aStr = String(a);
  const bStr = String(b);

  // Try numeric comparison first
  const aNum = parseFloat(aStr);
  const bNum = parseFloat(bStr);

  if (!isNaN(aNum) && !isNaN(bNum) && aStr === aNum.toString() && bStr === bNum.toString()) {
    return aNum - bNum;
  }

  // Fall back to natural string comparison
  return naturalCompare(aStr, bStr);
}