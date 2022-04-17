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

//グループの振り分けにランダム性を持たせる関数
//arrayGroupSort: 各参加者のグループ割り当てが格納された配列の引数を格納する配列
// function shuffleGroupSort(arrayGroupSort){
//     for (let i = arrayGroupSort.length - 1; i >= 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [arrayGroupSort[i], arrayGroupSort[j]] = [arrayGroupSort[j], arrayGroupSort[i]];
//     }
//     return arrayGroupSort;
// }

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

//2回目以降のグループ割り当て
//Remain: 未定義グループ割り当ての数
function shiftGroup(NGP, preGroupList,  divide, Remain){
    let nextGroupList = [];
    let counter = 0;
    NGP.forEach(function (value) {//index: 各グループの格納人数のindex
        for (let i = 0; i < value; i++) {
            nextGroupList.push({No:preGroupList[counter].No,GroupName:getGroupName(counter % divide)});
            personalGroupList[preGroupList[counter].No-1].GroupList += ', '+getGroupName(counter % divide);
            counter++;
        }
    });
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
        shiftGroup(NGP, nextGroupList, divide,Remain-1);
    } else {
        downloadTextFile(formatList(personalGroupList));
        refreshCash();
        setTimeout(function (){location.reload();},500);
    }
}

//グループ振り分けアルゴリズム: グループのN分割を再帰的に繰り返す
//total: 参加者の合計人数 , divide: グループを何分割するか , count: 議論の回数
function assignGroup(total,divide,count){
    personalGroupList = [];
    if(total < divide){
        console.log('参加人数:　' + total);
        console.log('分割数: '　+ divide);
        alert("グループ分割数が参加人数を超えています。");
    }else{
        const NGP = getNumberGroupPeople(total,divide);//各グループの格納人数

        let GroupList = [];//各回のグループ割り当て

        let Number = 1;
        NGP.forEach(function (value, index) {//index: 各グループの格納人数のindex
            for (let i = 0; i < value; i++) {
                GroupList.push({No: Number, GroupName: getGroupName(index)});
                personalGroupList.push({No: Number, GroupList:getGroupName(index)});
                Number++;
            }
        });
        if(count>=2){
            shiftGroup(NGP, GroupList, divide, count-1);
        }else{
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
        alert('未入力項目があります。');
    }
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