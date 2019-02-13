'use strict'

const util = require('./util.js')
const Handlebars = require('./../../node_modules/handlebars/dist/handlebars.js')
const groupsHBS = require('./../views/groups.hbs')
const groupsHTML = require('./../views/groups.html')

module.exports =  async (divMain) => {
	 
	 try{
        const session = await util.fetchJSON('/foca/auth/session')
        if(!session.auth){
			divMain.innerHTML = ''
			return util.showAlert('You cannot access FocaGroups! Only for authenticated users.')
			}
    }
    catch(err){
        util.showAlert(JSON.stringify(err))
    }

	
    divMain.innerHTML = groupsHTML
	document //Search function eventListener
		.getElementById('buttonSearch')
		.addEventListener('click', searchHandler)
	document //createGroup function eventListener
		.getElementById('buttonCreateGroup')
		.addEventListener('click', createGroupHandler)
	
	document //createGroupCopy function eventListener
		.getElementById('buttonCreateGroupCopy')
		.addEventListener('click', createGroupCopyHandler)
	
	document //editGroup function eventListener
		.getElementById('buttonEditGroup')
		.addEventListener('click', editGroupHandler)	
	
	
	document //insertTeam function eventListener
		.getElementById('buttonInsertTeam')
		.addEventListener('click', insertTeamHandler)	

	document //removeTeam function eventListener
		.getElementById('buttonRemoveTeam')
		.addEventListener('click',removeTeamHandler)	
	
	const inputGroupId = document.getElementById('groupId')
	const inputCompetitionId = document.getElementById('competitionId')
	const inputTeamId= document.getElementById('teamId')
	const inputGroupName = document.getElementById('groupName')
	const inputDescriptionId = document.getElementById('descriptionId')

	const divSearchResults = document.getElementById('divSearchResults')
	const searchResultsView = Handlebars.compile(groupsHBS)


	function createGroupHandler(ev){
		ev.preventDefault()
		if(!inputGroupName.value ||  !inputDescriptionId.value){
			util.showAlert('Preencha os campos Name e Description')
		}
		else{
			fetch(`http://localhost:3000/foca/groups?name=${inputGroupName.value}&description=${inputDescriptionId.value}`, {method: 'POST'})
			.then(res => {
				if(res.status == '500'){
					util.showAlert('já existe um grupo com esse nome')
					return Promise.reject(new Error('já existe um grupo com esse nome'))
				}
				return res.json()
			})
			.then(obj => {
				fetch(`http://localhost:3000/foca/groups/${obj.id}`)
				.then(ress=> ress.json())
				.then( objj => divSearchResults.innerHTML = showGroupInfo(objj)
				//showAlert sucesso
				)})
			.catch()
		}
	}
	
	function createGroupCopyHandler(ev){
		ev.preventDefault()
		if(!inputGroupName.value || !inputGroupId.value){
			util.showAlert('Preencha o campo identificador e o nome do novo grupo')
		}
		else{
			fetch(`http://localhost:3000/foca/groups/${inputGroupId.value}/copy/${inputGroupName.value}`, {method: 'POST'})
			.then(res => res.json())
			.then(obj => {
				console.log(JSON.stringify(obj))
				fetch(`http://localhost:3000/foca/groups/${obj.id}`)
				.then(ress=> ress.json())
				.then( objj => divSearchResults.innerHTML = showGroupInfo(objj)
				//showAlert sucesso
				)})
			.catch()
		}
	}
	
	
	

	function editGroupHandler(ev){
		ev.preventDefault()
		if(!inputGroupId.value || !inputGroupName.value ||  !inputDescriptionId.value){
			util.showAlert('Preencha os campos groupId, name e Description')
		}
		else{
			fetch(`http://localhost:3000/foca/groups/${inputGroupId.value}?name=${inputGroupName.value}&description=${inputDescriptionId.value}`, {method: 'PUT'})
			.then(res => res.json())
			.then(obj => {
				fetch(`http://localhost:3000/foca/groups/${obj.id}`)
				.then(ress=> ress.json())
				.then( objj => {
					if(objj.teams == null) util.showAlert('não existe o grupo especificado')
					divSearchResults.innerHTML = showGroupInfo(objj)
				}
				)})
			.catch()
		}


	}
	function insertTeamHandler(ev){
		ev.preventDefault()
		if(!inputGroupId.value || !inputTeamId.value || !competitionId.value){
			util.showAlert('por favor introduza os parametros necessários')
		}
		else{
			fetch(`http://localhost:3000/foca/groups/${inputGroupId.value}/competition/${competitionId.value}/team/${inputTeamId.value}`, {method: 'POST'})
				.then(res => {
					if(res.status == '500'){
						util.showAlert('a equipa já se encontra inserida neste grupo')
						return Promise.reject(new Error("a equipa já se encontra inserida neste grupo"))
					}
					return res.json()
				})
				.then(obj => {
					fetch(`http://localhost:3000/foca/groups/${obj.id}`)
					.then(ress=> ress.json())
					.then( objj => {
						if(objj.teams == null) util.showAlert('não existe o grupo especificado')
						divSearchResults.innerHTML = showGroupInfo(objj)
					}
					)})
				.catch()
		}
	}
	function removeTeamHandler(ev){
		ev.preventDefault()
		if(!inputGroupId.value || !inputTeamId.value){
			util.showAlert('por favor introduza os parametros necessários')
		}
		else{
			fetch(`http://localhost:3000/foca/groups/${inputGroupId.value}/team/${inputTeamId.value}`, {method: 'DELETE'})
				.then(() => document.getElementById('buttonSearch').click())
				.catch()
		}
	}

	function searchHandler(ev){
		ev.preventDefault()
	 
		if(!inputGroupId.value){
		fetch(`http://localhost:3000/foca/groups`)
			.then(res=>res.json())
			.then(obj => divSearchResults.innerHTML = showAllGroupInfo(obj.groups))
			//	alert(JSON.stringify(obj.groups))
			.catch(err => console.log(err))
		//util.showAlert('por favor introduza um identificador do grupo')
		}
		else{

		const groupId = inputGroupId.value
		fetch(`http://localhost:3000/foca/groups/${groupId}`)
			.then(res => res.json())
			.then(obj => {
				if(obj.teams == null) util.showAlert('não existe o grupo especificado')
				divSearchResults.innerHTML = showGroupInfo(obj)
			})
			.catch(err => console.log(err))
		}
	}
	
 
   function showAllGroupInfo(groups){
	   const headers = '<table class="table"><thead><tr><th>Id</th><th>Nome</th><th>Descrição</th><th>Equipas</th></tr></thead><tbody>'
	   let data = ''
	   groups.forEach(element => {
		data+=searchResultsView({element})
	})
	   return headers + data + '</tbody></table>'
   }

   function showGroupInfo(group){
	const headers = '<table class="table"><thead><tr><th>Id</th><th>Nome</th><th>Descrição</th><th>Equipas</th></tr></thead><tbody>'
	return headers + searchResultsView({group}) + '</tbody></table>'
   }
}








