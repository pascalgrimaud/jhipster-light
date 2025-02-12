import type { ModuleRank } from '@/module/domain/landscape/ModuleRank';
import { RANKS } from '@/module/domain/landscape/ModuleRank';
import type { RankDescription } from '@/module/domain/RankDescription';
import type { RanksUsed } from '@/module/domain/RanksUsed';
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  name: 'LandscapeRankModuleFilterVue',
  props: {
    ranksUsed: {
      type: Array as PropType<RanksUsed>,
      required: true,
    },
  },
  emits: ['selected'],
  setup(props, { emit }) {
    const ranks = RANKS;
    const selectedRank = ref<ModuleRank | undefined>(undefined);

    const rankDescriptions: RankDescription = {
      RANK_D: 'Experimental or advanced module requiring specific expertise',
      RANK_C: 'Module without known production usage',
      RANK_B: 'Module with at least one confirmed production usage',
      RANK_A: 'Module with multiple production usages across different projects and documented through talks, books or blog posts',
      RANK_S: 'Production-proven module providing unique features, validated by community feedback (10+ endorsements)',
    };

    const isRankSelected = (rank: ModuleRank): boolean => {
      return selectedRank.value === rank;
    };

    const toggleRank = (rank: ModuleRank): void => {
      if (selectedRank.value === rank) {
        selectedRank.value = undefined;
      } else {
        selectedRank.value = rank;
      }
      emit('selected', selectedRank.value);
    };

    const formatRank = (rank: ModuleRank): string => {
      return rank.replace('RANK_', '');
    };

    const getRankDescription = (rank: ModuleRank): string => {
      return rankDescriptions[rank];
    };

    const isRankDisabled = (rank: ModuleRank): boolean => {
      const rankUsed = props.ranksUsed.find(ru => ru.rank === rank);
      return rankUsed?.quantity === 0;
    };

    return {
      ranks,
      isRankSelected,
      toggleRank,
      formatRank,
      getRankDescription,
      isRankDisabled,
    };
  },
});
