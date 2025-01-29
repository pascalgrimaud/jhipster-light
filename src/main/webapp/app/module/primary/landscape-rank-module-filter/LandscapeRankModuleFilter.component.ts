import { ModuleRank, RANKS } from '@/module/domain/landscape/ModuleRank';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'LandscapeRankModuleFilterVue',
  emits: ['selected'],
  setup(_, { emit }) {
    const ranks = RANKS;
    const selectedRank = ref<ModuleRank | undefined>(undefined);

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

    return {
      ranks,
      isRankSelected,
      toggleRank,
      formatRank,
    };
  },
});
