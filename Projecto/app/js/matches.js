'use strict'

const util = require('./util.js')
const Handlebars = require('./../../node_modules/handlebars/dist/handlebars.js')
const matchesHBS = require('./../views/matches.hbs')
const matchesHTML = require('./../views/matches.html')

module.exports = async (divMain) => {
	 try{
        const session = await util.fetchJSON('/foca/auth/session')
        if(!session.auth){
			divMain.innerHTML= ''
			return util.showAlert('You cannot access FocaGroups! Only for authenticated users.')
		}
    }
    catch(err){
        util.showAlert(JSON.stringify(err))
    }
	
    divMain.innerHTML = matchesHTML
	document
		.getElementById('buttonSearch')
		.addEventListener('click', searchHandler)
		
	const inputGroupId = document.getElementById('groupId')
	const inputdateFrom = document.getElementById('dateFrom')
	const inputdateTo = document.getElementById('dateTo')
	const divSearchResults = document.getElementById('divSearchResults')
	const searchResultsView = Handlebars.compile(matchesHBS)

	function searchHandler(ev){
		ev.preventDefault()
		if(!inputGroupId.value || !inputdateFrom.value || !inputdateTo.value){
			util.showAlert('por favor preencha os campos necessários')
		}else{
			const groupId = inputGroupId.value
			const dateFrom = inputdateFrom.value 
			const dateTo = inputdateTo.value 
			fetch(`http://localhost:3000/foca/groups/${groupId}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`)
				.then(res => res.json())
				.then(obj => {
					if(obj.length == 0){
						util.showAlert('não existem jogos para estas equipas neste intervalo')
						return Promise.reject('não existem jogos para estas equipas neste intervalo')
					}
					return divSearchResults.innerHTML = showMatches(obj)
				})
				.catch(err => console.log(err))
		}
	}
	
   function showMatches(matches){
	 
	   let data =searchResultsView({matches}) 
	   return data
   }
}