try {
  const metroConfig = require('metro-config');
  console.log('metro-config exports:', Object.keys(metroConfig));
} catch(e) { console.log('metro-config not found'); }

try {
  const expoMetroConfig = require('expo/metro-config');
  console.log('expo/metro-config exports:', Object.keys(expoMetroConfig));
} catch(e) { console.log('expo/metro-config not found'); }
