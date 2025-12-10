try {
    const passkey = require("better-auth/plugins/passkey");
    console.log('plugins/passkey:', Object.keys(passkey));
} catch (e) {
    console.log('plugins/passkey not found');
}

try {
    const clientPasskey = require("better-auth/client/passkey");
    console.log('client/passkey keys:', Object.keys(clientPasskey));
} catch (e) {
    console.log('better-auth/client/passkey not found');
}
