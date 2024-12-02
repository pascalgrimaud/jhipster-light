package tech.jhipster.lite.module.domain.javaproperties;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import tech.jhipster.lite.shared.collection.domain.JHipsterCollections;
import tech.jhipster.lite.shared.error.domain.Assert;
import tech.jhipster.lite.shared.generation.domain.ExcludeFromGeneratedCodeCoverage;

public final class PropertyValue {

  private final Collection<Object> values;

  private PropertyValue(Object[] values) {
    this(List.of(values));
  }

  private PropertyValue(Collection<Object> values) {
    Assert.field("values", values).noNullElement();

    this.values = JHipsterCollections.immutable(values);
  }

  public static PropertyValue of(String[] values) {
    return new PropertyValue(values);
  }

  public static PropertyValue of(Boolean[] values) {
    return new PropertyValue(values);
  }

  public static PropertyValue of(Number[] values) {
    return new PropertyValue(values);
  }

  public Collection<Object> get() {
    return values();
  }

  public static PropertyValue merge(PropertyValue v1, PropertyValue v2) {
    Collection<Object> mergedValues = new LinkedHashSet<>();
    mergedValues.addAll(v1.get());
    mergedValues.addAll(v2.get());

    return new PropertyValue(mergedValues);
  }

  public Collection<Object> values() {
    return values;
  }

  @Override
  @ExcludeFromGeneratedCodeCoverage
  public boolean equals(Object obj) {
    if (obj == this) {
      return true;
    }
    if (obj == null || obj.getClass() != this.getClass()) {
      return false;
    }
    var that = (PropertyValue) obj;
    return Objects.equals(this.values, that.values);
  }

  @Override
  @ExcludeFromGeneratedCodeCoverage
  public int hashCode() {
    return Objects.hash(values);
  }

  @Override
  @ExcludeFromGeneratedCodeCoverage
  public String toString() {
    return "PropertyValue[" + "values=" + values + ']';
  }
}
