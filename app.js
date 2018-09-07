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

processResponse = (responseData) => {
  this.rawData = [];
  this.cleanedData = {};
  console.log("Matching filter = " + responseData.filtered +" , Returned = " + responseData.items.length);
  this.rawData.push(...responseData.items);
  console.log(this.rawData.length);

  this.rawData.forEach((prospie) => {
    Object.assign(this.cleanedData, { [prospie.item_id] : {"link":prospie.link} });
    prospie.fields.forEach((field) => {
      key = field.external_id;
      if (field.type === "category" && !field.config.settings.multiple) {
        value = field.values[0].value.text;
      } else if (field.type === "category" && field.config.settings.multiple) {
        n = field.values.length;
        value = "";
        for (i = 0; i < n; i++) {
          value += field.values[i].value.text + ", "
        };
        } else if (field.type === "contact") {
            value = field.values[0].value.name;
          } else if (field.type === "app" && !field.config.settings.multiple) {
              value = field.values[0].value.title;
            } else if (field.type === "app" && field.config.settings.multiple) {
                n = field.values.length;
                value = "";
                for (i = 0; i < n; i++) {
                  value += field.values[i].value.title + ", "
                };
              } else if (field.type === "location") {
                  value = field.values[0].formatted;
                } else if (field.type === "date") {
                    value = field.values[0].start_date;
                  } else if ((!field.values.length) || (field.type === "image")) {
                    value = "NA";
                  } else value = field.values[0].value
        Object.assign(this.cleanedData[prospie.item_id],{[key]:value});
    });
  });

  return this.cleanedData
}

podio.authenticateWithApp(appId, appToken, (err) => {
  this.results = {};
  if (err) throw new Error(err);

  podio.isAuthenticated().then(() => {
    podio.request('POST', '/item/app/' + appId + '/filter/' + viewId, {"limit":500,"offset":0,"sort_by":"created_on"})
    .then((responseData) => {
      Object.assign(this.results, processResponse(responseData));
      return podio.request('POST', '/item/app/' + appId + '/filter/' + viewId, {"limit":500,"offset":500,"sort_by":"created_on"})
  }).then((responseData) => {
      Object.assign(this.results, processResponse(responseData));
      return podio.request('POST', '/item/app/' + appId + '/filter/' + viewId, {"limit":500,"offset":1000,"sort_by":"created_on"})
  }).then((responseData) => {
      Object.assign(this.results, processResponse(responseData));
      console.log(Object.keys(this.results).length);
      fs.writeFile("srtfetch.json", JSON.stringify(this.results), (err) => {
        if (err) throw err;
        console.log("File Written");
      });
    });     
  });
});