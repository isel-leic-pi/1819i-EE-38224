'use strict'


const FocaDB = require('./foca-db.js')
const FootballData = require('./football-data')
const rp = require('request-promise')

class Foca {
	
    constructor(es){
		this.focadb = FocaDB.init(es)
		this.footballData = FootballData.init(es)
    }
	
    static init(es){
        return new Foca(es)
    }
	
	getCompetitions(){
		return this.footballData.getCompetitions()
		.catch(err=>
			Promise.reject({statusCode:503}
		))
	}
	
	getTeamsByCompetitionId(id){
		return this.footballData.getTeamsByCompetitionId(id)
		.catch(err=>
			Promise.reject({statusCode:503}
		))
	}
	
	getGroups(user_id){
		return this.focadb.getGroups(user_id)
		.catch(err=>
			Promise.reject({statusCode:503}
		))
    }
	
	createGroup(user_id,name, description){
		return this.focadb.getGroups(user_id)
		.catch(err=>
			Promise.reject({statusCode:503}
		))
		.then(body =>{
			let grp = body.groups.find( g => g.name === name)
			if(grp) return Promise.reject({statusCode:409})
			return this.focadb.CreateGroup(user_id,name,description)
			.catch(err=>Promise.reject({statusCode:503}
			))
		})
	}
	 
	createGroupCopy(user_id,id,name){ 
		return this.focadb.getGroups(user_id)
		.catch(err=>
			Promise.reject({statusCode:503}
		))
		.then(body =>{
			let grp = body.groups.find( g => g.id === id)
			if(!grp)return Promise.reject({statusCode: 404})
			let grpName = body.groups.find( g => g.name === name)
			if(grpName) return Promise.reject({statusCode:409})
			return this.focadb.CreateGroupCopy(user_id,name,grp)
			.catch(err=>Promise.reject({statusCode:503}))
		})
	}
 
	getGroupById(user_id,id){
	return this.focadb.getGroupById(user_id,id)
	.catch(err=>
		Promise.reject({statusCode:404, err:err}
	))
	}
	
	editGroup(user_id,id,name, description){
		return this.focadb.getGroups(user_id)
		.catch(err=>
			Promise.reject({statusCode:404}))
		.then(body =>{
			let grp = body.groups.find( g => g.id === id)
			let grpEqualName = body.groups.find( g => g.name === name)
			if(!grp)return Promise.reject({statusCode:404})
			if(grpEqualName) return Promise.reject({statusCode:409})
			return this.focadb.editGroup(user_id,id,name,description)
			.catch(err=>
				Promise.reject({statusCode:503}
			))
		})
	}

	insertTeamInGroup(user_id,groupId, competitionId, teamId){
		return this.footballData.getTeamsByCompetitionId(competitionId)
			.catch(err=>
				Promise.reject({statusCode:404}
			))
			.then(body =>{
				let team = checkid (body.teams, teamId)
				return this.focadb.insertGroupTeam(user_id,groupId, team)
				.catch(err=>
					Promise.reject({statusCode:409}
				))
			})
	}
	deleteGroupTeam(user_id,groupId, teamId){
		 return this.focadb.deleteGroupTeam(user_id,groupId, teamId)
		 .catch(err=>
			Promise.reject({statusCode:503}
		))
	}
	
	getAllGamesBetweenTwoDates(user_id,groupId,dateFrom,dateTo){

		return this.focadb.getGroupById(user_id,groupId)
		.catch(err=>
				Promise.reject({statusCode:404}
		))
		.then(body=> 
			Promise.all(
				body.teams.map(team=> 
					this.footballData.getgamesfromteam(team.id,dateFrom,dateTo)
				)	
			)
		)
		.then(matches => 
			matches
				.reduce((accumulator, currentvalue) => accumulator.concat(currentvalue))
				.sort((matchesX,matchesY)=> (new Date(matchesX.date)- new Date(matchesY.date)))
		)
 
	}
}

function checkid (source, teamid) {
	let teamA
	 source.forEach(team => {
	 if(team.id == teamid){
			teamA = team
		}
	})
	return teamA
}

module.exports = Foca