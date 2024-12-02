package tech.jhipster.lite;

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;
import tech.jhipster.lite.module.domain.properties.JHipsterProjectFolder;

public final class TestFileUtils {

  private TestFileUtils() {}

  public static String tmpDirForTest() {
    return Paths.get(tmpDir()).resolve("jhlite-test").resolve(UUID.randomUUID().toString()).toString().replace("\\", "/");
  }

  private static String tmpDir() {
    String tempDir = System.getProperty("java.io.tmpdir");
    String fileSeparator = FileSystems.getDefault().getSeparator();

    if (tempDir.endsWith(fileSeparator)) {
      return tempDir.substring(0, tempDir.length() - fileSeparator.length());
    }

    return tempDir;
  }

  public static String content(Path path) {
    try {
      return Files.readString(path);
    } catch (IOException e) {
      throw new AssertionError(e);
    }
  }

  public static String contentNormalizingNewLines(Path path) {
    return content(path).replace("\r\n", "\n");
  }

  public static List<String> fileLines(Path path) {
    try {
      return Files.readAllLines(path);
    } catch (IOException e) {
      throw new AssertionError(e);
    }
  }

  public static void loadDefaultProperties(Path from, Path to) {
    try {
      Files.createDirectories(to.getParent());

      Files.copy(from, to);
    } catch (IOException e) {
      throw new AssertionError(e.getMessage(), e);
    }
  }

  public static JHipsterProjectFolder projectFrom(String sourceProject) {
    Path targetFolder = Paths.get(tmpDirForTest());

    try {
      Files.createDirectories(targetFolder);
    } catch (IOException e) {
      throw new AssertionError(e);
    }

    try {
      copyFolder(Paths.get(sourceProject), targetFolder);
    } catch (IOException e) {
      throw new AssertionError(e);
    }

    return new JHipsterProjectFolder(targetFolder.toString());
  }

  public static void copyFolder(Path src, Path dest) throws IOException {
    try (Stream<Path> stream = Files.walk(src)) {
      stream.forEach(source -> copy(source, dest.resolve(src.relativize(source))));
    }
  }

  public static void copy(Path source, Path dest) {
    try {
      Files.copy(source, dest, REPLACE_EXISTING);
    } catch (Exception e) {
      throw new AssertionError(e.getMessage(), e) {};
    }
  }
}
