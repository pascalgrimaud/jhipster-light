import { APPLICATION_LISTENER, CURSOR_UPDATER, GLOBAL_WINDOW, provide } from '@/injections';
import {
  LANDSCAPE_SCROLLER,
  MODULES_REPOSITORY,
  MODULE_PARAMETERS_REPOSITORY,
  PROJECT_FOLDERS_REPOSITORY,
} from '@/module/application/ModuleProvider';
import { ModuleParametersRepository } from '@/module/domain/ModuleParametersRepository';
import { ModuleSlug } from '@/module/domain/ModuleSlug';
import { ModulesRepository } from '@/module/domain/ModulesRepository';
import { ModulesToApply } from '@/module/domain/ModulesToApply';
import { LandscapeVue } from '@/module/primary/landscape';
import { LandscapePresetConfigurationVue } from '@/module/primary/landscape-preset-configuration';
import { LandscapeRankModuleFilterVue } from '@/module/primary/landscape-rank-module-filter';
import { BodyCursorUpdater } from '@/module/primary/landscape/BodyCursorUpdater';
import { LandscapeScroller } from '@/module/primary/landscape/LandscapeScroller';
import { ALERT_BUS } from '@/shared/alert/application/AlertProvider';
import { ApplicationListener } from '@/shared/alert/infrastructure/primary/ApplicationListener';
import { DOMWrapper, VueWrapper, flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { stubAlertBus } from '../../../shared/alert/domain/AlertBus.fixture';
import { wrappedElement } from '../../../WrappedElement';
import { defaultLandscape } from '../../domain/landscape/Landscape.fixture';
import { ModuleParametersRepositoryStub, stubModuleParametersRepository } from '../../domain/ModuleParameters.fixture';
import { ModulesRepositoryStub, defaultPresets, projectHistoryWithInit, stubModulesRepository } from '../../domain/Modules.fixture';
import { ProjectFoldersRepositoryStub, stubProjectFoldersRepository } from '../../domain/ProjectFolders.fixture';
import { stubWindow } from '../GlobalWindow.fixture';

interface ApplicationListenerStub extends ApplicationListener {
  addEventListener: vi.fn;
  removeEventListener: vi.fn;
}

interface BodyCursorUpdaterStub extends BodyCursorUpdater {
  set: vi.fn;
  reset: vi.fn;
}

const stubBodyCursorUpdater = (): BodyCursorUpdaterStub =>
  ({
    set: vi.fn(),
    reset: vi.fn(),
  }) as BodyCursorUpdaterStub;

const stubApplicationListener = (): ApplicationListenerStub => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

const stubLandscapeScroller = (): any => ({
  scroll: vi.fn(),
  scrollSmooth: vi.fn(),
  scrollIntoView: vi.fn(),
});

interface WrapperOptions {
  cursorUpdater: BodyCursorUpdater;
  landscapeScroller: LandscapeScroller;
  modules: ModulesRepository;
  applicationListener: ApplicationListener;
  moduleParameters: ModuleParametersRepository;
}

const alertBus = stubAlertBus();

const wrap = (options?: Partial<WrapperOptions>): VueWrapper => {
  const { applicationListener, cursorUpdater, landscapeScroller, modules, moduleParameters }: WrapperOptions = {
    cursorUpdater: stubBodyCursorUpdater(),
    landscapeScroller: stubLandscapeScroller(),
    modules: repositoryWithLandscape(),
    applicationListener: stubApplicationListener(),
    moduleParameters: repositoryWithModuleParameters(),
    ...options,
  };

  provide(ALERT_BUS, alertBus);
  provide(APPLICATION_LISTENER, applicationListener);
  provide(CURSOR_UPDATER, cursorUpdater);
  provide(LANDSCAPE_SCROLLER, landscapeScroller);
  provide(MODULES_REPOSITORY, modules);
  provide(MODULE_PARAMETERS_REPOSITORY, moduleParameters);
  provide(GLOBAL_WINDOW, stubWindow());
  provide(PROJECT_FOLDERS_REPOSITORY, repositoryWithProjectFolders());

  return mount(LandscapeVue);
};

const componentWithLandscape = async (applicationListener?: ApplicationListener): Promise<VueWrapper> => {
  const listener = applicationListener ?? stubApplicationListener();
  const modules = repositoryWithLandscape();

  const wrapper = wrap({ modules, applicationListener: listener });

  await flushPromises();

  return wrapper;
};

const repositoryWithLandscape = (): ModulesRepositoryStub => {
  const modules = stubModulesRepository();
  modules.landscape.resolves(defaultLandscape());
  modules.applyAll.resolves(undefined);
  modules.history.resolves(projectHistoryWithInit());
  modules.preset.resolves(defaultPresets());

  return modules;
};

const repositoryWithLandscapeError = (): ModulesRepositoryStub => {
  const modules = stubModulesRepository();
  modules.landscape.rejects(new Error('repositoryWithLandscapeError'));
  modules.applyAll.resolves(undefined);
  modules.history.resolves(projectHistoryWithInit());

  return modules;
};

const repositoryWithProjectFolders = (): ProjectFoldersRepositoryStub => {
  const projectFolders = stubProjectFoldersRepository();
  projectFolders.get.resolves('/tmp/jhlite/1234');

  return projectFolders;
};

const repositoryWithProjectFoldersError = (): ProjectFoldersRepositoryStub => {
  const projectFolders = stubProjectFoldersRepository();
  projectFolders.get.rejects(new Error('repositoryWithProjectFoldersError'));

  return projectFolders;
};

const repositoryWithModuleParameters = (): ModuleParametersRepositoryStub => {
  const moduleParameters = stubModuleParametersRepository();
  moduleParameters.store.resolves(undefined);
  moduleParameters.storeCurrentFolderPath.resolves('');
  moduleParameters.getCurrentFolderPath.returns('');
  moduleParameters.get.returns(new Map());
  return moduleParameters;
};

describe('Landscape', () => {
  describe('Loading', () => {
    it('should display loader when loading landscape', () => {
      const wrapper = wrap();

      expect(wrapper.find(wrappedElement('landscape-loader')).exists()).toBe(true);
      expect(wrapper.find(wrappedElement('landscape')).exists()).toBe(false);
    });

    it('should catch error when waiting for modules error', () => {
      try {
        const { applicationListener, cursorUpdater, landscapeScroller, modules, moduleParameters }: WrapperOptions = {
          cursorUpdater: stubBodyCursorUpdater(),
          landscapeScroller: stubLandscapeScroller(),
          modules: repositoryWithLandscapeError(),
          applicationListener: stubApplicationListener(),
          moduleParameters: repositoryWithModuleParameters(),
        };

        provide(ALERT_BUS, alertBus);
        provide(APPLICATION_LISTENER, applicationListener);
        provide(CURSOR_UPDATER, cursorUpdater);
        provide(LANDSCAPE_SCROLLER, landscapeScroller);
        provide(MODULES_REPOSITORY, modules);
        provide(MODULE_PARAMETERS_REPOSITORY, moduleParameters);
        provide(GLOBAL_WINDOW, window);
        provide(PROJECT_FOLDERS_REPOSITORY, repositoryWithProjectFolders());

        return mount(LandscapeVue);
      } catch (e) {
        if (e instanceof Error) {
          expect(e.message).toBe('repositoryWithLandscapeError');
        }
        expect(console.error).toHaveBeenCalled();
      }
    });

    it('should catch error when waiting for project folders error', () => {
      try {
        const { applicationListener, cursorUpdater, landscapeScroller, modules, moduleParameters }: WrapperOptions = {
          cursorUpdater: stubBodyCursorUpdater(),
          landscapeScroller: stubLandscapeScroller(),
          modules: repositoryWithLandscape(),
          applicationListener: stubApplicationListener(),
          moduleParameters: repositoryWithModuleParameters(),
        };

        provide(ALERT_BUS, alertBus);
        provide(APPLICATION_LISTENER, applicationListener);
        provide(CURSOR_UPDATER, cursorUpdater);
        provide(LANDSCAPE_SCROLLER, landscapeScroller);
        provide(MODULES_REPOSITORY, modules);
        provide(MODULE_PARAMETERS_REPOSITORY, moduleParameters);
        provide(GLOBAL_WINDOW, window);
        provide(PROJECT_FOLDERS_REPOSITORY, repositoryWithProjectFoldersError());

        return mount(LandscapeVue);
      } catch (e) {
        if (e instanceof Error) {
          expect(e.message).toBe('repositoryWithProjectFoldersErrorww');
        }
        expect(console.error).toHaveBeenCalled();
      }
    });

    it('should load landscape at startup', async () => {
      const applicationListener = stubApplicationListener();
      const wrapper = await componentWithLandscape(applicationListener);

      expect(wrapper.find(wrappedElement('landscape-loader')).exists()).toBe(false);
      expect(wrapper.find(wrappedElement('landscape')).exists()).toBe(true);
      expect(wrapper.find(wrappedElement('landscape-connectors')).findAll('path').length).toBe(17);
      expect(applicationListener.addEventListener).toHaveBeenCalledOnce();

      const pathField = wrapper.find(wrappedElement('folder-path-field')).element as HTMLInputElement;
      expect(pathField.value).toBe('/tmp/jhlite/1234');
    });

    it('should unload landscape at destroy', async () => {
      const applicationListener = stubApplicationListener();
      const wrapper = await componentWithLandscape(applicationListener);

      wrapper.unmount();

      expect(applicationListener.removeEventListener).toHaveBeenCalledOnce();
    });

    it('should load folder path from local storage', async () => {
      const moduleParameters = repositoryWithModuleParameters();
      moduleParameters.getCurrentFolderPath.returns('/tmp/jhlite/5678');

      const wrapper = wrap({ moduleParameters });
      await flushPromises();

      const pathField = wrapper.find(wrappedElement('folder-path-field')).element as HTMLInputElement;
      expect(pathField.value).toBe('/tmp/jhlite/5678');
    });
  });

  describe('Display modes', () => {
    it('should switch to compacted mode', async () => {
      const wrapper = await componentWithLandscape();

      wrapper.find(wrappedElement('compacted-mode-button')).trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('compacted-mode-button')).classes()).toContain('-selected');
      expect(wrapper.find(wrappedElement('extended-mode-button')).classes()).toContain('-not-selected');
      expect(wrapper.find(wrappedElement('infinitest-module')).classes()).toContain('-compacted');
    });

    it('should switch to extended mode', async () => {
      const wrapper = await componentWithLandscape();

      wrapper.find(wrappedElement('extended-mode-button')).trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('compacted-mode-button')).classes()).toContain('-not-selected');
      expect(wrapper.find(wrappedElement('extended-mode-button')).classes()).toContain('-selected');
      expect(wrapper.find(wrappedElement('infinitest-module')).classes()).toContain('-extended');
    });
  });

  describe('Modules emphasize', () => {
    it('should highlight compacted selectable module and dependencies', async () => {
      const wrapper = await componentWithLandscape();

      wrapper.find(wrappedElement('vue-module')).trigger('mouseover');
      await wrapper.vm.$nextTick();

      const vueClasses = wrapper.find(wrappedElement('vue-module')).classes();
      expect(vueClasses).toContain('-selectable-highlighted');
      expect(vueClasses).toContain('-compacted');

      const initClasses = wrapper.find(wrappedElement('init-module')).classes();
      expect(initClasses).toContain('-selectable-highlighted');
      expect(initClasses).toContain('-compacted');

      assertSelectableHighlightedConnectorsCount(wrapper, 1);
    });

    it('should highlight extended selectable module and dependencies', async () => {
      const wrapper = await componentWithLandscape();
      wrapper.find(wrappedElement('extended-mode-button')).trigger('click');
      await wrapper.vm.$nextTick();

      wrapper.find(wrappedElement('vue-module')).trigger('mouseover');
      await wrapper.vm.$nextTick();

      const vueClasses = wrapper.find(wrappedElement('vue-module')).classes();
      expect(vueClasses).toContain('-selectable-highlighted');
      expect(vueClasses).toContain('-extended');

      const initClasses = wrapper.find(wrappedElement('init-module')).classes();
      expect(initClasses).toContain('-selectable-highlighted');
      expect(initClasses).toContain('-extended');

      assertSelectableHighlightedConnectorsCount(wrapper, 1);
    });

    it('should highlight dependant feature', async () => {
      const wrapper = await componentWithLandscape();

      wrapper.find(wrappedElement('sample-feature-module')).trigger('mouseover');
      await wrapper.vm.$nextTick();

      const sampleFeatureClasses = wrapper.find(wrappedElement('sample-feature-module')).classes();
      expect(sampleFeatureClasses).toContain('-not-selectable-highlighted');
      expect(sampleFeatureClasses).toContain('-compacted');

      const springMvcClasses = wrapper.find(wrappedElement('spring-mvc-feature')).classes();
      expect(springMvcClasses).toContain('-not-selectable-highlighted');
      expect(springMvcClasses).toContain('-compacted');
      assertNotSelectableHighlightedConnectorsCount(wrapper, 2);
    });

    it('should highlight selection tree', async () => {
      const wrapper = await componentWithLandscape();

      await clickModule('maven', wrapper);

      wrapper.find(wrappedElement('liquibase-module')).trigger('mouseover');
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('java-build-tools-feature')).classes()).toContain('-selectable-highlighted');
      expect(wrapper.find(wrappedElement('spring-boot-module')).classes()).toContain('-selectable-highlighted');
      expect(wrapper.find(wrappedElement('postgresql-module')).classes()).toContain('-selectable-highlighted');
      expect(wrapper.find(wrappedElement('liquibase-module')).classes()).toContain('-selectable-highlighted');
      assertSelectableHighlightedConnectorsCount(wrapper, 4);
    });

    it('should un-highlight single module and dependencies', async () => {
      const wrapper = await componentWithLandscape();

      wrapper.find(wrappedElement('java-base-module')).trigger('mouseover');
      await wrapper.vm.$nextTick();
      wrapper.find(wrappedElement('java-base-module')).trigger('mouseleave');
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('java-base-module')).classes()).not.toContain('-selectable-highlighted');
      expect(wrapper.find(wrappedElement('init-module')).classes()).not.toContain('-selectable-highlighted');
      assertSelectableHighlightedConnectorsCount(wrapper, 0);
    });

    it('should un-highlight featured module and dependencies', async () => {
      const wrapper = await componentWithLandscape();

      wrapper.find(wrappedElement('vue-module')).trigger('mouseover');
      await wrapper.vm.$nextTick();
      wrapper.find(wrappedElement('vue-module')).trigger('mouseleave');
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('vue-module')).classes()).not.toContain('-selectable-highlighted');
      expect(wrapper.find(wrappedElement('init-module')).classes()).not.toContain('-selectable-highlighted');
      assertSelectableHighlightedConnectorsCount(wrapper, 0);
    });

    it('should highlight unselection tree', async () => {
      const wrapper = await componentWithLandscape();

      await clickModule('maven', wrapper);
      await clickModule('spring-boot', wrapper);

      wrapper.find(wrappedElement('init-module')).trigger('mouseover');
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('maven-module')).classes()).toContain('-highlighted-unselection');
      expect(wrapper.find(wrappedElement('spring-boot-module')).classes()).toContain('-highlighted-unselection');
      assertUnSelectionHighlightedConnectorsCount(wrapper, 2);
    });

    it('should put not emphasized in background', async () => {
      const wrapper = await componentWithLandscape();

      wrapper.find(wrappedElement('infinitest-module')).trigger('mouseover');
      await wrapper.vm.$nextTick();
      expect(wrapper.find(wrappedElement('landscape-container')).classes()).toContain('has-emphasized-module');

      wrapper.find(wrappedElement('infinitest-module')).trigger('mouseleave');
      await wrapper.vm.$nextTick();
      expect(wrapper.find(wrappedElement('landscape-container')).classes()).not.toContain('has-emphasized-module');
    });
  });

  describe('Selectable module', () => {
    it('should mark compacted root modules as selectable', async () => {
      const wrapper = await componentWithLandscape();

      const initClasses = wrapper.find(wrappedElement('init-module')).classes();
      expect(initClasses).toContain('-selectable');
      expect(initClasses).toContain('-compacted');

      const infinitestClasses = wrapper.find(wrappedElement('infinitest-module')).classes();
      expect(infinitestClasses).toContain('-selectable');
      expect(infinitestClasses).toContain('-compacted');
    });

    it('should mark extended root modules as selectable', async () => {
      const wrapper = await componentWithLandscape();
      wrapper.find(wrappedElement('extended-mode-button')).trigger('click');
      await wrapper.vm.$nextTick();

      const initClasses = wrapper.find(wrappedElement('init-module')).classes();
      expect(initClasses).toContain('-selectable');
      expect(initClasses).toContain('-extended');

      const infinitestClasses = wrapper.find(wrappedElement('infinitest-module')).classes();
      expect(infinitestClasses).toContain('-selectable');
      expect(infinitestClasses).toContain('-extended');
    });

    it('should mark feature depending modules as not selectable', async () => {
      const wrapper = await componentWithLandscape();

      expect(wrapper.find(wrappedElement('java-base-module')).classes()).toContain('-not-selectable');
    });
  });

  describe('Module selection', () => {
    it('should select selectable module', async () => {
      const wrapper = await componentWithLandscape();

      await clickModule('init', wrapper);

      const initClasses = wrapper.find(wrappedElement('init-module')).classes();
      expect(initClasses).toContain('-selected');
      expect(initClasses).not.toContain('-selectable');
      expect(initClasses).not.toContain('-not-selectable');

      assertSelectedConnectorsCount(wrapper, 0);
      expect(wrapper.find(wrappedElement('modules-apply-new-button')).text()).toContain('(1)');
      expect(wrapper.find(wrappedElement('modules-apply-all-button')).text()).toContain('(1)');
    });

    it('should select module in feature', async () => {
      const wrapper = await componentWithLandscape();
      await updatePath(wrapper);

      await clickModule('init', wrapper);
      await clickModule('maven', wrapper);

      assertSelectedConnectorsCount(wrapper, 1);
      expect(wrapper.find(wrappedElement('modules-apply-new-button')).text()).toContain('(1)');
      expect(wrapper.find(wrappedElement('modules-apply-all-button')).text()).toContain('(3)');
    });

    it('should not select not selectable module', async () => {
      const wrapper = await componentWithLandscape();

      await clickModule('java-base', wrapper);

      expect(wrapper.find(wrappedElement('java-base-module')).classes()).not.toContain('-selected');
    });
  });

  describe('Module unselection', () => {
    it('should unselect selected module', async () => {
      const wrapper = await componentWithLandscape();

      await clickModule('init', wrapper);
      await clickModule('init', wrapper);

      expect(wrapper.find(wrappedElement('init-module')).classes()).not.toContain('-selected');
      expect(wrapper.find(wrappedElement('modules-apply-new-button')).text()).toContain('(0)');
      expect(wrapper.find(wrappedElement('modules-apply-all-button')).text()).toContain('(0)');
    });

    it('should unselect dependant modules', async () => {
      const wrapper = await componentWithLandscape();

      await clickModule('init', wrapper);
      await clickModule('maven', wrapper);
      await clickModule('java-base', wrapper);
      await clickModule('init', wrapper);

      expect(wrapper.find(wrappedElement('init-module')).classes()).not.toContain('-selected');
      expect(wrapper.find(wrappedElement('maven-module')).classes()).not.toContain('-selected');
      expect(wrapper.find(wrappedElement('java-base-module')).classes()).not.toContain('-selected');

      expect(wrapper.find(wrappedElement('modules-apply-new-button')).text()).toContain('(0)');
      expect(wrapper.find(wrappedElement('modules-apply-all-button')).text()).toContain('(0)');
    });
  });

  describe('New modules application', () => {
    it('should disable application button without selected modules', async () => {
      const wrapper = await componentWithLandscape();

      await wrapper.find(wrappedElement('folder-path-field')).setValue('test');

      expect(wrapper.find(wrappedElement('modules-apply-new-button')).attributes('disabled')).toBeDefined();
    });

    it('should disable application button without project path', async () => {
      const wrapper = await componentWithLandscape();

      await clickModule('maven', wrapper);
      await wrapper.find(wrappedElement('folder-path-field')).setValue('');

      expect(wrapper.find(wrappedElement('modules-apply-new-button')).attributes('disabled')).toBeDefined();
    });

    it('should disable application button with missing mandatory properties and no defaults', async () => {
      const wrapper = await componentWithLandscape();

      await wrapper.find(wrappedElement('folder-path-field')).setValue('test');
      await clickModule('init-props', wrapper);

      expect(wrapper.find(wrappedElement('modules-apply-new-button')).attributes('disabled')).toBeDefined();
    });

    it('should not disable application button with missing mandatory properties and available defaults', async () => {
      const wrapper = await componentWithLandscape();

      await wrapper.find(wrappedElement('folder-path-field')).setValue('test');
      await clickModule('init-props', wrapper);
      await wrapper.find(wrappedElement('parameter-mandatoryBoolean-field')).setValue('false');

      expect(wrapper.find(wrappedElement('modules-apply-new-button')).attributes('disabled')).toBeUndefined();
    });

    it('should apply and re-apply module using repository', async () => {
      const modules = repositoryWithLandscape();
      const wrapper = wrap({ modules });
      await flushPromises();

      await updatePath(wrapper);
      await clickModule('vue', wrapper);

      await wrapper.find(wrappedElement('modules-apply-new-button')).trigger('click');

      await flushPromises();

      let [appliedModules] = modules.applyAll.lastCall.args as ModulesToApply[];
      expect(appliedModules.modules.map(slug => slug.get())).toEqual(['vue']);
      expect(wrapper.find(wrappedElement('modules-apply-new-button')).attributes('disabled')).toBeDefined();
      let component: any = wrapper.vm;
      expect(component.isApplied('vue')).toBeTruthy();
      expect(component.isApplied('angular')).toBeFalsy();
      let [message] = alertBus.success.lastCall.args;
      expect(message).toBe('Modules applied');

      let initClasses = wrapper.find(wrappedElement('init-module')).find('em').classes();
      expect(initClasses).toContain('jhlite-icon');

      await wrapper.find(wrappedElement('init-module')).find('em').trigger('click');

      await flushPromises();

      [appliedModules] = modules.applyAll.lastCall.args as ModulesToApply[];
      expect(appliedModules.modules.map(slug => slug.get())).toEqual(['init']);
      component = wrapper.vm;
      expect(component.isApplied('vue')).toBeTruthy();
      [message] = alertBus.success.lastCall.args;
      expect(message).toBe('Modules applied');

      initClasses = wrapper.find(wrappedElement('vue-module')).find('em').classes();
      expect(initClasses).toContain('jhlite-icon');

      await wrapper.find(wrappedElement('vue-module')).find('em').trigger('click');

      await flushPromises();

      [appliedModules] = modules.applyAll.lastCall.args as ModulesToApply[];
      expect(appliedModules.modules.map(slug => slug.get())).toEqual(['vue']);
      component = wrapper.vm;
      expect(component.isApplied('vue')).toBeTruthy();
      [message] = alertBus.success.lastCall.args;
      expect(message).toBe('Modules applied');
    });
  });

  describe('All modules application', () => {
    it('should disable application button without selected modules', async () => {
      const wrapper = await componentWithLandscape();

      await wrapper.find(wrappedElement('folder-path-field')).setValue('test');

      expect(wrapper.find(wrappedElement('modules-apply-all-button')).attributes('disabled')).toBeDefined();
    });

    it('should disable application button without project path', async () => {
      const wrapper = await componentWithLandscape();

      await clickModule('maven', wrapper);
      await wrapper.find(wrappedElement('folder-path-field')).setValue('');

      expect(wrapper.find(wrappedElement('modules-apply-all-button')).attributes('disabled')).toBeDefined();
    });

    it('should disable application button with missing mandatory properties and no defaults', async () => {
      const wrapper = await componentWithLandscape();

      await wrapper.find(wrappedElement('folder-path-field')).setValue('test');
      await clickModule('init-props', wrapper);

      expect(wrapper.find(wrappedElement('modules-apply-all-button')).attributes('disabled')).toBeDefined();
    });

    it('should not disable application button with missing mandatory properties and no defaults', async () => {
      const wrapper = await componentWithLandscape();

      await wrapper.find(wrappedElement('folder-path-field')).setValue('test');

      await clickModule('init-props', wrapper);

      await wrapper.find(wrappedElement('parameter-mandatoryBoolean-field')).setValue('false');

      expect(wrapper.find(wrappedElement('modules-apply-all-button')).attributes('disabled')).toBeUndefined();
    });

    it('should apply module using repository', async () => {
      const modules = repositoryWithLandscape();
      const wrapper = wrap({ modules });
      await flushPromises();

      await wrapper.find(wrappedElement('folder-path-field')).setValue('test');
      await clickModule('init', wrapper);
      await clickModule('vue', wrapper);
      await wrapper.find(wrappedElement('parameter-baseName-field')).setValue('base');

      await wrapper.find(wrappedElement('modules-apply-all-button')).trigger('click');

      await flushPromises();

      const [appliedModules] = modules.applyAll.lastCall.args as ModulesToApply[];
      expect(appliedModules.modules.map(slug => slug.get())).toEqual(['init', 'vue']);
      expect(wrapper.find(wrappedElement('modules-apply-all-button')).attributes('disabled')).toBeUndefined();

      const initClasses = wrapper.find(wrappedElement('init-module')).classes();
      expect(initClasses).toContain('-selected');
      expect(initClasses).toContain('-applied');

      const [message] = alertBus.success.lastCall.args;
      expect(message).toBe('Modules applied');
    });

    it('should apply module using repository with default values for unfilled properties', async () => {
      const modules = repositoryWithLandscape();
      const wrapper = wrap({ modules });
      await flushPromises();

      await wrapper.find(wrappedElement('folder-path-field')).setValue('test');
      await clickModule('init-props', wrapper);
      await clickModule('vue', wrapper);
      await wrapper.find(wrappedElement('parameter-mandatoryBoolean-field')).setValue('true');
      await wrapper.find(wrappedElement('modules-apply-all-button')).trigger('click');

      await flushPromises();

      expect((wrapper.find(wrappedElement('parameter-baseName-field')).element as HTMLInputElement).value).toBe('jhipster');
      expect((wrapper.find(wrappedElement('parameter-mandatoryBooleanDefault-field')).element as HTMLInputElement).value).toBe('true');
      expect((wrapper.find(wrappedElement('parameter-indentSize-field')).element as HTMLInputElement).value).toBe('2');

      const [appliedModules] = modules.applyAll.lastCall.args as ModulesToApply[];
      expect(appliedModules.modules.map(slug => slug.get())).toEqual(['init-props', 'vue', 'init']);
      expect(wrapper.find(wrappedElement('modules-apply-all-button')).attributes('disabled')).toBeUndefined();

      const initClasses = wrapper.find(wrappedElement('init-module')).classes();
      expect(initClasses).toContain('-selected');
      expect(initClasses).toContain('-applied');

      const [message] = alertBus.success.lastCall.args;
      expect(message).toBe('Modules applied');
    });

    it('should remove set boolean parameter', async () => {
      const wrapper = await componentWithLandscape();

      await clickModule('maven', wrapper);
      await wrapper.find(wrappedElement('parameter-optionalBoolean-field')).setValue('true');
      await wrapper.find(wrappedElement('parameter-optionalBoolean-field')).setValue('');

      expect(wrapper.find(wrappedElement('modules-apply-all-button')).attributes('disabled')).toBeUndefined();
    });

    it('should apply modules without committing them', async () => {
      const modules = repositoryWithLandscape();
      const wrapper = wrap({ modules });
      await flushPromises();

      await wrapper.find(wrappedElement('folder-path-field')).setValue('test');
      await clickModule('init', wrapper);
      await wrapper.find(wrappedElement('parameter-baseName-field')).setValue('base');
      await wrapper.find(wrappedElement('commit-module-application')).trigger('click');

      wrapper.find(wrappedElement('modules-apply-all-button')).trigger('click');

      await flushPromises();

      const [modulesToApply] = modules.applyAll.firstCall.args;
      expect(modulesToApply.commit).toBe(false);
    });

    it('should handle application error', async () => {
      const modules = repositoryWithLandscape();
      modules.applyAll.rejects();
      const wrapper = wrap({ modules });
      await flushPromises();

      await validateInitApplication(wrapper);

      expect(modules.applyAll.calledOnce).toBe(true);
      expect(wrapper.find(wrappedElement('modules-apply-all-button')).attributes('disabled')).toBeUndefined();

      const [message] = alertBus.error.lastCall.args;
      expect(message).toBe('Modules not applied');
    });

    it('should disable actions during application', async () => {
      const modules = repositoryWithLandscape();
      modules.applyAll.returns(new Promise(resolve => setTimeout(resolve, 500)));
      const wrapper = wrap({ modules });
      await flushPromises();

      await validateInitApplication(wrapper);

      expect(wrapper.find(wrappedElement('modules-apply-all-button')).attributes('disabled')).toBeDefined();
      expect(wrapper.find(wrappedElement('init-module')).classes()).toContain('-not-selectable');
    });
  });

  describe('History', () => {
    it('should load information from history', async () => {
      const modules = repositoryWithLandscape();
      const wrapper = wrap({ modules });
      await flushPromises();

      await updatePath(wrapper);

      const baseNameField = wrapper.find(wrappedElement('parameter-baseName-field')).element as HTMLInputElement;
      expect(baseNameField.value).toBe('setbase');

      const initClasses = wrapper.find(wrappedElement('init-module')).classes();
      expect(initClasses).toContain('-selected');
      expect(initClasses).toContain('-applied');
    });

    it('should silently handle history loading error', async () => {
      const modules = repositoryWithLandscape();
      modules.history.rejects(undefined);
      const wrapper = wrap({ modules });
      await flushPromises();

      const consoleErrors = vi.spyOn(console, 'error');
      await updatePath(wrapper);

      expect(console.error).not.toHaveBeenCalled();
      consoleErrors.mockRestore();
    });

    it('should ignore unknown modules from history', async () => {
      const modules = repositoryWithLandscape();
      modules.history.resolves({
        modules: [new ModuleSlug('unknown')],
        properties: [],
      });
      const wrapper = wrap({ modules });
      await flushPromises();
      await updatePath(wrapper);

      expect(wrapper.find(wrappedElement('init-module')).exists()).toBe(true);
    });

    it('should not replace user set properties from history', async () => {
      const modules = repositoryWithLandscape();
      const wrapper = wrap({ modules });
      await flushPromises();

      await clickModule('init', wrapper);
      await wrapper.find(wrappedElement('parameter-baseName-field')).setValue('hello');
      await updatePath(wrapper);

      const baseNameField = wrapper.find(wrappedElement('parameter-baseName-field')).element as HTMLInputElement;
      expect(baseNameField.value).toBe('hello');
    });
  });

  describe('Formatting', () => {
    it('should disable applications during project formatting', async () => {
      const modules = repositoryWithLandscape();
      modules.format.returns(new Promise(resolve => setTimeout(resolve, 500)));
      const wrapper = wrap({ modules });
      await flushPromises();

      await updatePath(wrapper);
      await wrapper.find(wrappedElement('format-button')).trigger('click');

      expect(wrapper.find(wrappedElement('modules-apply-all-button')).attributes('disabled')).toBeDefined();
      expect(wrapper.find(wrappedElement('init-module')).classes()).toContain('-compacted');
    });

    it('should enable applications after project formatting', async () => {
      const modules = repositoryWithLandscape();
      modules.format.resolves(undefined);
      const wrapper = wrap({ modules });
      await flushPromises();

      await updatePath(wrapper);
      await wrapper.find(wrappedElement('format-button')).trigger('click');
      await flushPromises();

      expect(wrapper.find(wrappedElement('modules-apply-all-button')).attributes('disabled')).toBeUndefined();
    });
  });

  describe('Download', () => {
    it('should disable applications during download', async () => {
      const modules = repositoryWithLandscape();
      modules.download.returns(new Promise(resolve => setTimeout(resolve, 500)));
      const wrapper = wrap({ modules });
      await flushPromises();

      await updatePath(wrapper);
      await wrapper.find(wrappedElement('download-button')).trigger('click');

      expect(wrapper.find(wrappedElement('modules-apply-all-button')).attributes('disabled')).toBeDefined();
    });

    it('should enable applications after download', async () => {
      const modules = repositoryWithLandscape();
      modules.download.resolves(undefined);
      const wrapper = wrap({ modules });
      await flushPromises();

      await updatePath(wrapper);
      wrapper.find(wrappedElement('download-button')).trigger('click');
      await flushPromises();

      expect(wrapper.find(wrappedElement('modules-apply-all-button')).attributes('disabled')).toBeUndefined();
    });
  });

  describe('Scrolling', () => {
    it('should start grabbing', async () => {
      const cursorUpdater = stubBodyCursorUpdater();
      const modules = repositoryWithLandscape();
      const wrapper = wrap({ modules, cursorUpdater });
      await flushPromises();
      const mouseEvent = {
        pageX: 0,
        pageY: 0,
        preventDefault: undefined,
      };

      const landscape = wrapper.find(wrappedElement('landscape-container'));
      await landscape.trigger('mousedown', mouseEvent);

      expect(cursorUpdater.set).toHaveBeenCalledExactlyOnceWith('grabbing');
    });

    it('should prevent default clicking event when defined', async () => {
      const cursorUpdater = stubBodyCursorUpdater();
      const modules = repositoryWithLandscape();
      const wrapper = wrap({ modules, cursorUpdater });
      await flushPromises();
      const mouseEvent = {
        pageX: 0,
        pageY: 0,
        preventDefault: vi.fn(),
      };

      const landscape = wrapper.find(wrappedElement('landscape-container'));
      await landscape.trigger('mousedown', mouseEvent);

      expect(mouseEvent.preventDefault).toHaveBeenCalledOnce();
    });

    it('should stop grabbing on mouseup', async () => {
      const modules = repositoryWithLandscape();
      const cursorUpdater = stubBodyCursorUpdater();
      const wrapper = wrap({ modules, cursorUpdater });
      await flushPromises();

      const landscape = wrapper.find(wrappedElement('landscape-container'));
      await landscape.trigger('mouseup');

      expect(cursorUpdater.reset).toHaveBeenCalledOnce();
    });

    it('should stop grabbing on mouseleave', async () => {
      const modules = repositoryWithLandscape();
      const cursorUpdater = stubBodyCursorUpdater();
      const wrapper = wrap({ modules, cursorUpdater });
      await flushPromises();

      const landscape = wrapper.find(wrappedElement('landscape-container'));
      await landscape.trigger('mouseleave');

      expect(cursorUpdater.reset).toHaveBeenCalledOnce();
    });

    it('should be scrolling', async () => {
      const landscapeScroller = stubLandscapeScroller();
      const cursorUpdater = stubBodyCursorUpdater();
      const modules = repositoryWithLandscape();
      const wrapper = wrap({ modules, cursorUpdater, landscapeScroller });
      await flushPromises();
      const mouseEventStart = {
        clientX: 30,
        clientY: 30,
      };
      const mouseEventGrabbed = {
        clientX: 10,
        clientY: 10,
      };

      const landscape = wrapper.find(wrappedElement('landscape-container'));
      await landscape.trigger('mousedown', mouseEventStart);
      await landscape.trigger('mousemove', mouseEventGrabbed);

      expect(landscapeScroller.scroll).toHaveBeenCalledExactlyOnceWith(expect.anything(), 20, 20);
    });

    it('should not scroll without starting grabbing', async () => {
      const landscapeScroller = stubLandscapeScroller();
      const modules = repositoryWithLandscape();
      const wrapper = wrap({ modules, landscapeScroller });
      await flushPromises();
      const mouseEventGrabbed = {
        clientX: 10,
        clientY: 10,
      };

      const landscape = wrapper.find(wrappedElement('landscape-container'));
      await landscape.trigger('mousemove', mouseEventGrabbed);

      expect(landscapeScroller.scroll).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard navigation', () => {
    beforeEach(() => {
      Object.defineProperty(document, 'activeElement', { value: document.body, configurable: true });
    });

    it('should navigate down and then up.', async () => {
      const wrapper = await componentWithLandscape();

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('init-module')).classes()).toContain('-selectable-highlighted');

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('infinitest-module')).classes()).toContain('-selectable-highlighted');
    });

    it('should not navigate when the dependant not exist', async () => {
      const wrapper = await componentWithLandscape();

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', ctrlKey: true }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('infinitest-module')).classes()).toContain('-selectable-highlighted');
    });

    it('should navigate to a dependant', async () => {
      const wrapper = await componentWithLandscape();

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('init-module')).classes()).toContain('-selectable-highlighted');

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', ctrlKey: true }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('vue-module')).classes()).toContain('-selectable-highlighted');
    });

    it('should not navigate when the module do not have any dependencies', async () => {
      const wrapper = await componentWithLandscape();

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', ctrlKey: true }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('infinitest-module')).classes()).toContain('-selectable-highlighted');
    });

    it('should call blur if input field has focus and click on a module', async () => {
      const wrapper = await componentWithLandscape();
      vi.spyOn(wrapper.find(wrappedElement('folder-path-field')).element as HTMLElement, 'blur');

      Object.defineProperty(document, 'activeElement', {
        value: wrapper.find(wrappedElement('folder-path-field')).element as HTMLElement,
        configurable: true,
      });

      await clickModule('init-props', wrapper);
      await flushPromises();
      await wrapper.vm.$nextTick();

      expect((wrapper.find(wrappedElement('folder-path-field')).element as HTMLElement).blur).toHaveBeenCalled();
    });

    it('should not navigate when an input field has focus', async () => {
      const wrapper = await componentWithLandscape();

      Object.defineProperty(document, 'activeElement', {
        value: wrapper.find(wrappedElement('folder-path-field')).element as HTMLElement,
        configurable: true,
      });

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', ctrlKey: true }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('prettier-module')).classes()).not.toContain('-selectable-highlighted');
    });

    it('should navigate to the first dependency of a module', async () => {
      const wrapper = await componentWithLandscape();

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('vue-module')).classes()).toContain('-selectable-highlighted');

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', ctrlKey: true }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('init-module')).classes()).toContain('-selectable-highlighted');
    });

    it('should toggle a module', async () => {
      const wrapper = await componentWithLandscape();

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('init-module')).classes()).toContain('-selectable-highlighted');

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('init-module')).classes()).toContain('-selected');
    });

    it('should navigate to a module that is in the same element', async () => {
      const wrapper = await componentWithLandscape();

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('vue-module')).classes()).toContain('-selectable-highlighted');

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('react-module')).classes()).toContain('-selectable-highlighted');

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('vue-module')).classes()).toContain('-selectable-highlighted');
    });

    it('should navigate to right then go back to left', async () => {
      const wrapper = await componentWithLandscape();

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('vue-module')).classes()).toContain('-selectable-highlighted');

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('infinitest-module')).classes()).toContain('-selectable-highlighted');
    });

    it('should not navigate if current module is the top or the bottom', async () => {
      const wrapper = await componentWithLandscape();

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('infinitest-module')).classes()).toContain('-selectable-highlighted');

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
      await wrapper.vm.$nextTick();

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
      await wrapper.vm.$nextTick();

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
      await wrapper.vm.$nextTick();

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('prettier-module')).classes()).toContain('-selectable-highlighted');
    });

    it('should not respond to a non navigation key', async () => {
      const wrapper = await componentWithLandscape();

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyNotExist' }));
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('landscape-container')).classes()).not.toContain('has-emphasized-module');
    });
  });

  describe('Preset Configuration', () => {
    it('should render LandscapePresetConfigurationVue component', async () => {
      const { presetComponent } = await setupPresetTest();

      expect(presetComponent.exists()).toBe(true);
    });

    it('should select modules from selected preset', async () => {
      const { initModuleElement } = await setupAndSelectPreset('init-maven');

      const classes = initModuleElement.classes();
      ['-selected', '-compacted'].forEach(expectedClass => {
        expect(classes).toContain(expectedClass);
      });
    });

    it('should select modules from selected preset when preset option is updated multiple times', async () => {
      let { initModuleElement } = await setupAndSelectPreset('init-prettier');

      let classes = initModuleElement.classes();
      ['-selected', '-compacted'].forEach(expectedClass => {
        expect(classes).toContain(expectedClass);
      });

      ({ initModuleElement } = await setupAndSelectPreset('init-typescript'));

      classes = initModuleElement.classes();
      ['-selected', '-compacted'].forEach(expectedClass => {
        expect(classes).toContain(expectedClass);
      });
    });

    it('should retain module selection state when preset option is deselected', async () => {
      const { presetComponent, initModuleElement } = await setupAndSelectPreset('init-maven');

      selectPresetOption(presetComponent, '');

      const classes = initModuleElement.classes();
      ['-selected', '-compacted'].forEach(expectedClass => {
        expect(classes).toContain(expectedClass);
      });
    });

    it('should deselect preset option when a new module is selected', async () => {
      const { wrapper, presetComponent } = await setupAndSelectPreset('init-maven');

      const moduleElement = wrapper.find(wrappedElement('infinitest-module'));
      await moduleElement.trigger('click');
      await flushPromises();

      const presetDropdown = presetComponent.find('select');
      expect(presetDropdown.element.value).toBe('');
    });

    it('should retain preset option when try to select a new not selectable module', async () => {
      const { wrapper, presetComponent } = await setupAndSelectPreset('init-maven');

      const moduleElement = wrapper.find(wrappedElement('sample-feature-module'));
      await moduleElement.trigger('click');
      await flushPromises();

      const presetDropdown = presetComponent.find('select');
      expect(presetDropdown.element.value).toBe('init-maven');
    });

    it('should deselect preset option when a selected module is deselected', async () => {
      const { wrapper, presetComponent } = await setupAndSelectPreset('init-maven');

      const moduleElement = wrapper.find(wrappedElement('maven-module'));
      await moduleElement.trigger('click');
      await flushPromises();

      const presetDropdown = presetComponent.find('select');
      expect(presetDropdown.element.value).toBe('');
    });

    const setupAndSelectPreset = async (presetValue: string) => {
      const { wrapper, presetComponent } = await setupPresetTest();

      selectPresetOption(presetComponent, presetValue);

      const initModuleElement = wrapper.find(wrappedElement('init-module'));

      return { wrapper, presetComponent, initModuleElement };
    };

    const setupPresetTest = async () => {
      const wrapper = await componentWithLandscape();
      const presetComponent = wrapper.findComponent(LandscapePresetConfigurationVue);

      return { wrapper, presetComponent };
    };

    const selectPresetOption = (presetComponent: VueWrapper<InstanceType<typeof LandscapePresetConfigurationVue>>, value: string) => {
      const presetDropdown = presetComponent.find('select');
      presetDropdown.setValue(value);
      presetDropdown.trigger('change');
    };
  });

  describe('Search module bar', () => {
    it('should render the search module bar', async () => {
      const { searchInput } = await setupSearchTest();

      expect(searchInput.exists()).toBe(true);
    });

    it('should highlight the first module found', async () => {
      const { wrapper, searchInput } = await setupSearchTest();

      await performSearch(searchInput, 'prettier');

      const prettierModuleClasses = wrapper.find(wrappedElement('prettier-module')).classes();
      expect(prettierModuleClasses).toContain('-search-highlighted');
    });

    it('should highlight the first feature found', async () => {
      const { wrapper, searchInput } = await setupSearchTest();

      await performSearch(searchInput, 'client');

      const prettierModuleClasses = wrapper.find(wrappedElement('client-feature')).classes();
      expect(prettierModuleClasses).toContain('-search-highlighted');
    });

    it('should remove the highlight when the search query is cleared', async () => {
      const { wrapper, searchInput } = await setupSearchTest();
      await performSearch(searchInput, 'prettier');

      await performSearch(searchInput, '');

      const prettierModuleClasses = wrapper.find(wrappedElement('prettier-module')).classes();
      expect(prettierModuleClasses).not.toContain('-search-highlighted');
    });

    it('should not highlight any modules when the search query does not match any modules', async () => {
      const { wrapper, searchInput } = await setupSearchTest();

      await performSearch(searchInput, 'not-found');

      const landscape = defaultLandscape();
      landscape
        .standaloneLevels()
        .flatMap(level => level.elements)
        .flatMap(element => element.allModules())
        .forEach(module => {
          const moduleClasses = wrapper.find(wrappedElement(`${module.slugString()}-module`)).classes();
          expect(moduleClasses).not.toContain('-search-highlighted');
        });
    });

    it('should scroll vertically and horizontally to the highlighted module if it is not visible within the current viewport', async () => {
      const { wrapper, searchInput, landscapeScroller } = await setupSearchTest();
      const { mockModuleRect, mockContainerRect } = setupScrollTest(wrapper, {
        moduleRect: {
          top: -100,
          bottom: -50,
          left: -100,
          right: 0,
          width: 100,
          height: 50,
          x: -100,
          y: -100,
        },
      });

      await performSearch(searchInput, 'prettier');

      const prettierModule = wrapper.find(wrappedElement('prettier-module')).element;

      expect(mockModuleRect).toHaveBeenCalled();
      expect(mockContainerRect).toHaveBeenCalled();
      expect(landscapeScroller.scrollIntoView).toHaveBeenCalledExactlyOnceWith(prettierModule);
    });

    it('should not scroll if the highlighted module is already visible', async () => {
      const { wrapper, searchInput, landscapeScroller } = await setupSearchTest();
      const { mockModuleRect, mockContainerRect } = setupScrollTest(wrapper, {
        moduleRect: {
          top: 100,
          bottom: 200,
          left: 100,
          right: 200,
          width: 100,
          height: 100,
          x: 100,
          y: 100,
        },
      });

      await performSearch(searchInput, 'prettier');

      expect(mockModuleRect).toHaveBeenCalled();
      expect(mockContainerRect).toHaveBeenCalled();
      expect(landscapeScroller.scrollIntoView).not.toHaveBeenCalled();
    });

    it('should reset the landscape container position to the initial landscape layout when the search query is cleared', async () => {
      const { wrapper, searchInput, landscapeScroller } = await setupSearchTest();
      const { landscapeContainer } = setupScrollTest(wrapper, {
        moduleRect: {
          top: -100,
          bottom: -50,
          left: -100,
          right: 0,
          width: 100,
          height: 50,
          x: -100,
          y: -100,
        },
      });
      await performSearch(searchInput, 'prettier');

      await performSearch(searchInput, '');

      expect(landscapeScroller.scrollSmooth).toHaveBeenCalledExactlyOnceWith(landscapeContainer, 0, 0);
    });

    const setupSearchTest = async () => {
      const landscapeScroller = stubLandscapeScroller();
      const modules = repositoryWithLandscape();
      const wrapper = wrap({ modules, landscapeScroller });

      await flushPromises();

      const searchInput = wrapper.find(wrappedElement('landscape-search-input'));

      return { wrapper, searchInput, landscapeScroller };
    };

    const performSearch = async (searchInput: DOMWrapper<Element>, searchTerm: string) => {
      await searchInput.setValue(searchTerm);
    };

    interface ModuleRect {
      top: number;
      bottom: number;
      left: number;
      right: number;
      width: number;
      height: number;
      x: number;
      y: number;
    }

    const setupScrollTest = (wrapper: VueWrapper, { moduleRect }: { moduleRect: ModuleRect }) => {
      const mockToJSON = vi.fn().mockImplementation(() => JSON.stringify(moduleRect));
      const mockModuleRect = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => ({
        ...moduleRect,
        toJSON: mockToJSON,
      }));

      const mockContainerRect = vi.fn().mockReturnValue({
        top: 0,
        bottom: 500,
        left: 0,
        right: 500,
        width: 500,
        height: 500,
        x: 0,
        y: 0,
        toJSON: () => '{"top":0,"bottom":500,"left":0,"right":500,"width":500,"height":500,"x":0,"y":0}',
      });

      const landscapeContainer = wrapper.find(wrappedElement('landscape-container')).element;
      landscapeContainer.getBoundingClientRect = mockContainerRect;

      return { mockModuleRect, mockContainerRect, landscapeContainer };
    };
  });

  describe('Rank module filter', () => {
    it('should render the rank module filter', async () => {
      const { rankComponent } = await setupRankTest();

      expect(rankComponent.exists()).toBe(true);
    });

    it('should filter modules from selected rank', async () => {
      const { wrapper, rankComponent } = await setupRankTest();

      const rankButton = rankComponent.find(wrappedElement('rank-RANK_S-filter'));
      await rankButton.trigger('click');
      await flushPromises();
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('infinitest-module')).exists()).toBe(true);
      expect(wrapper.find(wrappedElement('init-module')).exists()).toBe(true);
      expect(wrapper.find(wrappedElement('vue-module')).exists()).toBe(true);
      expect(wrapper.find(wrappedElement('java-base')).exists()).toBe(false);
    });

    it('should show all modules when deselect rank', async () => {
      const { wrapper, rankComponent } = await setupRankTest();
      const rankButton = rankComponent.find(wrappedElement('rank-RANK_S-filter'));
      await rankButton.trigger('click');
      await flushPromises();
      await wrapper.vm.$nextTick();

      await rankButton.trigger('click');
      await flushPromises();
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('infinitest-module')).exists()).toBe(true);
      expect(wrapper.find(wrappedElement('init-module')).exists()).toBe(true);
      expect(wrapper.find(wrappedElement('vue-module')).exists()).toBe(true);
      expect(wrapper.find(wrappedElement('java-base-module')).exists()).toBe(true);
    });

    it('should present distinctly with minimal emphasis on dependency modules of different ranks than the selected one', async () => {
      const { wrapper, rankComponent } = await setupRankTest();

      const rankButton = rankComponent.find(wrappedElement('rank-RANK_D-filter'));
      await rankButton.trigger('click');
      await flushPromises();
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('init-module')).exists()).toBe(true);
      expect(wrapper.find(wrappedElement('init-module')).classes()).toContain('-diff-rank-minimal-emphasis');
    });

    const setupRankTest = async () => {
      const wrapper = await componentWithLandscape();
      const rankComponent = wrapper.findComponent(LandscapeRankModuleFilterVue);

      return { wrapper, rankComponent: rankComponent };
    };
  });
});

const assertSelectableHighlightedConnectorsCount = (wrapper: VueWrapper, count: number): void => {
  assertConnectorsCount(wrapper, '-selectable-highlighted', count);
};

const assertNotSelectableHighlightedConnectorsCount = (wrapper: VueWrapper, count: number): void => {
  assertConnectorsCount(wrapper, '-not-selectable-highlighted', count);
};

const assertUnSelectionHighlightedConnectorsCount = (wrapper: VueWrapper, count: number): void => {
  assertConnectorsCount(wrapper, '-highlighted-unselection', count);
};

const assertSelectedConnectorsCount = (wrapper: VueWrapper, count: number): void => {
  assertConnectorsCount(wrapper, '-selected', count);
};

const assertConnectorsCount = (wrapper: VueWrapper, cssClass: string, count: number): void => {
  expect(
    wrapper
      .find(wrappedElement('landscape-connectors'))
      .findAll('path')
      .filter(line => line.classes().includes(cssClass)).length,
  ).toBe(count);
};

const validateInitApplication = async (wrapper: VueWrapper): Promise<void> => {
  await wrapper.find(wrappedElement('folder-path-field')).setValue('test');
  await clickModule('init', wrapper);
  await wrapper.find(wrappedElement('parameter-baseName-field')).setValue('base');

  await wrapper.find(wrappedElement('modules-apply-all-button')).trigger('click');

  await flushPromises();
};

const clickModule = async (slug: string, wrapper: VueWrapper): Promise<void> => {
  await wrapper.find(wrappedElement(`${slug}-module`)).trigger('click');
};

const updatePath = async (wrapper: VueWrapper): Promise<void> => {
  await wrapper.find(wrappedElement('folder-path-field')).setValue('test');
  await wrapper.find(wrappedElement('folder-path-field')).trigger('blur');
};
