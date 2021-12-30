import Decentragram from "../contracts/Decentragram.json";
import React, { Component } from "react";
import Navbar from "./Navbar";
import Main from "./Main";
import Web3 from "web3";
import "./App.css";

//Declare IPFS
// const ipfsClient {create }= require("ipfs-http-client");
import { create } from "ipfs-http-client";
// ipfsClient({

// });

const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

// leaving out the arguments will default to these values

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
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    // Network ID
    const networkId = await web3.eth.net.getId();
    const networkData = Decentragram.networks[networkId];
    if (networkData) {
      const decentragram = new web3.eth.Contract(
        Decentragram.abi,
        networkData.address
      );
      this.setState({ decentragram });
      const imagesCount = await decentragram.methods.imageCount().call();
      this.setState({ imagesCount });

      const followersCount = await decentragram.methods
        .followersCount(accounts[0])
        .call();
      const followingCount = await decentragram.methods
        .followingCount(accounts[0])
        .call();

      let followers = [];
      let followings = [];
      for (var i = 0; i < followersCount; i++) {
        const follower = await decentragram.methods
          .followers(accounts[0], i)
          .call();

        followers.push(follower);
        this.setState({
          followers: followers,
        });
      }

      for (var i = 0; i < followingCount; i++) {
        const following = await decentragram.methods
          .following(accounts[0], i)
          .call();

        followings.push(following);

        this.setState({
          followings: followings,
        });
      }

      // Load images
      for (var i = 1; i <= imagesCount; i++) {
        const image = await decentragram.methods.images(i).call();

        let tips = [];

        const tipCount = await decentragram.methods.tipCount(i).call();

        for (var j = 0; j < tipCount; j++) {
          let tip = await decentragram.methods.tips(i, j).call();
          tips.push(tip);
          //this.setState({
          //   tips: [...this.state.tips, tip],
          // });
        }

        this.setState({
          images: [...this.state.images, image],
          tips: [...this.state.tips, tips],
          // tips: tips,
        });
      }
      // Sort images. Show highest tipped images first
      // this.setState({
      //   images: this.state.images.sort((a, b) => b.tipAmount - a.tipAmount),
      //   tips: this.state.tips.sort((a, b) => a.amount > b.amount),
      // });
      this.setState({ loading: false });
      console.log(this.state);
    } else {
      window.alert("Decentragram contract not deployed to detected network.");
    }
  }

  captureFile = async (event) => {
    console.log(this.state);
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
      console.log("buffer", this.state.buffer);
    };
  };

  // fetchBids() {}

  uploadImage = async (description, category) => {
    console.log(category);
    console.log("Submitting file to ipfs...");

    try {
      this.setState({ loading: true });
      let cid = await ipfs.add(this.state.buffer);

      console.log(cid);
      let txHash = await this.state.decentragram.methods
        .uploadImage(cid.path, description, category)
        .send({
          from: this.state.account,
        });

      console.log(txHash);

      this.setState({ loading: false });
    } catch (error) {
      console.log(error.message);
      this.setState({ loading: false });
    }
  };

  tipImageOwner(id, tipAmount) {
    this.setState({ loading: true });
    this.state.decentragram.methods
      .tipImageOwner(id)
      .send({ from: this.state.account, value: tipAmount })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  }

  follow = async (address) => {
    try {
      this.setState({ loading: true });

      let hash = await this.state.decentragram.methods
        .followSingle(address)
        .send({ from: this.state.account });

      console.log(hash);

      this.setState({ loading: true });
    } catch (error) {
      console.log(error.message);
    }
  };

  search = async (input, showSearch) => {
    try {
      let results = this.state.images.filter((i) => i.category == input);

      this.setState({
        showSearch: showSearch,
        searchResults: results,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      decentragram: null,
      images: [],
      tips: [],
      followers: [],
      followings: [],
      searchResults: null,
      loading: true,
      showSearch: false,
    };

    this.uploadImage = this.uploadImage.bind(this);
    this.tipImageOwner = this.tipImageOwner.bind(this);
    this.captureFile = this.captureFile.bind(this);
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} search={this.search} />
        {this.state.loading ? (
          <div id="loader" className="text-center mt-5">
            <p>Loading...</p>
          </div>
        ) : (
          <Main
            images={
              this.state.showSearch
                ? this.state.searchResults
                : this.state.images
            }
            tips={this.state.tips}
            captureFile={this.captureFile}
            uploadImage={this.uploadImage}
            tipImageOwner={this.tipImageOwner}
            follow={this.follow}
            followers={this.state.followers}
            followings={this.state.followings}
          />
        )}
      </div>
    );
  }
}

export default App;
