import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import BigNumber from "bignumber.js"
import marketplaceAbi from "../contract/marketplace.abi.json"
import erc20Abi from "../contract/erc20.abi.json"
import {cUSDContractAddress, ERC20_DECIMALS, MPContractAddress} from "./utils/constants";



let kit
let contract
let profiles = []
let myModal = new bootstrap.Modal(document.getElementById('registerUser'))
let registered = false
let user = {}
let shared

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  const result = await cUSDContract.methods
    .approve(MPContractAddress, _price)
    .send({ from: kit.defaultAccount })
  return result
}

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}

const getProducts = async function() {
  const _profilesLength = await contract.methods.getProfilesLength().call()
  const _profiles = []
  for (let i = 0; i < _profilesLength; i++) {
    let _profile = new Promise(async (resolve, reject) => {
      let p = await contract.methods.getProfile(i).call()
      resolve({
        index: i,
        user: p[0],
        name: p[1],
        pfp: p[2],
        description: p[3],
        price: new BigNumber(p[4])
      })
    })
    _profiles.push(_profile)
  }
  profiles = await Promise.all(_profiles)

  profiles.forEach((ele) => {
    if (ele.user == kit.defaultAccount) {
      user = ele
      registered = true
    }
  })

  document.getElementById("userName").innerText = user.name
  document.getElementById("principalName").innerText = user.name
  
  if (registered) {
    renderProducts()
  }
  else {
    renderForm()
  }
  
  if (user.pfp.includes("http")){
    document.getElementById("userImage").src = user.pfp
    document.getElementById("principalPfp").src = user.pfp
  }
  else{
    document.getElementById("userImage").src = identiconTemplate(kit.defaultAccount)
    document.getElementById("principalPfp").src = identiconTemplate(kit.defaultAccount)
  }
}

async function renderProducts() {
  document.getElementById("users").innerHTML = `
              <div class="px-4 d-none d-md-block">
                <div class="d-flex align-items-center">
                  <div class="flex-grow-1">
                    <input type="text" class="form-control my-3" placeholder="Search...">
                  </div>
                </div>
              </div>`
  profiles.forEach((_profile) => {
    let userIcon = ""
    if (_profile.pfp.includes("http")){
      userIcon = _profile.pfp
    }
    else{
      userIcon = identiconTemplate(_profile.user)
    }
    if(_profile.user != kit.defaultAccount){
      document.getElementById("users").innerHTML += (
        `
        <div class="d-flex align-items-start">
          <img src="${userIcon}" class="rounded-circle mr-1" width="40" height="40">
          <div class="flex-grow-1 ml-3">
            ${_profile.name}
          </div>
          <button id="${_profile.index}" class="list-group-item border-0 viewUser" style="widht: 10px">Contact</button>
        </div>
  
        `
      )
    }
  })
}

function renderForm() {
  myModal.show()
}


function identiconTemplate(_address) {
  return blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getProducts()
  notificationOff()
});

document
  .querySelector("#register")
  .addEventListener("click", async (e) => {
    const params = [
      document.getElementById("nameForm").value,
      document.getElementById("pfpForm").value,
      document.getElementById("descriptionForm").value,
      new BigNumber(document.getElementById("priceForm").value)
      .shiftedBy(ERC20_DECIMALS)
      .toString()
    ]
    notification(`⌛ Registering "${params[0]}"...`)
    try {
      const result = await contract.methods
        .registerUser(...params)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You have registered as "${params[0]}".`)
    myModal.hide()
    getProducts()
  })

document.querySelector("#users").addEventListener("click", async (e) => {
  if (e.target.className.includes("viewUser")) {
    loadView(e.target.id)
  }
});

async function loadView(index) {
    const profile = await contract.methods.getProfile(index).call()

    document.getElementById("userName").innerText = profile[1]
    if (profile[2].includes("http")){
      document.getElementById("userImage").src = profile[2]
    }
    else{
      document.getElementById("userImage").src = identiconTemplate(kit.defaultAccount)
    }

        
    const chatsSender = await contract.methods.getChatsUnited(kit.defaultAccount).call()
    const chatsReciever = await contract.methods.getChatsUnited(profile[0]).call()

    shared = findShared(chatsSender, chatsReciever)

    if(!shared) {

      document.getElementById("userDescription").innerText = `Description about ${profile[1]}: ${profile[3]}`
      document.getElementById("userPrice").innerText = `Would you like to contact with this user for ${new BigNumber(profile[4]).shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD? Just send a message!`

      document.getElementById("start").style.display = "block"
      document.getElementById("chat").style.display = "none"

      document.getElementsByClassName("sendMessage")[0].style.display = "none"
      document.getElementsByClassName("startChat")[0].style.display = "block"

      document.getElementsByClassName("startChat")[0].id = index
      
    }
    else {

      const messagesIndex = await contract.methods.getMessages(shared).call()

      let messages = []
      let _messages = []

      for (let i = 0; i < messagesIndex.length; i++) {
        let _message = new Promise(async (resolve, reject) => {
          let p = await contract.methods.getMessage(messagesIndex[i]).call()
          resolve({
            index: i,
            sender: p[0],
            content: p[1]
          })
        })
        _messages.push(_message)
      }
      messages = await Promise.all(_messages)

      document.getElementById("chat").innerHTML = ""

      messages.forEach(_message => {
        if (_message.sender == kit.defaultAccount){
          document.getElementById("chat").innerHTML += `
          <div class="chat-message-right pb-4">
            <div class="flex-shrink-1 rounded py-2 px-3 mr-3" style="background-color: rgb(210 210 210 / 50%);">
              <div class="font-weight-bold mb-1">You</div>
              <div>${_message.content}</div>
            </div>
          </div>
          `
        }
        else {
          document.getElementById("chat").innerHTML += `
          <div class="chat-message-left pb-4">
            <div class="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
              <div class="font-weight-bold mb-1"></div>
              <div>${_message.content}</div>
            </div>
          </div>
          `
        }
      })

      document.getElementById("start").style.display = "none"
      document.getElementById("chat").style.display = "block"

      document.getElementsByClassName("sendMessage")[0].style.display = "block"
      document.getElementsByClassName("startChat")[0].style.display = "none"

      document.getElementsByClassName("sendMessage")[0].id = index
    }
}

function findShared(arr1, arr2) {
  var duplicates = arr1.filter(function(val) {
    return arr2.indexOf(val) != -1;
  });
  return duplicates[0];
}

document.querySelector(".sendMessage").addEventListener("click", async (e) => {


  const message = document.getElementById("messageContent").value;

  notification(`⌛ Sending message...`)
    try {
      const result = await contract.methods
        .sendMessage(shared, message)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 The message has been sent.`)
    
    document.getElementById("messageContent").value = ""
    loadView(e.target.id)
})

document.querySelector(".startChat").addEventListener("click", async (e) => {
  const index = e.target.id

  const message = document.getElementById("messageContent").value;

  notification("⌛ Waiting for payment approval...")
  try {
    await approve(profiles[index].price)
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
  notification(`⌛ Awaiting payment for "${profiles[index].name}"...`)
  try {
    const result = await contract.methods
      .startChat(index, message)
      .send({ from: kit.defaultAccount })
    notification(`🎉 You started the chat with "${profiles[index].name}".`)
    getBalance()
    document.getElementById("messageContent").value = ""
    loadView(index)
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }

})