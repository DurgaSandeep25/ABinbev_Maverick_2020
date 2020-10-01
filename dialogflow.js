(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var writer = response.getStreamWriter(),
	hdrs = {};
		// Initialising required vairables
		var x=request.body.data; // x is nothing but result
		var inc='';
		var priority='';
		var state='';
		var assigned_to='';
		var context='';
		var command='';
		var message='';
		var status ='';
		var desc='';
		//var caller='';
		var content='';
		var summary='';
		var comments='';
		data={};
			
			if(x.queryResult.intent.displayName=='status_check')
				{
				var numbers=x.queryResult.parameters.number + "";
				var ci = new GlideRecord("incident");
				ci.addQuery("number",'ENDSWITH', numbers);
				ci.query();
				if (ci.next()) {
					if(ci.assigned_to!='')
						assigned_to=ci.getDisplayValue('assigned_to');
					else
						assigned_to="no one";
					message="Incident "+ci.number+" is currently assigned to "+assigned_to+". Current state of the incident is "+ci.getDisplayValue('state')+". This incident was last updated by "+ci.sys_updated_by+" on "+ci.sys_updated_on+".";

					//summary={}
						context='success';
					}
					
				}
			else if(x.queryResult.intent.displayName=="Raise Service Request") 
			{
				var description=x.queryResult.parameters.description + "";
				//var severity=x.queryResult.parameters.severity + "";
				var severity = '3';
				//var userid=x.queryResult.parameters.username+"";
				var userid = 'admin';
				var user=new GlideRecord('sys_user'); 
				user.addQuery('user_name',userid); 
				user.query(); 
				while(user.next()) 
				{ 
					caller=user.sys_id; 
				} 
				gs.log("The caller recieved is "+caller);
				if(caller!='') 
				{ 
					var create = new GlideRecord("incident");
					//put all the mandatory fields
					create.initialize();
					create.caller_id=caller;
					create.description=description;
					create.short_description=description;
					create.impact=severity;
					create.urgency=severity;
					create.insert();
					message="Incident is created for you and the ticket number is : "+create.number+". The incident is currently assigned";

					context='success'; 
				}
			}
				
			var messages="Incident ";
			hdrs['Content-Type'] = 'application/json';
			response.setStatus(200);
			response.setHeaders(hdrs);
	
			var response_body = { 
			"fulfillmentText": message,
			"payload":{ 
			"messages": [ { 
			"displayText": "Text response",
			"platform": "google", 
			"textToSpeech": "Audio response", 
			"type": "simple_response" 
			} 
			] } 
			}; 
// 			var response_body = {
// 				"fulfillmentText": message,
// 				"payload":{
// 					"google": {
// 						"expectUserResponse": true,
// 						"richResponse": {
// 							"items": [
// 								{
// 									"simpleResponse": {
// 										"textToSpeech": message
// 									}
// 								}
// 							]
// 						}
// 					}
// 				}

// 			};
			writer.writeString(global.JSON.stringify(response_body));
			//return response_body;

})(request, response);