import { ModulePropertyValueType } from '@/module/domain/ModuleProperties';
import { ModulePropertyDefinition } from '@/module/domain/ModulePropertyDefinition';
import { defineComponent, PropType } from 'vue';
import { ModulePropertiesType } from '../ModulePropertiesType';
import { notEmpty } from '../PropertyValue';

export default defineComponent({
  name: 'ModulePropertiesVue',
  props: {
    properties: {
      type: Array as PropType<Array<ModulePropertyDefinition>>,
      required: true,
    },
    moduleSlug: {
      type: String,
      required: true,
    },
    moduleProperties: {
      type: Map<string, ModulePropertyValueType>,
      required: true,
    },
    propertiesType: {
      type: String as PropType<ModulePropertiesType>,
      required: true,
    },
    selected: {
      type: Boolean,
      required: false,
    },
  },
  setup(props) {
    const typeLabel = (): string => {
      if (mandatoryProperties()) {
        return 'Mandatory';
      }

      return 'Optional';
    };

    const propertiesStats = (): string => {
      return `${propertiesWithValueCount()} / ${props.properties.length}`;
    };

    const stateClass = (): string => {
      return selectionClass() + ' ' + validityClass();
    };

    const validityClass = (): string => {
      if (propertiesWithValueCount() === props.properties.length) {
        return 'all-valid-properties';
      }

      if (mandatoryProperties()) {
        return 'invalid-mandatory-property';
      }

      return 'invalid-optional-property';
    };

    const mandatoryProperties = (): boolean => {
      return props.propertiesType === 'MANDATORY';
    };

    const propertiesWithValueCount = (): number => {
      return props.properties.filter(property => notEmpty(props.moduleProperties.get(property.key))).length;
    };

    const selectionClass = (): string => {
      if (props.selected) {
        return 'selected';
      }

      return 'not-selected';
    };

    return {
      typeLabel,
      propertiesStats,
      stateClass,
    };
  },
});
