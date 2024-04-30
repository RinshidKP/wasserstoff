import cluster from 'cluster';
import os from 'os';

// Function to create worker processes
function createWorkers() {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
}

// Auto-scaling logic
function autoScale() {
    // Maximum number of worker processes
    const MAX_WORKERS = os.cpus().length * 2;
  
    // CPU usage threshold for scaling
    const CPU_THRESHOLD = 0.7;
  
    // Function to create a new worker process
    function createWorker() {
      cluster.fork();
    }
  
    // Function to terminate a worker process
    function terminateWorker() {
      const workerIds = Object.keys(cluster.workers);
      if (workerIds.length > 1) {
        cluster.workers[workerIds[0]].kill(); // Terminate the first worker
      }
    }
  
    // Retrieve CPU usage metric (dummy implementation)
    function getCpuUsage() {
      // Dummy implementation, replace with actual CPU usage retrieval mechanism
      return Math.random(); // Simulated CPU usage between 0 and 1
    }
  
    // Auto-scaling logic
    function scale() {
      const cpuUsage = getCpuUsage();
      const numWorkers = Object.keys(cluster.workers).length;
  
      // Scale up if CPU usage exceeds the threshold and the number of workers is below the maximum
      if (cpuUsage > CPU_THRESHOLD && numWorkers < MAX_WORKERS) {
        createWorker();
        console.log('Scaled up: CPU usage exceeded threshold');
      }
      // Scale down if CPU usage drops below the threshold and the number of workers is greater than one
      else if (cpuUsage < CPU_THRESHOLD && numWorkers > 1) {
        terminateWorker();
        console.log('Scaled down: CPU usage below threshold');
      }
    }
  
    // Return the scale function for external invocation
    return scale;
  }

export { createWorkers, autoScale };
