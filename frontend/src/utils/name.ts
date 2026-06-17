/**
 * Extracts the first name from a full name.
 * Rahul Nair -> Rahul
 * Priya Menon -> Priya
 * Arjun Kumar -> Arjun
 */
export function getFirstName(fullName?: string | null): string {
  if (!fullName) return 'User';
  const trimmed = fullName.trim();
  if (trimmed === '') return 'User';
  return trimmed.split(/\s+/)[0];
}
