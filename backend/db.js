export function getDb(env) {
  if (!env?.DB) throw new Error("La conexión D1 `DB` no está configurada.");
  return env.DB;
}
