import { useState, useEffect } from 'react'
import abi from "./abi.json"
import { ethers } from 'ethers'
import toast, { Toaster } from 'react-hot-toast'
import { PlusCircle, Trash2, Wallet, WalletCards, RefreshCw, CheckCircle } from 'lucide-react';
import "./index.css"


function App() {
  const [useramount, setUserAmount] = useState('')
  const [tasks, setTasks] = useState([])
  const [taskTitle, setTaskTitle] = useState('')
  const [taskText, setTaskText] = useState('')
  // const [taskId, setTaskId] = useState('')
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
      const receipt = await tx.wait()
      console.log(receipt)
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

  async function _deleteTask(id) {
    // requestAccounts()
    if (!isConnected) {
      return
    }
    if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
        const tx = await contract.deleteTask(id)
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
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)

  try {
      toast.loading('Getting tasks...', { duration: 1000 })
      const _tasks = await contract.getMyTask()
      const formattedTasks = _tasks.map(task => ({
        id: Number(task.id),
        taskTitle: task.taskTitle,
        taskText: task.taskText,
        isDeleted: task.isDeleted
      }))
      console.log(formattedTasks)
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
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
  <div className="max-w-2xl mx-auto space-y-8">
    {/* Header Card */}
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-indigo-100 p-8 hover:shadow-2xl transition-shadow duration-300">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">
        Task Manager
      </h1>

      {/* Wallet Connection */}
      <div className="flex justify-center mb-8">
        {!isConnected ? (
          <button
            onClick={requestAccounts}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
          >
            <Wallet className="w-5 h-5 text-white" />
            Connect Wallet
          </button>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3 text-gray-600 bg-indigo-50 px-4 py-2 rounded-lg">
              <Wallet className="w-4 h-4" />
              <span className="font-mono text-sm">
                {walletAddress}
              </span>
            </div>
            <button
              onClick={disconnectWallet}
              className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-md"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Task Input Form */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <input 
            type="text"
            placeholder="Task Title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all placeholder-gray-400 bg-white/50 hover:border-indigo-200"
          />
        </div>
        <div className="relative">
          <textarea 
            placeholder="Task Description"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all placeholder-gray-400 bg-white/50"
            rows={3}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button 
          onClick={_addTask}
          disabled={!isConnected}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
        >
          <PlusCircle className="w-5 h-5 text-white" />
          Add Task
        </button>
        
        <button 
          onClick={_getMyTask}
          disabled={!isConnected}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
        >
          <RefreshCw className="w-5 h-5 text-white" />
          Refresh
        </button>
      </div>
    </div>

    {/* Tasks List */}
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-indigo-100 p-8 hover:shadow-2xl transition-shadow duration-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <CheckCircle className="w-6 h-6 text-indigo-600" />
        My Tasks ({tasks.length})
      </h2>
      
      {tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div 
              key={task.id}
              className="p-6 rounded-xl bg-gradient-to-r from-white to-indigo-50/30 border border-indigo-100 hover:border-indigo-200 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {task.taskTitle}
                  </h3>
                  <span className="text-xs text-gray-500">
                    Added on {task.timestamp}
                  </span>
                </div>
                <button 
                  onClick={() => _deleteTask(task.id)}
                  className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600">
                {task.taskText}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-indigo-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-gray-500">
            No tasks found. Add your first task above!
          </p>
        </div>
      )}
    </div>
  </div>
</div>
);
};


export default App
