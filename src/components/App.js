import React, { Component } from 'react';
// import Web3 from "web3";
import Image from '../abis/Image.json';

import './App.css';
const ipfsClient = require('ipfs-api');
const ipfs = ipfsClient({
  host: 'ipfs.infura.io',
  port: '5001',
  protocol: 'https',
});
var Web3 = require('web3');

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    const networkData = Image.networks[networkId];
    if (networkData) {
      const contract = new web3.eth.Contract(Image.abi, networkData.address);
      this.setState({ contract });
      const listSize = await this.state.contract.methods.getListSize().call();
      if (listSize > 0) {
        const lastRecord = await this.state.contract.methods
          .get(listSize)
          .call();
        const [lhash, ltype, lname] = lastRecord.split(',');
        this.setState({ type: ltype, imageHash: lhash });
        await this.refreshListData(listSize);
      }
    } else {
      window.alert('Smart contract not deployed to detected network.');
    }
  }

  refreshListData = async (listsize) => {
    const listSize = listsize
      ? listsize
      : await this.state.contract.methods.getListSize().call();
    this.setState({ listSize: listSize });
    if (listSize > 0) {
      var contentList = [];
      for (let i = 0; i < listSize; i++) {
        var record = await this.state.contract.methods.get(i + 1).call();
        var [_hash, _type, _name] = record.split(',');
        contentList.push({
          hash: _hash,
          name: _name,
          type: _type,
        });
      }
      this.setState({ contentList: contentList });
    }
  };

  showListContent = (e, hash, type) => {
    e.preventDefault();
    this.setState({ imageHash: hash, type: type });
  };

  constructor(props) {
    super(props);
    this.state = {
      imageHash: '',
      contract: null,
      web3: null,
      buffer: null,
      account: null,
      type: 'image',
      contentList: [],
      listSize: 0,
      contentName: null,
    };
    const that = this;
  }
  captureFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (file.type.includes('image')) {
      this.setState({ type: 'image' });
    } else if (file.type.includes('video')) {
      this.setState({ type: 'video' });
    } else if (file.type.includes('audio')) {
      this.setState({ type: 'audio' });
    }
    this.setState({ contentName: file.name });
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer.from(reader.result) });
    };
  };
  onSubmitClick = async (event) => {
    event.preventDefault();
    console.log('Submitting File');
    if (this.state.buffer) {
      const file = await ipfs.add(this.state.buffer);
      const imageHash = file[0]['hash'];
      console.log(imageHash);
      var _type = this.state.type;
      var _name = this.state.contentName;
      this.state.contract.methods
        .set(imageHash, _type, _name)
        .send({ from: this.state.account })
        .then(async (r) => {
          this.setState({ imageHash: imageHash });
          await this.refreshListData();
        });
    }
  };
  render() {
    return (
      <div>
        <nav className='navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow'>
          <a
            className='navbar-brand col-sm-3 col-md-2 mr-0'
            href='#'
            target='_blank'
            rel='noopener noreferrer'
          >
            <p className='title'> AUDIO/VIDEO PLAYER APPLICATION</p>
          </a>
        </nav>
        <div className='container-fluid mt-5'>
          <div className='row'>
            <main role='main' className='col-lg-12 d-flex text-center'>
              <div className='content mr-auto ml-auto'>
                <div className='container'>
                 
                  <div className='child'>
                      
                    {this.state.type === 'image' && (
                      <img
                        className='photo'
                        src={`https://ipfs.infura.io/ipfs/${this.state.imageHash}`}
                      />
                    )}
                    {this.state.type === 'audio' && (
                      <audio controls>
                        <source
                          src={`https://ipfs.infura.io/ipfs/${this.state.imageHash}`}
                          type='audio/mp3'
                        />
                      </audio>
                    )}
                    {this.state.type === 'video' && (
                      <video
                        src={`https://ipfs.infura.io/ipfs/${this.state.imageHash}`}
                        controls 
                        
                      />
                    )}
                         
                  </div>
                  <div className='listing'>
                    <h2>List of Uploaded Files</h2>
                    {this.state.contentList.length > 0 ? (
                      <div>
                        <div>
                            
                          <h3 > Audio List </h3> 
                          <ul class="list">
                          {this.state.contentList
                            .filter((item) => {
                              
                              return item.type === 'audio'; 
                            })
                            .map((item, index) => {
                              return (
                                <li key={index}>
                                  <a
                                    href='#'
                                    onClick={(e) => {
                                      this.showListContent(
                                        e,
                                        item.hash,
                                        item.type
                                      );
                                    }}
                                  >
                                    {item.name}
                                  </a>
                                </li>
                                
                              );
                            })}
                            </ul>
                        </div>
                        <div>
                          <h3> Video List </h3>
                          <ul class="list">
                          {this.state.contentList
                            .filter((item) => {
                             return  item.type === 'video';
                            })
                            .map((item, index) => {
                              return (
                                <li key={index}>
                                  <a
                                    href='#'
                                    onClick={(e) => {
                                      this.showListContent(
                                        e,
                                        item.hash,
                                        item.type
                                      );
                                    }}
                                  >
                                    {item.name}
                                  </a>
                                </li>
                              );
                            })}
                            </ul>
                        </div>
                      </div>
                    )
                       : (
                      <p>No Items in the list</p>
                    )}
                  </div>
                </div>
                <div className='container-form'>
                  <h2>Upload Audio/Video File</h2>
                  <form>
                    <div class='but'>
                    <input type='file' onChange={this.captureFile}></input>
                    <input type='submit' onClick={this.onSubmitClick}></input>
                    </div>
                  </form>
                </div>
                <div>
                  <p>{/* {this.state.account} */}</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
