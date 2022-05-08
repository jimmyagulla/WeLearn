const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 8080;
const axios = require('axios').default;

require('dotenv').config()

const knex = require('knex')({
    client: 'mysql',
    connection: {
        host     : process.env.host,
        user     : process.env.db_user,
        password : process.env.db_password,
        database : process.env.db_name
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/create-formation", async (req, res) => {
    
    formation_name = req.body.formation_name
    wallet = req.body.wallet

    if (!formation_name || !wallet) {
        res.status(400).json({
            message: "Missing parameters"
        });
    }

    const http = axios.create({ baseURL: "https://api.starton.io/v2", headers: {"x-api-key": 'BCyavFNFISpxz6F2QYvFFkjOHAsg2w0X',},})

    let keyScRes = await http.post('/smart-contract/from-template', {
        network: "binance-testnet",
        signerWallet: "0x22D901E22203673903263E363062e6759E0632C8",
        templateId: "sct_d4c1d5f2ed6f44d185bfb60eee2dbcaf",
        name: formation_name + " - Key",
        description: "Nft mintor for " + formation_name,
        params: [
            "Test",
            "ipfs://ipfs/",
            "QmYLR4ATgcf7wyNsqKty5yoWXQKXNXL1oqfEvSemYAcAb2",
            "0x22D901E22203673903263E363062e6759E0632C8"
        ],
        speed: "fast"
    }).catch(err => {
        console.log(err)
    });

    let certifScRes = await http.post('/smart-contract/from-template', {
        network: "binance-testnet",
        signerWallet: "0x22D901E22203673903263E363062e6759E0632C8",
        templateId: "sct_d4c1d5f2ed6f44d185bfb60eee2dbcaf",
        name: formation_name + " - Certificate",
        description: "Nft certificate for " + formation_name,
        params: [
            "Test",
            "ipfs://ipfs/",
            "QmYLR4ATgcf7wyNsqKty5yoWXQKXNXL1oqfEvSemYAcAb2",
            "0x22D901E22203673903263E363062e6759E0632C8"
        ],
        speed: "fast"
    }).catch(err => {
        console.log(err)
    });

    nft_contract = keyScRes.data.smartContract.address
    ntt_contract = certifScRes.data.smartContract.address

    knex('formation').insert({
        name: formation_name,
        wallet_creator: wallet,
        nft_contract: nft_contract,
        ntt_contract: ntt_contract
    }).then(() => {
        res.send("Formation created")
    }).catch((err) => {
        res.send(err)
    });

    async function mintNft(receiverAddress, metadataCid) {
        const nft = await starton.post(`/smart-contract/binance-testnet/${nft_contract}/call`,
    {
        functionName: "mint",
        signerWallet: wallet,
        speed: "low",
        params: [
            receiverAddress, metadataCid
        ],
    });
        return nft.data;
    }

});

app.get('/wallet_info', async (req, res) => {
    wallet = req.body.wallet
    if (!wallet) {
        res.status(400).json({
            message: "Missing parameters"
        });
    }
    const http = axios.create({ baseURL: "https://api.starton.io/v2", headers: {"x-api-key": 'BCyavFNFISpxz6F2QYvFFkjOHAsg2w0X',},})
    let scRes = await http.post('/smart-contract/binance-testnet/0xb622d957Feb979b1E70D5e797C3A0eeE13BD5202/read',
    {
        "functionName": 'balanceOf',
        "params": [wallet],
    })
    let bnbRes = await http.get(`/wallet/${wallet}/binance-testnet/balance`)
    lrn = parseFloat(scRes.data.response.raw / (10**18)).toFixed(3)
    bnb = parseFloat(bnbRes.data.balance.raw / (10**18)).toFixed(3)
    res.send({bnb: bnb.toString(), lrn: lrn.toString()})
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
