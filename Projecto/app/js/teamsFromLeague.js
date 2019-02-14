'use strict'

const util = require('./util.js')
const Handlebars = require('./../../node_modules/handlebars/dist/handlebars.js')
const teamsFromLeagueHBS = require('./../views/teamsFromLeague.hbs')
const teamsFromLeagueHTML = require('./../views/teamsFromLeague.html')

module.exports = (divMain) => {
	
    divMain.innerHTML = teamsFromLeagueHTML
	document
		.getElementById('buttonSearch')
		.addEventListener('click', searchHandler)
		
	const inputCompId = document.getElementById('compId')

	const divSearchResults = document.getElementById('divSearchResults')
	const searchResultsView = Handlebars.compile(teamsFromLeagueHBS)

	function searchHandler(ev){
		ev.preventDefault()
		if(!inputCompId.value){
		util.showAlert('por favor introduza um identificador de competição')
		}
		const compId = inputCompId.value
		fetch(`http://localhost:3000/competitions/${compId}/teams`)
			.then(res => {			
				if(res.status == '503'){
					util.showAlert('o serviço está em baixo')
					return Promise.reject(new Error('o serviço está em baixo'))
				}
				return res.json()
			})
			.then(arr =>{
				if(arr.teams == null)util.showAlert('não existe esta liga')
				divSearchResults.innerHTML = searchTeamsFromLeague(arr.teams)
			})
			.catch(err => console.log(err))
	}
   function searchTeamsFromLeague(teams) {
        return searchResultsView({teams})
    }
}








