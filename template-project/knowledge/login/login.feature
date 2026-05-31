Feature: Login
  Product behavior for user authentication.

  @LGN-001
  Scenario: Login requires registered email.
    Given a user email does not exist
    When login is submitted
    Then invalid credentials are returned

  @LGN-002
  Scenario: Login requires correct password for the registered email.
    Given a registered user enters a wrong password
    When login is submitted
    Then invalid credentials are returned

  @LGN-003
  Scenario: Successful login returns an active session token.
    Given a registered user enters valid credentials
    When login is submitted
    Then an active session token is returned
