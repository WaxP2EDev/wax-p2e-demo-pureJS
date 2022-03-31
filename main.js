const collection = "skyedgegamex";
const schema = "soldiers";
const endpoint = "https://wax.greymass.com";
let wallet_userAccount = "";
let display_nft = false;
let loggedIn = false;
let Pool;
let assetsPool = [];
let assetsIDs;
const wax = new waxjs.WaxJS({
    rpcEndpoint: endpoint
});

main();
async function main() {

    if (loggedIn) {
        document.getElementById("login").style.visibility = "hidden";
        document.getElementById("logout").style.visibility = "visible";
        let assets = await GetAssets();
        if (assets.length != 0) PopulateData(assets);
        else document.getElementById('autologin').textContent = 'No assets to display !';

    } else {
        await autoLogin(); //checks if autologin is available 


    }
}

async function autoLogin() {
    let isAutoLoginAvailable = await wax.isAutoLoginAvailable();
    if (isAutoLoginAvailable) {
        loggedIn = true;
        await main();
    } else {
        document.getElementById('autologin').insertAdjacentHTML('beforeend', '');
    }
}

//normal login. Triggers a popup for non-whitelisted dapps
async function login() {

    try {
        //if autologged in, this simply returns the userAccount w/no popup
        if (!loggedIn) {
            wallet_userAccount = await wax.login();
            let pubKeys = wax.pubKeys;
            let str = 'Account: ' + wallet_userAccount + '<br/>Active: ' + pubKeys[0] + '<br/>Owner: ' + pubKeys[1]
            document.getElementById('loginresponse').insertAdjacentHTML('beforeend', str);
            loggedIn = true;
            await main();
        }
    } catch (e) {
        document.getElementById('loginresponse').append(e.message);
    }
}

async function sign() {
    if (!wax.api) {
        return document.getElementById('response').append('* Login first *');
    }
    try {
        const result = await wax.api.transact({
            actions: [{
                account: 'eosio.token',
                name: 'transfer',
                authorization: [{
                    actor: wallet_userAccount,
                    permission: 'active',
                }],
                data: {
                    from: wallet_userAccount,
                    to: 'eosio',
                    quantity: '0.00000001 WAX',
                    memo: '',
                },
            }]
        }, {
            blocksBehind: 3,
            expireSeconds: 30
        });
        document.getElementById('response').append(JSON.stringify(result, null, 2))
    } catch (e) {
        document.getElementById('response').append(e.message);
    }
}
async function GetAssets() {
    let results = [];
    var path = "atomicassets/v1/assets?collection_name=" + collection + "&owner=" + wallet_userAccount + "&page=1&limit=1000&order=desc&sort=asset_id";
    const response = await fetch("https://" + "wax.api.atomicassets.io/" + path, {
        headers: {
            "Content-Type": "text/plain"
        },
        method: "POST",
    });
    const body = await response.json();
    if (body.data.length != 0)
        results = body.data;
    return results;
}
const countdown = async () => {
    if(document.getElementById("selectNFT1") == undefined && document.getElementById("selectNFT2") == undefined && document.getElementById("selectNFT3") == undefined){
        alert("plz choose soliders");
        return;
    }
    let counter = 60;
    document.getElementsByClassName("content")[0].style.display = "none";
    
    document.getElementById("myTimerId").style.display = "none";
    document.getElementById("count_timer").style.display = "flex";
    let timerflag = setInterval(() => {
    document.getElementById("timer").innerHTML = counter;
    document.getElementsByClassName("soliders")[0].innerHTML = "";

    console.log(counter);
    counter--;
    if(counter < 0) {
        clearInterval(timerflag);
        document.getElementById("claim").style.display = "block";
        document.getElementById("count_timer").style.display = "none";
        document.getElementById("btn-back").style.display = "block";
        document.getElementsByClassName("soliders")[0].innerHTML = `<i class="fa fa-star-o" style="font-size:48px;color:yellow"></i> VICTORY`;
    }
    }, 1000);
}
const back = async () => {
    document.getElementsByClassName("content")[0].style.display = "flex";
    document.getElementById("myTimerId").disabled = true;
    document.getElementById("myTimerId").style.display = "block";
    document.getElementById("claim").style.display = "none";
    document.getElementById("btn-back").style.display = "none";
    document.getElementsByClassName("soliders")[0].innerHTML = `CHOOSE YOUR SOLIDERS`;
    document.getElementById("selectNFT1").style.removeProperty("background-image");
    document.getElementById("selectNFT2").style.removeProperty("background-image");
    document.getElementById("selectNFT3").style.removeProperty("background-image");

    
}
const PopulateData = async (assets) => {
    if (!display_nft) {
        var src = "https://ipfs.infura.io/ipfs/";
        for (const data of assets) {
            if(data.schema.schema_name != schema){
                continue;
            }
            var items = document.createElement('div');
            
            var div = document.createElement('div');
            div.id = "tablecontainer";
            items.className = "itemwrapper";

            img2 = document.createElement('BUTTON');
            let img_src = src + data.data.img;
            img2.className = 'nftimg';
            img2.style.backgroundImage = 'url(' + img_src + ')';
            items.appendChild(img2);
            let asset_id = data.asset_id;
            items.id = asset_id;

            img2.onclick = async function () {
                document.getElementById("myTimerId").disabled = false;
                closeModal()
                document.getElementById('' + Pool + '').style.backgroundImage = "url('" + img_src + "')";
                document.getElementById(asset_id).remove();

            };

            div.appendChild(items);
            document.getElementById("autologin").appendChild(items);
        }
        display_nft = true;
    }
}

const logout = async() => {
    document.getElementById("login").style.visibility = "visible";
    document.getElementById("logout").style.visibility = "hidden";
    document.getElementById('autologin').textContent = '';
    document.getElementById('loginresponse').textContent = '';
    loggedIn = false;
    display_nft = false;
    wallet_userAccount = "";
    let scrolldiv = document.getElementById('maindiv');
    if (scrolldiv.children.length > 0) {
        var child = scrolldiv.lastElementChild;
        while (child) {
          scrolldiv.removeChild(child);
          child = scrolldiv.lastElementChild;
        }
    }
}
window.openModal = function openModal(a) {
    
    if(!loggedIn){
        alert("plz login");
        return;
    }
    Pool = a.id;
    document.getElementById("extract-modal").style.display = "block";
    document.body.classList.add("modal-open");
  };
  
  window.closeModal = function closeModal() {
    document.getElementById("extract-modal").style.display = "none";
    document.body.classList.remove("modal-open");
  };