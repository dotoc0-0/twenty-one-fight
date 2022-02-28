'use strict';

{
  const Text = document.querySelector('#rule .text');
  const Pagenumber = document.querySelector('#rule .page');
  const Next = document.querySelector('#rule .next');
  const Prev = document.querySelector('#rule .prev');
  const Tabs = document.querySelectorAll('.tab');

  const ruleText = {
    game: [
      'ゲームを開始すると、<b>自分(Player)</b>と<b>相手(Enemy)</b>に2枚ずつ<b>手札</b>が配られます。<br>    (最初に配られた手札のうち、相手の手札の片方は伏せられていて見ることができません。)<br><br>自分のターンでは、山札からカードを引くかどうかを選択することができます。<br>このゲームで使用するのは、1～11の数字が書かれた<b>合計11枚</b>のカードです。<br>',
      '自分の持ち札や相手の見えている手札から山札の残りのカードの数字を推察しつつ、<b>自分の手札の合計を21に近づける</b>ことを目指しましょう。<br><br>ただし、自分の手札の合計が<b>21を超えてしまうと勝利することはできません。</b>',
      '手札の合計が21以下の場合、<b>相手よりも手札の合計が多ければあなたの勝利</b>です。<br>(<b>相手の手札の合計のみが21を超えていた場合</b>も、あなたの勝利です。)<br><br>自分の手札の合計が21を超えてしまった場合や相手の手札の合計の方が21に近かった場合は敗北、相手と手札の合計が同じだった場合や両方とも21を超えてしまっていた場合は引き分けとなります。',
    ],
    mode: [
      '敵とカードゲームの勝敗を重ねることで戦いが進んでいきます。<br>戦えるモードの種類は3つあります。<br>（<b>試練モード、復讐モード、決戦モード</b>）<br><br>モードは最初から選択可能ですが、<b>順番にプレイ</b>するのがおすすめです。<br>全てのモードをクリアすることを目指してみましょう。',
      '<b>試練モード</b><br><br>ライフ5つで戦います。<br>カードゲームに勝利すると相手のライフの数が減り、敗北すると自分のライフが減ります。<br>引き分けの場合、両方のライフの数が減ります。<br>ラウンドが進むごとに、減るライフの数も増えていきます。<br>自分より先に相手のライフを削り切ることができれば試練モードクリアです。',
      '<b>復讐モード</b><br><br>試合の勝敗に応じて、自分や相手にダメージが蓄積します。<br>引き分けの場合、両方にダメージが蓄積します。<br>蓄積するダメージは1ラウンドごとに1上がります。<br>自分より先に相手のダメージを10以上にできれば復讐モードクリアです。',
      '<b>決戦モード</b><br><br>押し合う2つのパワーゲージで戦います。<br>勝利すると自分のパワーゲージが伸び、敗北すると相手のゲージに押されてしまいます。<br>引き分けの場合、パワーゲージは変動しません。<br>自分のパワーゲージを14まで伸ばし、相手のパワーを0に出来れば決戦モードクリアです。',
    ],
  }

  //タブ
  let selectedText = ruleText.game;
  function changeTab(key) {
    selectedText = ruleText[key];
  }

  //ページ切替
  let page;
  function changePage() {
    Next.classList.remove('disabled');
    Prev.classList.remove('disabled');
    if (page < 1) {
      Prev.classList.add('disabled');
    }
    Text.innerHTML = selectedText[page];
    Pagenumber.innerHTML = (page + 1) + ' / ' + selectedText.length;
    if (page >= selectedText.length - 1) {
      Next.classList.add('disabled');
    }
  }

  Next.addEventListener('click', () => {
    page++;
    changePage();
  });
  Prev.addEventListener('click', () => {
    page--;
    changePage();
  });


  //クリックでタブ切替
  for (let i = 0; i < Object.keys(ruleText).length; i++) {
    Tabs[i].addEventListener('click', () => {
      Tabs.forEach(tab => {
        tab.classList.remove('selected');
      });
      Tabs[i].classList.add('selected');
      changeTab(Object.keys(ruleText)[i]);
      page = 0;
      changePage();
    });
  }
  

  //ルール開閉
  const Rulebtn = document.getElementById('menu-rule');
  const Ruleclose = document.querySelector('#rule .close');
  Rulebtn.addEventListener('click', () => {
    Tabs.forEach(tab => {
      tab.classList.remove('selected');
    });
    Tabs[0].classList.add('selected');
    changeTab(Object.keys(ruleText)[0]);
    page = 0;
    changePage();
    document.getElementById('rule').classList.remove('hidden');
  });
  Ruleclose.addEventListener('click', () => {
    document.getElementById('rule').classList.add('hidden');
  });
}