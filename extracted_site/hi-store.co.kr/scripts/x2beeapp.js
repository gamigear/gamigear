/*
    hybridapp web to app interface script by directionsoft.
*/
/* eslint-disable */
const isMobile = {
    Android: function() {
        return (/android/i.test(navigator.userAgent));
    },
    iOS: function() {
        return (/iPad|iPhone|iPod/i.test(navigator.userAgent) && !window.MSStream);
    },
    App: function() {
        return (/x2beeapp/i.test(navigator.userAgent));
    }
}
const x2beeapp = {
    data: {}
    , web2app:function(groupname, funcname, args) {
        let dict = {}
        dict["group"] = groupname;
        dict["function"] = funcname;
        dict["args"] = args;

        if (isMobile.App() && isMobile.Android()) {
            window.AppInterface.postMessage(JSON.stringify(dict));
        }
        else if (isMobile.App() && isMobile.iOS()) {
            webkit.messageHandlers.AppInterface.postMessage(dict);
        }
    }
    , setData:function(scriptname, data) {
        x2beeapp.data[scriptname] = data;
    }
    , getData:function(scriptname, iskeep) {
        const temp = x2beeapp.data[scriptname];
        if(!iskeep) delete x2beeapp.data[scriptname];
        return temp;
    }
}


/*
    hybridapp app to web callback function as args.script.
*/
function cameraPermission(isPermit) {
    x2beeapp.setData('cameraPermission', isPermit);
}

function bioLogin(isSuccess) {
  x2beeapp.setData('bioLogin', isSuccess);
  window.postMessage({
    functionName: 'bioLogin',
    data: isSuccess
  })
}

function bioSuccess(isSuccess) {
  x2beeapp.setData('bioSuccess', isSuccess);
  window.postMessage({
    functionName: 'bioSuccess',
    data: isSuccess
  })
}
