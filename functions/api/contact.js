const RESEND_ENDPOINT = "https://api.resend.com/emails";
const TURNSTILE_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const DEFAULT_TO_EMAIL = "sumnersparkman@bowenengsurv.com";
const DEFAULT_FROM_EMAIL = "Bowen Website <forms@inquiry.bowenengsurv.com>";
const MAX_BODY_BYTES = 32_000;

const serviceNames = {
	engineering: "Civil engineering",
	surveying: "Land surveying",
	testing: "Testing or inspection",
	multiple: "Multiple services",
	unsure: "Not sure yet"
};

const jsonResponse = (body, status = 200, extraHeaders = {}) => new Response(JSON.stringify(body), {
	status,
	headers: {
		"Content-Type": "application/json; charset=utf-8",
		"Cache-Control": "no-store",
		...extraHeaders
	}
});

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[character]);

const normalizeField = (formData, name, maximumLength) => {
	const value = formData.get(name);
	if (typeof value !== "string") return "";
	return value.trim().slice(0, maximumLength);
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const verifyTurnstile = async (token, request, secret) => {
	const verificationData = new FormData();
	verificationData.append("secret", secret);
	verificationData.append("response", token);

	const visitorIp = request.headers.get("CF-Connecting-IP");
	if (visitorIp) verificationData.append("remoteip", visitorIp);

	const response = await fetch(TURNSTILE_ENDPOINT, {
		method: "POST",
		body: verificationData
	});

	if (!response.ok) return false;
	const result = await response.json();
	return result.success === true;
};

export async function onRequest(context) {
	const { request, env } = context;

	if (request.method !== "POST") {
		return jsonResponse(
			{ message: "Method not allowed." },
			405,
			{ "Allow": "POST" }
		);
	}

	const requestOrigin = request.headers.get("Origin");
	const expectedOrigin = new URL(request.url).origin;
	if (requestOrigin && requestOrigin !== expectedOrigin) {
		return jsonResponse({ message: "Invalid submission origin." }, 403);
	}

	const contentLength = Number(request.headers.get("Content-Length") || 0);
	if (contentLength > MAX_BODY_BYTES) {
		return jsonResponse({ message: "The submitted inquiry is too large." }, 413);
	}

	if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY) {
		console.error("Contact form is missing required Cloudflare secrets.");
		return jsonResponse({
			message: "The contact form is temporarily unavailable. Please call (573) 339-5900."
		}, 503);
	}

	let formData;
	try {
		formData = await request.formData();
	} catch {
		return jsonResponse({ message: "The submitted form could not be read." }, 400);
	}

	if (normalizeField(formData, "company", 200)) {
		return jsonResponse({ message: "Thank you. Your project inquiry has been sent to our team." });
	}

	const name = normalizeField(formData, "name", 120);
	const email = normalizeField(formData, "email", 254);
	const phone = normalizeField(formData, "phone", 40);
	const service = normalizeField(formData, "service", 30);
	const location = normalizeField(formData, "location", 240);
	const message = normalizeField(formData, "message", 5_000);
	const turnstileToken = normalizeField(formData, "cf-turnstile-response", 2_048);

	if (!name || !email || !phone || !service || !message) {
		return jsonResponse({ message: "Please complete every required field." }, 400);
	}

	if (!isValidEmail(email)) {
		return jsonResponse({ message: "Please enter a valid email address." }, 400);
	}

	if (!serviceNames[service]) {
		return jsonResponse({ message: "Please select a valid service." }, 400);
	}

	if (!turnstileToken) {
		return jsonResponse({ message: "Please complete the verification and try again." }, 400);
	}

	let isHuman = false;
	try {
		isHuman = await verifyTurnstile(turnstileToken, request, env.TURNSTILE_SECRET_KEY);
	} catch (error) {
		console.error("Turnstile verification failed:", error);
	}

	if (!isHuman) {
		return jsonResponse({ message: "Verification failed. Please try again." }, 400);
	}

	const serviceName = serviceNames[service];
	const safeName = name.replace(/[\r\n]+/g, " ");
	const subject = `Website inquiry: ${serviceName} - ${safeName}`;
	const submittedAt = new Date().toLocaleString("en-US", {
		timeZone: "America/Chicago",
		dateStyle: "medium",
		timeStyle: "short"
	});

	const text = [
		"New website project inquiry",
		"",
		`Name: ${name}`,
		`Email: ${email}`,
		`Phone: ${phone}`,
		`Service: ${serviceName}`,
		`Project location: ${location || "Not provided"}`,
		`Submitted: ${submittedAt} CT`,
		"",
		"Project details:",
		message
	].join("\n");

	const html = `
		<h1 style="color:#071b3a;font-family:Arial,sans-serif;font-size:24px;">New website project inquiry</h1>
		<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:16px;line-height:1.5;">
			<tr><th style="padding:5px 16px 5px 0;text-align:left;vertical-align:top;">Name</th><td style="padding:5px 0;">${escapeHtml(name)}</td></tr>
			<tr><th style="padding:5px 16px 5px 0;text-align:left;vertical-align:top;">Email</th><td style="padding:5px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
			<tr><th style="padding:5px 16px 5px 0;text-align:left;vertical-align:top;">Phone</th><td style="padding:5px 0;">${escapeHtml(phone)}</td></tr>
			<tr><th style="padding:5px 16px 5px 0;text-align:left;vertical-align:top;">Service</th><td style="padding:5px 0;">${escapeHtml(serviceName)}</td></tr>
			<tr><th style="padding:5px 16px 5px 0;text-align:left;vertical-align:top;">Location</th><td style="padding:5px 0;">${escapeHtml(location || "Not provided")}</td></tr>
			<tr><th style="padding:5px 16px 5px 0;text-align:left;vertical-align:top;">Submitted</th><td style="padding:5px 0;">${escapeHtml(submittedAt)} CT</td></tr>
		</table>
		<h2 style="color:#071b3a;font-family:Arial,sans-serif;font-size:18px;margin-top:24px;">Project details</h2>
		<p style="font-family:Arial,sans-serif;font-size:16px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</p>
	`;

	let resendResponse;
	try {
		resendResponse = await fetch(RESEND_ENDPOINT, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${env.RESEND_API_KEY}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				from: env.CONTACT_FROM_EMAIL || DEFAULT_FROM_EMAIL,
				to: [env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL],
				reply_to: email,
				subject,
				text,
				html
			})
		});
	} catch (error) {
		console.error("Resend request failed:", error);
		return jsonResponse({
			message: "We could not send your inquiry. Please try again or call (573) 339-5900."
		}, 502);
	}

	if (!resendResponse.ok) {
		console.error("Resend rejected the contact email:", resendResponse.status);
		return jsonResponse({
			message: "We could not send your inquiry. Please try again or call (573) 339-5900."
		}, 502);
	}

	return jsonResponse({ message: "Thank you. Your project inquiry has been sent to our team." });
}
