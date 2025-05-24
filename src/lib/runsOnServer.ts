/**
 * Function to determine if the code is running on the server or client.
 * @returns {boolean} - Returns true if running on the server, false if on the client.
 */
export function runsOnServer(): boolean {
	return typeof window === "undefined";
}
