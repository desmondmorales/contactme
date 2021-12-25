page: https://desmondmorales.github.io/contactme/

# ContactMe
This dapp allows its users to register with their wallet address, registering attributes such as their name, a profile image, and a small description of themselves, in addition to entering the fee to contact them, in this way, any registered user can contact another user, and whoever has the first intention to contact, will be the first to pay, this payment will be made to the profile you want to contact.

Once the fee is paid, a chat will be created, where both parties will be able to interact.

# Contract methods

getChatsLength -> Returns the total number of chat created

getChatsUnited -> Receives the address of the user registered, and returns an array of the indexes of the chats where the users participates

getMessage -> Receives the index of the message and returns the address of the user that sent the message, and the content of it

getMessages -> Receives the index of the chat, and returns ans array of the indexes of the messages in the chat

getProfile -> Receives the index of the profile, and return all its information, the address, the name, the profile picture url, the description, and the price

getProfilesLength -> Returns the total number of profiles registered

registerUser -> Receives the name, the profile picture url, the description and the price of the user, then adds it to the profiles registered

sendMessage -> Receives the index of the chat where the message will be added, and its content

startChat -> Receives the index of the user to be contacted and the content of the message, then it pays the user that the inital user wanted to contact

# Install

```

npm install

```

or 

```

yarn install

```

# Start

```

npm run dev

```

# Build

```

npm run build

```
# Usage
1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the google chrome store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.
