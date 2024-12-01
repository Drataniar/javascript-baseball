const { stat } = require('fs/promises');
const readline = require('readline');

// readline 인터페이스 설정
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/*
 ** computerSelectNumber : 랜덤 숫자 생성 **
 * Set : 중복된 값을 허용하지 않는 데이터 구조
 * randomNum이 count만큼 반복
 * Set에 max까지의 숫자 중 중복되지 않고 랜덤한 count개의 숫자를 추가
 * Set은 객체이므로 Array.from() 메서드를 사용하여 Set을 배열로 변환 후 반환
 * computerSelectNumber(3, 9) = 1 - 9 사이의 숫자 중 중복되지 않는 3개의 숫자가 포함된 배열이 반환
 */
function computerSelectNumber(count, max) {
    const randomNum = new Set();
    while (randomNum.size < count) {
        randomNum.add(Math.floor(Math.random() * max) + 1);
    }
    return Array.from(randomNum);
}

/*
** getStrikeCount : 값과 순서가 일치하는 숫자의 개수 **
* 사용자가 입력한 숫자(userNumber)의 숫자(num)와 순서(index)가 모두 일치하는 숫자의 개수 반환
*/
function getStrikeCount(userNumber, computerNumber) {
    return userNumber.filter((num, index) => num === computerNumber[index]).length;
}

/*
** getBallCount : 순서는 다르지만 값이 일치하는 숫자의 개수 **
* userNumber의 num은 같지만 index는 다른 숫자의 개수 반환
*/
function getBallCount(userNumber, computerNumber) {
    return userNumber.filter((num, index) => computerNumber.includes(num) && computerNumber[index] !== num).length;
}

/*
** getUserNum : 사용자가 입력한 값 처리 **
* return new Promise((resolve) => {}) : Promise는 비동기 작업의 완료 / 실패를 나타내는 객체
* resolve : Promise가 성공적으로 완료되었을 때 호출되는 함수 (true)
* rl.question(promptMsg, (userInput) => {}) : readline에서 question 메서드로 사용자에게 promptMsg를 표시하고 입력을 요청
* 사용자가 입력한 값은 userInput 매개변수로 전달
* trim() : 공백을 제거 - 1입력해도 null반환 이슈로 추가
* 사용자가 9를 입력하면 null 반환 > 게임 종료
* split('').map(Number) : 한 글자씩 나누고 숫자로 변환하여 숫자 배열로 반환
*/
function getUserNum(promptMsg) {
    return new Promise((resolve) => {
        rl.question(promptMsg, (userInput) => {
            resolve(userInput);
        });
    });
}

/*
** checkUserNumber : 유효성 검사 **
* 사용자가 입력한 숫자(userNumber)의 길이가 3인지 확인
* every(num => num >= 1 && num <= 9) : userNumber의 모든 숫자가 1 이상 9 이하인지 확인
* new Set(userNumber).size === userNumber.length : Set으로 중복값 제거 후 각 배열을 비교해서 중복값이 있는지 확인
*/
// function checkUserNumber(userNumber) {
//   return userNumber.length === 3 && userNumber.every(num => num >= 1 && num <= 9) && new Set(userNumber).size === userNumber.length;
// }
function checkUserNumber(userNumber){
    const checkUserNumberDuplicate = new Set(userNumber);
    if(userNumber.length !== 3){
        //alert("세자리 수로 다시 입력해주세요!");
        console.log("세자리 수로 다시 입력해주세요!");
        return false;
    }
    else if(userNumber.length !== checkUserNumberDuplicate.size)
    {
        //alert("중복되지 않는 세자리 수로 다시 입력해주세요!");
        console.log("중복되지 않는 세자리 수로 다시 입력해주세요!");
        return false;
    }
    console.log("유효성 체크 완료");
    return true;
}

function recordDate()
{
    let nowDate = new Date();
    const year = nowDate.getFullYear();
    const month = String(nowDate.getMonth() + 1).padStart(2, '0');
    const day = String(nowDate.getDate()).padStart(2, '0');
    const hours = String(nowDate.getHours()).padStart(2, '0');
    const minutes = String(nowDate.getMinutes()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    return formattedDate;
}

/*
** playGame : 게임 실행 **
* async : 비동기적인 함수, Promise를 반환
* await : 기다렸다가 Promise의 상태가 바뀌면 다음 연산 시작
* readline에서 await은 prompt역할을 함
*/
async function playGame() {
    //json 배열 , info는 날짜,승리자 id, alltext는 나온 텍스트들
    let gameId=0;
    let gameLogsArray = [];
    
    let statistics=[];
    
    let startNum = await getUserNum('게임을 새로 시작하려면 1, 기록을 보려면 2, 통계를 보려면 3, 종료하려면 9을 입력하세요.');
  
    while (startNum !== '9') {
        
        // 기록
        // let gameLogsArray = [];
        

        if(startNum === '1'){ // 1입력 후 게임 진행되는 동안의 반복문
            
            gameId++;
            let stats = {
              id : gameId,
              maxTime : 0,
              rounds : 0,
              winner : "",
            };
            let gameLog={};
            let startGameTime = recordDate();
            let gameInfoText = ` [ID : ${gameId}] \n 시작시간: ${startGameTime} /`;
            let gameAllText = "";

            const computerNumber = computerSelectNumber(3, 9); // 1~9까지의 중복되지 않는 3자리 숫자
            console.log(`컴퓨터가 숫자를 뽑았습니다. ${computerNumber}`);
            gameAllText +=`컴퓨터가 숫자를 뽑았습니다. ${computerNumber} \n`;

            let userRemainChance = await getUserNum("컴퓨터에게 승리하기 위해 몇번만에 성공해야 하나요?");
            gameAllText += `컴퓨터에게 승리하기 위해 몇번만에 성공해야 하나요? \n ${userRemainChance} \n`;

            let time = 0; // 게임 횟수
            let maxTime = parseInt(userRemainChance); // 횟수 제한
            
            while (time < maxTime) { // 사용자가 제한 횟수보다 먼저 승리 또는 제한 횟수에 도달하기까지
    
                let request = await getUserNum(`\n${time+1}번째 시도 \n숫자를 입력해주세요. : `);
                let userNumber = request.split('').map(Number);

                gameAllText += `${time+1}번째 시도 \n 숫자를 입력해주세요 \n ${userNumber} \n`
                
                if(request === '2'){
                    console.log(`\n사용자 기권\n게임을 종료합니다!\n`);
                    gameAllText +=`\n사용자 기권\n게임을 종료합니다!\n`
                    let endTime = recordDate();
                    gameInfoText += ` 종료시간: ${endTime} / 최대 도전 횟수: ${maxTime} / 도전 횟수: ${time+1} / 승리자 : 컴퓨터(사용자 기권)`;
                    stats.winner = "computer";
                    stats.rounds = time+1;
                    break;
                }
    
                if (userNumber === null) {
                    console.log("게임을 종료합니다!");
                    gameAllText += `게임을 종료합니다!`
                    break;
                }
    
                if (!checkUserNumber(userNumber)) {
                    continue;
                }
    
                const strikes = getStrikeCount(userNumber, computerNumber);
                const balls = getBallCount(userNumber, computerNumber);
                let resultText= "";
    
                if(balls !== 0){ 
                    resultText+=`${balls}볼 `; 
                }
                if(strikes !== 0){ 
                    resultText+=`${strikes}스트라이크 `; 
                }
                if(strikes === 0 && balls === 0){
                    resultText+=`Nothing`;
                }
                console.log(resultText);
                gameAllText +=`${resultText}\n`;
    
                if (strikes === 3) {
                    let endTime = recordDate();

                    // 기록 업데이트
                    gameInfoText += ` 종료시간: ${endTime} / 최대 도전 횟수: ${maxTime} / 도전 횟수: ${time+1} / 승리자 : 사용자`;
                    console.log(`\n3개의 숫자를 모두 맞히셨습니다.\n사용자가 승리하였습니다.`);
                    gameAllText +=`\n3개의 숫자를 모두 맞히셨습니다.\n\n사용자가 승리하였습니다.\n`;

                    stats.winner = "user";
                    stats.rounds = time+1;
                    break;
                }
                time++;
            }
            
            if(time === maxTime){
                let endTime = recordDate();
                gameInfoText += `종료시간: ${endTime} / 최대 도전 횟수: ${maxTime} / 사용자의 도전 횟수: ${time} / 승리자 : 컴퓨터`;
                console.log(`\n컴퓨터가 승리하였습니다.`);
                gameAllText +=`\n컴퓨터가 승리하였습니다.\n`;
                stats.winner = "computer";
                stats.rounds = time;
            }
    
            
            stats.maxTime = maxTime;
            console.log("-------게임 종료--------");
            gameAllText +=`-------게임 종료-------\n`;
            gameLog.info = gameInfoText;
            gameLog.allText = gameAllText;
            gameLogsArray.push({...gameLog});
            statistics.push({...stats});
            
            // startNum = await getUserNum('게임을 새로 시작하려면 1, 기록을 보려면 2, 통계를 보려면 3, 종료하려면 9을 입력하세요.');
        }else if(startNum === '2'){
            console.log(`\n ************** 기 록 **************`);
            calculateGameLog(gameLogsArray)
            // startNum = await getUserNum('게임을 새로 시작하려면 1, 기록을 보려면 2, 통계를 보려면 3, 종료하려면 9을 입력하세요.');
        }else if(startNum === '3'){
            console.log(`\n ************** 통 계 **************`);
            calculateStatistics(statistics)
        }
        startNum = await getUserNum('게임을 새로 시작하려면 1, 기록을 보려면 2, 통계를 보려면 3, 종료하려면 9을 입력하세요.');
    }
    console.log("애플리케이션이 종료되었습니다.");
    rl.close();
}

// 기록
function calculateGameLog(gameLogsArray){
    if (gameLogsArray.length === 0) {
        console.log("기록 없음");
        return;
    }
    gameLogsArray.forEach(gameLog => {
        console.log(`${gameLog.info} \n ${gameLog.allText}`);
    });
}

function FindMinMaxInStatics(key, data) {
    const calculatedStats = data.map((stats) => stats[key]);
    return {
      min: Math.min(...calculatedStats),
      max: Math.max(...calculatedStats)
    }
  }
  
  function filteringStats(array,key,filteringValue){
  
      const filteredArray = array.filter(function(stat){
          return stat[key] === filteringValue
      });
  
      return filteredArray;
  }

  function checkMaxFrequency(givenArray,key)
  {
    let maxFrequencyValue = 0;
    let maxFrequency = -1;
    let maxFrequencyIdArrayText = '';
    let tempArray=[];

    givenArray.forEach(function(stat){
        tempArray.push(stat[key]);
    })
    
    tempArray = tempArray.sort();

    //tempArray.forEach(arr => console.log(arr));

    let FrequencyCompare ={
        value : tempArray[0],
        many : 0
    };

    let checkCompare =[];
    tempArray.forEach(function(arrayValue,index){
        
        if(FrequencyCompare.value===arrayValue){
            FrequencyCompare.many++;
        }
        else if(FrequencyCompare.value !== arrayValue){
            checkCompare.push(FrequencyCompare);
            //FrequencyCompare.value = arrayValue;
            //FrequencyCompare.many = 1;
            FrequencyCompare = { value: arrayValue, many: 1 };
        }

        if(tempArray.length===index+1)
            {
                checkCompare.push(FrequencyCompare);
            }
    })

    /*checkCompare.forEach(
        arrayValue => 
            console.log(`checkvalue : ${arrayValue.value}, checkmany : ${arrayValue.many}`))
*/
    checkCompare.forEach(function(arrayValue){
        if(maxFrequency<arrayValue.many){
            maxFrequency=arrayValue.many;
            maxFrequencyValue=arrayValue.value;
        }
        
    })

    givenArray.forEach(function(arrayValue){
        if(arrayValue[key]===maxFrequencyValue){
            maxFrequencyIdArrayText+=`[${arrayValue.id}]`;
        }
    })

    return {
        maxFrequencyValue : maxFrequencyValue,
        maxFrequencyIdArrayText : maxFrequencyIdArrayText
    };
  }

// 통계 
function calculateStatistics(statistics){
    statistics.forEach(stat => {
        console.log(`${stat.id} / ${stat.maxTime} / ${stat.winner} / ${stat.rounds}`);
    });

    function userWin(el){
        if(el.winner === "user"){
        return true;
        }
    }
    const userWins = statistics.filter(userWin);
    const computerWins = filteringStats(statistics,"winner","computer");

    const userMaxWin = FindMinMaxInStatics("rounds",userWins).max;
    const userMinWin = FindMinMaxInStatics("rounds",userWins).min;

    const userMaxWinArr = filteringStats(userWins,"rounds",userMaxWin);
    const userMinWinArr = filteringStats(userWins,"rounds",userMinWin);

    let userMaxWinIdText = "";
    userMaxWinArr.forEach(function(stat){
        userMaxWinIdText+=`[${stat.id}] `;
    });

    let userMinWinIdText = "";
    userMinWinArr.forEach(function(stat){
        userMinWinIdText+=`[${stat.id}] `;
    });

    // 가장 큰 / 작은 값의 입력횟수
    const calculateTimes = statistics.reduce((accu, stat) => { 
        if(accu.timeMax < stat.maxTime){
            accu.timeMax = stat.maxTime;
            accu.timeMaxId = [stat.id];
        }else if(accu.timeMax === stat.maxTime){
            accu.timeMaxId.push(stat.id);
        }
        if(accu.timeMin === 0 || accu.timeMin > stat.maxTime){
            accu.timeMin = stat.maxTime;
            accu.timeMinId = [stat.id];
        }else if(accu.timeMin === stat.maxTime){
            accu.timeMinId.push(stat.id);
        }
        accu.allTimes.push({ maxTime: stat.maxTime, id: stat.id });

        return accu;
    }, {allTimes: [], allTimesId: [], timeMax : 0, timeMaxId : [], timeMin : 0, timeMinId : []});
    // console.log('calculateTimes',calculateTimes.allTimes);

    const calculateMaxTimes = calculateTimes.allTimes.reduce((accu, allTime) => { 
        if(accu.applyMaxTime < allTime.maxTime){
            accu.applyMaxTime = allTime.maxTime;
            accu.applyMaxTimeId = [allTime.id];
        }else if(accu.applyMaxTime === allTime.maxTime){
            accu.applyMaxTimeId.push(allTime.id);
        }

        return accu;
    }, {applyMaxTime: 0, applyMaxTimeId: []});
    console.log('calculateMaxTimes',calculateMaxTimes);

    // 입력횟수 평균 값
    const averageTime = (calculateTimes.allTimes.reduce((sum, times) => sum + times.maxTime, 0) / calculateTimes.allTimes.length).toFixed(1);


    console.log(`총 게임 횟수: ${statistics.length}`);
    console.log(`사용자 총 승리 횟수: ${userWins.length}`);
    console.log(`컴퓨터 총 승리 횟수: ${statistics.length - userWins.length}`);
    console.log(`사용자가 승리한 게임 중 가장 많은 횟수: ${userMaxWin} / ID : ${userMaxWinIdText}`);
    console.log(`사용자가 승리한 게임 중 가장 적은 횟수: ${userMinWin} / ID : ${userMinWinIdText}`);
    console.log(`가장 큰 값으로 적용된 입력횟수 : ${calculateTimes.timeMax} / ID : ${calculateTimes.timeMaxId}`);
    console.log(`가장 적은 값으로 적용된 입력횟수 : ${calculateTimes.timeMin} / ID : ${calculateTimes.timeMinId}`);


    //현선
    console.log(`적용된 입력횟수 평균: ${averageTime}`);
    console.log(`가장 많이 적용된 입력횟수 : ${calculateMaxTimes.applyMaxTime} / ID : ${calculateMaxTimes.applyMaxTimeId}`);

    //재욱
    console.log(`컴퓨터가 가장 많이 승리한 입력횟수: ${checkMaxFrequency(computerWins,"maxTime").maxFrequencyValue} / ID : ${checkMaxFrequency(computerWins,"maxTime").maxFrequencyIdArrayText}`);
    console.log(`사용자가 가장 많이 승리한 입력횟수: ${checkMaxFrequency(userWins,"rounds").maxFrequencyValue} / ID : ${checkMaxFrequency(userWins,"rounds").maxFrequencyIdArrayText}`);

    
    return;
}

playGame();