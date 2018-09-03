const Podio = require('podio-js').api;
const fs = require('fs');

// Example config file where you might store your credentials
const config = require('./config.js')

// get the API id/secret
const clientId = config.clientId;
const clientSecret = config.clientSecret;

// get the app ID and Token for appAuthentication
const appId = config.appId;
const appToken = config.appToken;
const viewId = config.viewId;

// instantiate the SDK
const podio = new Podio({
  authType: 'app',
  clientId: clientId,
  clientSecret: clientSecret
});
results = {}
results.rawData = [];

podio.authenticateWithApp(appId, appToken, (err) => {

  if (err) throw new Error(err);

  podio.isAuthenticated().then(() => {

    podio.request('POST', '/item/app/' + appId + '/filter/' + viewId, {"limit":500,"offset":500}).then((responseData) => {
      console.log("Matching filter = " + responseData.filtered +" , Returned = " + responseData.items.length);

      results.rawData.push(...responseData.items);
      console.log(results.rawData.length);
    });

    podio.request('POST', '/item/app/' + appId + '/filter/' + viewId, {"limit":500,"offset":0}).then((responseData) => {
      console.log("Matching filter = " + responseData.filtered +" , Returned = " + responseData.items.length);
        
      results.rawData.push(...responseData.items);
      console.log(results.rawData.length);

      results.cleanedData = {};

      for(const prospie of results.rawData) {
        Object.assign(results.cleanedData, {prospie.item_id: {
          
        }}
          
        })
      }



      fs.writeFile("srtfetch.json", JSON.stringify(results.rawData), (err) => {
        if (err) throw err;
        console.log("File Written");
      });
    });

    

  }).catch(err => console.log(err));

});


