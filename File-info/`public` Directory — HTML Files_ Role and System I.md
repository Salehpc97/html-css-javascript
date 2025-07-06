<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

### `public` Directory — HTML Files: Role and System Integration

This section provides a focused, professional description of each HTML file located directly in the `public` directory, detailing its specific function, system interaction, and exact project location.

#### 1. `Forget.html`

- **Function:**
Implements the "Forgot Password" user interface, allowing users to request a password reset by submitting their email address.
- **System Interaction:**
    - Presents a form for users to enter their email for password recovery.
    - Integrates with `assets/css/Forget.css` for RTL-friendly styling.
    - Links back to the login page for user convenience.
    - Expected to interact with backend logic (not shown here) to process password reset requests.
- **File Location:**

```
public/Forget.html
```

- **Key Structure:**
    - Arabic language and RTL layout.
    - Form with email input and submit button.
    - Navigation link to return to the login page.


#### 2. `index.html`

- **Function:**
Serves as the main application interface for the learning journal, enabling users to add, view, and manage learning notes.
- **System Interaction:**
    - Integrates with `assets/css/style.css` for global and component-level styling.
    - Loads `assets/js/script.js` to handle note management, local storage, and quote display.
    - Provides a form for adding new notes and a section for daily inspirational quotes.
    - All note data is managed client-side and persisted in the browser.
- **File Location:**

```
public/index.html
```

- **Key Structure:**
    - English language, LTR layout.
    - Note input form, notes list, and quote section.
    - Script for dynamic note and quote functionality.


#### 3. `Login.html`

- **Function:**
Provides the login interface for users to authenticate with the system.
- **System Interaction:**
    - Integrates with `assets/css/Login.css` for RTL and authentication-specific styling.
    - Loads `assets/js/Login.js` to handle form submission, validation, and API requests to the backend.
    - Includes options for "Remember Me" and a link to the password reset page.
    - Redirects to registration for new users.
- **File Location:**

```
public/Login.html
```

- **Key Structure:**
    - Arabic language and RTL layout.
    - Login form with email and password fields.
    - Links for password recovery and account registration.


#### 4. `Register.html`

- **Function:**
Implements the user registration interface, allowing new users to create an account.
- **System Interaction:**
    - Integrates with `assets/css/Register.css` for RTL and registration-specific styling.
    - Loads `assets/js/Register.js` to handle form validation, submission, and communication with the backend registration endpoint.
    - Provides fields for username, email, password, and password confirmation.
    - Includes navigation back to the login page for existing users.
- **File Location:**

```
public/Register.html
```

- **Key Structure:**
    - Arabic language and RTL layout.
    - Registration form with all required fields.
    - Link to return to the login page.


### Summary Table

| File Path | Main Functionality | System Role / Integration |
| :-- | :-- | :-- |
| public/Forget.html | Password reset UI | User password recovery, links to login |
| public/index.html | Main journal interface | Note management, quote display, main app entry |
| public/Login.html | User login interface | Authentication, links to register/forget pages |
| public/Register.html | User registration interface | Account creation, links to login |

