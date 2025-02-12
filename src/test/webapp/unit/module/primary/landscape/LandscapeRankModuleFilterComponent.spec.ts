import { LandscapeRankModuleFilterVue } from '@/module/primary/landscape-rank-module-filter';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { wrappedElement } from '../../../WrappedElement';

const RANKS = ['RANK_D', 'RANK_C', 'RANK_B', 'RANK_A', 'RANK_S'];

describe('LandscapeRankModuleFilterComponent', () => {
  it('should display all rank filters', () => {
    const wrapper = mount(LandscapeRankModuleFilterVue);

    const buttons = wrapper.findAll('[data-testid^="rank-"]');
    expect(buttons).toHaveLength(RANKS.length);
  });

  it('should select rank when clicking on filter button', async () => {
    const wrapper = mount(LandscapeRankModuleFilterVue);

    const rankDButton = wrapper.find(wrappedElement('rank-RANK_D-filter'));
    await rankDButton.trigger('click');

    expect(wrapper.emitted('selected')).toEqual([[RANKS[0]]]);
  });

  it('should deselect rank when clicking on selected filter button', async () => {
    const wrapper = mount(LandscapeRankModuleFilterVue);

    const rankDButton = wrapper.find(wrappedElement('rank-RANK_D-filter'));
    await rankDButton.trigger('click');
    await rankDButton.trigger('click');

    expect(wrapper.emitted('selected')).toEqual([[RANKS[0]], [undefined]]);
  });

  it('should format rank labels correctly', () => {
    const wrapper = mount(LandscapeRankModuleFilterVue);

    const buttons = wrapper.findAll('[data-testid^="rank-"]');
    RANKS.forEach((rank, index) => {
      expect(buttons[index].text()).toBe(rank.replace('RANK_', ''));
    });
  });

  it('should apply selected style to active filter', async () => {
    const wrapper = mount(LandscapeRankModuleFilterVue);

    const rankDButton = wrapper.find(wrappedElement('rank-RANK_D-filter'));
    await rankDButton.trigger('click');

    expect(rankDButton.classes()).toContain('-active');
  });

  it('should emit selected rank when clicking a filter button', async () => {
    const wrapper = mount(LandscapeRankModuleFilterVue);

    const rankAButton = wrapper.find(wrappedElement('rank-RANK_A-filter'));
    await rankAButton.trigger('click');

    expect(wrapper.emitted('selected')).toEqual([[RANKS[3]]]);
  });

  it('should emit undefined when deselecting a rank', async () => {
    const wrapper = mount(LandscapeRankModuleFilterVue);

    const rankSButton = wrapper.find(wrappedElement('rank-RANK_S-filter'));
    await rankSButton.trigger('click');
    await rankSButton.trigger('click');

    expect(wrapper.emitted('selected')).toEqual([[RANKS[4]], [undefined]]);
  });

  it('should only emit one rank at a time', async () => {
    const wrapper = mount(LandscapeRankModuleFilterVue);

    const rankBButton = wrapper.find(wrappedElement('rank-RANK_B-filter'));
    const rankCButton = wrapper.find(wrappedElement('rank-RANK_C-filter'));
    await rankBButton.trigger('click');
    await rankCButton.trigger('click');

    expect(wrapper.emitted('selected')).toEqual([[RANKS[2]], [RANKS[1]]]);
  });

  it('should display correct description for rank button', () => {
    const wrapper = mount(LandscapeRankModuleFilterVue);

    const rankDButton = wrapper.find(wrappedElement('rank-RANK_D-filter'));

    expect(rankDButton.attributes('title')).toBe('Experimental or advanced module requiring specific expertise');
  });
});
