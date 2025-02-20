import { GLOBAL_WINDOW, provide } from '@/injections';
import { MODULES_REPOSITORY, MODULE_PARAMETERS_REPOSITORY, PROJECT_FOLDERS_REPOSITORY } from '@/module/application/ModuleProvider';
import { Module } from '@/module/domain/Module';
import { ModuleParametersRepository } from '@/module/domain/ModuleParametersRepository';
import { Modules } from '@/module/domain/Modules';
import { ModulesRepository } from '@/module/domain/ModulesRepository';
import { ProjectFoldersRepository } from '@/module/domain/ProjectFoldersRepository';
import { ModulesVue } from '@/module/primary/modules-patch';
import { ALERT_BUS } from '@/shared/alert/application/AlertProvider';
import { VueWrapper, flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { wrappedElement } from '../../../WrappedElement';
import { stubAlertBus } from '../../../shared/alert/domain/AlertBus.fixture';
import { ModuleParametersRepositoryStub, stubModuleParametersRepository } from '../../domain/ModuleParameters.fixture';
import {
  ModulesRepositoryStub,
  defaultModules,
  defaultModulesWithNonDefaultProperties,
  defaultProjectHistory,
  moduleSlug,
  stubModulesRepository,
} from '../../domain/Modules.fixture';
import { ProjectFoldersRepositoryStub, stubProjectFoldersRepository } from '../../domain/ProjectFolders.fixture';
import { stubWindow } from '../GlobalWindow.fixture';

interface WrapperOptions {
  modules: ModulesRepository;
  projectFolders: ProjectFoldersRepository;
  moduleParameters: ModuleParametersRepository;
}

const alertBus = stubAlertBus();

const wrap = (options?: Partial<WrapperOptions>): VueWrapper => {
  const { modules, projectFolders, moduleParameters }: WrapperOptions = {
    modules: repositoryWithModules(),
    projectFolders: repositoryWithProjectFolders(),
    moduleParameters: repositoryWithModuleParameters(),
    ...options,
  };

  provide(MODULES_REPOSITORY, modules);
  provide(PROJECT_FOLDERS_REPOSITORY, projectFolders);
  provide(MODULE_PARAMETERS_REPOSITORY, moduleParameters);
  provide(ALERT_BUS, alertBus);
  provide(GLOBAL_WINDOW, stubWindow());

  return mount(ModulesVue);
};

const makeTaggedModule = (tag: string): Module => ({
  slug: moduleSlug(`${tag}-slug`),
  description: `${tag} description`,
  properties: [],
  tags: [tag],
});

describe('Modules', () => {
  describe('Loading', () => {
    it('should display loader when waiting for modules', () => {
      const wrapper = wrap();

      expect(wrapper.find(wrappedElement('modules-loader')).exists()).toBe(true);
      expect(wrapper.find(wrappedElement('modules-list')).exists()).toBe(false);
    });

    it('should catch error when waiting for modules error', () => {
      const consoleErrors = vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
        const { modules, projectFolders, moduleParameters }: WrapperOptions = {
          modules: repositoryWithModulesError(),
          projectFolders: repositoryWithProjectFolders(),
          moduleParameters: repositoryWithModuleParameters(),
        };

        provide(MODULES_REPOSITORY, modules);
        provide(PROJECT_FOLDERS_REPOSITORY, projectFolders);
        provide(MODULE_PARAMETERS_REPOSITORY, moduleParameters);
        provide(ALERT_BUS, alertBus);
        provide(GLOBAL_WINDOW, window);

        return mount(ModulesVue);
      } catch (e) {
        if (e instanceof Error) {
          expect(e.message).toBe('repositoryWithModulesError');
        }
        expect(console.error).toHaveBeenCalled();
        consoleErrors.mockRestore();
      }
    });

    it('should catch error when waiting for project folders error', () => {
      try {
        const { modules, projectFolders, moduleParameters }: WrapperOptions = {
          modules: repositoryWithModules(),
          projectFolders: repositoryWithProjectFoldersError(),
          moduleParameters: repositoryWithModuleParameters(),
        };

        provide(MODULES_REPOSITORY, modules);
        provide(PROJECT_FOLDERS_REPOSITORY, projectFolders);
        provide(MODULE_PARAMETERS_REPOSITORY, moduleParameters);
        provide(ALERT_BUS, alertBus);
        provide(GLOBAL_WINDOW, window);

        return mount(ModulesVue);
      } catch (e) {
        if (e instanceof Error) {
          expect(e.message).toBe('repositoryWithProjectFoldersError');
        }
        expect(console.error).toHaveBeenCalled();
      }
    });

    it('should load modules at startup', async () => {
      const wrapper = await componentWithModules();

      expect(wrapper.find(wrappedElement('modules-loader')).exists()).toBe(false);
      expect(wrapper.find(wrappedElement('modules-list')).exists()).toBe(true);
      expect(wrapper.find(wrappedElement('spring-cucumber-module-content')).exists()).toBe(true);
      expect(wrapper.find(wrappedElement('banner-module-content')).classes()).toEqual([
        'jhipster-module--content',
        'not-selected',
        'not-applied',
      ]);
      expect(wrapper.find(wrappedElement('module-spring-cucumber-MANDATORY-parameters')).classes()).toEqual([
        'jhipster-module-parameters',
        'not-selected',
        'invalid-mandatory-parameter',
      ]);
      expect(wrapper.find(wrappedElement('module-spring-cucumber-OPTIONAL-parameters')).classes()).toEqual([
        'jhipster-module-parameters',
        'not-selected',
        'invalid-optional-parameter',
      ]);

      const pathField = wrapper.find(wrappedElement('folder-path-field')).element as HTMLInputElement;
      expect(pathField.value).toBe('/tmp/jhlite/1234');
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

  describe('Properties filling', () => {
    it.each(['click', 'keyup.enter'])('Should select module on %s', async trigger => {
      const wrapper = await componentWithModules();

      await selectModule(wrapper, trigger);

      expect(wrapper.find(wrappedElement('parameter-baseName-field')).attributes('type')).toBe('text');
      expect(wrapper.find(wrappedElement('parameter-baseName-optional-marker')).exists()).toBe(false);

      expect(wrapper.find(wrappedElement('parameter-optionalBoolean-field')).exists()).toBe(true);
      expect(wrapper.find(wrappedElement('parameter-optionalBoolean-optional-marker')).exists()).toBe(true);

      expect(wrapper.find(wrappedElement('parameter-optionalInteger-field')).attributes('type')).toBe('number');
      expect(wrapper.find(wrappedElement('parameter-optionalInteger-optional-marker')).exists()).toBe(true);

      expect(wrapper.find(wrappedElement('banner-module-content')).classes()).toEqual([
        'jhipster-module--content',
        'not-selected',
        'not-applied',
      ]);
      expect(wrapper.find(wrappedElement('spring-cucumber-module-content')).classes()).toEqual([
        'jhipster-module--content',
        'selected',
        'not-applied',
      ]);
    });

    it('should unselect module', async () => {
      const wrapper = await componentWithModules();

      await selectModule(wrapper);
      wrapper.find(wrappedElement('spring-cucumber-module-content')).trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.find(wrappedElement('parameter-baseName-field')).exists()).toBe(false);
      expect(wrapper.find(wrappedElement('parameter-optionalBoolean-field')).exists()).toBe(false);
      expect(wrapper.find(wrappedElement('parameter-optionalInteger-field')).exists()).toBe(false);
      expect(wrapper.find(wrappedElement('spring-cucumber-module-content')).classes()).toEqual([
        'jhipster-module--content',
        'not-selected',
        'not-applied',
      ]);
    });

    it('should disable validation button without project folder', async () => {
      const wrapper = await componentWithModules();
      await selectModule(wrapper);

      wrapper.find(wrappedElement('folder-path-field')).setValue('');
      wrapper.find(wrappedElement('parameter-baseName-field')).setValue('test');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).attributes('disabled')).toBeDefined();
    });

    it('should disable validation button without mandatory fields and no defaults', async () => {
      const wrapper = await componentWithModulesAndNonDefaultProperties();
      await selectModule(wrapper);

      wrapper.find(wrappedElement('folder-path-field')).setValue('test');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).attributes('disabled')).toBeDefined();
    });

    it('should not disable validation button without mandatory fields and available defaults', async () => {
      const wrapper = await componentWithModulesAndNonDefaultProperties();
      await selectModule(wrapper);

      wrapper.find(wrappedElement('folder-path-field')).setValue('test');
      wrapper.find(wrappedElement('parameter-mandatoryBoolean-field')).setValue('false');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).attributes('disabled')).toBeUndefined();
    });

    it('should disable module application with empty string on non default mandatory properties', async () => {
      const wrapper = await componentWithModulesAndNonDefaultProperties();
      await selectModule(wrapper);

      wrapper.find(wrappedElement('folder-path-field')).setValue('test');
      wrapper.find(wrappedElement('parameter-baseName-field')).setValue('baseName');
      wrapper.find(wrappedElement('parameter-mandatoryBoolean-field')).setValue('');

      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).attributes('disabled')).toBeDefined();
    });

    it('should enable module application with mandatory fields set', async () => {
      const wrapper = await componentWithModules();
      await selectModule(wrapper);

      wrapper.find(wrappedElement('folder-path-field')).setValue('test');
      wrapper.find(wrappedElement('parameter-baseName-field')).setValue('test');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).attributes('disabled')).toBeUndefined();
    });

    it('should display set properties', async () => {
      const wrapper = await componentWithModules();
      await selectModule(wrapper);

      wrapper.find(wrappedElement('folder-path-field')).setValue('test');
      wrapper.find(wrappedElement('parameter-baseName-field')).setValue('test');
      wrapper.find(wrappedElement('parameter-optionalBoolean-field')).setValue('true');
      wrapper.find(wrappedElement('parameter-optionalInteger-field')).setValue('42');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-spring-cucumber-baseName-parameter-value')).text()).toBe('test');
      expect(wrapper.find(wrappedElement('module-spring-cucumber-MANDATORY-parameters-stats')).text()).toBe('1 / 1');

      expect(wrapper.find(wrappedElement('module-spring-cucumber-optionalBoolean-parameter-value')).text()).toBe('true');
      expect(wrapper.find(wrappedElement('module-spring-cucumber-optionalInteger-parameter-value')).text()).toBe('42');
      expect(wrapper.find(wrappedElement('module-spring-cucumber-OPTIONAL-parameters-stats')).text()).toBe('2 / 2');

      expect(wrapper.find(wrappedElement('module-spring-cucumber-MANDATORY-parameters')).classes()).toEqual([
        'jhipster-module-parameters',
        'selected',
        'all-valid-parameters',
      ]);
    });

    it('should set boolean parameter to false', async () => {
      const wrapper = await componentWithModules();
      await selectModule(wrapper);

      wrapper.find(wrappedElement('parameter-optionalBoolean-field')).setValue('false');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-spring-cucumber-optionalBoolean-parameter-value')).text()).toBe('false');
    });

    it('should set boolean parameter to undefined', async () => {
      const wrapper = await componentWithModules();
      await selectModule(wrapper);

      wrapper.find(wrappedElement('parameter-optionalBoolean-field')).setValue('true');
      await flushForm(wrapper);
      wrapper.find(wrappedElement('parameter-optionalBoolean-field')).setValue('');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-spring-cucumber-optionalBoolean-parameter-value')).text()).toBe('');
    });

    it('should set integer parameter to undefined', async () => {
      const wrapper = await componentWithModules();
      await selectModule(wrapper);

      wrapper.find(wrappedElement('parameter-optionalInteger-field')).setValue('42');
      await flushForm(wrapper);
      wrapper.find(wrappedElement('parameter-optionalInteger-field')).setValue('');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-spring-cucumber-optionalInteger-parameter-value')).text()).toBe('');
    });
  });

  describe('Module application', () => {
    it('should apply module using repository', async () => {
      const modules = repositoryWithModules();
      modules.apply.resolves(null);
      const wrapper = wrap({ modules });

      await flushPromises();
      await selectModule(wrapper);

      wrapper.find(wrappedElement('folder-path-field')).setValue('test');
      wrapper.find(wrappedElement('parameter-baseName-field')).setValue('test');
      await flushForm(wrapper);

      wrapper.find(wrappedElement('module-spring-cucumber-application-button')).trigger('click');

      await flushPromises();

      const [, moduleToApply] = modules.apply.lastCall.args;
      expect(moduleToApply.commit).toBe(true);
    });

    it('should apply module using repository with default values for unfilled properties', async () => {
      const modules = repositoryWithModulesAndNonDefaultProperties();
      modules.apply.resolves(null);
      const wrapper = wrap({ modules });

      await flushPromises();
      await selectModule(wrapper);

      wrapper.find(wrappedElement('folder-path-field')).setValue('test');
      wrapper.find(wrappedElement('parameter-mandatoryBoolean-field')).setValue('true');
      await flushForm(wrapper);

      wrapper.find(wrappedElement('module-spring-cucumber-application-button')).trigger('click');

      await flushPromises();

      const [, moduleToApply] = modules.apply.lastCall.args;
      expect(moduleToApply.commit).toBe(true);
      expect(wrapper.find(wrappedElement('module-spring-cucumber-baseName-parameter-value')).text()).toBe('jhipster');
      expect(wrapper.find(wrappedElement('module-spring-cucumber-mandatoryBooleanDefault-parameter-value')).text()).toBe('true');
      expect(wrapper.find(wrappedElement('module-spring-cucumber-mandatoryInteger-parameter-value')).text()).toBe('1337');
    });

    it('should disable applications during application', async () => {
      const modules = repositoryWithModules();
      modules.apply.returns(new Promise(resolve => setTimeout(resolve, 500)));
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('module-spring-cucumber-application-button')).trigger('click');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).attributes('disabled')).toBeDefined();
    });

    it('should enable applications after successful application', async () => {
      const modules = repositoryWithModules();
      modules.apply.resolves(undefined);
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('module-spring-cucumber-application-button')).trigger('click');
      await flushForm(wrapper);

      await flushPromises();

      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).attributes('disabled')).toBeUndefined();
    });

    it('should enable applications after failing application', async () => {
      const modules = repositoryWithModules();
      modules.apply.rejects('this is an error');
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('module-spring-cucumber-application-button')).trigger('click');
      await flushForm(wrapper);

      await flushPromises();

      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).attributes('disabled')).toBeUndefined();
    });

    it('should apply module without commit', async () => {
      const modules = repositoryWithModules();
      modules.apply.resolves(undefined);
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('commit-module-application')).trigger('click');
      wrapper.find(wrappedElement('module-spring-cucumber-application-button')).trigger('click');
      await flushForm(wrapper);
      await flushPromises();

      const [, moduleToApply] = modules.apply.lastCall.args;
      expect(moduleToApply.commit).toBe(false);
    });

    it('should send module application notification', async () => {
      const modules = repositoryWithModules();
      modules.apply.resolves(undefined);
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('module-spring-cucumber-application-button')).trigger('click');
      await flushForm(wrapper);

      await flushPromises();

      const [message] = alertBus.success.lastCall.args;
      expect(message).toBe('Module "spring-cucumber" applied');
    });

    it('should send module application error notification', async () => {
      const modules = repositoryWithModules();
      modules.apply.rejects(undefined);
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('module-spring-cucumber-application-button')).trigger('click');
      await flushForm(wrapper);

      await flushPromises();

      const [message] = alertBus.error.lastCall.args;
      expect(message).toBe('Module "spring-cucumber" not applied');
    });
  });

  describe('Applied modules', () => {
    it('should mark already applied modules as applied', async () => {
      const modules = repositoryWithModules();
      modules.history.resolves(defaultProjectHistory());
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('folder-path-field')).trigger('blur');

      await flushPromises();

      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-icon')).classes()).toEqual(['jhlite-icon', 'jhlite-icon-ccw']);
      expect(wrapper.find(wrappedElement('spring-cucumber-module-content')).classes()).toEqual([
        'jhipster-module--content',
        'selected',
        'applied',
      ]);
    });

    it('should reset modules application for module history error', async () => {
      const modules = repositoryWithModules();
      modules.history.rejects();
      modules.apply.resolves(undefined);

      const wrapper = await filledModuleForm(modules);
      wrapper.find(wrappedElement('module-spring-cucumber-application-button')).trigger('click');
      await flushForm(wrapper);
      await flushPromises();

      wrapper.find(wrappedElement('folder-path-field')).trigger('blur');
      await flushPromises();

      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-icon')).classes()).toEqual([
        'jhlite-icon',
        'jhlite-icon-play',
      ]);
    });

    it('should mark modules as applied after application', async () => {
      const modules = repositoryWithModules();
      modules.apply.resolves(undefined);
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('module-spring-cucumber-application-button')).trigger('click');
      await flushForm(wrapper);

      await flushPromises();

      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-icon')).classes()).toEqual(['jhlite-icon', 'jhlite-icon-ccw']);
    });
  });

  describe('Properties preload', () => {
    it('should load properties from project', async () => {
      const modules = repositoryWithModules();
      modules.history.resolves(defaultProjectHistory());
      const wrapper = wrap({ modules });

      await updatePath(wrapper);

      const baseNameField = wrapper.find(wrappedElement('parameter-baseName-field')).element as HTMLInputElement;
      expect(baseNameField.value).toBe('setbase');
    });

    it('should not override set properties', async () => {
      const modules = repositoryWithModules();
      modules.history.resolves(defaultProjectHistory());
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('folder-path-field')).trigger('blur');
      await flushPromises();

      const baseNameField = wrapper.find(wrappedElement('parameter-baseName-field')).element as HTMLInputElement;
      expect(baseNameField.value).toBe('test');
    });
  });

  describe('Filtering', () => {
    it('should filter modules with one matching slug module', async () => {
      const modules = repositoryWithModules();
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('modules-filter-field')).setValue('spring-cucumber');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-banner-application-button')).exists()).toBe(false);
      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).exists()).toBe(true);

      const modulesCountText = wrapper.find(wrappedElement('displayed-modules-count')).text();
      expect(modulesCountText).toContain('1');
      expect(modulesCountText).toContain('2');
    });

    it('should filter modules with one matching description module', async () => {
      const modules = repositoryWithModules();
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('modules-filter-field')).setValue('Add cucumber');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-banner-application-button')).exists()).toBe(false);
      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).exists()).toBe(true);
    });

    it('should filter modules with one matching tag module', async () => {
      const modules = repositoryWithModules();
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('modules-filter-field')).setValue('server');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-banner-application-button')).exists()).toBe(false);
      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).exists()).toBe(true);
    });

    it('should filter modules with multiple words matching', async () => {
      const modules = repositoryWithModules();
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('modules-filter-field')).setValue('spring-cucumber add application');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-banner-application-button')).exists()).toBe(false);
      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).exists()).toBe(true);
    });

    it('should filter modules with no matching module', async () => {
      const modules = repositoryWithModules();
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('modules-filter-field')).setValue('hello');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-banner-application-button')).exists()).toBe(false);
      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).exists()).toBe(false);
    });

    it.each([{ tag: 'init' }, { tag: 'server' }, { tag: 'client' }])('Should filter modules with $tag filter', async ({ tag }) => {
      const tags = ['init', 'server', 'client'];
      const otherTags = tags.filter(current => current !== tag);
      const repository = stubModulesRepository();

      repository.list.resolves(
        new Modules([
          {
            name: 'Three filters',
            modules: tags.map(makeTaggedModule),
          },
        ]),
      );
      const wrapper = wrap({ modules: repository });
      await flushForm(wrapper);

      wrapper.find(wrappedElement(`${tag}-tag-filter`)).trigger('click');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement(`module-${tag}-slug-application-button`)).exists()).toBe(true);
      otherTags.forEach(other => expect(wrapper.find(wrappedElement(`module-${other}-slug-application-button`)).exists()).toBe(false));
    });

    it('should filter modules with tag filter', async () => {
      const modules = repositoryWithModules();
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('server-tag-filter')).trigger('click');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-banner-application-button')).exists()).toBe(false);
      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).exists()).toBe(true);
      expect(wrapper.find(wrappedElement('server-tag-filter')).classes()).toEqual(['jhipster-tag-filter', 'selected']);
    });

    it('should filter modules with tag and search filter', async () => {
      const modules = repositoryWithModules();
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('server-tag-filter')).trigger('click');
      wrapper.find(wrappedElement('modules-filter-field')).setValue('cucumber');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-banner-application-button')).exists()).toBe(false);
      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).exists()).toBe(true);
    });

    it('should unselect modules tag filter', async () => {
      const modules = repositoryWithModules();
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('server-tag-filter')).trigger('click');
      await flushForm(wrapper);
      wrapper.find(wrappedElement('server-tag-filter')).trigger('click');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-banner-application-button')).exists()).toBe(true);
      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).exists()).toBe(true);
      expect(wrapper.find(wrappedElement('server-tag-filter')).classes()).toEqual(['jhipster-tag-filter', 'not-selected']);
    });
  });

  describe('Formatting', () => {
    it('should disable applications during project formatting', async () => {
      const modules = repositoryWithModules();
      modules.format.returns(new Promise(resolve => setTimeout(resolve, 500)));
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('format-button')).trigger('click');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).attributes('disabled')).toBeDefined();
    });

    it('should enable applications after project formatting', async () => {
      const modules = repositoryWithModules();
      modules.format.resolves(undefined);
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('format-button')).trigger('click');
      await flushForm(wrapper);
      await flushPromises();

      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).attributes('disabled')).toBeUndefined();
    });
  });

  describe('Download', () => {
    it('should disable applications during download', async () => {
      const modules = repositoryWithModules();
      modules.download.returns(new Promise(resolve => setTimeout(resolve, 500)));
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('download-button')).trigger('click');
      await flushForm(wrapper);

      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).attributes('disabled')).toBeDefined();
    });

    it('should enable applications after download', async () => {
      const modules = repositoryWithModules();
      modules.download.resolves(undefined);
      const wrapper = await filledModuleForm(modules);

      wrapper.find(wrappedElement('download-button')).trigger('click');
      await flushForm(wrapper);
      await flushPromises();

      expect(wrapper.find(wrappedElement('module-spring-cucumber-application-button')).attributes('disabled')).toBeUndefined();
    });
  });
});

const componentWithModules = async (): Promise<VueWrapper> => {
  const modules = repositoryWithModules();

  const projectFolders = repositoryWithProjectFolders();
  const moduleParameters = repositoryWithModuleParameters();
  const wrapper = wrap({ modules, projectFolders, moduleParameters });

  await flushPromises();

  return wrapper;
};

const componentWithModulesAndNonDefaultProperties = async (): Promise<VueWrapper> => {
  const modules = repositoryWithModulesAndNonDefaultProperties();
  const projectFolders = repositoryWithProjectFolders();
  const wrapper = wrap({ modules, projectFolders });

  await flushPromises();

  return wrapper;
};

const selectModule = async (wrapper: VueWrapper, trigger = 'click') => {
  wrapper.find(wrappedElement('spring-cucumber-module-content')).trigger(trigger);
  await wrapper.vm.$nextTick();
};

const flushForm = async (wrapper: VueWrapper) => {
  await wrapper.vm.$nextTick();
};

const filledModuleForm = async (modules: ModulesRepository): Promise<VueWrapper> => {
  const wrapper = wrap({ modules });

  await flushPromises();
  await selectModule(wrapper);

  wrapper.find(wrappedElement('folder-path-field')).setValue('test');
  wrapper.find(wrappedElement('parameter-baseName-field')).setValue('test');
  await flushForm(wrapper);

  return wrapper;
};

const repositoryWithModules = (): ModulesRepositoryStub => {
  const modules = stubModulesRepository();
  modules.list.resolves(defaultModules());

  return modules;
};

const repositoryWithModulesError = (): ModulesRepositoryStub => {
  const modules = stubModulesRepository();
  modules.list.rejects(new Error('repositoryWithModulesError'));

  return modules;
};

const repositoryWithModulesAndNonDefaultProperties = (): ModulesRepositoryStub => {
  const modules = stubModulesRepository();
  modules.list.resolves(defaultModulesWithNonDefaultProperties());

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

const updatePath = async (wrapper: VueWrapper): Promise<void> => {
  await flushPromises();
  await selectModule(wrapper);

  wrapper.find(wrappedElement('folder-path-field')).setValue('test');
  wrapper.find(wrappedElement('folder-path-field')).trigger('blur');
  await flushForm(wrapper);
  await flushPromises();
};
