# OAuth Setup Guide

This guide will help you set up OAuth authentication for the Thesaurus LLM Fine-Tuning application. The application supports authentication with Google, GitHub, and Facebook.

## Prerequisites

- A Google account for Google OAuth
- A GitHub account for GitHub OAuth
- A Facebook account for Facebook OAuth

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Enter a name for your OAuth client
7. Add the following authorized redirect URIs:
   - `http://localhost:5002/auth/login/google/callback`
   - `https://your-domain.com/auth/login/google/callback` (for production)
8. Click "Create"
9. Note the Client ID and Client Secret
10. Add these credentials to your `.env` file:
    ```
    GOOGLE_CLIENT_ID=your-client-id
    GOOGLE_CLIENT_SECRET=your-client-secret
    ```

## GitHub OAuth Setup

1. Go to your [GitHub Settings](https://github.com/settings/profile)
2. Navigate to "Developer settings" > "OAuth Apps"
3. Click "New OAuth App"
4. Fill in the application details:
   - Application name: "Thesaurus LLM Fine-Tuning"
   - Homepage URL: `http://localhost:5002` (or your production URL)
   - Authorization callback URL: `http://localhost:5002/auth/login/github/callback`
5. Click "Register application"
6. Generate a new client secret
7. Note the Client ID and Client Secret
8. Add these credentials to your `.env` file:
    ```
    GITHUB_CLIENT_ID=your-client-id
    GITHUB_CLIENT_SECRET=your-client-secret
    ```



## Testing OAuth

1. Start the application:
   ```
   PORT=5002 python app.py
   ```
2. Open your browser and navigate to `http://localhost:5002`
3. Click "Sign In" in the navigation bar
4. Select one of the OAuth providers to test the authentication

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**: Ensure that the redirect URIs in your OAuth provider settings exactly match the URIs used in your application.

2. **Missing Scopes**: If you're not getting all the user information you need, check that you've requested the appropriate scopes in the OAuth configuration.

3. **HTTPS Requirements**: Some OAuth providers require HTTPS for production redirect URIs. Make sure your production server uses HTTPS.

4. **Cookies and Sessions**: Ensure that your application's session management is properly configured. OAuth relies on sessions to maintain state during the authentication flow.

### Debug Logging

To enable debug logging for OAuth, add the following to your `.env` file:

```
OAUTHLIB_INSECURE_TRANSPORT=1  # Only for development
OAUTHLIB_RELAX_TOKEN_SCOPE=1
```

This will provide more detailed error messages during the OAuth flow.
