// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


contract Project {
    
    // Task structure
    struct Task {
        uint256 id;
        string content;
        bool completed;
        uint256 createdAt;
        address owner;
    }
    
    // State variables
    mapping(address => Task[]) private userTasks;
    mapping(address => uint256) private taskCounters;
    
    // Events
    event TaskCreated(address indexed user, uint256 taskId, string content);
    event TaskCompleted(address indexed user, uint256 taskId);
    event TaskDeleted(address indexed user, uint256 taskId);
    
    /**
     * @dev Create a new task
     * @param _content The task description
     */
    function createTask(string memory _content) public {
        require(bytes(_content).length > 0, "Task content cannot be empty");
        
        uint256 taskId = taskCounters[msg.sender];
        
        Task memory newTask = Task({
            id: taskId,
            content: _content,
            completed: false,
            createdAt: block.timestamp,
            owner: msg.sender
        });
        
        userTasks[msg.sender].push(newTask);
        taskCounters[msg.sender]++;
        
        emit TaskCreated(msg.sender, taskId, _content);
    }
    
    /**
     * @dev Mark a task as completed
     * @param _taskIndex The index of the task in user's task array
     */
    function completeTask(uint256 _taskIndex) public {
        require(_taskIndex < userTasks[msg.sender].length, "Task does not exist");
        require(!userTasks[msg.sender][_taskIndex].completed, "Task already completed");
        
        userTasks[msg.sender][_taskIndex].completed = true;
        
        emit TaskCompleted(msg.sender, userTasks[msg.sender][_taskIndex].id);
    }
    
    /**
     * @dev Delete a task
     * @param _taskIndex The index of the task in user's task array
     */
    function deleteTask(uint256 _taskIndex) public {
        require(_taskIndex < userTasks[msg.sender].length, "Task does not exist");
        
        uint256 taskId = userTasks[msg.sender][_taskIndex].id;
        
        // Move the last task to the deleted task's position
        userTasks[msg.sender][_taskIndex] = userTasks[msg.sender][userTasks[msg.sender].length - 1];
        userTasks[msg.sender].pop();
        
        emit TaskDeleted(msg.sender, taskId);
    }
    
    /**
     * @dev Get all tasks for the caller
     * @return Array of user's tasks
     */
    function getTasks() public view returns (Task[] memory) {
        return userTasks[msg.sender];
    }
    
    /**
     * @dev Get the number of tasks for the caller
     * @return Number of tasks
     */
    function getTaskCount() public view returns (uint256) {
        return userTasks[msg.sender].length;
    }
    
    /**
     * @dev Get a specific task by index
     * @param _taskIndex The index of the task
     * @return The task details
     */
    function getTask(uint256 _taskIndex) public view returns (Task memory) {
        require(_taskIndex < userTasks[msg.sender].length, "Task does not exist");
        return userTasks[msg.sender][_taskIndex];
    }
}
