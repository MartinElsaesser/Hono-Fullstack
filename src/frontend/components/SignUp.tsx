import { authClient } from "../clients/auth.js";
import { useInput } from "../hooks/useInput.js";
import { Snackbar, useSnackbar } from "../hooks/useSnackbar.js";
export default function SignUp() {
	const { showSnackbar, snackbarState } = useSnackbar();
	const emailInput = useInput("test@gmail.com");
	const nameInput = useInput("Michael");
	const passwordInput = useInput("mysecretpassword");

	const { data } = authClient.useSession();
	console.log(data);

	async function handleSignUp() {
		await authClient.signUp.email(
			{
				email: emailInput.value,
				password: passwordInput.value,
				name: nameInput.value,
			},
			{
				onRequest: _ctx => {
					//show loading
				},
				onSuccess: async _ctx => {
					//redirect to the dashboard or sign in page
					await showSnackbar({
						position: "top",
						children: "Sign up successful!",
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
			<h1 className="center-align">Sign up</h1>
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
				<div className="field border label">
					<input type="text" {...nameInput} />
					<label>name</label>
				</div>
				<button className="responsive no-round no-margin" onClick={handleSignUp}>
					Sign up
				</button>
			</fieldset>
		</main>
	);
}
