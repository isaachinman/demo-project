// The model may echo or invent ids; only ones that belong to this user are ever written.
export const ownedIds = (returned: string[], owned: string[]) => {
  const allowed = new Set(owned)

  return [...new Set(returned)].filter(id => allowed.has(id))
}
