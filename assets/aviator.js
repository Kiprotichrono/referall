let busts = [];
let STATE = "RUNNING";

let points = [];
let labels = [];
let point_counter = 0;

let users = [];
let RUNNING = "RUNNING";
let BUSTED = "BUSTED";
let WAIT = "WAIT";

let time = 0;
let start_time = 0;
let chart;
let elem_time;

let bet_details = {
  hasPlaceBet: false,
  amount: 0,
  autoBet: false,
  cashout: 1, //multiplier
};

function getBusts() {
  return busts;
}

function getRunningTime2() {
  let MAX_BUST = 30000.0;
  let MIN_BUST = 1000.0;
  return Math.random() * MAX_BUST + MIN_BUST;
}

function getRunningTime() {
  let MAX_ODDS = 15000.0;
  let MIN_ODDS = 1100.0;

  let num = Math.floor(MAX_ODDS / 1000);
  let weights = []; //new double[num];
  let values = []; //new int[num];

  let totalWeight = 0.0;
  for (let i = 0; i < num; i++) {
    weights[i] = Math.pow(num - i, 2);
    values[i] = i;
    totalWeight += weights[i];
  }

  let idx = 0;
  for (let r = Math.random() * totalWeight; idx < weights.length - 1; ++idx) {
    r -= weights[idx];
    if (r <= 0.0) break;
  }
  let myRandomItem = values[idx];
  let random_range = myRandomItem * 1000 + Math.random() * 1000;
  return random_range + MIN_ODDS;
}

function getWaitTime() {
  return 10000;
}

function getBustTime() {
  return 3000.0;
}

function showBusts() {
  let elem = document.getElementById("busts");
  elem.innerHTML = "";

  let BUSTS_SHOWN = 7;
  for (let i = 0; i < Math.min(busts.length, BUSTS_SHOWN); i++) {
    let b = busts[i] / 1000;
    let item = document.createElement("span");
    item.textContent = b.toFixed(2) + "x";
    item.style.display = "block";
    item.style.margin = "2px";
    item.style.opacity = 1.0 - (i * i) / 70.0;
    item.style.fontSize = "small";
    if (b < 2) {
      item.style.color = "red";
    } else {
      item.style.color = "rgb(46, 204, 113)";
    }
    elem.appendChild(item);
  }
}

function addHistoricBusts(count) {
  busts = [];
  for (let i = 0; i < count; i++) {
    let r = getRunningTime();
    busts.push(r);
  }
  showBusts();
}

function handleRunning() {
  //Clear chart
  let t = ((start_time - time) / 1000);
  //let x1 = labels.length + 1;

  points[point_counter] = t;
  point_counter += 1;
  
  let mydata = [];
 // let xs = [];
  for (let i = 0; i < point_counter; i++){
      let t0 = points[i];
      let y1 = Math.pow(t0 * 0.3, 2);
      let x1 = i ;

      mydata.push(y1) ;//{x : x1, y : y1})
  }


  for(let j = point_counter; j < 100; j++){
    mydata.push(null);
  }

  chart.data.datasets[0].data = mydata;
  //chart.data.labels = xs;
  chart.update();

  elem_time.style.color = "white";
  elem_time.style.fontSize = "4vh";

  let v = t.toFixed(2);
  elem_time.innerHTML = v + "x";
}

function _handleBustsWinnings(t) {
  if (!bet_details.hasPlaceBet) {
    return;
  }

  let wt = t / 1000; //actual bust
  let ut = bet_details.cashout; //already a multiplier

  let won = (ut < wt ) && ut > 0;
  app_winnings(bet_details.amount, bet_details.cashout, won);
  bet_details.hasPlaceBet = false;
}

function handleBust() {
  busts.unshift(start_time);
  showBusts();
  _handleBustsWinnings(start_time);

  points = [];
  point_counter = 0;
  chart.data.datasets[0].data = points;
  chart.update();

  elem_time.style.fontSize = "5vh";
  elem_time.style.color = "red";
  let t = (start_time / 1000).toFixed(2);
  elem_time.innerHTML = "Busted <br> @ " + t;
  handleUsers(start_time / 1000);
}

function addUsers() {
  if (users.length > 10) {
    return;
  }

  let names = [
    "Eric",
    "James",
    "Momanyi",
    "KiptooG",
    "Aztec",
    "Helen",
    "Faith",
    "Kiptum",
    "Richie",
    "Asbel",
    "Wairimu",
    "Atieno",
    "Juma5",
    "Kiprono33",
    "Ronnie",
    "Jeniffer67",
    "Awol",
    "Daudi",
    "Ken",
    "Sukari",
    "Caro",
    "Shally8",
  ];

  let num_users = Math.floor(Math.random() * 2);
  //console.log("added " + num_users);
  for (let i = 0; i < num_users; i++) {
    let pos = Math.floor(Math.random() * names.length);
    let v = getRunningTime() / 1000;
    let amount = Math.floor(Math.random() * 30) * 100 + 100;
    let user = [names[pos], v, amount, "-"];
    users.push(user);
    showUsers(false);
  }
}

function showUsers(busted) {
  let parent = document.getElementById("players");
  parent.innerHTML = "";
  for (let i = 0; i < users.length; i++) {
    let item = document.createElement("div");
    item.className = "row player";

    //console.log(users[i]);
    let name = users[i][0];
    let amount = users[i][2].toFixed(2);
    amount = ("Ksh " + amount).padStart(12);
    let at = busted ? users[i][1].toFixed(2) : "-";
    if (users[i][3] == 0){
      at  = "-";
    }

    let profit = busted ? users[i][3].toFixed(2) : "-";
    if (!busted) {
      profit = "-";
      item.style.color = "darkorange";
    } else {
      //console.log(users[i]);
      if (profit <= 0) {
        profit = "-";
        item.style.color = "red";
      } else {
        item.style.color = "rgb(46, 204, 113)";
      }
    }

    profit = ("Ksh " + profit).padStart(12);

    item.innerHTML = `
    <div class="player-child">${name}</div>
    <div class="player-child">${at}</div>
    <div class="player-child">${amount}</div>
    <div class="player-child">${profit}</div>`;

    parent.appendChild(item);
  }
}

function handleUsers(t) {
  //busted at t
  for (let i = 0; i < users.length; i++) {
    if (users[i][1] < t) {
      users[i][3] = users[i][1] * users[i][2];
    } else {
      users[i][3] = 0;
    }
  }
  showUsers(true);
}

function handleWait() {
  //wait
  elem_time.style.fontSize = "4vh";
  let t = (time / 1000).toFixed(1);
  elem_time.style.color = "cyan";
  elem_time.innerHTML = "Next Round In <br>" + t;

  //add self
  if (bet_details.autoBet) {
    bet_details.hasPlaceBet = true;
  }

  //add users
  if (t < 5.0) {
    addUsers();
  }
}

function stateMachine() {
  time -= 100;
  if (STATE == RUNNING) {
    handleRunning();
    if (time <= 0) {
      STATE = BUSTED;
      handleBust();

      time = getBustTime();
      start_time = time;
    }
  } else if (STATE == BUSTED) {
    if (time <= 0) {
      STATE = WAIT;
      users = [];
      time = getWaitTime();
      start_time = time;
    }
  } else if (STATE == WAIT) {
    handleWait();
    if (time <= 0) {
      
      STATE = RUNNING;
      time = getRunningTime();
      start_time = time;
      time = time - 1000;
    }
  }
  setTimeout(stateMachine, 100);
}

function createChart() {
  const labels = [];
  for (i = 0; i < 100; i++) {
    labels.push(i);
  }

  chart = new Chart(document.getElementById("chart-canvas"), {
    type: "line",
   
    data: {
      labels: labels,
      datasets: [
        {
          label: "Aviator",
          data: [],
          fill: true,
          cubicInterpolationMode : "monotone",
          color: "rgb(0,255,255)",
          backgroundColor: "rgb(0, 0, 0)",
          borderColor: "rgb(255, 255, 255)",
          borderWidth : 1,
          tension: 0.5,
          lineTension: 0.5,
          pointRadius: 0,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
          labels: {
            color: "rgb(255, 99, 132)",
          },
        },
      },
      scales: {
        y: {
          display: true,
          stacked: true,
          min: 0,
          max: 10,
        },
        x: {
          display: true,
          stacked: true,
          min: 0,
          max: 100,
        },
      },
    },
  });
  chart.options.animation = false;
}

function aviator_run() {
  elem_time = document.getElementById("time");

  //love me some randomness
  let c = Math.floor(Math.random() * 3);
  if (c == 0) {
    time = getRunningTime();
    start_time = time;
    time = time - 1000;
    STATE = RUNNING;
  } else if (c == 1) {
    time = getBustTime();
    start_time = time;
    STATE = BUSTED;
  } else {
    time = Math.floor(Math.random() * 10);
    start_time = time;
    STATE = WAIT;
  }

  addHistoricBusts(10);
  createChart();
  stateMachine();
}

function aviator_auto_bet(amount, cashout, auto) {
  bet_details.amount = amount;
  bet_details.hasPlaceBet = false;
  bet_details.autoBet = auto;
  bet_details.cashout = cashout;
}

function aviator_bet(amount) {
  if (STATE == WAIT) {
    bet_details.amount = amount;
    bet_details.hasPlaceBet = true;
    bet_details.autoBet = false;
    bet_details.cashout = -1;

    app_message("Bet placed.");
    app_canCashout();
  } else {
    app_message("Wait for next round.");
  }
}

function aviator_manual_cashout() {
  if (STATE == RUNNING) {
    bet_details.cashout = time / 1000;
    app_message("You have cashout.");
  } else {
    app_message("Cannot cashout now.");
  }
}
