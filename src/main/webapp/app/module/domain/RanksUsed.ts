import { RankUsed } from '@/module/domain/RankUsed';
import { Landscape } from '@/module/domain/landscape/Landscape';
import { ModuleRank, RANKS } from '@/module/domain/landscape/ModuleRank';

export type RanksUsed = RankUsed[];

export const toRanksUsed = (landscape: Landscape): RanksUsed => {
  const rankCounts = new Map<ModuleRank, number>(RANKS.map(rank => [rank, 0]));

  landscape
    .standaloneLevels()
    .flatMap(level => level.elements)
    .flatMap(element => element.allModules())
    .forEach(module => {
      const currentCount = rankCounts.get(module.rank()) || 0;
      rankCounts.set(module.rank(), currentCount + 1);
    });

  return RANKS.map(rank => ({
    rank,
    quantity: rankCounts.get(rank) || 0,
  }));
};
