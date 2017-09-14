(function(win){
	"use strict";
	
	win.UKPM = function($client_key, $client_secret, server_url){
		
		if(typeof server_url == "undefined"){ server_url = "https://ukpm_api.intortuscs.co.uk/"; }
		
		var encryptor = new JSEncrypt();
		var decryptor = new JSEncrypt();
				
		this.key = "-----BEGIN PUBLIC KEY-----\r\n";
		this.key += $client_key.replace(/\\s/g, "\r\n");
		this.key += "\r\n-----END PUBLIC KEY-----";

		var secret = "-----BEGIN RSA PRIVATE KEY-----\r\n";
		secret += $client_secret.replace(/\\s/g, "\r\n");
		secret += "\r\n-----END RSA PRIVATE KEY-----";
		
		this.serverAddress = "";
				
		encryptor.setPublicKey(this.key, "010001");
		decryptor.setPrivateKey(this.secret, "010001");
		
		var serialiseObject = function(obj) {
			var pairs = [];
			for (var prop in obj) {
				if (!obj.hasOwnProperty(prop)) {
					continue;
				}
				if (Object.prototype.toString.call(obj[prop]) == '[object Object]') {
					pairs.push(serialiseObject(obj[prop]));
					continue;
				}
				pairs.push(prop + '=' + obj[prop]);
			}
			return pairs.join('&');
		}
		
		
		var encrypt = function UKPM_Encrypt(raw){
			return new Promise(function(resolve, reject) {
				var enc = encryptor.encrypt(raw);
				resolve(enc);
			});
		};
				
		var decrypt = function UKPM_Decrypt(enc){
			return new Promise(function(resolve, reject) {
				var raw = decryptor.decrypt(enc);
				resolve(JSON.parse(raw));
			});
		};
		
		this.post = function(url, params){
			if(typeof params === "undefined"){ params = {}; }
			params.pub = $client_key;
			return new Promise(function(resolve, reject){
				fetch(server_url+url, {
					method		: 'POST',
					mode		: 'cors',
					body		: serialiseObject(params)
				}).then(function(response){
					if(response.ok){
						return response.text();
					}else{
						reject(response);
					}
				}).then(function(text){
					var resp;
					
					try{
						resp = JSON.parse(text);
						if(resp.responseType === "failure"){
							reject(resp);
						}else if(resp.responseType === "success"){
							resolve(resp);
						}else{
							reject({"responseType":"failure", "error":"invailid JSON object", "error_number":5002, "detailed_error":"the object returned from the server does not contain a valid answer for 'responseType'"});
						}
					}catch(err){
						reject({"responseType":"failure", "error":"malformed JSON object", "error_number":5001, "detailed_error":"the object returned from the server is not a valid JSON object"});
					}
					
				}).catch(function(ex){
					reject(ex)
				});
			});
		}
	};
	
})(window);