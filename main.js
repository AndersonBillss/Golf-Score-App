/* document.querySelector("#test").addEventListener("click", () => {
})
document.querySelector("#clearStorage").addEventListener("click", () => {
    localStorage.clear()
    console.log("cleared local storage")
}) */

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
let resumeCourseName
let resumeTeeBoxName
let selectedTeeBoxIndex
let view
let golfScoreTableRow
let tableElementNum
let currentRow = 0
let prevRow = 0
let columnCount
let tableHtmlLabels
let rowLength
let selectedCourseName
let selectedTeeBoxIndexOption
let totalScores = []
let yardageTotal
let parTotal
let HandicapTotal
if(localStorage.getItem('players') != null){
    players = JSON.parse(localStorage.getItem('players'))
    resumeCourseName = JSON.parse(localStorage.getItem('resumeCourseName'))
    resumeTeeBoxName = JSON.parse(localStorage.getItem('resumeTeeBoxName'))
    courseDetails = JSON.parse(localStorage.getItem('courseDetails'))
    selectedTeeBoxIndex = localStorage.getItem('selectedTeeBoxIndex')
    playerNames = JSON.parse(localStorage.getItem('playerNames'))
    view = localStorage.getItem('view')
}
if(view == 'scorecard'){
    renderScorecard()
} else {
    initialLoad()
}



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
function initialLoad(){
    document.getElementById('scorecard-container').innerHTML = ''
    view = 'selectCourse'
    localStorage.setItem('view', view)

    getAvailableCourses().then(value => {
            golfCourseSelectHtml = ``
            golfCourses = value
        golfCourses.forEach (function (teeBox){
            golfCourseSelectHtml += `<option class="course button" value="` + teeBox.id + `">` + teeBox.name + `</option>`
        })
        document.getElementById('options-container').innerHTML = golfCourseSelectHtml

        if(Object.keys(players).length > 0){
            document.getElementById('button-container').innerHTML = `
            <button id="resume-game" class="resume button">
            Resume Game? (`+Object.keys(players).length+` players, `+resumeCourseName+`, teetype: `+resumeTeeBoxName+`)
            </button>
            `
            document.getElementById('resume-game').addEventListener('click', renderScorecard)
        }
    
        courses = document.getElementsByClassName('course')
        for(i=0; i<courses.length; i++){
            courses[i].addEventListener('click', selectCourse)
        }
    })  

}


function selectCourse(){
    for(i=0; i<courses.length; i++){
        courses[i].classList.remove('selected')
    }

    scoreCardHtml = `
    <h2>` + this.innerText + `</h2>
    <input type="number" min=1 max=4 id="playerCount" placeholder="Number of players">
    <div class="submit button" id="submitButton">submit</div>
    <div id="playerCountError" class="error"></div>
    `
    this.classList.add('selected')

    selectedCourseName = this.innerHTML

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

    playerEnterHtml += `<div class="containerRow players" id="player-names-container">`
    for(i=0; i<playerCount; i++){
        playerEnterHtml += `<input type="text" class="playerName" placeholder="Player ` + (i + 1) + `" id="nameInput` + (i + 1) + `">`
    }
    playerEnterHtml += `</div>
    <div class="add-subtract-players">
        <i class="fa-solid fa-minus player-count button" id="remove-player"></i>
        <i class="fa-solid fa-plus player-count button" id="add-player"></i>
    </div>
    `



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
            selectedTeeBoxIndexOption = Number(this.id.slice(-1))
        })
    }

    document.getElementById('add-player').addEventListener('click', () => {
        if(playerCount < playerCountMax){
            playerCount++
            document.getElementById('player-names-container').innerHTML += `
            <input type="text" class="playerName" placeholder="Player ` + playerCount + `" id="nameInput` + playerCount + `">
            `
        }
    })
    document.getElementById('remove-player').addEventListener('click', () => {
        if(playerCount > playerCountMin){
            playerCount--
            if(document.getElementById('player-names-container').lastChild.length > 5){
                document.getElementById('player-names-container').lastChild.remove()
            }
            document.getElementById('player-names-container').lastChild.remove()
        }
    })

    document.getElementById('confirmPlayerNames').addEventListener('click', checkNameValidity)

}


function checkNameValidity(){
    selectedTeeBoxIndex = selectedTeeBoxIndexOption
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

                    players = []
                    resumeCourseName = selectedCourseName
                    resumeTeeBoxName = courseDetails.holes[0].teeBoxes[selectedTeeBoxIndex].teeType
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
    players = []
    currentRow = 0
    resumeCourseName = selectedCourseName
    resumeTeeBoxName = courseDetails.holes[0].teeBoxes[selectedTeeBoxIndex].teeType
    
    let resumeCourseNameString = JSON.stringify(resumeCourseName)
    let resumeTeeBoxNameString = JSON.stringify(resumeTeeBoxName)
    let courseDetailsString = JSON.stringify(courseDetails)
    let playerNamesString = JSON.stringify(playerNames)
    localStorage.setItem('resumeCourseName', resumeCourseNameString)
    localStorage.setItem('resumeTeeBoxName', resumeTeeBoxNameString)
    localStorage.setItem('courseDetails', courseDetailsString)
    localStorage.setItem('selectedTeeBoxIndex', selectedTeeBoxIndex)
    localStorage.setItem('playerNames', playerNamesString)
    renderScorecard()
}



function renderScorecard(){
    view = 'scorecard'
    localStorage.setItem('view', view)

    if(document.getElementById('playerNameSuggestion') != null){
        document.getElementById('playerNameSuggestion').innerText = ""
        document.getElementById('playerNameWarning').innerText = ""
        document.getElementById('header').innerText = ""
        document.getElementById('scorecard-container').innerText = ""
    }
    document.getElementById('options-container').innerText = ""

    let emptySpaces = 0
    for(i=0; i<playerNames.length; i++){
        if(players[i] == undefined){
            players[i] = new Player(playerNames[i])
        }
        let DNF = false
        totalScores[i] = 0
        for(j=0; j<Object.keys(courseDetails.holes).length; j++){
            if(players[i].scores[j] == undefined){
                players[i].scores[j] = ''
            } 
            if((players[i].scores[j] != '') && (players[i].scores[j] != 'DNF')){
                totalScores[i] += Number(players[i].scores[j])
            }
            if(players[i].scores[j] == 'DNF'){
                DNF = true
            }
            if(players[i].scores[j] == ''){
                emptySpaces++
            }
        }
        if(DNF == true){
            totalScores[i] = "DNF"
        }
    }
    document.getElementById('button-container').innerHTML = `<button class="back button" id="back-button">back</button>`
    document.getElementById('back-button').addEventListener('click', () =>{
        initialLoad()
        document.getElementById('scorecard-container').innerHTML=""
        document.getElementById('button-container').innerHTML=""
    })
    if(emptySpaces == 0){
        document.getElementById('button-container').innerHTML += `<button class="submit button" id="view-results-button">View Results</button>`
        document.getElementById('view-results-button').addEventListener('click', winMessage)
        document.getElementById('back-button').addEventListener('click', () =>{
            initialLoad()
            document.getElementById('scorecard-container').innerHTML=""
            document.getElementById('button-container').innerHTML=""
        })
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
        <div class="arrow" id="leftGolfScoreArrow"></div>
        <div class="arrow" id="rightGolfScoreArrow"></div>
    </div>
    `
    yardageTotal = 0
    parTotal = 0
    HandicapTotal = 0
    for(i=currentRow; i<Object.keys(courseDetails.holes).length; i++){
        yardageTotal += courseDetails.holes[i].teeBoxes[selectedTeeBoxIndex].yards
        parTotal += courseDetails.holes[i].teeBoxes[selectedTeeBoxIndex].par
        HandicapTotal += courseDetails.holes[i].teeBoxes[selectedTeeBoxIndex].hcp
    }

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
            for(j=0; j<Object.keys(players).length; j++){
                golfScoreTableRow[4+j].innerHTML += `
                <td><input id="`+i+`player`+j+`" class="player`+j+`" value=`+players[j].scores[i]+`></td>
                `
            }
            columnCount = i+1
            prevRow = columnCount-(rowLength+(columnCount-currentRow))
            if(prevRow<0){
                prevRow=0
            }
            if(currentRow > 0){
                document.getElementById('leftGolfScoreArrow').innerHTML = `
                <i class="fa-solid fa-arrow-left button" id="golfScorePrevArrow"></i>
                `
                document.getElementById('golfScorePrevArrow').addEventListener('click', () => {
                    currentRow = prevRow
                    renderTable()
                })
            }
        } else {
            if(i < Object.keys(courseDetails.holes).length){
                document.getElementById('rightGolfScoreArrow').innerHTML = `
                <i class="fa-solid fa-arrow-right button" id="golfScoreNextArrow"></i>
                `
                rowLength = (i-currentRow)
                document.getElementById('golfScoreNextArrow').addEventListener('click', () => {
                    currentRow = columnCount
                    renderTable()
                })
            }
            break
        }
    }
    golfScoreTableRow[0].innerHTML += `<td>Total</td>`
    golfScoreTableRow[1].innerHTML += `<td>` + yardageTotal + `</td>`
    golfScoreTableRow[2].innerHTML += `<td>` + parTotal + `</td>`
    golfScoreTableRow[3].innerHTML += `<td>` + HandicapTotal + `</td>`
    for(j=0; j<Object.keys(players).length; j++){
        golfScoreTableRow[4+j].innerHTML += `<td>`+totalScores[j]+`</td>`
        let playerScores = document.getElementsByClassName('player'+j)
        for(n=0; n<playerScores.length;n++){
            playerScores[n].addEventListener('blur', savePlayerScores)
        }
    }
    let playerString = JSON.stringify(players)
    localStorage.setItem("players", playerString)
}

function savePlayerScores(){
    this.value = (this.value).toUpperCase()
    if(Number(this.value)*0 != 0 && this.value != 'DNF'){
        this.value=1
    }
    if(this.value != '' && this.value != 'DNF'){
        this.value=Number(this.value)

        if(this.value == 0){
            this.value = 'DNF'
        }
        if(this.value < 0){
            this.value = Math.abs(this.value)
        }
        if(this.value > 99){
            this.value = 99
        }
    }

    let id=this.id
    let idNumLength=id.length-7
    let scoreNumber = Number(id.slice(0,idNumLength))
    let playerNumber = Number(id.slice(-1))
    players[playerNumber].scores[scoreNumber] = this.value

    renderScorecard()
} 

function winMessage(){
    document.getElementById('view-results-button').remove()
    document.getElementById('back-button').remove()

//sort the scores and players in order of total score
    winMessageHtml = `<ul class="win-message">`
    let place = ''
    if(Object.keys(players).length != 1){
        for(i=0; i<totalScores.length; i++){
            if(totalScores[i] == 'DNF'){
                totalScores[i] = 10000
            }
            for(j=0; j<totalScores.length; j++){
                if(totalScores[i]<totalScores[j]){
                    let bigNumber = totalScores[j]
                    let smallNumber = totalScores[i]
                    let p1 = players[i]
                    let p2 = players[j]
                    totalScores[j] = smallNumber
                    totalScores[i] = bigNumber
                    players[j] = p1
                    players[i] = p2
                }

            }
        }
        //display final scores
        let n=0
        for(i=0; i<Object.keys(players).length; i++){
            console.log(i)
            if(i-n==0){
                place = 'first'
            }
            if(i-n==1){
                place = 'second'
            }
            if(i-n==2){
                place = 'third'
            }
            if(i-n==3){
                place = 'fourth'
            }
            if(totalScores[i] == 10000){
                winMessageHtml += `<li class="score placeDNF">` + players[i].name + ` did not finish</li>`
            } else
            if(totalScores[i] == totalScores[i+1] && totalScores[i+1] == totalScores[i+2] && totalScores[i+2] == totalScores[i+3]){
                winMessageHtml += `<li class="score">Everyone tied with ` + totalScores[i] + ` net strokes!</li>`
                i+=3
                n+=3
            } else
            if(totalScores[i] == totalScores[i+1] && totalScores[i+1] == totalScores[i+2]){
                if(Object.keys(players).length == 3){
                    winMessageHtml += `<li class="score">Everyone tied with ` + totalScores[i] + ` net strokes!</li>`
                } else {
                    winMessageHtml += `<li class="score place` + (i+1-n) +`">` + players[i].name + `, ` + players[i+1].name + `, and ` + players[i+2].name + ` tied at ` + place + ` place with ` + totalScores[i] + ` net strokes!</li>`
                }
                i+=2
                n+=2
            } else
            if(totalScores[i] == totalScores[i+1]){
                if(Object.keys(players).length == 2){
                    winMessageHtml += `<li class="score">Everyone tied with ` + totalScores[i] + ` net strokes!</li>`
                } else {
                    winMessageHtml += `<li class="score place` + (i+1-n) +`">` + players[i].name + ` tied with ` + players[i+1].name + ` at ` + place + ` place with ` + totalScores[i] + ` net strokes!</li>`
                }
                i++
                n++
            } else {
                winMessageHtml += `<li class="score place` + (i+1-n) +`">` + players[i].name + ` got ` + place + ` place with ` + totalScores[i] + ` net strokes!</li>`
            }
        } 
    } else {
       winMessageHtml += `<li class="score">you completed the course with ` + totalScores[0] + ` strokes!<li>`
    }
    winMessageHtml += `</ul>`
    document.getElementById('scorecard-container').innerHTML = winMessageHtml
    document.getElementById('button-container').innerHTML = `<button class="submit button" id="return-button">Return to Home Screen</button>`
    document.getElementById('return-button').addEventListener('click', () =>{
        document.getElementById('return-button').remove()
        players = []
        localStorage.clear()   
        initialLoad()
    })
}


window.onresize = updateTableWidth
function updateTableWidth(){
    if(document.getElementById('golfScoreTable') != null){
        currentRow = 0
        renderTable()
    }
}
