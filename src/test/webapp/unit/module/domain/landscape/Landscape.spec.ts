import { LandscapeFeature } from '@/module/domain/landscape/LandscapeFeature';
import { LandscapeSelectionElement } from '@/module/domain/landscape/LandscapeSelectionElement';
import { LandscapeSelectionTree } from '@/module/domain/landscape/LandscapeSelectionTree';
import { Optional } from '@/shared/optional/domain/Optional';
import { describe, expect, it } from 'vitest';
import { applicationBaseNamePropertyDefinition, moduleSlug, optionalBooleanPropertyDefinition } from '../Modules.fixture';
import { defaultLandscape, featureSlug } from './Landscape.fixture';

describe('Landscape', () => {
  describe('Reset applied modules', () => {
    it('should ignore unknown modules', () => {
      const landscape = defaultLandscape().resetAppliedModules([moduleSlug('init'), moduleSlug('unknown')]);

      expect(landscape.isSelected(moduleSlug('init'))).toBe(true);
      expect(landscape.isApplied(moduleSlug('init'))).toBe(true);
      expect(landscape.isSelected(moduleSlug('unknown'))).toBe(false);
      expect(landscape.isApplied(moduleSlug('unknown'))).toBe(false);
    });

    it('should be applied for newly applied module', () => {
      const landscape = defaultLandscape().resetAppliedModules([moduleSlug('init')]);

      expect(landscape.isApplied(moduleSlug('init'))).toBe(true);
      expect(landscape.isSelected(moduleSlug('init'))).toBe(true);

      expect(landscape.notAppliedSelectedModules()).toEqual([]);
      expect(landscape.selectedModules()).toEqual([moduleSlug('init')]);
    });

    it('should not be applied for previously applied module', () => {
      const landscape = defaultLandscape()
        .resetAppliedModules([moduleSlug('init')])
        .resetAppliedModules([moduleSlug('vue')]);

      expect(landscape.isApplied(moduleSlug('init'))).toBe(false);
      expect(landscape.isSelected(moduleSlug('init'))).toBe(true);

      expect(landscape.isApplied(moduleSlug('vue'))).toBe(true);
      expect(landscape.isSelected(moduleSlug('vue'))).toBe(true);
    });
  });

  describe('Apply modules', () => {
    it('should ignore unknown modules', () => {
      const landscape = defaultLandscape().appliedModules([moduleSlug('unknown')]);

      expect(landscape.isApplied(moduleSlug('unknown'))).toBe(false);
    });

    it('should mark applied modules as applied', () => {
      const landscape = defaultLandscape()
        .resetAppliedModules([moduleSlug('init')])
        .appliedModules([moduleSlug('vue')]);

      expect(landscape.isApplied(moduleSlug('init'))).toBe(true);
      expect(landscape.isSelected(moduleSlug('init'))).toBe(true);

      expect(landscape.isApplied(moduleSlug('vue'))).toBe(true);
      expect(landscape.isSelected(moduleSlug('vue'))).toBe(true);
    });
  });

  describe('Selection', () => {
    it('should not select unknown module', () => {
      const landscape = defaultLandscape().toggle(moduleSlug('unknown'));

      expect(landscape.isSelected(moduleSlug('unknown'))).toBe(false);
    });

    it('should not select not selectable module', () => {
      const landscape = defaultLandscape().toggle(moduleSlug('java-base'));

      expect(landscape.isSelected(moduleSlug('java-base'))).toBe(false);
    });

    it('should select modules', () => {
      const landscape = defaultLandscape().toggle(moduleSlug('vue'));

      expect(landscape.isSelected(moduleSlug('init'))).toBe(true);
      expect(landscape.isSelected(moduleSlug('vue'))).toBe(true);

      expect(landscape.isSelected(featureSlug('client'))).toBe(true);

      expect(landscape.notAppliedSelectedModules()).toEqual([moduleSlug('vue'), moduleSlug('init')]);
      expect(landscape.selectedModules()).toEqual([moduleSlug('vue'), moduleSlug('init')]);
    });

    it('should not select features', () => {
      const landscape = defaultLandscape().toggle(moduleSlug('maven')).toggle(moduleSlug('java-base'));

      expect(landscape.selectedModules()).not.toContainEqual(moduleSlug('java-build-tools'));
    });

    it('should switch selected module in feature', () => {
      const landscape = defaultLandscape().toggle(moduleSlug('maven')).toggle(moduleSlug('gradle'));

      expect(landscape.isSelected(moduleSlug('gradle'))).toBe(true);
      expect(landscape.isSelected(moduleSlug('maven'))).toBe(false);
    });
  });

  describe('Unselection', () => {
    it('should not unselect unknown module', () => {
      const landscape = defaultLandscape().toggle(moduleSlug('unknown'));

      expect(landscape.isSelected(moduleSlug('unknown'))).toBe(false);
    });

    it('should unselect selected module', () => {
      const landscape = defaultLandscape().toggle(moduleSlug('maven')).toggle(moduleSlug('java-base')).toggle(moduleSlug('maven'));

      expect(landscape.isSelected(moduleSlug('maven'))).toBe(false);
      expect(landscape.isSelected(moduleSlug('java-base'))).toBe(false);
      expect(landscape.isSelected(moduleSlug('init'))).toBe(true);
    });
  });

  describe('Selection tree', () => {
    it('should get empty selection tree for unknown module', () => {
      const selectionTree = defaultLandscape().selectionTreeFor(moduleSlug('unknown'));

      expect(selectionTree).toEqual(LandscapeSelectionTree.EMPTY);
    });

    it('should get empty selection tree for root module', () => {
      const selectionTree = defaultLandscape().selectionTreeFor(moduleSlug('init'));

      expect(selectionTree.elements).toEqual([selectableModule('init')]);
    });

    it('should get selection tree with one selectable module', () => {
      const selectionTree = defaultLandscape().selectionTreeFor(moduleSlug('vue'));

      expect(selectionTree.elements).toEqual([selectableModule('vue'), selectableModule('init')]);
      expect(selectionTree.isSelectable()).toBe(true);
    });

    it('should get selection tree with one not selectable feature', () => {
      const selectionTree = defaultLandscape().selectionTreeFor(moduleSlug('java-base'));

      expect(selectionTree.elements).toEqual([notSelectableModule('java-base'), notSelectableFeature('java-build-tools')]);
      expect(selectionTree.isSelectable()).toBe(false);
    });

    it('should get selection tree with selected module', () => {
      const selectionTree = defaultLandscape().toggle(moduleSlug('maven')).selectionTreeFor(moduleSlug('java-base'));

      expect(selectionTree.elements).toEqual([
        selectableModule('java-base'),
        selectableFeature('java-build-tools'),
        selectableModule('maven'),
        selectableModule('init'),
      ]);
      expect(selectionTree.isSelectable()).toBe(true);
    });

    it('should get selection tree with dependency to feature with one module', () => {
      const selectionTree = defaultLandscape().toggle(moduleSlug('maven')).selectionTreeFor(moduleSlug('liquibase'));

      expect(selectionTree.elements).toContainEqual(selectableFeature('jpa'));
      expect(selectionTree.elements).toContainEqual(selectableModule('postgresql'));
      expect(selectionTree.elements).toContainEqual(selectableModule('spring-boot'));
      expect(selectionTree.isSelectable()).toBe(true);
    });

    it('should get selection tree with dependency to feature with incompatible selected module', () => {
      const landscape = defaultLandscape().toggle(moduleSlug('maven')).toggle(moduleSlug('gitlab-maven'));

      expect(landscape.isSelectable(moduleSlug('maven'))).toBe(true);
      expect(landscape.isSelectable(moduleSlug('gradle'))).toBe(false);
      expect(landscape.isSelectable(moduleSlug('gitlab-gradle'))).toBe(false);

      const gradleSelectionTree = landscape.selectionTreeFor(moduleSlug('gradle'));
      expect(gradleSelectionTree.elements).toContainEqual(notSelectableModule('gradle'));
      expect(gradleSelectionTree.isSelectable()).toBe(false);

      const gitlabGradleSelectionTree = landscape.selectionTreeFor(moduleSlug('gitlab-gradle'));
      expect(gitlabGradleSelectionTree.elements).toContainEqual(notSelectableModule('maven'));
      expect(gitlabGradleSelectionTree.elements).toContainEqual(notSelectableModule('gradle'));
      expect(gitlabGradleSelectionTree.isSelectable()).toBe(false);
    });

    it('should get selection tree with disabled incompatible module dependencies', () => {
      const landscape = defaultLandscape().toggle(moduleSlug('maven'));
      const selectionTree = landscape.selectionTreeFor(moduleSlug('gradle'));

      expect(landscape.isSelectable(moduleSlug('gitlab-gradle'))).toBe(false);

      expect(selectionTree.elements).toContainEqual(selectableModule('gradle'));
      expect(selectionTree.isSelectable()).toBe(true);
    });

    it('should get not selectable feature for applied module in feature', () => {
      const landscape = defaultLandscape().appliedModules([moduleSlug('maven')]);
      const selectionTree = landscape.selectionTreeFor(moduleSlug('gradle'));

      expect(landscape.isSelectable(moduleSlug('gradle'))).toBe(false);

      expect(selectionTree.elements).toContainEqual(notSelectableModule('gradle'));
      expect(selectionTree.isSelectable()).toBe(false);
    });
  });

  describe('Unselection tree', () => {
    it('should get empty unselection tree for unknown module', () => {
      const unselectionTree = defaultLandscape().unselectionTreeFor(moduleSlug('unknown'));

      expect(unselectionTree.elements).toEqual([]);
    });

    it('should get empty unselection tree for not selected module', () => {
      const unselectionTree = defaultLandscape().unselectionTreeFor(moduleSlug('init'));

      expect(unselectionTree.elements).toEqual([]);
    });

    it('should get unselection tree for single selected module', () => {
      const unselectionTree = defaultLandscape().toggle(moduleSlug('init')).unselectionTreeFor(moduleSlug('init'));

      expect(unselectionTree.elements).toEqual([moduleSlug('init')]);
    });

    it('should get unselection of other selected module in feature', () => {
      const unselectionTree = defaultLandscape()
        .toggle(moduleSlug('maven'))
        .toggle(moduleSlug('jpa'))
        .unselectionTreeFor(moduleSlug('gradle'));

      expect(unselectionTree.elements).toEqual([moduleSlug('maven')]);
    });

    it('should get unselection tree of module not in a feature', () => {
      const unselectionTree = defaultLandscape()
        .toggle(moduleSlug('maven'))
        .toggle(moduleSlug('spring-boot'))
        .unselectionTreeFor(moduleSlug('init'));

      expect(unselectionTree.elements).toEqual([
        moduleSlug('init'),
        moduleSlug('maven'),
        featureSlug('java-build-tools'),
        moduleSlug('spring-boot'),
      ]);
    });

    it('should get unselection tree of selected module in feature', () => {
      const unselectionTree = defaultLandscape()
        .toggle(moduleSlug('maven'))
        .toggle(moduleSlug('postgresql'))
        .unselectionTreeFor(moduleSlug('maven'));

      expect(unselectionTree.elements).toEqual([
        moduleSlug('maven'),
        featureSlug('java-build-tools'),
        moduleSlug('spring-boot'),
        moduleSlug('postgresql'),
        featureSlug('jpa'),
      ]);
    });
  });

  describe('Selectable', () => {
    it('should not be selectable for unknown module', () => {
      expect(defaultLandscape().isSelectable(moduleSlug('unknown'))).toBe(false);
    });

    it('should be selectable for selectable module', () => {
      expect(defaultLandscape().isSelectable(moduleSlug('init'))).toBe(true);
    });

    it('should not be selectable for not selectable module', () => {
      expect(defaultLandscape().isSelectable(moduleSlug('java-base'))).toBe(false);
    });
  });

  describe('Selected module properties', () => {
    it('should not have any selected properties without selected module', () => {
      expect(defaultLandscape().selectedModulesProperties()).toEqual([]);
    });

    it('should get selected module properties', () => {
      const properties = defaultLandscape()
        .toggle(moduleSlug('init'))
        .toggle(moduleSlug('infinitest'))
        .toggle(moduleSlug('maven'))
        .selectedModulesProperties();

      expect(properties).toEqual([applicationBaseNamePropertyDefinition(), optionalBooleanPropertyDefinition()]);
    });
  });

  describe('Has module different rank', () => {
    it('should return false for unknown module', () => {
      const landscape = defaultLandscape();

      expect(landscape.hasModuleDifferentRank(moduleSlug('unknown'), 'RANK_S')).toBe(false);
    });

    it('should return false when module has same rank', () => {
      const landscape = defaultLandscape();

      expect(landscape.hasModuleDifferentRank(moduleSlug('init'), 'RANK_S')).toBe(false);
    });

    it('should return true when module has different rank', () => {
      const landscape = defaultLandscape();

      expect(landscape.hasModuleDifferentRank(moduleSlug('react'), 'RANK_S')).toBe(true);
    });
  });

  describe('Filter by rank', () => {
    it('should return same landscape when no rank filter is applied', () => {
      const landscape = defaultLandscape();

      const filteredLandscape = landscape.filterByRank(Optional.empty());

      expect(filteredLandscape).toEqual(landscape);
    });

    it('should filter modules by rank', () => {
      const landscape = defaultLandscape();

      const filteredLandscape = landscape.filterByRank(Optional.of('RANK_S'));

      const levels = filteredLandscape.standaloneLevels();
      expect(levels).toHaveLength(3);
      const rootModules = levels[0].elements.flatMap(element => element.allModules());
      expect(rootModules).toHaveLength(2);
      expect(rootModules).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            information: expect.objectContaining({
              slug: moduleSlug('infinitest'),
              rank: 'RANK_S',
            }),
          }),
          expect.objectContaining({
            information: expect.objectContaining({
              slug: moduleSlug('init'),
              rank: 'RANK_S',
            }),
          }),
        ]),
      );
      const clientFeatureModules = levels[1].elements[0].allModules();
      expect(clientFeatureModules).toHaveLength(1);
      expect(clientFeatureModules[0]).toEqual(
        expect.objectContaining({
          information: expect.objectContaining({
            slug: moduleSlug('vue'),
            rank: 'RANK_S',
          }),
        }),
      );
    });

    it('should filter modules in feature keeping only modules with specified rank', () => {
      const landscape = defaultLandscape();

      const filteredLandscape = landscape.filterByRank(Optional.of('RANK_S'));

      const clientFeature = filteredLandscape
        .standaloneLevels()[1]
        .elements.find(element => element instanceof LandscapeFeature && element.slugString() === 'client');
      expect(clientFeature).toBeDefined();
      expect(clientFeature?.allModules()).toEqual([
        expect.objectContaining({
          information: expect.objectContaining({
            slug: moduleSlug('vue'),
            rank: 'RANK_S',
          }),
        }),
      ]);
    });

    it('should keep dependency modules with different ranks than the rank filter applied', () => {
      const landscape = defaultLandscape();

      const filteredLandscape = landscape.filterByRank(Optional.of('RANK_D'));

      const levels = filteredLandscape.standaloneLevels();
      const initModule = levels[0].elements[0].allModules()[0];
      expect(initModule).toEqual(
        expect.objectContaining({
          information: expect.objectContaining({
            slug: moduleSlug('init'),
            rank: 'RANK_S',
          }),
        }),
      );
      const reactModule = levels[1].elements[0].allModules()[0];
      expect(reactModule).toEqual(
        expect.objectContaining({
          information: expect.objectContaining({
            slug: moduleSlug('react'),
            rank: 'RANK_D',
          }),
        }),
      );
    });

    it('should keep features with different ranks modules than the rank filter applied', () => {
      const landscape = defaultLandscape();

      const filteredLandscape = landscape.filterByRank(Optional.of('RANK_D'));

      const levels = filteredLandscape.standaloneLevels();
      const ciFeature = levels[2].elements[2];
      expect(ciFeature).toEqual(
        expect.objectContaining({
          featureSlug: featureSlug('ci'),
        }),
      );
    });
  });
});

const selectableModule = (slug: string): LandscapeSelectionElement => ({ slug: moduleSlug(slug), selectable: true });
const notSelectableModule = (slug: string): LandscapeSelectionElement => ({ slug: moduleSlug(slug), selectable: false });

const selectableFeature = (slug: string): LandscapeSelectionElement => ({ slug: featureSlug(slug), selectable: true });
const notSelectableFeature = (slug: string): LandscapeSelectionElement => ({ slug: featureSlug(slug), selectable: false });
