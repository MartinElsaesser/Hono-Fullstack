import { authClient } from "../clients/auth.js";
import { useInput } from "../hooks/useInput.js";
import { Snackbar, useSnackbar } from "../hooks/useSnackbar.js";

export default function SignUp() {
	const { showSnackbar, snackbarState } = useSnackbar();
	const emailInput = useInput("test@gmail.com");
	const passwordInput = useInput("mysecretpassword");

	const { data } = authClient.useSession();
	console.log(data);

	async function handleLogin() {
		await authClient.signIn.email(
			{
				email: emailInput.value,
				password: passwordInput.value,
			},
			{
				onRequest: _ctx => {
					//show loading
				},
				onSuccess: async _ctx => {
					//redirect to the dashboard or sign in page
					await showSnackbar({
						position: "top",
						children: "Login successful!",
						duration: 3000,
						style: "primary",
					});
					location.href = "/";
				},
				onError: ctx => {
					// display the error message
					void showSnackbar({
						position: "top",
						children: ctx.error.message,
						duration: 3000,
						style: "error",
					});
				},
			}
		);
	}

	return (
		<main className="responsive">
			<Snackbar {...snackbarState}></Snackbar>
			<h1 className="center-align">Login</h1>
			<fieldset>
				<legend>Fill all fields</legend>
				<div className="field border label">
					<input type="email" {...emailInput} />
					<label>email</label>
				</div>
				<div className="field border label">
					<input type="password" {...passwordInput} />
					<label>password</label>
				</div>
				<button className="responsive no-round no-margin" onClick={handleLogin}>
					Login
				</button>
			</fieldset>
		</main>
	);
}
