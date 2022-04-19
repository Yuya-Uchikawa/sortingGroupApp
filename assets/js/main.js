//グループ名設定
const GroupName = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'N',
    'M',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'W',
    'X',
    'Y',
    'Z',
];

var personalGroupList = [];
var debateCount = 0;
var randomGroupNameList = [];//議論回数が多い時用のグループ名リスト

//各グループの格納人数を定義
function getNumberGroupPeople(total,divide){
    const numberGroupPeople = [];//各グループの格納人数
    const extra = total % divide;
    numberGroupPeople.length = divide;
    for(let i = 0; i < divide; i++){
        numberGroupPeople[i] = Math.floor(total / divide);
        if(i < extra){
            numberGroupPeople[i]++;
        }
    }

    return numberGroupPeople;
}
//配列の先頭の要素を末尾にシフトする関数
function shiftArray(array){
    array[array.length]  = array[0];
    array.shift();
    return array;
}

//グループの振り分けにランダム性を持たせる関数
//arrayGroupSort: 各参加者のグループ割り当てが格納された配列の引数を格納する配列
function shuffleGroupSort(arrayGroupSort){
    for (let i = arrayGroupSort.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayGroupSort[i], arrayGroupSort[j]] = [arrayGroupSort[j], arrayGroupSort[i]];
    }
    return arrayGroupSort;
}

//グループ名取得
function getGroupName(index){
    return (index < GroupName.length ? GroupName[index] : '未設定');
}


function formatList(personalGroupList){
    let formatList = '';
    personalGroupList.forEach(function(value,index){
        formatList += value.No + ', ' + ' , ' + value.GroupList + '\n';
    });
    return formatList;
}

function downloadTextFile(personalGroupList){
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var hour = today.getHours();
    var minute = today.getMinutes();
    var second = today.getSeconds();

    let date = year + '-' + month + '-' + day + '-' + hour + '-' + minute + '-' + second;
    const blob = new Blob([personalGroupList], { type: 'text/plain' });
    const aTag = document.createElement('a');
    aTag.href = URL.createObjectURL(blob);
    aTag.target = '_blank';
    aTag.download = date + '_forCSV.txt';
    aTag.click();
    URL.revokeObjectURL(aTag.href);
}

function showResult(personalGroupList){
    let formatList = '';
    personalGroupList.forEach(function(value,index){
        formatList += value.No + ': ' + value.GroupList + '<br>';
    });
    $('.modal-body').empty();
    $('.modal-body').append('<div>'+formatList+'</div>');
    $('#modal1').modal('show');
}

//2回目以降のグループ割り当て
//Remain: 未定義グループ割り当ての数
function shiftGroup(NGP, preGroupList,  divide, count, Remain){
    let nextGroupList = [];
    let tmpGroupList = [];
    let tmpGroupNameList = [];
    let counter = 0;

    if((count - Remain) < divide){//試行回数　>　分割数　の時
        //グループ毎にループ
        NGP.forEach(function (value,index) {//index: 各グループの格納人数のindex
            tmpGroupList = [];//グループのリスト
            tmpGroupNameList = [];//次のグループ名リスト
            //グループのリストを一時保存
            for (let i = 0; i < value; i++) {
                tmpGroupList.push(preGroupList[counter]);
                tmpGroupNameList.push(getGroupName(counter%divide));
                counter++;
            }
            //重複少なく振り分けをするために配列のシフト
            for(let i = 0; i < index + Remain; i++){
                tmpGroupList = shiftArray(tmpGroupList);
            }
            //次の移動先を格納
            tmpGroupList.forEach(function (value,index){
                nextGroupList.push({No:value.No, GroupName:tmpGroupNameList[index]});
                personalGroupList[value.No-1].GroupList += ', '+tmpGroupNameList[index];
            });
        });
    } else {//試行回数　<　分割数　の時
        randomGroupNameList = shuffleGroupSort(randomGroupNameList);
        for(let i = 0; i < preGroupList.length; i++){
            nextGroupList.push({No: i+1, GroupName:randomGroupNameList[i]});
            personalGroupList[i].GroupList += ', '+randomGroupNameList[i];
        }
    }


    //ID昇順にソート
    nextGroupList.sort(function (a,b){
        return a.No - b.No;
    });

    //グループ名昇順にソート
    nextGroupList.sort(function (a,b){
        if(a.GroupName < b.GroupName) return -1;
        else if(a.GroupName > b.GroupName) return 1;
        return 0;
    });
    if(Remain>1){
        shiftGroup(NGP, nextGroupList, divide,count,Remain-1);
    } else {
        downloadTextFile(formatList(personalGroupList));
        refreshCash();
        showResult(personalGroupList);
    }
}

//グループ振り分けアルゴリズム: グループのN分割を再帰的に繰り返す
//total: 参加者の合計人数 , divide: グループを何分割するか , count: 議論の回数
function assignGroup(total,divide,count){
    initializeList();
    debateCount = count;
    if(total < divide){
        alert("グループ分割数が参加人数を超えています。");
    }else{
        const NGP = getNumberGroupPeople(total,divide);//各グループの格納人数

        let GroupList = [];//１回目のグループ割り当て
        let Number = 1;
        NGP.forEach(function (value, index) {//index: 各グループの格納人数のindex
            for (let i = 0; i < value; i++) {
                GroupList.push({No: Number, GroupName: getGroupName(index)});
                personalGroupList.push({No: Number, GroupList:getGroupName(index)});
                Number++;
            }
        });
        if(count>divide){
            for (let i = 0; i < total; i++){
                randomGroupNameList.push(getGroupName(i % divide));
            }
        }else {
            randomGroupNameList = [];
        }
        if(count>=2){
            shiftGroup(NGP, GroupList, divide, count, count-1);
        }else{
            showResult(personalGroupList);
            downloadTextFile(formatList(personalGroupList));
        }

    }
}

function validationCheck(){
    let joined = $('#sum').val();
    let divide = $('#divide').val();
    let count = $('#count').val();
    if(
        (joined > 0) &&
        (divide > 0) &&
        (count > 0)
    ){
        if(confirm('グループ振り分けのリストを生成しますか？\n（ダウンロードしたテキストファイルは、エクセルのデータタブからインポートすることで活用することが出来ます。）')){
            sessionStorage.clear();
            sessionStorage.setItem('sessionFlag','true');
            sessionStorage.setItem('sum',joined);
            sessionStorage.setItem('divide',divide);
            sessionStorage.setItem('count',count);
            assignGroup(parseInt(joined), parseInt(divide), parseInt(count));
        }
    }else{
        alert('未入力項目 or 負の数値の入力があります。');
    }
}

function initializeList(){
    personalGroupList = [];
    debateCount = 0;
    randomGroupNameList = [];
}

function refreshForm(){
    if(confirm('フォームをクリアしますか？')){
        $('#sum').val('');
        $('#divide').val('');
        $('#count').val('');
        sessionStorage.clear();
    }
}

function refreshCash(){
    if(sessionStorage.getItem('sessionFlag')==='true'){
        $('#sum').val(sessionStorage.getItem('sum'));
        $('#divide').val(sessionStorage.getItem('divide'));
        $('#count').val(sessionStorage.getItem('count'));
    }else{
        $('#sum').val('');
        $('#divide').val('');
        $('#count').val('');
    }
}
$(document).ready(function (){
    refreshCash();
});