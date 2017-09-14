(function(win){
	"use strict";
	
	win.UKPM = function($client_key, $client_secret, server_url){
		
		if(typeof server_url == "undefined"){ server_url = "https://ukpm_api.intortuscs.co.uk/"; }
		
		var decryptor = new JSEncrypt();
		
		var iv, Key;
				
		var secret = "-----BEGIN RSA PRIVATE KEY-----\r\n";
		secret += $client_secret.replace(/\\s/g, "\r\n");
		secret += "\r\n-----END RSA PRIVATE KEY-----";
				
		decryptor.setPrivateKey(secret);
		
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
				pairs.push(encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop]));
			}
			return pairs.join('&');
		}
		
		function hex2a(hex) {
			var str = '';
			for (var i = 0; i < hex.length; i += 2)
				str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
			return str;
		}
		
		var getEncryptionKey = function(){
			var formData = new FormData();
			formData.append("client_key", $client_key);
			
			fetch("https://ukpm_api.intortuscs.co.uk/test/createKey", {
				method		: 'POST',
				mode		: 'cors',
				body		: formData
			}).then(function(response){
				return response.json();
			}).then(function(data){
				console.log({"iv_b64":data.key.iv, "key_b64":data.key.secret});
				console.log({"iv_js":atob(data.key.iv), "key_js":atob(data.key.secret)});
				console.log({"iv_js_d":decryptor.decrypt(atob(data.key.iv)), "key_js_d":decryptor.decrypt(atob(data.key.secret))});
				console.log({"iv_crypt":CryptoJS.enc.Base64.parse(data.key.iv), "key_crypt":CryptoJS.enc.Base64.parse(data.key.secret)});
				console.log({"iv_crypt_d":decryptor.decrypt(CryptoJS.enc.Base64.parse(data.key.iv)), "key_crypt_d":decryptor.decrypt(CryptoJS.enc.Base64.parse(data.key.secret))});
			}).catch(function(ex){
				throw ex;
			});
		}
		
		getEncryptionKey();
				
		var decrypt = function UKPM_Decrypt(enc){
			return new Promise(function(resolve, reject) {
				var raw = decryptor.decrypt(enc);
				resolve(raw);
			});
		};
		
		this.post = function(url, params){
			var formData = new FormData();
			for(var index in params){
				formData.append(index, params[index]);
			}
			return new Promise(function(resolve, reject){
				fetch(server_url+url, {
					method		: 'POST',
					mode		: 'cors',
					body		:  formData
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