pragma solidity >=0.4.21 <0.8.0;


contract Image{
  uint public listSize;
  mapping (uint => string) public contentList;

  constructor () public {
    listSize = 0;
  }
  
  ///write function
  function set(string memory _imageHash, string memory _type, string memory _name) public {
    listSize += 1;
    contentList[listSize] = string(abi.encodePacked(_imageHash,",",_type,",",_name));
  }

  //read function
  function get(uint ind) public view returns (string memory) {
    return contentList[ind];
  }

  function getListSize() public view returns (uint) {
    return listSize;
  }

}


