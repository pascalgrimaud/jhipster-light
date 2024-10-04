Feature: Svelte

  Scenario: Should apply Svelte core module
    When I apply modules to default project
      | init        |
      | prettier    |
      | svelte-core |
    Then I should have files in ""
      | jsconfig.json    |
      | vitest-setup.js  |
      | vite.config.js   |
      | svelte.config.js |
      | eslint.config.js |
