// public/app.js


const deployBtn =
  document.getElementById(
    "deployBtn"
  )

const connectBtn =
  document.getElementById(
    "connectBtn"
  )

const statusBox =
  document.getElementById(
    "status"
  )

const historyBox =
  document.getElementById(
    "history"
  )

const deployCount =
  document.getElementById(
    "deployCount"
  )

const terminal =
  document.getElementById(
    "terminal"
  )

let provider
let signer
let connected = false

// ======================
// TERMINAL
// ======================

function clearTerminal() {

  if (!terminal) return

  terminal.innerHTML = ""
}

function terminalLog(text) {

  if (!terminal) return

  const div =
    document.createElement("div")

  div.className =
    "terminal-line"

  div.innerText =
    `> ${text}`

  terminal.appendChild(div)

  terminal.scrollTop =
    terminal.scrollHeight
}

function delay(ms) {

  return new Promise(resolve =>
    setTimeout(resolve, ms)
  )
}

// ======================
// CHAIN
// ======================

const ritualChain = {

  chainId: "0x7BB",

  chainName: "Ritual",

  nativeCurrency: {
    name: "RITUAL",
    symbol: "RIT",
    decimals: 18
  },

  rpcUrls: [
    "https://rpc.ritualfoundation.org"
  ],

  blockExplorerUrls: [
    "https://explorer.ritualfoundation.org"
  ]
}

// ======================
// CONNECT WALLET
// ======================

async function connectWallet() {

  try {

    if (!window.ethereum) {

      alert(
        "MetaMask not installed"
      )

      return
    }

    // disconnect

    if (connected) {

      provider = null
      signer = null

      connected = false

      connectBtn.innerText =
        "wallet Connect"

      loadHistory()

      statusBox.innerText =
        "wallet disconnected"

      return
    }

    provider =
      new ethers.BrowserProvider(
        window.ethereum
      )

    await window.ethereum.request({

      method:
        "eth_requestAccounts"

    })

    const currentChainId =
      await window.ethereum.request({

        method:
          "eth_chainId"

      })

    // switch chain

    if (
      currentChainId !== "0x7BB"
    ) {

      try {

        await window.ethereum.request({

          method:
            "wallet_switchEthereumChain",

          params: [
            {
              chainId: "0x7BB"
            }
          ]

        })

      } catch (switchError) {

        if (
          switchError.code === 4902
        ) {

          await window.ethereum.request({

            method:
              "wallet_addEthereumChain",

            params: [
              ritualChain
            ]

          })

        } else {

          throw switchError
        }
      }
    }

    signer =
      await provider.getSigner()

    connected = true

    const wallet =
(
  await signer.getAddress()
).toLowerCase()

connectBtn.innerText =
  `${wallet.slice(0,6)}...${wallet.slice(-4)}`

    connectBtn.style.color =
      "#9298A4"

    statusBox.innerText =
      "wallet Connected"

      connectBtn.style.color =
  ""

  } catch (err) {

    console.log(err)

    statusBox.innerText =
      "wallet connection failed"
  }
}

// ======================
// DEPLOY CONTRACT
// ======================

async function deployContract() {

  try {

    clearTerminal()

    // auto connect

    if (!signer) {

      await connectWallet()

      if (!signer) return
    }

    terminalLog(
      "preparing contract deployment..."
    )

    await delay(700)

    // ABI

    const abi = [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      }
    ]

    // BYTECODE

    const bytecode =
    "0x6080604052348015600f57600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555042600181905550610167806100666000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80638da5cb5b1461003b578063cf09e0d014610059575b600080fd5b610043610077565b60405161005091906100e2565b60405180910390f35b61006161009b565b60405161006e9190610116565b60405180910390f35b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60015481565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006100cc826100a1565b9050919050565b6100dc816100c1565b82525050565b60006020820190506100f760008301846100d3565b92915050565b6000819050919050565b610110816100fd565b82525050565b600060208201905061012b6000830184610107565b9291505056fea2646970667358221220719a393fdc486c125fe9f0c737d80bedca0653a71917a7692c841aaadd4f5fd164736f6c634300081c0033"

    const factory =
      new ethers.ContractFactory(
        abi,
        bytecode,
        signer
      )

    terminalLog(
      "broadcasting transaction..."
    )

const contract =
 await factory.deploy()

terminalLog(
  "waiting block confirmation..."
)

await contract.waitForDeployment()

const contractAddress = 
 await contract.getAddress() 

 const deployTx =
  contract.deploymentTransaction()

const txHash =
  deployTx?.hash || "Failed"

console.log( 
  "TX HASH:", txHash 
) 

console.log( 
"CONTRACT:", contractAddress 
)

console.log(
  "SAVE ADDRESS:",
  contractAddress
)

const wallet =
  (
    await signer.getAddress()
  ).toLowerCase()

    // save history

    console.log(
  "SAVE ADDRESS:",
  contractAddress
)

const response =
  await fetch("/api/history", {

    method: "POST",

    headers: {
      "Content-Type":
        "application/json"
    },

    body: JSON.stringify({

  txHash: txHash,

  contractAddress: contractAddress,

  wallet,

  status: "Success"

})

  })

const result =
  await response.text()

console.log(result)

console.log(
  "HISTORY RESPONSE:",
  result
)


    terminalLog(
      "contract deployed successfully"
    )

    terminalLog(
      `contract deployed at ${contractAddress}`
    )

    statusBox.innerText =
      "deploy success"

    loadStats()

    loadHistory()

  } catch (err) {

    console.log(err)

    if (
      err.code === 4001
    ) {

      terminalLog(
        "transaction rejected"
      )

    } else {

      terminalLog(
        "deployment failed"
      )
    }

    statusBox.innerText =
      "deploy failed"

    await fetch("/api/history", {

      method: "POST",

      headers: {
        "Content-Type":
          "application/json"
      },

      body: JSON.stringify({

  tx_hash:
    err?.transactionHash ||
    "Failed",

  contract_address:
    "-",

  wallet:
    "-",

  status: "Failed"

})

    })

    loadHistory()
  }
}

// ======================
// LOAD STATS
// ======================

async function loadStats() {

  try {

    const res =
      await fetch("/api/stats")

    const data =
      await res.json()
  
      console.log("DATA:", data)

    if (deployCount) {

      deployCount.innerText =
        `${data.total} Deploys`
    }

  } catch (err) {

    console.log(err)
  }
}

// ======================
// LOAD HISTORY
// ======================

async function loadHistory() {

  try {

    if (!signer) return

    const wallet =
  (
    await signer.getAddress()
  ).toLowerCase()

    const res =
      await fetch(
        `/api/history?wallet=${wallet}`
      )

    const data =
      await res.json()

      console.log("DATA:", data)

    if (!historyBox) return

    historyBox.innerHTML = ""

    if (!Array.isArray(data)) return

      data.forEach(item => {

      const div =
        document.createElement("div")

      div.className =
        "history-item"

      div.innerHTML = `

<div class="history-status">
  ${item.status}
</div>

<div class="history-row">
  Contract:
  <span>
    ${item.contractAddress}
  </span>

  <button
    class="copy-btn"
    onclick="copyContract('${item.contractAddress}', this)"
  >
    Copy
  </button>
</div>

<div class="history-row">

  Transaction:
  <a
    class="history-link"
    href="https://explorer.ritualfoundation.org/tx/${item.txHash}"
    target="_blank"
  >
    ${item.txHash}
  </a>
</div>

`

      historyBox.appendChild(div)

    })

  } catch (err) {

    console.log(err)

  }
}

// ======================
// EVENTS
// ======================

if (connectBtn) {

  connectBtn.addEventListener(
    "click",
    connectWallet
  )
}

if (deployBtn) {

  deployBtn.addEventListener(
    "click",
    deployContract
  )
}

// ======================
// INIT
// ======================

loadStats()
loadHistory()



function copyContract(address, btn) {

  navigator.clipboard.writeText(address)

  btn.innerText = "Copied ✓"

  setTimeout(() => {

    btn.innerText = "Copy"

  }, 1500)
}

const supabaseClient =
  supabase.createClient(

    "https://gmuvjzzcxclbfmcvaymi.supabase.co",

    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXZqenpjeGNsYmZtY3ZheW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2Nzg3NTgsImV4cCI6MjA5NDI1NDc1OH0.AKU8zDKKZul-2msCz11rmCKJQN8C5P1697QCZg5utUY"
  )

supabaseClient

  .channel("deploy-realtime")

  .on(

    "postgres_changes",

    {

      event: "INSERT",

      schema: "public",

      table: "deploy_history"

    },

    async (payload) => {

      console.log(
        "REALTIME:",
        payload
      )

      loadStats()
      loadHistory()

      const deployWallet =
        payload.new.wallet?.toLowerCase()

      let currentWallet = null

      if (signer) {

        currentWallet =
          (
            await signer.getAddress()
          ).toLowerCase()
      }

      // user lain
      if (
        currentWallet !== deployWallet
      ) {

        terminalLog(
          "new deploy detected"
        )
      }

      // yg deploy sendiri
      else {

        terminalLog(
          "contract verification coming soon"
        )
      }
    }
  )

  .subscribe()