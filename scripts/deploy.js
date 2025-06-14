const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment of Decentralized To-Do List contract...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);

  console.log("📋 Deployment Details:");
  console.log("Deploying with account:", deployerAddress);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("");

  try {
    // Get the contract factory
    const TodoList = await ethers.getContractFactory("DecentralizedTodoList");
    
    console.log("📝 Deploying DecentralizedTodoList contract...");
    
    // Deploy the contract
    const todoList = await TodoList.deploy();
    
    // Wait for deployment to be mined
    await todoList.waitForDeployment();
    
    const contractAddress = await todoList.getAddress();
    
    console.log("✅ Contract deployed successfully!");
    console.log("📍 Contract address:", contractAddress);
    console.log("🔗 Transaction hash:", todoList.deploymentTransaction().hash);
    console.log("");

    // Verify deployment by calling a view function
    console.log("🔍 Verifying deployment...");
    try {
      const ownerAddress = await todoList.owner();
      console.log("Contract owner:", ownerAddress);
      console.log("✅ Deployment verified successfully!");
    } catch (error) {
      console.log("⚠️  Warning: Could not verify deployment:", error.message);
    }

    // Save deployment info to file
    const deploymentInfo = {
      network: network.name,
      chainId: network.chainId.toString(),
      contractAddress: contractAddress,
      deployerAddress: deployerAddress,
      deploymentHash: todoList.deploymentTransaction().hash,
      timestamp: new Date().toISOString(),
      blockNumber: todoList.deploymentTransaction().blockNumber
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save to network-specific file
    const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to:", deploymentFile);

    // Generate ABI file for frontend integration
    const artifactPath = path.join(__dirname, "../artifacts/contracts/DecentralizedTodoList.sol/DecentralizedTodoList.json");
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      const abiFile = path.join(deploymentsDir, "DecentralizedTodoList-ABI.json");
      fs.writeFileSync(abiFile, JSON.stringify(artifact.abi, null, 2));
      console.log("📄 ABI saved to:", abiFile);
    }

    // Display contract interaction examples
    console.log("\n📚 Contract Interaction Examples:");
    console.log("================================");
    console.log("// JavaScript (ethers.js)");
    console.log(`const contractAddress = "${contractAddress}";`);
    console.log(`const todoList = await ethers.getContractAt("DecentralizedTodoList", contractAddress);`);
    console.log("");
    console.log("// Create a new task");
    console.log(`await todoList.createTask("Buy groceries");`);
    console.log("");
    console.log("// Get all tasks");
    console.log(`const tasks = await todoList.getAllTasks();`);
    console.log("");
    console.log("// Complete a task");
    console.log(`await todoList.completeTask(0); // taskId = 0`);
    console.log("");
    console.log("// Delete a task");
    console.log(`await todoList.deleteTask(0); // taskId = 0`);

    // Estimate gas costs for common operations
    console.log("\n⛽ Estimated Gas Costs:");
    console.log("======================");
    try {
      const createTaskGas = await todoList.createTask.estimateGas("Sample task");
      const completeTaskGas = await todoList.completeTask.estimateGas(0).catch(() => "N/A (no tasks)");
      
      console.log("Create Task:", createTaskGas.toString(), "gas");
      console.log("Complete Task:", typeof completeTaskGas === 'string' ? completeTaskGas : completeTaskGas.toString() + " gas");
    } catch (error) {
      console.log("Could not estimate gas costs:", error.message);
    }

    console.log("\n🎉 Deployment completed successfully!");
    console.log("Contract is ready for interaction on", network.name);

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

// Handle script execution
main()
  .then(() => {
    console.log("\n✨ Script execution completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });

// Export for testing purposes
module.exports = { main };
