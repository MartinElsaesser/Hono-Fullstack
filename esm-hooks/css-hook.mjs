// source: https://nodejs.org/api/module.html#hooks
export async function load(url, context, nextLoad) {
	if (url.endsWith(".css")) {
		return { source: "", format: "module", shortCircuit: true };
	}

	return await nextLoad(url, context);
}
