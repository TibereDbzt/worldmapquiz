export function formatPopulation (population) {
  return new Intl.NumberFormat('en-US', { notation: "compact" , compactDisplay: "short" }).format(population);
}