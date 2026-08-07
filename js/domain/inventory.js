/**
 * Inventory service — quantity mutations for player_inventory rows.
 */

export function qty(inventory, playerId, itemId) {
  const row = inventory.find((i) => i.player_id === playerId && i.item_id === itemId);
  return row ? row.quantity : 0;
}

export function addItem(inventory, nextId, playerId, itemId, amount = 1) {
  let row = inventory.find((i) => i.player_id === playerId && i.item_id === itemId);
  if (!row) {
    row = { id: nextId(), player_id: playerId, item_id: itemId, quantity: 0 };
    inventory.push(row);
  }
  row.quantity += amount;
  return row;
}

export function consumeItem(inventory, playerId, itemId, amount = 1) {
  const row = inventory.find((i) => i.player_id === playerId && i.item_id === itemId);
  if (!row || row.quantity < amount) return false;
  row.quantity -= amount;
  return true;
}
