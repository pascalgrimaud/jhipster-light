import { ModuleRankCount } from '@/module/domain/ModuleRankCount';
import { Landscape } from '@/module/domain/landscape/Landscape';
import { ModuleRank, RANKS } from '@/module/domain/landscape/ModuleRank';

export type ModuleRankStatistics = ModuleRankCount[];

export const toModuleRankStatistics = (landscape: Landscape): ModuleRankStatistics => {
  const rankCounts = landscape
    .standaloneLevels()
    .flatMap(level => level.elements)
    .flatMap(element => element.allModules())
    .reduce(
      (counts, module) => {
        const currentCount = counts.get(module.rank())!;
        counts.set(module.rank(), currentCount + 1);
        return counts;
      },
      new Map<ModuleRank, number>(RANKS.map(rank => [rank, 0])),
    );

  return RANKS.map(rank => ({
    rank,
    quantity: rankCounts.get(rank)!,
  }));
};
