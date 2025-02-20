import { provide } from '@/injections';
import { MODULES_REPOSITORY } from '@/module/application/ModuleProvider';
import { LandscapePresetConfigurationVue } from '@/module/primary/landscape-preset-configuration';
import { VueWrapper, flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { wrappedElement } from '../../../WrappedElement';
import { ModulesRepositoryStub, defaultPresets, stubModulesRepository } from '../../domain/Modules.fixture';

const wrap = (modulesRepository: ModulesRepositoryStub): VueWrapper => {
  provide(MODULES_REPOSITORY, modulesRepository);
  return mount(LandscapePresetConfigurationVue);
};

const componentVm = (wrapper: VueWrapper) => wrapper.findComponent(LandscapePresetConfigurationVue).vm;

const repositoryWithPreset = (): ModulesRepositoryStub => {
  const modulesRepository = stubModulesRepository();
  modulesRepository.preset.resolves(defaultPresets());
  return modulesRepository;
};

const repositoryWithPresetError = (error: Error): ModulesRepositoryStub => {
  const modulesRepository = stubModulesRepository();
  modulesRepository.preset.rejects(error);
  return modulesRepository;
};

describe('LandscapePresetConfigurationComponent', () => {
  it('should fetch presets on mount and populate the select box', async () => {
    const modulesRepository = repositoryWithPreset();
    const wrapper = wrap(modulesRepository);
    await flushPromises();

    expect(modulesRepository.preset.called).toBe(true);
    expect(componentVm(wrapper).presets).toEqual(defaultPresets().presets);

    const options = wrapper.findAll('option');
    expect(options.length - 1).toBe(defaultPresets().presets.length);
    options
      .filter((_option, index) => index > 0)
      .forEach((option, index) => {
        expect(option.text()).toBe(defaultPresets().presets[index].name);
      });
  });

  it('should handle API error', async () => {
    const consoleErrors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('API Error');
    const modulesRepository = repositoryWithPresetError(error);
    const wrapper = wrap(modulesRepository);
    await flushPromises();

    expect(componentVm(wrapper).presets).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(error);
    consoleErrors.mockRestore();
  });

  it('should emit selected event with selected preset', async () => {
    const modulesRepository = repositoryWithPreset();
    const wrapper = wrap(modulesRepository);
    await flushPromises();

    const select = wrapper.find('select');
    select.element.value = componentVm(wrapper).presets[0].name;
    await select.trigger('change');

    expect(wrapper.emitted('selected')).toBeTruthy();
    expect(wrapper.emitted('selected')![0]).toEqual([componentVm(wrapper).presets[0]]);
  });

  it('should emit selected event with null when deselecting preset', async () => {
    const modulesRepository = repositoryWithPreset();
    const wrapper = wrap(modulesRepository);
    await flushPromises();

    const select = wrapper.find('select');
    select.element.value = '';
    await select.trigger('change');

    expect(wrapper.emitted('selected')).toBeTruthy();
    expect(wrapper.emitted('selected')![0][0]).toEqual(null);
  });

  it('should close preset configuration when clicking on the hide preset configuration button', async () => {
    const modulesRepository = repositoryWithPreset();
    const wrapper = wrap(modulesRepository);
    await flushPromises();

    const hidePresetConfigurationBtn = wrapper.find(wrappedElement('hide-preset-configuration-btn'));
    await hidePresetConfigurationBtn.trigger('click');

    expect(wrapper.find(wrappedElement('show-preset-configuration-btn')).exists()).toBeTruthy();
    expect(wrapper.find(wrappedElement('hide-preset-configuration-btn')).exists()).toBeFalsy();
  });

  it('should open preset configuration when clicking on the show preset configuration button', async () => {
    const modulesRepository = repositoryWithPreset();
    const wrapper = wrap(modulesRepository);
    await flushPromises();

    const hidePresetConfigurationBtn = wrapper.find(wrappedElement('hide-preset-configuration-btn'));
    await hidePresetConfigurationBtn.trigger('click');
    const showPresetConfigurationBtn = wrapper.find(wrappedElement('show-preset-configuration-btn'));
    await showPresetConfigurationBtn.trigger('click');

    expect(wrapper.find(wrappedElement('show-preset-configuration-btn')).exists()).toBeFalsy();
    expect(wrapper.find(wrappedElement('hide-preset-configuration-btn')).exists()).toBeTruthy();
  });
});
