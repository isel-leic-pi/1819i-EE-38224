'use strict'
const util = require('./util.js')
const Handlebars = require('./../../node_modules/handlebars/dist/handlebars.js')
const competitionsHBS = require('./../views/competitions.hbs')
const competitionsHTML = require('./../views/competitions.html')

module.exports = (divMain) => {
	
    divMain.innerHTML = competitionsHTML
	document
		.getElementById('buttonSearch')
		.addEventListener('click', searchHandler)
		
	const divSearchResults = document.getElementById('divSearchResults')
	const searchResultsView = Handlebars.compile(competitionsHBS)

	function searchHandler(ev){
		ev.preventDefault()
		fetch(`http://localhost:3000/competitions`)
			.then(res =>{
				if(res.status == '503'){
					util.showAlert('o serviço está em baixo')
					return Promise.reject(new Error('o serviço está em baixo'))
				}
				return res.json()
			})
			.then(arr => divSearchResults.innerHTML = searchCompetitions(arr.competitions))
			.catch(err => console.log(err))
	}
   function searchCompetitions(competitions) {
        return searchResultsView({competitions})
    }
}