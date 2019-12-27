var express = require('express');
//var app = express();
var fs = require('fs')
let mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectID;
var sys = require('util')
var exec = require('child_process').exec;
var MongoClient = require('mongodb').MongoClient
var randomstring = require("randomstring");


let pubKeySchema = mongoose.Schema({
  chatid: String,
  pubkeyhexstr: String
},
  { collection: 'public_keys' })
let pubkeys = mongoose.model('PublicKeys', pubKeySchema)

let messageSchema = mongoose.Schema({
  toid: String,
  encmessagehexstr: String,
  fromid: String
},
  { collection: 'messages' })
let messages = mongoose.model('Messages', messageSchema)

let tokenSchema = mongoose.Schema({
  chatid: String,
  token: String
},
  { collection: 'tokens' })
let tokens = mongoose.model('Tokens', tokenSchema)



var Db = require('mongodb').Db
var Server = require('mongodb').Server

var url = "mongodb://localhost:27017/chatdb";


function mongoWrapper(funct_to_pass) {
  MongoClient.connect(url, { useUnifiedTopology: true }, funct_to_pass);
}



mongoWrapper(function (err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

mongoWrapper(function (err, db) {
  if (err) throw err;
  var dbo = db.db("chatdb");

  dbo.createCollection("public_keys", function (err, res) {
    if (err) throw err;
    console.log("public_keys collection created");
    db.close();
  });
});

mongoWrapper(function (err, db) {
  if (err) throw err;
  var dbo = db.db("chatdb");
  dbo.createCollection("messages", function (err, res) {
    if (err) throw err;
    console.log("messages collection created!");
    db.close();
  });
});

mongoWrapper(function (err, db) {
  if (err) throw err;
  var dbo = db.db("chatdb");
  dbo.createCollection("tokens", function (err, res) {
    if (err) throw err;
    console.log("tokens collection created!");
    db.close();
  });
});



function pullAllPubKeys(res) {


  mongoWrapper(function (err, db) {
    if (err) throw err;
    var dbo = db.db("chatdb");
    dbo.collection("public_keys").find({}, { projection: { _id: 0, chatid: 1, pubkeyhexstr: 1 } }).toArray(function (err, result) {
      if (err) throw err;
      console.log("pub keys being pulled");

      res.send(result);
      db.close();
    });
  });
}

function pullAllMessagesForUser(res, user) {


  mongoWrapper(function (err, db) {
    if (err) throw err;
    var dbo = db.db("chatdb");
    dbo.collection("messages").find({ toid: user },
      { projection: { _id: 0, toid: 1, fromid: 1, encmessagehexstr: 1 } }).toArray(function (err, result) {
        if (err) throw err;
        console.log("pulling messages for " + user);

        res.send(result);
        db.close();
      });
  });
}


//stole these shamelessly from https://steveridout.github.io/mongo-object-time/
function getDateFromObjID(objectId) {
  return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
}

function getObjectIdStrFromDate(date) {
  return Math.floor(date.getTime() / 1000).toString(16) + "0000000000000000";
}


function pullAllMessagesForUserAfterTimeStamp(res, user, timeInMillis) {


  mongoWrapper(function (err, db) {
    if (err) throw err;
    var dbo = db.db("chatdb");
    dbo.collection("messages").find({ toid: user },
      { projection: { _id: 1, toid: 1, fromid: 1, encmessagehexstr: 1 } }).toArray(function (err, result) {
        if (err) throw err;
        output = []

        for (var ii = 0; ii < result.length; ii++) {
          if (getDateFromObjID(result[ii]["_id"] + '').getTime() > timeInMillis) {
            var itemtoadd = new Object();
            itemtoadd.toid = result[ii]["toid"];
            itemtoadd.fromid = result[ii]["fromid"];
            itemtoadd.encmessagehexstr = result[ii]["encmessagehexstr"];
            output.push(itemtoadd)
          }
        }

        console.log("pulling messages after " + timeInMillis.toString() + " for " + user);

        res.send(output);
        db.close();
      });
  });
}

function addMessage(tochatid, fromchatid, message, restouser) {
  mongoWrapper(function (err, db) {
    if (err) throw err;
    var dbo = db.db("chatdb");
    var messageObj = { toid: tochatid, fromid: fromchatid, encmessagehexstr: message };

    dbo.collection("messages").insertOne(messageObj, function (err, res) {
      if (err) {
        throw err;
        res.send("fail")
      }
      console.log("Message being added from " + fromchatid + " to " + tochatid);
      restouser.send("success")
      db.close();
    });

  });

}


var isTaken = false;

function seeIfChatIDIsTaken(chatidtopub, keystr, response) {

  return mongoWrapper(function (err, db) {
    if (err) throw err;
    var dbo = db.db("chatdb");
    //var pubKeyObj = { chatid: chatidtopub, pubkeyhexstr: keystringtopub };

    return dbo.collection("public_keys").find({ chatid: chatidtopub }, { projection: { _id: 0, chatid: 1, pubkeyhexstr: 1 } }).toArray(function (err, result) {
      if (err) {
        throw err;
      }
      if (result.length > 0) {
        console.log("id taken for " + chatidtopub);
        response.send("fail:chatidtaken")

        db.close();
      }
      else {
        console.log("Pubkey being added for " + chatidtopub);

        publishPubKey(chatidtopub, keystr, response)

        db.close();

      }
    }

    );
  }
  );
}

function publishPubKey(chatidtopub, keystringtopub, restouser) {

  mongoWrapper(function (err, db) {
    if (err) throw err;
    var dbo = db.db("chatdb");
    var pubKeyObj = { chatid: chatidtopub, pubkeyhexstr: keystringtopub };



    dbo.collection("public_keys").insertOne(pubKeyObj, function (err, restouser) {
      if (err) {
        throw err;
        res.send("fail:database_error")
      }
      console.log("Pubkey being added for " + chatidtopub);

      setTokenForIdToBePassedIn(chatidtopub, keystringtopub, restouser);
      //restouser.send("success");
      db.close();
    });
  }
  );
}


function getPubkeyForUser(user) {
  console.log("about to pull keys for user");

  var outputKey = "";

  mongoWrapper(function (err, db) {
    if (err) throw err;
    var dbo = db.db("chatdb");
    dbo.collection("public_keys").find({ chatid: user }).toArray(function (err, result) {
      if (err) throw err;
      console.log("pub keys being pulled for " + user + " with the following result\n" + result[0].pubkeyhexstr);
      console.log("the result of result.length is\n" + result.length);

      if (result.length > 0) {

        console.log("lets see if you see this\n");
        outputKey = String(result[0].pubkeyhexstr);
        return String(result[0].pubkeyhexstr);


      }
      db.close();
    });
  });

  console.log("you shouldnt see this\n" + outputKey);
  return outputKey;
}



function getTokenForUser(user) {

  var outputToken = "";

  mongoWrapper(function (err, db) {
    if (err) throw err;
    var dbo = db.db("chatdb");
    dbo.collection("tokens").find({ chatid: user }, { projection: { _id: 0, chatid: 0 } }).toArray(function (err, result) {
      if (err) throw err;
      console.log("pub keys being pulled");

      if (result.length > 0)
        outputToken = result[0].token;
      db.close();
    });
  });

  return outputToken;
}


function seeIfTokenIsGoodForUserThenExecuteFunction(user, token_passed_in_by_user, funct_to_pass, response) {

  mongoWrapper(function (err, db) {
    if (err) throw err;
    var dbo = db.db("chatdb");
    dbo.collection("tokens").find({ chatid: user }, { projection: { _id: 0, chatid: 0 } }).toArray(function (err, result) {
      if (err) throw err;

      if (result.length > 0) {
        if (token_passed_in_by_user == result[0].token) {
          console.log("token found and matched running passed in function");
          funct_to_pass();
        }
        else {
          console.log("token found but it did not match");
          response.send("fail:token_incorrect");
        }
      }
      else {
        console.log("token was not found");
        response.send("fail:token_not_found_for_user");
      }
      db.close();
    });
  });

}


function lookupPubKeyForUserThenPassPubKeyToFunctionInArgs(user, funct_to_pass, response) {

  mongoWrapper(function (err, db) {
    if (err) throw err;
    var dbo = db.db("chatdb");
    dbo.collection("public_keys").find({ chatid: user }).toArray(function (err, result) {
      if (err) throw err;

      if (result.length > 0) {

        console.log("about to pass the public key to the fuction\nHere is the key\n" + result[0].pubkeyhexstr);
        funct_to_pass(result[0].pubkeyhexstr);
      }
      else {
        response.send("fail:public_key_not_found");
      }
      db.close();
    });
  });
}


function setTokenForIdToBePassedIn(chatIdForNewToken, keyForUser, res) {


  var newTokenStr = randomstring.generate({length: 24, charset: 'alphabetic', capitalization: 'uppercase'});

var sender = res;

  mongoWrapper(function (err, db) {
    if (err) throw err;
    var dbo = db.db("chatdb");
    var newToken = { chatid: chatIdForNewToken, token: newTokenStr };

    // executes the cryptoworker jar to encrypt the token
    //console.log("about to run java -jar /home/ubuntu/crypto/cryptoWorker.jar -e " + keyForUser + " " + newTokenStr);
    child = exec("java -jar /home/ubuntu/crypto/cryptoWorker.jar -e " + keyForUser + " " + newTokenStr,
      function (error, stdout, stderr, sender) {

        dbo.collection("tokens").insertOne(newToken, function (err, result) {
          if (err) {

            console.log("error on unserting the new token for "+ chatIdForNewToken);

            sender.send("fail:database_error");

          }
          else {
            //console.log("about to return" + "good:" + stdout);
            sender.send("good:" + stdout);
          }
          db.close();
        });
      });

  });

}






function setTokenForId(chatIdForNewToken, restouser) {


  var newTokenStr = randomstring.generate({
    length: 24,
    charset: 'alphabetic',
    capitalization: 'uppercase'
  });



  var keyForUser = getPubkeyForUser(chatIdForNewToken);
  console.log("\n\nthe key for my user is " + keyForUser);

  console.log("the key for my user is " + keyForUser);


  var output = "test";


  mongoWrapper(function (err, db) {
    if (err) throw err;
    var dbo = db.db("chatdb");
    var newToken = { chatid: chatIdForNewToken, token: newTokenStr };

    // executes the cryptoworker jar to encrypt the token
    console.log("about to run java -jar /home/ubuntu/crypto/cryptoWorker.jar -e " + keyForUser + " " + newTokenStr);
    child = exec("java -jar /home/ubuntu/crypto/cryptoWorker.jar -e " + keyForUser + " " + newTokenStr,
      function (error, stdout, stderr) {

        dbo.collection("tokens").insertOne(newToken, function (err, res) {
          if (err) {

            // res.send("fail");
            db.close();

            output = "fail:database_error";
          }
          else {
            console.log("token " + newTokenStr + " made for " + chatIdForNewToken);
            db.close();
            console.log("about to return" + "good:" + stdout);
            output = "good:" + stdout;
            return "good:" + stdout;
          }
        });
      });


  });

  console.log("about to return output with " + output);


  return output;

}


function changeusername(oldname, newname) {

  mongoWrapper(function (err, db) {
    if (err) throw err;
    var dbo = db.db("chatdb");

    var myquery = { chatid: oldname };
    var newvalues = { $set: { chatid: newname } };
    dbo.collection("public_keys").updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
    });

    dbo.collection("tokens").updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      db.close();

    });
  });

}



var app = express()


app.get('/', function (req, res) {
  res.send("looks like it works");
});



app.get('/pubkeys', function (req, res) {
  pullAllPubKeys(res)
});

app.get('/messages/:chatid', function (req, res) {
  var chatIdToCheck = req.params.chatid;
  pullAllMessagesForUser(res, chatIdToCheck)
});

app.get('/messagesaftertime/:chatid/:time', function (req, res) {
  var chatIdToCheck = req.params.chatid;
  var timeinmillisecs = parseInt(req.params.time)

  if (timeinmillisecs < 1700000000) { res.send('[]') }
  else {
    console.log("checking for all messages for " + chatIdToCheck + " after time " + timeinmillisecs);
    pullAllMessagesForUserAfterTimeStamp(res, chatIdToCheck, timeinmillisecs)
  }

});

app.get('/sendmessage/:tochatid/:fromchatid/:messagetosend', function (req, res) {
  var sender = req.params.fromchatid;
  var getter = req.params.tochatid;
  var mes = req.params.messagetosend;
  addMessage(getter, sender, mes, res)
});

app.get('/publishpubkey/:chatid/:pubkeystring', function (req, res) {
  var chatidtopub = req.params.chatid;
  var keystringtopub = req.params.pubkeystring;
  seeIfChatIDIsTaken(chatidtopub, keystringtopub, res)
});


app.get('/gettoken/:chatid', function (req, res) {
  var chatidtomaketokenfor = req.params.chatid;
  //var touser = setTokenForId(chatidtomaketokenfor, res);

  lookupPubKeyForUserThenPassPubKeyToFunctionInArgs(chatidtomaketokenfor,
    function (public_key) { setTokenForIdToBePassedIn(chatidtomaketokenfor, public_key, res); },
    res);

  //res.send(touser);

});

app.get('/changechatid/:oldchatid/:newchatid/:token', function (req, res) {
  var oldchatid = req.params.oldchatid;
  var newchatid = req.params.newchatid;
  var token = req.params.token;

  seeIfTokenIsGoodForUserThenExecuteFunction(oldchatid, token,changeusername(oldchatid, newchatid), res);

  //if (token == getTokenForUser(olchatid)) {
  //  changeusername(oldchatid, newchatid);
  //  res.send('chatid changed');
  //}
  //else {
  //  res.send('token failed');
  //}

});


app.get('/version', function (req, res) {
  res.send('0.2');
});


app.get('*', function (req, res) {

  res.send('<!DOCTYPE html> <html> <head><title>404</title></head><body><h2>404 - The Page can\'t be found</h2></body></html>');

  //res.status(404).render('404.jade');
});

app.listen(8080, '172.31.38.12');
