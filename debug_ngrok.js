const ngrok = require('./node_modules/@expo/ngrok');

async function test() {
  console.log('Testing @expo/ngrok...');
  try {
    const version = await ngrok.getVersion();
    console.log('Version:', version);
    
    console.log('Attempting to connect...');
    // We use a dummy port
    const url = await ngrok.connect({ addr: 8081 });
    console.log('Success! URL:', url);
  } catch (err) {
    console.error('CRASH DETECTED:');
    console.error(err);
    if (err.stack) console.error(err.stack);
  }
}

test();
