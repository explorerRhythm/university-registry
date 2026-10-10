// One stable colour per faculty id, used for the small marker beside each faculty name.
const PALETTE = ["#1F4FD8", "#B7791F", "#0E8A6B", "#9B3B8E", "#C2410C", "#0F766E", "#6D28D9", "#475569"];
export const facultyColor = (id) => PALETTE[(Number(id) - 1) % PALETTE.length];
