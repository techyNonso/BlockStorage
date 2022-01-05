// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BlockStorage {
    string public name = "BlockStorage";
    uint public fileCount = 0;

    //mapoing for files
    mapping(uint => File) public files;

    //struct for File
    struct File {
        uint fileId;
        string fileHash;
        uint fileSize;
        string fileType;
        string fileName;
        string fileDescription;
        uint uploadTime;
        address payable uploader;
    }

    event FileUploaded(
        uint fileId,
        string fileHash,
        uint fileSize,
        string fileType,
        string fileName,
        string fileDescription,
        uint uploadTime,
        address payable uploader
    );

   

    function uploadFile(string memory _fileHash, uint _fileSize, string memory _fileType, string memory _fileName,string memory _description) external {
        require(bytes(_fileHash).length > 0);

        require (bytes(_fileType).length > 0);

        require(bytes(_description).length > 0);

        require(bytes(_fileName).length > 0);

        require(msg.sender != address(0));

        require(_fileSize > 0);


        fileCount++;
        files[fileCount] = File(fileCount,_fileHash,_fileSize,_fileType,_fileName,_description, block.timestamp,payable(msg.sender));

        emit FileUploaded(fileCount,_fileHash,_fileSize,_fileType,_fileName,_description,block.timestamp,payable(msg.sender));
        
    }
}