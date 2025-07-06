document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            const username = emailInput.value.trim(); // Using email as username for now
            const password = passwordInput.value.trim();

            // Simple client-side validation
            if (!username || !password) {
                alert('Please enter both email and password.');
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:8000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(`Login successful! Welcome, ${data.username}`);
                    // Redirect to another page or update UI
                    window.location.href = 'index.html'; // Example: Redirect to main journal page
                } else {
                    const errorData = await response.json();
                    alert(`Login failed: ${errorData.detail || response.statusText}`);
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred during login. Please try again later.');
            }
        });
    }
});
