export const environment = {
    production: true,
    // BASE_API_PATH: 'https://localhost:44303/api',
    BASE_API_PATH: 'https://ilearn-api.azurewebsites.net/api',
    REFRESH_TOKEN_X_SECONDS_BEFORE_EXPIRY: 30, //refresh the access token using "refresh token" X seconds before it expires
    CHECK_TOKEN_REFRESH_AFTER_X_SECONDS: 30 //check if we need to refresh the access token after every 30 seconds
};