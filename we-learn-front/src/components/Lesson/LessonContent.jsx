import React from 'react';
import './LessonContent.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_REACT_URL

export default class LessonContent extends React.Component {
  constructor(props) {
    super();
    this.state = { 
      lessonInfos: [],
    };
  }

  async componentDidMount() {
    var wallet = "";
    var tab = window.location.href.split('/');
    wallet = await connect()
    await axios({
        method: 'post',
        url: API + '/get_formation',
        headers: {}, 
        data: {
          wallet: wallet,
          formation_id: tab[tab.length - 1],
        }
      }).then((res) => {
        this.setState({ lessonInfos: res.data })
      });
      console.log(this.state.lessonInfos);
  }

  testfunction = (wallet_creator) => {
    var contractAddress = "0xb622d957Feb979b1E70D5e797C3A0eeE13BD5202";
    var targetAddress = wallet_creator;
    var contractAbiFragment = [
      {
          "name" : "transfer",
          "type" : "function",
          "inputs" : [
            {
                "name" : "_to",
                "type" : "address"
            },
            {
                "type" : "uint256",
                "name" : "_tokens"
            }
          ],
          "constant" : false,
          "outputs" : [],
          "payable" : false
      }
    ];

    const provider = new ethers.providers.Web3Provider(web3.currentProvider);
    const signer = provider.getSigner();
    var contract = new ethers.Contract(contractAddress, contractAbiFragment, signer);
    var numberOfDecimals = 18;
    var numberOfTokens = ethers.utils.parseUnits('1.0', numberOfDecimals);
    contract.transfer(targetAddress, numberOfTokens).then(function(tx) {
        console.log(tx);
    });
  }

  render() {
    if (this.state.lessonInfos.bought == false) {
      return (
        <div class="article">
          <h1 class="article-title">You need to buy this formation to see it !</h1>
          <div class="buy-div">
            <p class="article-buy">{this.state.lessonInfos.formation_name}</p>
            <p class="article-buy2">{this.state.lessonInfos.price} LRN</p>
          </div>
          <button class="button-metamask buy">
            Buy Formation
          </button>
      </div>
    )
    } else {
      return (
        <div class="article">
      <h1 class="article-title">{this.state.lessonInfos.formation_name}</h1>
        <img class="article-img" src="https://static.vecteezy.com/system/resources/thumbnails/001/782/780/small/light-purple-pink-gradient-blur-backdrop-vector.jpg"></img>
        <p class="article-content">{this.state.lessonInfos.content}</p>
      </div>
    )
  }
  }
}