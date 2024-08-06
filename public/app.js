// Get the login and register form elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Add event listeners for form submissions
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (validateLoginForm()) {
    await handleLogin();
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (validateRegisterForm()) {
    await handleRegister();
  }
});

// Function to handle login
async function handleLogin() {
  const loadingIndicator = showLoadingIndicator();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/login', { // Updated endpoint to match server route
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessMessage(data.message);
      setTimeout(() => {
        window.location.href = '/'; // Redirect to the main page or another page upon successful login
      }, 2000); // 2 seconds delay
    } else {
      showErrorMessage(`Login failed: ${data.message}`);
    }
  } catch (error) {
    console.error('Error:', error);
    showErrorMessage('An error occurred. Please try again later.');
  } finally {
    hideLoadingIndicator(loadingIndicator);
  }
}

// Function to handle registration
async function handleRegister() {
  const loadingIndicator = showLoadingIndicator();
  const username = document.getElementById('newUsername').value;
  const password = document.getElementById('newPassword').value;
  const email = document.getElementById('email').value; // Added email field for registration

  try {
    const response = await fetch('/register', { // Updated endpoint to match server route
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, email })
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessMessage(data.message);
    } else {
      showErrorMessage(`Registration failed: ${data.message}`);
    }
  } catch (error) {
    console.error('Error:', error);
    showErrorMessage('An error occurred. Please try again later.');
  } finally {
    hideLoadingIndicator(loadingIndicator);
  }
}

// Function to display a success message
function showSuccessMessage(message) {
  const successMessage = document.createElement('div');
  successMessage.classList.add('success-message');
  successMessage.textContent = message;
  document.body.appendChild(successMessage);
  setTimeout(() => {
    successMessage.remove();
  }, 3000);
}

// Function to display an error message
function showErrorMessage(message) {
  const errorMessage = document.createElement('div');
  errorMessage.classList.add('error-message');
  errorMessage.textContent = message;
  document.body.appendChild(errorMessage);
  setTimeout(() => {
    errorMessage.remove();
  }, 3000);
}

// Add dynamic styles for success and error messages
const styles = `
  .success-message, .error-message {
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #fff;
    border-radius: 4px;
    padding: 10px 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    animation: fadeIn 0.3s ease-in-out;
  }

  .success-message {
    color: #4CAF50;
  }

  .error-message {
    color: #F44336;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// Create a style element and add the styles
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

// Function to show a loading indicator
function showLoadingIndicator() {
  const loadingIndicator = document.createElement('div');
  loadingIndicator.classList.add('loading-indicator');
  loadingIndicator.textContent = 'Loading...';
  document.body.appendChild(loadingIndicator);
  return loadingIndicator;
}

// Function to hide the loading indicator
function hideLoadingIndicator(loadingIndicator) {
  loadingIndicator.remove();
}

// Function to validate login form
function validateLoginForm() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showErrorMessage('Please enter both username and password.');
    return false;
  }
  return true;
}

// Function to validate registration form
function validateRegisterForm() {
  const username = document.getElementById('newUsername').value;
  const password = document.getElementById('newPassword').value;
  const email = document.getElementById('email').value;

  if (!username || !password || !email) {
    showErrorMessage('Please fill in all fields.');
    return false;
  }
  return true;
}
<script>
  // Function to update the pie chart
  function updateChart(expenses) {
    const ctx = document.getElementById('expensesChart').getContext('2d');
    const labels = expenses.map(expense => expense.category);
    const data = expenses.map(expense => expense.amount);

    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Expenses by Category',
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (context.parsed !== null) {
                  label += ': ' + context.parsed + ' units';
                }
                return label;
              }
            }
          }
        }
      }
    });
  }

  // Example function to fetch data and update chart
  async function fetchExpenses() {
    try {
      const response = await fetch(`/expenses/${userId}`);
      const expenses = await response.json();
      updateChart(expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  }

  // Fetch expenses when the page loads
  fetchExpenses();
</script>
