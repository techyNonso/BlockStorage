import React, { Component } from "react";
import BlockStorage from "./contracts/BlockStorage.json";
import getWeb3 from "./getWeb3";

import "./App.css";
import Navbar from "./components/NavBar";
import Main from "./components/Main";

//Declare IPFS
import { create } from "ipfs-http-client";

/* Create an instance of the client */
const client = create("https://ipfs.infura.io:5001/api/v0");

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    filesCount: 0,
    files: [],
    buffer: null,
    type: null,
    name: null,
    loading: false,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = BlockStorage.networks[networkId];
      if (deployedNetwork) {
        const instance = new web3.eth.Contract(
          BlockStorage.abi,
          deployedNetwork && deployedNetwork.address
        );

        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        this.setState({ web3, accounts, contract: instance });

        // Get files amount
        const filesCount = await instance.methods.fileCount().call();
        this.setState({ filesCount });
        // Load files&sort by the newest
        for (var i = filesCount; i >= 1; i--) {
          const file = await instance.methods.files(i).call();
          this.setState({
            files: [...this.state.files, file],
          });
        }
      } else {
        this.setState({
          web3: "",
        });
        alert("App does not exeist on this network");
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  // Get file from user
  captureFile = (event) => {
    event.preventDefault();

    const file = event.target.files[0];
    const reader = new window.FileReader();

    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({
        buffer: Buffer(reader.result),
        type: file.type,
        name: file.name,
      });
      console.log("buffer", this.state.buffer);
    };
  };

  uploadFile = async (description) => {
    console.log("Submitting file to IPFS...");

    // upload the file
    const added = await client.add(this.state.buffer);

    this.setState({ loading: true });
    // Assign value for the file without extension
    if (this.state.type === "") {
      this.setState({ type: "none" });
    }
    this.state.contract.methods
      .uploadFile(
        added.path,
        added.size,
        this.state.type,
        this.state.name,
        description
      )
      .send({ from: this.state.accounts[0] })
      .on("transactionHash", (hash) => {
        this.setState({
          loading: false,
          type: null,
          name: null,
        });
        window.location.reload();
      })
      .on("error", (e) => {
        window.alert("Error");
        this.setState({ loading: false });
      });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    } else {
      return (
        <div className="App">
          <Navbar account={this.state.accounts[0]} />
          {this.state.loading ? (
            <div id="loader" className="text-center mt-5">
              <p>Loading...</p>
            </div>
          ) : (
            <Main
              files={this.state.files}
              captureFile={this.captureFile}
              uploadFile={this.uploadFile}
              account={this.state.accounts[0]}
            />
          )}
        </div>
      );
    }
  }
}

export default App;
