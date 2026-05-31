Feature: Create User
  Product behavior for creating user accounts.

  @USR-001
  Scenario: Create user requires authorization.
    Given a request without authorization token
    When create user is submitted
    Then unauthorized response is returned

  @USR-002
  Scenario: Create user requires unique email.
    Given an existing user already uses the requested email
    When create user is submitted
    Then conflict response is returned

  @USR-003
  Scenario: Successful create user returns created user identifier.
    Given an authorized request with valid unique user data
    When create user is submitted
    Then response includes created user identifier
