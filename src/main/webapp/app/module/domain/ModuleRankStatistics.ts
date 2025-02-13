import { ModuleRankCount } from '@/module/domain/ModuleRankCount';
import { Landscape } from '@/module/domain/landscape/Landscape';
import { ModuleRank, RANKS } from '@/module/domain/landscape/ModuleRank';

export type ModuleRankStatistics = ModuleRankCount[];

export const toModuleRankStatistics = (landscape: Landscape): ModuleRankStatistics => {
  const rankCounts = new Map<ModuleRank, number>(RANKS.map(rank => [rank, 0]));

  landscape
    .standaloneLevels()
    .flatMap(level => level.elements)
    .flatMap(element => element.allModules())
    .reduce((counts, module) => {
      const currentCount = counts.get(module.rank()) || 0;
      counts.set(module.rank(), currentCount + 1);
      return counts;
    }, rankCounts);

  return RANKS.map(rank => ({
    rank,
    quantity: rankCounts.get(rank) || 0,
  }));
};
