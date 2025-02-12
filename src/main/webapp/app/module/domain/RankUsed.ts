import { ModuleRank } from '@/module/domain/landscape/ModuleRank';

type RankUsedQuantity = number;

export type RankUsed = {
  rank: ModuleRank;
  quantity: RankUsedQuantity;
};
