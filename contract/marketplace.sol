// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract Contact {
    uint256 internal profilesLength = 0;
    uint256 internal chatsLength = 0;
    uint256 internal messagesLength = 0;
    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Profile {
        address payable user;
        string name;
        string pfp;
        string description;
        uint256 price;
        uint256 contacts;
    }

    struct Message {
        address sender;
        string content;
        uint timestamp;
    }

    mapping(uint256 => Profile) internal profiles;

    mapping(uint256 => uint256[]) internal chats;

    mapping(uint256 => Message) internal messages;

    mapping(address => uint256[]) internal chatsUnited;

    modifier onlyOwner(uint _index)  {
        require( profiles[_index].user == msg.sender, "Only callable by owner");
        _;
    }

    function registerUser(
        string memory _name,
        string memory _pfp,
        string memory _description,
        uint256 _price
    ) public {
        uint256 _contacts = 0;
        profiles[profilesLength] = Profile(
            payable(msg.sender),
            _name,
            _pfp,
            _description,
            _price,
            _contacts
        );
        profilesLength++;
    }

    function sendMessage(uint256 _index, string memory _content) public {
        messages[messagesLength] = Message(msg.sender, _content, block.timestamp);

        chats[_index].push(messagesLength);

        messagesLength++;
    }

    function getProfile(uint256 _index)
        public
        view
        returns (
            address payable,
            string memory,
            string memory,
            string memory,
            uint256,
            uint256
        )
    {
        return (
            profiles[_index].user,
            profiles[_index].name,
            profiles[_index].pfp,
            profiles[_index].description,
            profiles[_index].price,
            profiles[_index].contacts
        );
    }

    function getMessages(uint256 _index)
        public
        view
        returns (uint256[] memory)
    {
        return (chats[_index]);
    }

    function getMessage(uint256 _index)
        public
        view
        returns (address sender, string memory content)
    {
        return (messages[_index].sender, messages[_index].content);
    }

    function startChat(uint256 _index, string memory message) public payable {
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                profiles[_index].user,
                profiles[_index].price
            ),
            "Transfer failed."
        );
        chats[chatsLength].push(messagesLength);
        messages[messagesLength] = Message(msg.sender, message, block.timestamp);
        chatsUnited[msg.sender].push(chatsLength);
        chatsUnited[profiles[_index].user].push(chatsLength);
        chatsLength++;
        messagesLength++;
    }

    function getChatsUnited(address _user)
        public
        view
        returns (uint256[] memory)
    {
        return (chatsUnited[_user]);
    }

    function getProfilesLength() public view returns (uint256) {
        return (profilesLength);
    }

    function updateProfilePrice(uint _index, uint _price) public payable onlyOwner(_index) {
        profiles[_index].price = _price;
    }

    function getChatsLength() public view returns (uint256) {
        return (chatsLength);
    }
}
