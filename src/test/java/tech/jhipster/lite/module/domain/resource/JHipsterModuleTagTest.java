package tech.jhipster.lite.module.domain.resource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.apache.commons.lang3.RandomStringUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import tech.jhipster.lite.UnitTest;
import tech.jhipster.lite.shared.error.domain.MissingMandatoryValueException;
import tech.jhipster.lite.shared.error.domain.StringTooLongException;

@UnitTest
class JHipsterModuleTagTest {

  @Test
  void shouldNotBuildWithoutTag() {
    assertThatThrownBy(() -> new JHipsterModuleTag(null)).isInstanceOf(MissingMandatoryValueException.class);
  }

  @Test
  void shouldNotBuildWithWhitespace() {
    assertThatThrownBy(() -> new JHipsterModuleTag("my tag")).isInstanceOf(InvalidJHipsterModuleTagException.class);
  }

  @Test
  void shouldNotBuildWithTooLongTag() {
    var stringTooLong = RandomStringUtils.secure().nextNumeric(16);
    assertThatThrownBy(() -> new JHipsterModuleTag(stringTooLong)).isInstanceOf(StringTooLongException.class);
  }

  @ParameterizedTest
  @ValueSource(strings = { "MyTag", "my_tag", "myTag123" })
  void shouldNotBuildInvalidTag(String tag) {
    assertThatThrownBy(() -> new JHipsterModuleTag(tag)).isExactlyInstanceOf(InvalidJHipsterModuleTagException.class);
  }

  @Test
  void shouldGetTagValue() {
    assertThat(new JHipsterModuleTag("mytag").get()).isEqualTo("mytag");
  }
}
