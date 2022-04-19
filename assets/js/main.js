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
var weight = [];

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

    defineWight(numberGroupPeople[0]);

    return numberGroupPeople;
}

function defineWight(nGroup){
    var slider = nGroup - 2;//スライドする人数
    weight.length = nGroup;
    weight.fill(0);
    if(slider>0){
        for(let i = 0; i < slider; i++){
            weight[i] = (i % 2 ? 1 : -1);
        }
    }
}

function shuffleWeight(){
    shuffleGroupSort(weight);
    console.log(weight);
}

//グループの振り分けにランダム性を持たせる関数
//weight: 重み
function shuffleGroupSort(weight){
    for (let i = weight.length - 2; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [weight[i], weight[j]] = [weight[j], weight[i]];
    }
    return weight;
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
function shiftGroup(NGP, preGroupList,  divide, Remain){
    let nextGroupList = [];
    let counter = 0;
    NGP.forEach(function (value) {//index: 各グループの格納人数のindex
        shuffleWeight();
        for (let i = 0; i < value; i++) {
            let index = counter + weight[i];
            if(index<0){
                index += divide;
            }
            nextGroupList.push({No:preGroupList[counter].No,GroupName:getGroupName((index) % divide)});
            personalGroupList[preGroupList[counter].No-1].GroupList += ', '+getGroupName((index) % divide);
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
        showResult(personalGroupList);
        // setTimeout(function (){location.reload();},5000);
    }
}

//グループ振り分けアルゴリズム: グループのN分割を再帰的に繰り返す
//total: 参加者の合計人数 , divide: グループを何分割するか , count: 議論の回数
function assignGroup(total,divide,count){
    initializeList();
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
    weight = [];
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