(function(win){
	"use strict";
	
	win.UKPM = function($client_key, $client_secret, hostname){
		let self = this;
		let server_host = "api.ukpolicememorial.org";
		let publicKey = $client_key;
		let secretKey = $client_secret;
		
		if(typeof hostname !== "undefined"){
			server_host = hostname;
		}
		
		function decryptMessage(encrypted){
			return new Promise(function(resolve, reject){
				let hex = encrypted.split("h");
				let n = sodium.from_hex(hex[0]);
				let msg = sodium.from_hex(hex[1]);
				let message = sodium.crypto_box_open_easy(msg, n, sodium.from_hex(publicKey), sodium.from_hex(secretKey));
				try{
					let obj = sodium.to_string(message);
					resolve(obj);
				}catch(e){
					reject(message);
				}
			});
		}

		let client = this;

		this.forces = {
			"List": function(){
				return client.post('forces/list', {});
			}
		};

		this.officer = {
			"Get": function(officer_id){
				return client.post('officer/get', {"officer_id": officer_id});
			}
		};

		this.officers = {
			"ByForce": function(force_id){
				return client.post('officers/force', {"force_id": force_id});
			},
			"ByRank": function(rank_id){
				return client.post('officers/rank', {"rank_id": rank_id});
			},
			"BySearchTerm": function(search_term){
				return client.post('officers/search', {"search_term": search_term});
			},
			"ByDayInMonth": function(day, month){
				return client.post('officers/day', {"day": day, "month":month});
			}
		};

		this.ranks = {
			"List": function(){
				return client.post('ranks/list', {});
			}
		};

		this.wall = {
			"Get": function(){
				return client.post('wall/get', {});
			}
		};

		this.test = {
			"Test": function(){
				return client.post('test/test', {})
			}
		};
		
		this.post = function(url, params){
			params["client_key"] = publicKey;
			var formData = new FormData();
			for(var index in params){
				formData.append(index, params[index]);
			}
			
			return new Promise(function(resolve, reject){
				fetch("https://"+server_host+"/"+url, {
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
						resolve(resp)
						//reject({"responseType":"failure", "error":"Server Encryption Failed", "error_number":5003, "detailed_error":"the object returned from the server is not a valid JSON Response", "response":resp});
					}catch(err){
						decryptMessage(text).then(function(msg){
							try{
								let obj = JSON.parse(msg);
								resolve(obj);
							}catch(e){
								reject({"responseType":"failure", "error":"malformed JSON object", "error_number":5001, "detailed_error":"the object returned from the server is not a valid JSON object"});
							}
						}).catch(function(err){
							reject({"responseType":"failure", "error":"invailid JSON object", "error_number":5002, "detailed_error":"the object returned from the server does not contain a valid answer for 'responseType'"});
						});
					}					
				}).catch(function(ex){
					reject(ex)
				});
			});
		}
	};
	
})(window);