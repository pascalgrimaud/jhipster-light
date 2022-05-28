package tech.jhipster.lite.generator.module.domain.replacement;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import tech.jhipster.lite.error.domain.Assert;
import tech.jhipster.lite.generator.module.domain.JHipsterModule.JHipsterModuleBuilder;
import tech.jhipster.lite.generator.module.domain.JHipsterProjectFolder;

public class JHipsterModuleReplacements {

  private final List<FileReplacer> replacements;

  private JHipsterModuleReplacements(JHipsterModuleReplacementsBuilder builder) {
    replacements = buildReplacements(builder);
  }

  private List<FileReplacer> buildReplacements(JHipsterModuleReplacementsBuilder builder) {
    return builder.files.stream().map(JHipsterModuleFileReplacementsBuilder::build).flatMap(Collection::stream).toList();
  }

  public static JHipsterModuleReplacementsBuilder builder(JHipsterModuleBuilder module) {
    return new JHipsterModuleReplacementsBuilder(module);
  }

  public void apply(JHipsterProjectFolder folder) {
    Assert.notNull("folder", folder);

    replacements.forEach(replacement -> replacement.apply(folder));
  }

  public static class JHipsterModuleReplacementsBuilder {

    private final JHipsterModuleBuilder module;
    private final Collection<JHipsterModuleFileReplacementsBuilder> files = new ArrayList<>();

    private JHipsterModuleReplacementsBuilder(JHipsterModuleBuilder module) {
      Assert.notNull("module", module);

      this.module = module;
    }

    public JHipsterModuleFileReplacementsBuilder in(String file) {
      JHipsterModuleFileReplacementsBuilder fileReplacements = new JHipsterModuleFileReplacementsBuilder(this, file);

      files.add(fileReplacements);

      return fileReplacements;
    }

    public JHipsterModuleBuilder and() {
      return module;
    }

    public JHipsterModuleReplacements build() {
      return new JHipsterModuleReplacements(this);
    }
  }

  public static class JHipsterModuleFileReplacementsBuilder {

    private final JHipsterModuleReplacementsBuilder replacements;
    private final String file;
    private final Collection<Replacement> fileReplacements = new ArrayList<>();

    private JHipsterModuleFileReplacementsBuilder(JHipsterModuleReplacementsBuilder replacements, String file) {
      Assert.notBlank("file", file);

      this.replacements = replacements;
      this.file = file;
    }

    public JHipsterModuleFileReplacementsBuilder text(String currentValue, String updatedValue) {
      fileReplacements.add(new Replacement(currentValue, updatedValue));

      return this;
    }

    public JHipsterModuleReplacementsBuilder and() {
      return replacements;
    }

    private Collection<FileReplacer> build() {
      return fileReplacements.stream().map(replace -> new FileReplacer(file, replace)).toList();
    }
  }

  private static record FileReplacer(String file, Replacement replacement) {
    public FileReplacer {
      Assert.notNull("file", file);
      Assert.notNull("replacement", replacement);
    }

    private void apply(JHipsterProjectFolder folder) {
      Path filePath = folder.filePath(file());

      try {
        String content = Files.readString(filePath);
        String updatedContent = replacement().apply(filePath, content);

        Files.writeString(filePath, updatedContent, StandardOpenOption.TRUNCATE_EXISTING);
      } catch (IOException e) {
        throw new ReplacementErrorException(filePath, e);
      }
    }
  }

  private static record Replacement(String currentValue, String updatedValue) {
    public Replacement {
      Assert.notBlank("currentValue", currentValue);
      Assert.notNull("updatedValue", updatedValue);
    }

    public String apply(Path file, String content) {
      if (!content.contains(currentValue)) {
        throw new UnknownCurrentValueException(file, content);
      }

      return content.replace(currentValue(), updatedValue());
    }
  }
}
