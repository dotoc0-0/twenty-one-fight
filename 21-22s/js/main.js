'use strict';

{
  const Drawbtn = document.getElementById('draw');
  const Notdrawbtn = document.getElementById('notdraw');
  const Selectdraw = document.getElementById('selectdraw');
  const Btn = document.getElementById('btn');
  const Caption = document.getElementById('caption');
  const Mydiv = document.getElementById('me');
  const Enemysdiv = document.getElementById('enemy');


  //マスターのメッセージ
  function Master(key) {
    const masterText = {
      firstcards: '<p>最初のカードが配られました！</p>',
      yourturn: '<p>あなたのターンです！<br>カードを引く？</p>',
      idraw: '<p>カードを引いた！</p>',
      inotdraw: '<p>カードを引かなかった！</p>',
      over21: '<p>もう引けないよ～</p>',
      enemysturn: '<p>相手はどうするのかな？？</p>',
      enemydraws: '<p>相手はカードを引いた！</p>',
      enemynotdraws: '<p>相手はカードを引かなかった！</p>',
      showdown: '<p>両者のカードが出揃いました！</p>',
    }
    Caption.innerHTML = masterText[key];
  }

  function blackjack() {
    const h5 = document.createElement('h5');
    h5.textContent = 'ブラックジャックで勝利！すごい！';
    Caption.appendChild(h5);
  }



  //隠す・出す
  function Hide(target) {
    target.classList.add('hidden');
  }
  function Appear(target) {
    target.classList.remove('hidden');
  }

  //山札配列作成・合計値
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[j], arr[i]] = [arr[i], arr[j]]
    }
    return arr;
  }
  function getSum(player) {
    return player['tefuda'].reduce(function (a, b) {
      return a + b;
    }, 0);
  }
  let yamafuda = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);


  //プレイヤーデータ
  let me = {
    tefuda: [],
    cards: document.querySelector('#me .cards'),
    sum: document.querySelector('#me .sum'),
  }
  let enemy = {
    tefuda: [],
    cards: document.querySelector('#enemy .cards'),
    sum: document.querySelector('#enemy .sum'),
  }

  let status;
  let stand = 0; //ドローしなかった時に加算され、ドローしたら0に戻る 両者連続でスタンドし値が２になったら結果へ


  function Reset() { //リセット（タイトル画面へ）
    Hide(Mydiv);
    Hide(Enemysdiv);
    Appear(Btn);
    Hide(Selectdraw);
    Hide(Forfight);
    Hide(me.icon);
    Hide(enemy.icon);

    [me, enemy].forEach(player => {
      player.icon.innerHTML = '';
    });
    document.getElementById('power').classList.add('hidden');


    round = 0;
    bet = 1;
    status = 'title';
    modeMaster('title');
    Btn.textContent = 'Start!';
  }


  Btn.onclick = function () { //状況別ボタンのクリックイベント
    switch (status) {
      case 'title': //スタート時
        status = 'firstcards';
        Master('firstcards');
        Btn.textContent = 'Next';
        startRound();
        break;

      case 'firstcards':
      case 'enemydraws':
      case 'enemynotdraws': //自分のターンに移行
        if (stand == 2) {
          status = 'showdown';
          Master('showdown');
          return;
        }
        status = 'yourturn';
        Master('yourturn');
        Hide(Btn);
        Appear(Selectdraw);
        Drawbtn.classList.remove('disabled');
        break;

      case 'endyourturn': //相手ターンに移行
        if (stand == 2) {
          status = 'showdown';
          Master('showdown');
          return;
        }
        status = 'enemysturn';
        Master('enemysturn');
        break;

      case 'enemysturn': //相手の行動
        enemysTurn();
        break;

      case 'showdown': //勝敗判定
        status = 'title';
        endRound();
        // Btn.textContent = 'Replay';
        document.querySelectorAll('#enemy .cards p')[0].textContent = enemy.tefuda[0];
        enemy['sum'].textContent = getSum(enemy) + ' / 21';
        break;

      case 'judge': //モード勝敗判定
        status = 'end';
        if (me.power > 0) {
          modeMaster('clear');
          Btn.textContent = 'Next';
          if (mode == 'kessen') {
            Btn.textContent = '最初から';
          }
          mode = modeAction[mode].nextmode;
        } else {
          modeMaster('notclear');
          Btn.textContent = 'Replay';
        }
        break;

      case 'end': //リセット(タイトル画面へ)
        Reset();
        break;

      default:
        console.log('知らないステータス！');
        break;
    }
  }

  //スタート・リスタート処理
  function startRound() {
    Appear(Mydiv);
    Appear(Enemysdiv); //タイトル画面解除
    enemy.cards.innerHTML = '';
    me.cards.innerHTML = '';
    enemy.tefuda = [];
    me.tefuda = []; //リスタート時持ち札リセット
    yamafuda = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    Draw(me);
    Draw(me);
    Draw(enemy);
    Draw(enemy); //初期持ち札2枚ずつ
    document.querySelectorAll('#enemy .cards p')[0].textContent = '?';
    enemy['sum'].textContent = '? / 21'; //敵札1枚の値と合計値を伏せる
    me['sum'].textContent = getSum(me) + ' / 21'; //自札合計値の表示

    //ラウンド
    showRound();
    if (round == 1) {
      modeAction[mode].start();
    }
  }


  //カードドロー
  function Draw(player) {
    stand = 0;
    player['tefuda'].push(yamafuda[0]);
    yamafuda.shift();
    const p = document.createElement('p');
    p.textContent = player['tefuda'][player['tefuda'].length - 1];
    player['cards'].appendChild(p);
    me['sum'].textContent = getSum(me) + ' / 21';
  }

  //自ターンでの行動
  Drawbtn.addEventListener('click', () => {
    if (getSum(me) > 21) { //21オーバーの時はドローできない
      Master('over21');
      Drawbtn.classList.add('disabled');
      return;
    }
    Draw(me);
    status = 'endyourturn';
    Master('idraw');
    Hide(Selectdraw);
    Appear(Btn);
  });
  Notdrawbtn.addEventListener('click', () => {
    stand++;
    status = 'endyourturn';
    Master('inotdraw');
    Hide(Selectdraw);
    Appear(Btn);
  });

  //相手の行動
  function enemysTurn() {
    function enemyDraws() {
      Draw(enemy);
      status = 'enemydraws';
      Master('enemydraws');
    }
    function enemyNotDraws() {
      stand++;
      status = 'enemynotdraws';
      Master('enemynotdraws');
    }
    //13以下100％・15以下50％・18以下20％・19以上0％の確率でドロー
    let number = Math.ceil(Math.random() * 10);
    if (getSum(enemy) <= 13) {
      enemyDraws();
    } else if (getSum(enemy) <= 15) {
      if (number <= 5) {
        enemyDraws();
      } else {
        enemyNotDraws();
      }
    } else if (getSum(enemy) <= 18) {
      if (number <= 2) {
        enemyDraws();
      } else {
        enemyNotDraws();
      }
    } else {
      enemyNotDraws();
    }
  }

  //勝敗判定
  function endRound() {
    if (getSum(me) > 21 && getSum(enemy) > 21) { //両方21オーバー
      modeAction[mode].tie();
    } else {
      if (getSum(me) > 21) { //自分だけ21オーバー
        modeAction[mode].lose();
      } else if (getSum(enemy) > 21) { //相手だけ21オーバー
        modeAction[mode].win();
        if (getSum(me) == 21) { //21で勝ち
          blackjack();
        }
      } else {
        if (getSum(me) == getSum(enemy)) { //引き分け
          modeAction[mode].tie();
        } else if (getSum(me) < getSum(enemy)) { //負け
          modeAction[mode].lose();
        } else {
          modeAction[mode].win();
          if (getSum(me) == 21) { //21で勝ち
            blackjack();
          }
        }
      }
    }
    if (me.power <= 0 || enemy.power <= 0) {
      status = 'judge';
      Btn.textContent = '最終結果へ';
    }
    modeAction[mode].restart();
  }

  //ラウンド表示
  const Forfight = document.querySelector('.for-fight');
  const Round = document.getElementById('round');
  const Bet = document.getElementById('bet');
  let round = 0;
  let bet = 1;
  function showRound() {
    Appear(Forfight);
    round++;
    Round.innerHTML = 'ROUND ' + round;
    Bet.innerHTML = '次のダメージ： ' + bet;
  }


  //モードから追加
  me = Object.assign(me, {
    icon: document.querySelector('#me .icon'),
    heart: 'img/mylife.png',
    value: document.querySelectorAll("#power .value")[1],
    power: 0,
  });
  enemy = Object.assign(enemy, {
    icon: document.querySelector('#enemy .icon'),
    heart: 'img/enemyslife.png',
    value: document.querySelectorAll("#power .value")[0],
    power: 0,
  });


  let mode = 'shiren';
  const modeAction = { //モード毎の開始・ラウンド終了処理
    shiren: {
      start: function () {
        [me, enemy].forEach(player => {
          player.icon.className = 'icon heart';
          player.power = 5;
          setIcon(player, player.power, player.heart);
        });
      },
      restart: function () {
        [me, enemy].forEach(player => {
          setIcon(player, player.power, player.heart);
        });
      },
      win: function () {
        modeMaster('win');
        enemy.power = enemy.power - bet;
        bet++;
      },
      lose: function () {
        modeMaster('lose');
        me.power = me.power - bet;
        bet++;
      },
      tie: function () {
        modeMaster('tie');
        enemy.power = enemy.power - bet;
        me.power = me.power - bet;
        bet++;
      },
      nextmode: 'fukushuu',
    },
    fukushuu: {
      //ダメージ蓄積式なので復讐モードのみパワーと設置アイコン数が逆
      start: function () {
        [me, enemy].forEach(player => {
          player.icon.className = 'icon damage';
          player.power = 10;
          setIcon(player, 10 - player.power, 'img/damage.png');
        });
      },
      restart: function () {
        [me, enemy].forEach(player => {
          if (player.power < 0) {
            setIcon(player, 10, 'img/damage.png');
            return;
          }
          setIcon(player, 10 - player.power, 'img/damage.png');
        });
      },
      win: function () {
        modeMaster('win');
        enemy.power = enemy.power - bet;
        bet++;
      },
      lose: function () {
        modeMaster('lose');
        me.power = me.power - bet;
        bet++;
      },
      tie: function () {
        modeMaster('tie');
        enemy.power = enemy.power - bet;
        me.power = me.power - bet;
        bet++;
      },
      nextmode: 'kessen',
    },
    kessen: {
      start: function () {
        //パワーゲージを出現させ、値をセット
        document.getElementById('power').classList.remove('hidden');
        me.power = 7;
        setGage();
      },
      restart: function () {
        setGage();
      },
      win: function () {
        modeMaster('win');
        me.power = me.power + bet;
        if (me.power > 14) {
          me.power = 14;
        }
        enemy.power = 14 - me.power;
        bet++;
      },
      lose: function () {
        modeMaster('lose');
        me.power = me.power - bet;
        if (me.power < 0) {
          me.power = 0;
        }
        enemy.power = 14 - me.power;
        bet++;
      },
      tie: function () {
        modeMaster('tie');
      },
      nextmode: 'shiren',
    },
  }

  //各モードのアイコン・ゲージ設置用
  function setIcon(player, number, src) {
    player['icon'].innerHTML = '';
    for (let i = 0; i < number; i++) {
      const img = document.createElement('img');
      img.src = src;
      player['icon'].appendChild(img);
    }
  }
  function setGage() {
    enemy.power = 14 - me.power;
    [me, enemy].forEach(player => {
      player.value.textContent = player.power;
      document.querySelector('#power .border').style.width = `calc(100% * ${me['power']} / 14)`;
    });
  }

  //モードによって変わるテキスト
  function modeMaster(key) {
    const modeText = {
      shiren: {
        title: '<h2>21<br>-Twenty One-</h2><br><br><br><h3>試練モード</h3><h5>先に相手のライフを0にすれば勝利</h5>',
        win: `<h3>勝利！</h3><p>相手のライフが${bet}減った！</p>`,
        lose: `<h3>敗北！</h3><p>自分のライフが${bet}減った！</p>`,
        tie: `<h3>引き分け！</h3><p>両者のライフが${bet}減った！</p>`,
        clear: `<h3>試練モード クリア！</h3><p>おめでとうございます！</p>`,
        notclear: `<h3>負けた・・・</h3><p>もう一度挑戦！</p>`,
      },
      fukushuu: {
        title: '<h2>21<br>-Twenty One-</h2><br><br><br><h3>復讐モード</h3><h5>先に相手に10ダメージ与えたら勝利</h5>',
        win: `<h3>勝利！</h3><p>相手のダメージが${bet}増えた！</p>`,
        lose: `<h3>敗北！</h3><p>自分のダメージが${bet}増えた！</p>`,
        tie: `<h3>引き分け！</h3><p>両者のダメージが${bet}増えた！</p>`,
        clear: `<h3>復讐モード クリア！</h3><p>おめでとうございます！</p>`,
        notclear: `<h3>負けた・・・</h3><p>もう一度挑戦！</p>`,
      },
      kessen: {
        title: '<h2>21<br>-Twenty One-</h2><br><br><br><h3>決戦モード</h3><h5>先に相手のパワーを0にすれば勝利</h5>',
        win: `<h3>勝利！</h3><p>自分のパワーが${bet}増した！</p>`,
        lose: `<h3>敗北！</h3><p>相手のパワーが${bet}増した！</p>`,
        tie: `<h3>引き分け！</h3><p>パワーは均衡を保っている。</p>`,
        clear: `<h3>決戦モード クリア！</h3><p>おめでとうございます！</p>`,
        notclear: `<h3>負けた・・・</h3><p>もう一度挑戦！</p>`,
      },
    }
    Caption.innerHTML = modeText[mode][key];
  }


  //モード選択
  const Modebtn = document.querySelectorAll('#mode-select li input');
  const Modeok = document.querySelector('#mode-select button');
  const Modediv = document.getElementById('mode-select');

  Modeok.addEventListener('click', () => {

    //モード切替
    for (let i = 0; i < Modebtn.length; i++) {
      if (Modebtn[i].checked) {
        mode = Modebtn[i].id;
      }
    }
    Modediv.classList.add('hidden');

    Reset();
  });

  document.getElementById('menu-mode').addEventListener('click', () => {
    Modediv.classList.toggle('hidden');
  });

  Reset();

}