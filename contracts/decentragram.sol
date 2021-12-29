// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Decentragram {
    string public name;
    uint256 public imageCount = 0;


    mapping(uint256 => Image) public images;
    mapping(address => uint256) public followersCount;
    mapping(address => uint256) public followingCount;
    mapping(address => address[]) public followers;
    mapping(address => address[]) public following;
    mapping(uint256 => Tip[]) public tips;

    struct Tip {
      uint256 amount;
      address tipper;
    }

    struct Image {
        uint256 id;
        string hash;
        string category;
        string description;
        uint256 tipAmount;
        address payable author;
    }

    event ImageCreated(
        uint256 id,
        string hash,
        string category,
        string description,
        uint256 tipAmount,
        address payable author
    );

    event ImageTipped(
        uint256 id,
        string hash,
        string description,
        uint256 tipAmount,
        address payable author
    );

    constructor() public {
        name = "Decentragram";
    }


    function followSingle(address followingAddress) public {
        
        followersCount[followingAddress] = followersCount[followingAddress]+1;
        followers[followingAddress].push(msg.sender);

        followingCount[msg.sender] = followingCount[msg.sender]+1;
        following[msg.sender].push(followingAddress);        
    }

    function uploadImage(string memory _imgHash, string memory _description,string memory _category)
        public
    {
        //+-Make sure the image hash exists:_
        require(bytes(_imgHash).length > 0, "Image should not be null");

        //+-Make sure image description exists:_
        require(bytes(_description).length > 0, "Description should not be null");

        //+-Make sure uploader address exists:_
        // require(msg.sender != address(0));

        //+-Increment image id:_
        imageCount++;

        //+-Add Image to the contract:_
        images[imageCount] = Image(
            imageCount,
            _imgHash,
            _category,
            _description,
            0,
            payable(msg.sender)
            // msg.sender
        );

        //+-Trigger an event:_
        emit ImageCreated(
            imageCount,
            _imgHash,
            _category,
            _description,
            0,
            payable(msg.sender)
        );
    }

    function tipImageOwner(uint256 _id) public payable {
        //+-Make sure the id is valid:_
        require(_id > 0 && _id <= imageCount);

        //+-Fetch the image:_
        Image memory _image = images[_id];

        //+-Fetch the author:_
        address payable _author = _image.author;

        //+-Pay the author by sending them Ether:_
        _author.transfer(msg.value);
        // address(_author).transfer(msg.value);

        //+-Increment the tip amount:_
        _image.tipAmount = _image.tipAmount + msg.value;

        //+-Update the image:_
        images[_id] = _image;

        // Add to Tips
        tips[_id].push(Tip(msg.value,msg.sender));

        //+-Trigger an event:_
        emit ImageTipped(
            _id,
            _image.hash,
            _image.description,
            _image.tipAmount,
            _author
        );
    }
}
