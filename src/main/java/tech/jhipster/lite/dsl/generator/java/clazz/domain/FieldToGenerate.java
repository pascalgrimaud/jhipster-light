package tech.jhipster.lite.dsl.generator.java.clazz.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import javax.lang.model.element.Modifier;
import tech.jhipster.lite.dsl.common.domain.clazz.field.FieldComment;
import tech.jhipster.lite.dsl.common.domain.clazz.field.FieldName;
import tech.jhipster.lite.dsl.generator.java.clazz.domain.annotation.Annotation;
import tech.jhipster.lite.dsl.generator.java.clazz.domain.assertion.CodeAssertion;
import tech.jhipster.lite.dsl.generator.java.clazz.domain.field.FieldType;
import tech.jhipster.lite.dsl.parser.domain.clazz.field.ClassField;
import tech.jhipster.lite.error.domain.Assert;

public class FieldToGenerate {

  public static FieldToGenerateBuilder builder() {
    return new FieldToGenerateBuilder();
  }

  private FieldToGenerate() {}

  private FieldName name;
  private List<Modifier> modifiers;
  private FieldComment comment;
  private FieldType type;
  private List<Annotation> annotations;
  private CodeAssertion assertion;

  public FieldName getName() {
    return name;
  }

  public List<Modifier> getModifiers() {
    return modifiers;
  }

  public Optional<FieldComment> getComment() {
    return Optional.ofNullable(comment);
  }

  public FieldType getType() {
    return type;
  }

  public List<Annotation> getAnnotations() {
    return Collections.unmodifiableList(annotations);
  }

  public Optional<CodeAssertion> getAssertion() {
    return Optional.ofNullable(assertion);
  }

  public String getterName() {
    if ("boolean".equalsIgnoreCase(type.name())) {
      return "is" + capitalizeName();
    }
    return "get" + capitalizeName();
  }

  public String setterName() {
    return "set" + capitalizeName();
  }

  private String capitalizeName() {
    return name.get().substring(0, 1).toUpperCase() + name.get().substring(1);
  }

  public static final class FieldToGenerateBuilder {

    private FieldName name;
    private FieldType type;
    private final List<Modifier> modifiers = new ArrayList<>();
    private FieldComment comment;
    private final List<Annotation> annotations = new ArrayList<>();
    private CodeAssertion assertion;

    private FieldToGenerateBuilder() {}

    public FieldToGenerateBuilder fromClassField(ClassField classField) {
      Assert.notNull("classField", classField);
      this.name = classField.getName();
      this.comment = classField.getComment().orElse(null);

      return this;
    }

    public FieldToGenerateBuilder assertion(CodeAssertion assertion) {
      Assert.notNull("assertion", assertion);
      this.assertion = assertion;
      return this;
    }

    public FieldToGenerateBuilder name(FieldName name) {
      Assert.notNull("key", name);
      this.name = name;
      return this;
    }

    public FieldToGenerateBuilder addModifiers(Modifier modifiers) {
      Assert.notNull("modifiers", modifiers);
      this.modifiers.add(modifiers);
      return this;
    }

    public FieldToGenerateBuilder comment(FieldComment comment) {
      Assert.notNull("comment", comment);
      this.comment = comment;
      return this;
    }

    public FieldToGenerateBuilder type(FieldType type) {
      Assert.notNull("type", type);
      this.type = type;
      return this;
    }

    public FieldToGenerateBuilder addAnnotation(Annotation annotation) {
      Assert.notNull("annotation", annotation);
      this.annotations.add(annotation);

      return this;
    }

    public FieldToGenerate build() {
      Assert.notNull("key", name);
      Assert.notNull("type", type);
      FieldToGenerate fieldToGenerate = new FieldToGenerate();

      fieldToGenerate.name = this.name;
      fieldToGenerate.annotations = this.annotations;
      fieldToGenerate.comment = this.comment;
      fieldToGenerate.type = this.type;
      fieldToGenerate.assertion = this.assertion;
      if (this.modifiers.isEmpty()) {
        this.modifiers.add(Modifier.PRIVATE);
      }
      fieldToGenerate.modifiers = this.modifiers;
      return fieldToGenerate;
    }
  }
}
