
try {
  console.log("Attempting to require metro.config.js...");
  const config = require('./metro.config.js');
  console.log("Success! Config loaded.");
} catch (error) {
  console.error("FAILED to load metro.config.js");
  console.error("Error name:", error.name);
  console.error("Error message:", error.message);
  console.error("Stack:", error.stack);
  if (error.code) console.error("Code:", error.code);
}
