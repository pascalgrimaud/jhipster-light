package tech.jhipster.lite.module.infrastructure.secondary;

import static java.util.stream.Collectors.joining;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;
import tech.jhipster.lite.module.domain.javaproperties.PropertyKey;
import tech.jhipster.lite.module.domain.javaproperties.PropertyValue;
import tech.jhipster.lite.shared.error.domain.Assert;
import tech.jhipster.lite.shared.error.domain.GeneratorException;
import tech.jhipster.lite.shared.generation.domain.ExcludeFromGeneratedCodeCoverage;

public class PropertiesFileSpringFactoriesHandler {

  private static final String COLLECTION_SEPARATOR = ",";

  private final Path file;
  private final Properties properties;

  public PropertiesFileSpringFactoriesHandler(Path file) {
    Assert.notNull("file", file);
    this.file = file;
    this.properties = new Properties();
    createPropertiesIfNotExists(file);
    loadPropertiesFromFile(file);
  }

  @ExcludeFromGeneratedCodeCoverage(reason = "Hard to cover IOException")
  private void loadPropertiesFromFile(Path file) {
    try (InputStream inputStream = Files.newInputStream(file)) {
      properties.load(inputStream);
    } catch (IOException e) {
      throw GeneratorException.technicalError("Error loading Spring Factories properties: " + e.getMessage(), e);
    }
  }

  @ExcludeFromGeneratedCodeCoverage(reason = "Hard to cover IOException")
  private static void createPropertiesIfNotExists(Path file) {
    try {
      if (Files.notExists(file)) {
        Files.createDirectories(file.getParent());
        Files.createFile(file);
      }
    } catch (IOException e) {
      throw GeneratorException.technicalError("Error creating Spring Factories properties file: " + e.getMessage(), e);
    }
  }

  public void append(PropertyKey key, PropertyValue value) {
    Assert.notNull("key", key);
    Assert.notNull("value", value);
    addToProperties(key, value);
    saveToFile();
  }

  @ExcludeFromGeneratedCodeCoverage(reason = "Hard to cover IOException")
  private void saveToFile() {
    try (OutputStream outputStream = Files.newOutputStream(file)) {
      properties.store(outputStream, null);
    } catch (IOException e) {
      throw GeneratorException.technicalError("Error writing Spring Factories properties: " + e.getMessage(), e);
    }
  }

  private void addToProperties(PropertyKey key, PropertyValue value) {
    if (properties.containsKey(key.get())) {
      properties.setProperty(
        key.get(),
        joinedPropertyValues(PropertyValue.merge(PropertyValue.of(new String[] { properties.getProperty(key.get()) }), value))
      );
    } else {
      properties.setProperty(key.get(), joinedPropertyValues(value));
    }
  }

  private static String joinedPropertyValues(PropertyValue value) {
    return value.get().stream().map(Object::toString).collect(joining(COLLECTION_SEPARATOR));
  }
}
