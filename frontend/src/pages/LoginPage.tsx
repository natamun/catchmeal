function LoginPage() {
  function handleFortyTwoLogin() {
    // Redirect the browser to the backend OAuth route
    // Passport takes over from there and redirects to 42
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/42`;
  }

  return (
    <main>
      <h1>Sign in to KcalApp</h1>
      <p>Choose how you want to sign in.</p>

      <button onClick={handleFortyTwoLogin}>Login with 42</button>
    </main>
  );
}

export default LoginPage;
