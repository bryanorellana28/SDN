export interface InterfaceNames {
  defaultName: string
  name: string
}

/**
 * Parse a single line from `interface ethernet export`.
 * Returns the default interface name and the configured name.
 */
export function parseInterfaceLine(line: string): InterfaceNames | null {
  const trimmed = line.trim()
  if (!trimmed.startsWith('set')) return null
  const defMatch = /default-name=(\S+)/.exec(trimmed)
  const nameMatch = /name=("([^"]+)"|\S+)/.exec(trimmed)
  if (!defMatch || !nameMatch) return null
  const defaultName = defMatch[1]
  let name = nameMatch[2] || nameMatch[1]
  name = name.replace(/^"|"$/g, '')
  return { defaultName, name }
}
