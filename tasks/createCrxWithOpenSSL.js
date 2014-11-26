/* jshint latedef:nofunc */
//http://nodejs.org/api/crypto.html#crypto_crypto_createsign_algorithm
//expected public key (p1): 21811304098396955093476276475851680289902128178489310780048306283127745420858178342264588828397773991051359115815803168418001260092272009537616882702475081150433933049448736111657064854557509901036573355734266974880314861925913913086756840190822114814023273167195233867957478212998587036638304021554375351782679168666217644210415683720620334501579300443712736172273255726260243038004422995294265919921347644923392373173475908575649394422594109092430814318597799403029484965043796575540200832693324758859021490655345616882635810428183104497854348708091101228287501292621474794398930691987697449888116070082783242927491
//expected public key (p2): 65537

module.exports = function() {
  var fs = require('fs'), childProcess = require("child_process"), crypto = require("crypto");

  this.generateCrxFileWithBadDefaults = function() {
    var zipFileName, outputFileName, pemFileName;

    zipFileName = 'archive.zip';
    outputFileName = 'archive.crx';
    pemFileName = 'scripts/dummy-chromium.pem';

    this.generateCrxFile(zipFileName, outputFileName, pemFileName);
  };

  this.generateCrxFile = function(zipFileName, outputFileName, pemFileName) {
    var pem, privateKey;
    console.log(" * zipFileName: " + zipFileName);
    console.log(" * outputFileName: " + outputFileName);
    console.log(" * pemFileName: " + pemFileName);
    pem = fs.readFileSync(pemFileName);
    privateKey = pem.toString('ascii').trim();

    generateSignature(privateKey, zipFileName, function(signatureBuffer) {
      generatePublicKey(privateKey, function(publicKey) {
        generatePackage(signatureBuffer, publicKey, zipFileName, outputFileName);
      });
    });
  };

    function toHexaString(thing) {
      var result = '',i;
      for (i = 0; i < thing.length; i++) {
        result = result + thing[i].toString(16) + ',';
      }
      return result;
    }

    function removePEMHeaderAndFooter(pem) {
      var result, lines = pem.split('\n');
      lines = lines.slice(1, lines.length-1);
      lines.forEach(function(part, index, theArray) {
        theArray[index] = part.trim();
      });
      result = lines.join('');
      return result;
    }

    /**
     * @param privateKey - pem encoded private key (e.g. base64 encoded + begin/end private key lines)
     * @param cb - the function must accept one parametner - public key cb(publicKey);
     */
    function generatePublicKey(privateKey, cb) {
      var publicKey, rsa, spawn;

      spawn = childProcess.spawn;
      rsa = spawn("openssl", ["rsa", "-pubout", "-outform", "DER"]);

     rsa.stdout.on("data", function(data) {
        publicKey = data;
        if (cb) {
          cb.call(this, publicKey);
        }
      }.bind(this));

      rsa.stdin.end(privateKey);
    }

    function generatePackage(signature, publicKey, zipFileName, outputFileName, doneCallback) {
      var zipStream, outStream, keyLength = publicKey.length, sigLength = signature.length,
        length = 16 + keyLength + sigLength, crx;

      //console.log("signature" + toHexaString(signature));
      crx = new Buffer(length);
      crx.write("Cr24" + (new Array(13)).join("\x00"), "binary");
      crx[4] = 2;
      crx.writeUInt32LE(keyLength, 8);
      crx.writeUInt32LE(sigLength, 12);

      zipStream = fs.createReadStream(zipFileName, {
        flags: "r",
        encoding: null,
        fd: null,
        mode: 0666,
        bufferSize: 64*1024
      });
      zipStream.on('error', function(err) {
        console.log('Can not read ' + zipFileName);
        throw err;
      });

      outStream = fs.createWriteStream(outputFileName, {
        flags: "w",
        encoding: null,
        mode: 0666
      });

      outStream.on('error', function(err) {
        console.log('Can not write into ' + outputFileName);
        throw err;
      });

      var onDone = function() {
        if (doneCallback) {
          doneCallback.call(this);
        }
      };
      zipStream.on("end", onDone);

      outStream.write(crx, function() {
        outStream.write(publicKey, function() {
          outStream.write(signature, function() {
            zipStream.pipe(outStream, { end: false });
          });
        });
      });
    }

    /**
     *
     * @param privateKey
     * @param zipFileName
     * @param callback - must accept one parametner - binary buffer with generated signature
     */
    function generateSignature(privateKey, zipFileName, callback) {
      var signObj, inStream, onDone;

      onDone = function() {
        var signatureBuffer = signObj.sign(privateKey);
        if (callback){
          callback.call(this, signatureBuffer);
        }
      };

      inStream = fs.createReadStream(zipFileName, {
        flags: "r",
        encoding: null,
        fd: null,
        mode: 0666,
        bufferSize: 64*1024
      });
      inStream.on("end", onDone);
      signObj = crypto.createSign("sha1");
      //this will call the onDone method
      inStream.pipe(signObj);
    }

};