// ramStressTest.js
let memoryArray = [];

function startRamStressTest() {
  const targetMemorySize = 10 * 1024 * 1024 * 1024; // 10 GB
  const chunkSize = 10 * 1024 * 1024; // 10 MB

  while (true) {
    try {
      memoryArray.push(new Uint8Array(chunkSize)); // Allocate 10 MB
      if (memoryArray.length * chunkSize >= targetMemorySize) {
        break; // Stop when we reach the target memory size
      }
    } catch (e) {
      console.error('Memory allocation failed:', e);
      break; // Exit the loop if memory allocation fails
    }
  }

  document.getElementById('status').innerText = 'RAM stress test running...';
}

document.getElementById('startTestButton').addEventListener('click', startRamStressTest);
