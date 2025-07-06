document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.querySelector('.register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const usernameInput = document.getElementById('username');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirm-password');

            const username = usernameInput.value.trim();
            const email = emailInput.value.trim(); // We'll use this as username for backend
            const password = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();

            // Client-side validation
            if (!username || !email || !password || !confirmPassword) {
                alert('Please fill in all fields.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:8000/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: email, password: password }) // Using email as username for backend
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(`Registration successful! Welcome, ${data.username}. You can now log in.`);
                    window.location.href = 'Login.html'; // Redirect to login page
                } else {
                    const errorData = await response.json();
                    alert(`Registration failed: ${errorData.detail || response.statusText}`);
                }
            } catch (error) {
                console.error('Error during registration:', error);
                alert('An error occurred during registration. Please try again later.');
            }
        });
    }
});
