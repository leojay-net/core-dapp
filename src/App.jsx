import { useState, useEffect } from 'react'
import abi from "./abi.json"
import { ethers } from 'ethers'
import toast, { Toaster } from 'react-hot-toast'

function App() {
  const [useramount, setUserAmount] = useState('')
  const [tasks, setTasks] = useState([])
  const [taskTitle, setTaskTitle] = useState('')
  const [taskText, setTaskText] = useState('')
  // const [balance, setbalance] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const contractAddress = "0x0D16Ec2af167bdf8B86adBf3258D7974501e7B74"


  useEffect(() => {
    requestAccounts()
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccount)
      window.ethereum.on('chainChanged', () => window.location.reload())
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccount)
      }
    }

  }, [])

  useEffect(() => {
    if (isConnected){
    _getMyTask()
    }
  }, [isConnected])


  async function handleAccount(accounts) {
    if (accounts.length === 0) {
      setIsConnected(false)
      setWalletAddress('')
      setTasks([])
    } else {
      setWalletAddress(accounts[0])
    }
  } 


  async function requestAccounts() {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({method: "eth_requestAccounts"})
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        setIsConnected(true)
        setWalletAddress(accounts[0])
        toast.success('Wallet connected!')
        await _getMyTask()
      } catch (error) {
        toast.error('Failed to connect wallet!')
      }
    } else {
      toast.error('Please install MetaMask!')
    }
  }


async function disconnectWallet() {
    setIsConnected(false)
    setWalletAddress('')
    setTasks([])
    toast.success('Wallet disconnected!')
}

  async function _addTask() {
    // requestAccounts()
    if (!isConnected) {
      toast.error('Please connect your wallet first!')
      return
    }
    if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    
    const contract = new ethers.Contract(contractAddress, abi, signer)
  try {
      const tx = await contract.addTask(taskText, taskTitle, false)
      toast.loading('Adding Task...', { duration: 1000 })
      const receipt = tx.wait()
      toast.success('Task added successfully!')
      await _getMyTask()
      toast.success("Task updated")
      console.log("Task updated", receipt)

    } catch(err){
      toast.error('Task addition failed!')
      console.log("Failed Transaction", err)
    }
  }
  }

  async function _deleteTask() {
    // requestAccounts()
    if (!isConnected) {
      return
    }
    if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
        const tx = await contract.deleteTask(useramount)
        toast.loading('Deleting...', { duration: 1000 })
        const receipt = tx.wait()
        toast.success('Task deleted Succesfully!')
        const _task = await contract.getMyTask()
        console.log("deleted", receipt)

      } catch(err){
        toast.error('Task deletion failed!')
        console.log("Failed Transaction", err)
      }
  } 
  }

  async function _getMyTask() {
    if (!isConnected) {
      return
    }
    if (typeof window.ethereum !== "undefined") {

    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(contractAddress, abi, provider)

  try {
      toast.loading('Getting tasks...', { duration: 1000 })
      const _tasks = await contract.getMyTask()
      console.log(_tasks)
      const formattedTasks = _tasks.map(task => ({
        id: Number(task.id),
        taskTitle: task.taskTitle,
        taskText: task.taskText,
        isDeleted: task.isDeleted
      }))
      setTasks(formattedTasks)
      toast.success('Tasks updated!')
      console.log("retrieval successful", _tasks)

    } catch(err){
      toast.error('Failed to get tasks!')
      console.log("retrieval unsuccessful", err)
    }
    
  }
}

  return (
    <div style={{
      padding: '20px',
      maxWidth: '400px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <Toaster position="top-right" />
      
      <h1 style={{
        textAlign: 'center',
        color: '#333',
        marginBottom: '20px'
      }}>
        LEO's TASK
      </h1>

      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        {!isConnected ? (
          <button
            onClick={requestAccounts}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Connect Wallet
          </button>
        ) : (
          <div>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
            <button
              onClick={disconnectWallet}
              style={{
                backgroundColor: '#ff9800',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>
      
      <input 
        type="text"
        placeholder="Enter Task Title"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          marginBottom: '15px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      />
      <input 
        type="text"
        placeholder="Enter Task Text"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          marginBottom: '15px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      />
          
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={_addTask}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer',
            opacity: isConnected ? 1 : 0.5
          }}
          disabled={!isConnected}
        >
          Add Task
        </button>
        
        <button 
          onClick={_deleteTask}
          style={{
            backgroundColor: '#f44336',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer',
            opacity: isConnected ? 1 : 0.5
          }}
          disabled={!isConnected}
        >
          Delete Task
        </button>
        
        <button 
          onClick={_getMyTask}
          style={{
            backgroundColor: '#2196F3',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: isConnected ? 1 : 0.5
          }}
          disabled={!isConnected}
        >
          Get Tasks
        </button>
      </div>
      
      <h2 style={{ 
          margin: '0 0 15px 0',
          color: '#333',
          fontSize: '18px'
        }}>
          My Tasks ({tasks.length})
        </h2>
        
        {tasks.length > 0 ? (
          <div>
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <p style={{ 
            textAlign: 'center',
            color: '#666'
          }}>
            No tasks found
          </p>
        )}
    </div>
  )
}

export default App
