Feature: Vue JWT

  Scenario: Should apply vue jwt module to vue
    When I apply modules to default project
      | init     |
      | vue-core |
      | vue-jwt  |
    Then I should have files in "src/main/webapp/app/login/secondary"
      | LocalStorageAuth.ts |
      | RestAuth.ts |
