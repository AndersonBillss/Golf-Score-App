document.querySelector("#test").addEventListener("click", () => {
    document.getElementById('golfScorePrevArrow').addEventListener('click', () => {
        console.log('a')
        currentRow = prevRow
        renderTable()
    })
})

class Player {
    constructor(name, id = getNextId(), scores = []) {
        this.name = name;
        this.id = id;
        this.scores = scores;
    }
}
function getNextId(){
    id++
    return id-1
}

let id = 0
let golfCourses
let golfCourseId
let golfCourseSelectHtml = ''
let courses
let courseDetails
let scoreCardHtml = ''
let playerNames = []
let playerNamesHtml = []
let players = []
let selectedTeeBoxIndex
let golfScoreTableRow
let tableElementNum
let currentRow
let prevRow = 0
let columnCount
let tableHtmlLabels
let rowLength

async function getAvailableCourses() {
    const url = 'https://exquisite-pastelito-9d4dd1.netlify.app/golfapi/courses.json';
    const response = await fetch(url);
    const data = await response.json();

    return data;
}

  async function getGolfCourseDetails() {
    const url = `https://exquisite-pastelito-9d4dd1.netlify.app/golfapi/course${golfCourseId}.json`;
    const response = await fetch(url);
    const data = await response.json();

    return data;
}


//get the array from the API, render it, then add event listeners to the options
getAvailableCourses().then(value => {
    golfCourses = value
    golfCourses.forEach (function (teeBox){
        golfCourseSelectHtml += `<option class="course button" value="` + teeBox.id + `">` + teeBox.name + `</option>`
    })
    document.getElementById('options-container').innerHTML = golfCourseSelectHtml

    courses = document.getElementsByClassName('course')
    for(i=0; i<courses.length; i++){
        courses[i].addEventListener('click', selectCourse)
    }
})  

function render(){

}


function selectCourse(){
    for(i=0; i<courses.length; i++){
        courses[i].classList.remove('selected')
    }

    scoreCardHtml = `
    <h2>` + this.innerText + `</h2>
    <input type="number" min=1 max=30 id="playerCount" placeholder="Number of players">
    <div class="submit button" id="submitButton">submit</div>
    <div id="playerCountError" class="error"></div>
    `
    this.classList.add('selected')
    golfCourseId = this.value

    getGolfCourseDetails().then(value => {
        courseDetails = value


        document.getElementById('scorecard-container').innerHTML = scoreCardHtml

        document.getElementById('submitButton').addEventListener('click', enterNames)
        document.getElementById('playerCount').addEventListener('keydown', () => {
            if(event.key == 'Enter'){
                enterNames()
            }
        })
    })
}

function enterNames(){
    playerCount = Number(document.getElementById('playerCount').value)
    playerCountMax = Number(document.getElementById('playerCount').max)
    playerCountMin = Number(document.getElementById('playerCount').min)

    let playerEnterHtml = ``

    if(playerCount > playerCountMax){
        document.getElementById('playerCountError').innerText = `
        You can't have more than ` + playerCountMax + ` players
        `
        return
    }
    if(playerCount < 1){
        document.getElementById('playerCountError').innerText = `
        You can't have less than 1 player
        `
        return
    } 
    document.getElementById('playerCountError').innerText = ``
    document.getElementById('playerCount').value = ``

    playerEnterHtml += `<div class="containerRow players">`
    for(i=0; i<playerCount; i++){
        playerEnterHtml += `<input type="text" class="playerName" placeholder="Player ` + (i + 1) + `" id="nameInput` + (i + 1) + `">`
    }
    playerEnterHtml += `</div>`


    let teeBoxes = courseDetails.holes[0].teeBoxes
    let teeBoxesHtml = `<ul class="containerRow reverse" id="teeBoxes">`
    for(i=0; i<teeBoxes.length; i++){
            if (teeBoxes[i].teeColorType != null){
            teeBoxesHtml += `<li class="` + teeBoxes[i].teeColorType + ` button bordered teebox" id="teebox` + i + `">` + teeBoxes[i].teeType + `</li>`
        }   
    }
    teeBoxesHtml += `</ul>`

    teeBoxesHtml += `
    <div class="submit button" id="confirmPlayerNames">Confirm</div>
    <div class="error" id="playerNameWarning"></div>
    <div class="suggestion button" id="playerNameSuggestion"></div>
    `

    document.getElementById('scorecard-container').innerHTML = playerEnterHtml + teeBoxesHtml

    let teeBoxOption = document.getElementsByClassName('teebox')
    for(i=0; i<teeBoxOption.length; i++){
        teeBoxOption[i].addEventListener('click', function () {
            for(j=0; j<teeBoxOption.length; j++){
                teeBoxOption[j].classList.remove('teebox-selected')
            }
            this.classList.add('teebox-selected')
            selectedTeeBoxIndex = Number(this.id.slice(-1))
        })
    }

    document.getElementById('confirmPlayerNames').addEventListener('click', checkNameValidity)

}


function checkNameValidity(){
    playerNamesHtml = document.getElementsByClassName('playerName')
    playerNames = []


    if(document.getElementsByClassName('teebox-selected').length == 0){
        document.getElementById('playerNameWarning').innerText = "Must select a tee type"  
        document.getElementById('playerNameSuggestion').innerText = ""
        return
    }

    for(i=0; i<playerNamesHtml.length; i++){
        playerNames[i] = playerNamesHtml[i].value.trim()
            if (playerNames[i] === ''){
                document.getElementById('playerNameWarning').innerText = "All players must have a name!"
            if(i != 0){
                if(i == 1){
                    document.getElementById('playerNameSuggestion').innerText = "play with just player 1 instead?"
                } else {
                    document.getElementById('playerNameSuggestion').innerText = "play with the first " + i + " players instead?"
                }
                document.getElementById('playerNameSuggestion').addEventListener('click', function(){
                    playerCount = i
                    playerNames.splice(i,1)
                    renderScorecard()
                })
                
            }
            return
        }
        for(j=0; j<playerNames.length; j++){
            if((playerNames[i] == playerNames[j]) && (i!=j)){
                document.getElementById('playerNameWarning').innerText = "you can't have duplicate names!"
                document.getElementById('playerNameSuggestion').innerText = ""
                return
            }
        }
    }

    renderScorecard()
}

function renderScorecard(){
    if(document.getElementById('playerNameSuggestion') != null){
        document.getElementById('playerNameSuggestion').innerText = ""
        document.getElementById('playerNameWarning').innerText = ""
        document.getElementById('header').innerText = ""
        document.getElementById('options-container').innerText = ""
        document.getElementById('scorecard-container').innerText = ""
    }

    players = []
    for(i=0; i<playerNames.length; i++){
        players[i] = new Player(playerNames[i])
    }
    tableHtmlLabels = `<table id="golfScoreTable">`
    tableHtmlLabels += `
    <tr class="golfScoreTableRow"><th>Hole</th></tr>
    <tr class="golfScoreTableRow"><th>Yardage</th></tr>
    <tr class="golfScoreTableRow"><th>Par</th></tr>
    <tr class="golfScoreTableRow"><th>Handicap</th></tr>
    `
    for(i=0; i<players.length; i++){
        tableHtmlLabels += `
        <tr class="golfScoreTableRow playerRow">
            <th class="playerName">` + players[i].name + `</th>
        </tr>
        `
    }
    tableHtmlLabels += `</table>
    <div id="golfScoreArrows">
        <div class="button arrow" id="leftGolfScoreArrow"></div>
        <div class="button arrow" id="rightGolfScoreArrow"></div>
    </div>
    `
    currentRow = 0
    renderTable()
}


function renderTable(){
    tableHtml = tableHtmlLabels
    document.getElementById('scorecard-container').innerHTML = tableHtml
    golfScoreTableRow = document.getElementsByClassName('golfScoreTableRow')

    for(i=currentRow; i<Object.keys(courseDetails.holes).length; i++){
        if(document.getElementById('golfScoreTable').getBoundingClientRect().width < window.innerWidth-125){
            golfScoreTableRow[0].innerHTML += `<td>` + courseDetails.holes[i].hole + `</td>`
            golfScoreTableRow[1].innerHTML += `<td>` + courseDetails.holes[i].teeBoxes[selectedTeeBoxIndex].yards + `</td>`
            golfScoreTableRow[2].innerHTML += `<td>` + courseDetails.holes[i].teeBoxes[selectedTeeBoxIndex].par + `</td>`
            golfScoreTableRow[3].innerHTML += `<td>` + courseDetails.holes[i].teeBoxes[selectedTeeBoxIndex].hcp + `</td>`

            columnCount = i+1
            prevRow = columnCount-(rowLength+(columnCount-currentRow))

            if(currentRow > 0){
                document.getElementById('leftGolfScoreArrow').innerHTML = `
                <i class="fa-solid fa-arrow-left" id="golfScorePrevArrow"></i>
                `
                document.getElementById('golfScorePrevArrow').addEventListener('click', () => {
                    currentRow = prevRow
                    renderTable()
                })
            }
        } else {
            if(i < Object.keys(courseDetails.holes).length){
                document.getElementById('rightGolfScoreArrow').innerHTML = `
                <i class="fa-solid fa-arrow-right" id="golfScoreNextArrow"></i>
                `
                rowLength = (i-currentRow)
                document.getElementById('golfScoreNextArrow').addEventListener('click', () => {
                    currentRow = columnCount
                    renderTable()
                })
            }
            return
        }

    }
}


window.onresize = updateTableWidth
function updateTableWidth(){
    if(document.getElementById('golfScoreTable') != null){
        currentRow = 0
        renderTable()
    }
}
