export const environment = {
    production: false,
    // BASE_API_PATH: 'https://localhost:5001/api',
    BASE_API_PATH: 'https://ilearn-api.azurewebsites.net/api',
    REFRESH_TOKEN_X_SECONDS_BEFORE_EXPIRY: 30, //refresh the access token using "refresh token" X seconds before it expires
    CHECK_TOKEN_REFRESH_AFTER_X_SECONDS: 30, //check if we need to refresh the access token after every 30 seconds
    SDK_KEY: '5jYNmws5QripxdjZibbzuQ',
    LEAVE_MEETING_URL: 'http://localhost:4200/meeting',
    SDK_SECRET_KEY: 'Dy57tZrdVAryZVLT9DdgZGhwSXX6NnR4'
  };