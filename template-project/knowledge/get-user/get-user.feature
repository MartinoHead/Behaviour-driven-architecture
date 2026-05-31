Feature: Get User
  Product behavior for fetching user details.

  @USG-001
  Scenario: Get user requires authorization.
    Given a request without authorization token
    When get user is submitted
    Then unauthorized response is returned

  @USG-002
  Scenario: Get user requires existing user identifier.
    Given an authorized request with unknown user identifier
    When get user is submitted
    Then not found response is returned

  @USG-003
  Scenario: Successful get user returns user details payload.
    Given an authorized request with existing user identifier
    When get user is submitted
    Then response includes user details payload
