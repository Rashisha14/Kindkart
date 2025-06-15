const { exec } = require('child_process');
const readline = require('readline');

// Function to simulate keypress
const simulateKeyPress = (process, key) => {
  process.stdin.write(key);
};

// Start expo
const expoProcess = exec('expo start', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  console.log(stdout);
});

// Wait for 3 seconds then press 's' to switch to Expo Go
setTimeout(() => {
  simulateKeyPress(expoProcess, 's');
}, 3000); 