import { ModuleRank } from '@/module/domain/landscape/ModuleRank';

type ModuleRankCountQuantity = number;

export type ModuleRankCount = {
  rank: ModuleRank;
  quantity: ModuleRankCountQuantity;
};
