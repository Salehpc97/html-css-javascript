<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

### `assets/css` Directory — File Roles and System Integration

This section provides a precise, context-driven description of each CSS file within the `assets/css` directory, focusing on its specific function, interaction with the system, and exact project location.

#### 1. `Forget.css`

- **Function:**
Styles the "Forget Password" page, ensuring a clean, modern, and RTL-friendly (right-to-left) user interface for password recovery workflows.
- **System Interaction:**
    - Applied exclusively to the password reset view, affecting layout, form elements, and visual feedback.
    - Ensures accessibility and visual consistency for users in RTL languages.
    - Integrates with the corresponding HTML (`Forget.html`) in the `public` directory.
- **File Location:**

```
public/assets/css/Forget.css
```

- **Source Code:**

```css
body {
    background-color: #f8f9fa;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    direction: rtl;
    text-align: right;
}
.container {
    background-color: #ffffff;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
    box-sizing: border-box;
}
.logo {
    text-align: center;
    font-size: 28px;
    font-weight: bold;
    color: #007bff;
    margin-bottom: 30px;
}
.main-title {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
    font-size: 28px;
}
.instruction-text {
    text-align: center;
    margin-bottom: 25px;
    color: #666;
    font-size: 15px;
}
.form-group {
    margin-bottom: 20px;
}
.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #555;
}
.form-group input[type="email"] {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    box-sizing: border-box;
}
.form-group input[type="email"]:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
.submit-btn {
    width: 100%;
    padding: 15px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}
.submit-btn:hover {
    background-color: #218838;
}
.back-to-login {
    text-align: center;
    margin-top: 25px;
    font-size: 15px;
}
.back-to-login a {
    color: #007bff;
    text-decoration: none;
    font-weight: 600;
}
.back-to-login a:hover {
    text-decoration: underline;
}
```


#### 2. `Login.css`

- **Function:**
Provides all visual styling for the login page, including form layout, input fields, buttons, and RTL support.
- **System Interaction:**
    - Directly linked to the login view (`Login.html`), ensuring a consistent and accessible authentication interface.
    - Handles visual feedback for user actions (focus, hover, etc.).
    - Supports RTL languages for seamless localization.
- **File Location:**

```
public/assets/css/Login.css
```

- **Source Code:**

```css
body {
    background-color: #f8f9fa;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    direction: rtl;
    text-align: right;
}
.container {
    background-color: #ffffff;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
    box-sizing: border-box;
}
.logo {
    text-align: center;
    font-size: 28px;
    font-weight: bold;
    color: #007bff;
    margin-bottom: 30px;
}
.main-title {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
    font-size: 28px;
}
.form-group {
    margin-bottom: 20px;
}
.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #555;
}
.form-group input[type="email"],
.form-group input[type="password"] {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    box-sizing: border-box;
}
.form-group input[type="email"]:focus,
.form-group input[type="password"]:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
.options-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    font-size: 14px;
}
.remember-me {
    display: flex;
    align-items: center;
}
.remember-me input[type="checkbox"] {
    margin-left: 8px;
    vertical-align: middle;
}
.remember-me label {
    color: #555;
    vertical-align: middle;
}
.forgot-password {
    color: #007bff;
    text-decoration: none;
}
.forgot-password:hover {
    text-decoration: underline;
}
.login-btn {
    width: 100%;
    padding: 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}
.login-btn:hover {
    background-color: #0056b3;
}
.register-links {
    text-align: center;
    margin-top: 25px;
    font-size: 15px;
    color: #555;
}
.register-links a {
    color: #007bff;
    text-decoration: none;
    font-weight: 600;
}
.register-links a:hover {
    text-decoration: underline;
}
```


#### 3. `Register.css`

- **Function:**
Defines the visual style for the registration page, focusing on form layout, input styling, and RTL compatibility.
- **System Interaction:**
    - Used by the registration view (`Register.html`) to ensure a user-friendly and accessible sign-up process.
    - Maintains design consistency with login and password reset pages.
    - Supports RTL languages for localization.
- **File Location:**

```
public/assets/css/Register.css
```

- **Source Code:**

```css
body {
    background-color: #f8f9fa;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    direction: rtl;
    text-align: right;
}
.container {
    background-color: #ffffff;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
    box-sizing: border-box;
}
.logo {
    text-align: center;
    font-size: 28px;
    font-weight: bold;
    color: #007bff;
    margin-bottom: 30px;
}
.main-title {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
    font-size: 28px;
}
.form-group {
    margin-bottom: 20px;
}
.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #555;
}
.form-group input[type="email"],
.form-group input[type="password"] {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    box-sizing: border-box;
}
.form-group input[type="email"]:focus,
.form-group input[type="password"]:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
.options-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    font-size: 14px;
}
.remember-me {
    display: flex;
    align-items: center;
}
.remember-me input[type="checkbox"] {
    margin-left: 8px;
    vertical-align: middle;
}
.remember-me label {
    color: #555;
    vertical-align: middle;
}
.forgot-password {
    color: #007bff;
    text-decoration: none;
}
.forgot-password:hover {
    text-decoration: underline;
}
.login-btn {
    width: 100%;
    padding: 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}
.login-btn:hover {
    background-color: #0056b3;
}
.register-links {
    text-align: center;
    margin-top: 25px;
    font-size: 15px;
    color: #555;
}
.register-links a {
    color: #007bff;
    text-decoration: none;
    font-weight: 600;
}
.register-links a:hover {
    text-decoration: underline;
}
```


#### 4. `style.css`

- **Function:**
Provides global and component-level styles for the main application interface, including layout, typography, and interactive elements (e.g., notes list, buttons).
- **System Interaction:**
    - Used across the main application views to ensure a cohesive and modern look.
    - Styles dynamic components such as forms and lists, supporting responsive and accessible design.
    - Not specific to authentication; instead, it covers general UI elements.
- **File Location:**

```
public/assets/css/style.css
```

- **Source Code:**

```css
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f4f7f6;
    color: #333;
    margin: 0;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
}
.container {
    background-color: #ffffff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 600px;
    box-sizing: border-box;
}
h1 {
    color: #2c3e50;
    text-align: center;
    margin-bottom: 30px;
}
#note-form {
    display: flex;
    margin-bottom: 20px;
}
#note-input {
    flex-grow: 1;
    padding: 12px 15px;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    margin-right: 10px;
    transition: border-color 0.3s ease;
}
#note-input:focus {
    border-color: #007bff;
    outline: none;
}
button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease, transform 0.2s ease;
}
button:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
}
button:active {
    transform: translateY(0);
}
#notes-list {
    list-style: none;
    padding: 0;
}
#notes-list li {
    background-color: #e9ecef;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 17px;
    color: #555;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}
#notes-list li .note-text {
    flex-grow: 1;
    margin-right: 10px;
}
#notes-list li .delete-btn {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s ease;
}
#notes-list li .delete-btn:hover {
    background-color: #c82333;
}
```


### Summary Table

| File Path | Main Functionality | System Role / Integration |
| :-- | :-- | :-- |
| public/assets/css/Forget.css | Styles password reset page | Password recovery UI, RTL support |
| public/assets/css/Login.css | Styles login page | Authentication UI, RTL support |
| public/assets/css/Register.css | Styles registration page | Registration UI, RTL support |
| public/assets/css/style.css | General/global styles for main app | Main UI, notes, forms, and components |

