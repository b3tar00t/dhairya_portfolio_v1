// Lets any component open the command palette without prop drilling.
export const PALETTE_EVENT = 'b3ta:palette';

export const openPalette = (mode: 'commands' | 'terminal' = 'commands') =>
  window.dispatchEvent(new CustomEvent(PALETTE_EVENT, { detail: mode }));
