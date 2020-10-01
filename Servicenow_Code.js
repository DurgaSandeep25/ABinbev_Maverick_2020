'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const serviceNow = require('./serviceNow');
require('dotenv').config();

const server = express();
let incident = "";

//tells the system whether you want to use a simple algorithm for shallow parsing (i.e. false) or 
//complex algorithm for deep parsing that can deal with nested objects (i.e. true).
server.use(bodyParser.urlencoded({
    extended: true
}));
//tells the system that you want json to be used.
server.use(bodyParser.json());

server.post('/', (req, res) => {
    if(req.body.result.action === 'Project'){
        //console.log(req.body.result);
        if(req.body.result.parameters.Project === 242 || req.body.result.parameters.Project === "242"){
            return res.json({
                speech: "242 is running in Production. Throughput is low. I have no access to Issue tracker",
                displayText: "242 is running in Production. Throughput is low. I have no access to Issue tracker"
            });
        }else if(req.body.result.parameters.Project === 650 || req.body.result.parameters.Project === "650"){
            return res.json({
                speech: "650 is in development. I do not have access to Issue tracker",
                displayText: "650 is in development. I do not have access to Issue tracker"
            });
        }else{
            
            var projectID = req.body.result.parameters.Project;
            
            return res.json({
                speech: `I am not able to find anything for ${projectID}`,
                displayText: `I am not able to find anything for ${projectID}`
            });
        }
    
    }else if(req.body.result.action === 'RaiseIncidentTicket.RaiseIncidentTicket-custom'){
        //console.log('calling api');
        
        var short_description = req.body.result.parameters.short_description;
        var severity = req.body.result.parameters.severity;
        var url = process.env.snincidenturl;
        
        serviceNow.postIncident(short_description, severity, 
            function(){
                var response = JSON.parse(this.responseText);
                //console.log(response);
                incident = response.result.number;
                //console.log(`Incident ${incident} have been created`);
                return res.json({
                    speech: `Incident ${incident} have been created`,
                    displayText: `Incident ${incident} have been created`
                }); 
            });
            
    }else if(req.body.result.action === "GetIncident"){
        var incidentNumber = "INC00"+req.body.result.parameters.incident_number;
        //console.log(incidentNumber);
        serviceNow.getRecords( 
            function(){
                var records = JSON.parse(this.responseText);
                //Loop in records to find the sys_id of the incident
                var sys_id;
                for(var i = 0; i< records.result.length; i++){
                    if(records.result[i].number === incidentNumber){
                        sys_id = records.result[i].sys_id;
                        //console.log(sys_id);
                        serviceNow.getIncidentRecord(sys_id,
                            function(){
                                var status = JSON.parse(this.responseText);
                                var short_description = status.result.short_description;
                                var state = serviceNow.incidentState( status.result.state);
                                var severity = status.result.severity;
                                return res.json({
                                    speech: `The incident ${short_description} is in ${state} state with severity ${severity}`,
                                    displayText: `The incident ${short_description} is in ${state} state with severity ${severity}`
                                });
                            });
                    }
                }
        });
    }
        
});

server.listen((process.env.PORT || 8000), () => {
    console.log("Server is up and running...");
});