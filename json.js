const T = [
  "Exercise",
  "Fajr Namaz",
  "Dhuhr Namaz",
  "Asr Namaz",
  "Maghrib Namaz",
  "Isha Namaz",
  "College",
  "Madrasa",
  "Self-study"
];

const N = T.length;

const $ = x => document.getElementById(x);

const today = new Date();

const data = JSON.parse(
  localStorage.getItem("protrackData") || "{}"
);

const settings = JSON.parse(
  localStorage.getItem("protrackSettings") ||
  '{"on":false,"time":"21:00"}'
);

today.setHours(0, 0, 0, 0);


let view = new Date(
  today.getFullYear(),
  today.getMonth(),
  1
);


/* DATE KEY */

const key = d => {
  const x = new Date(d);

  return (
    x.getFullYear() +
    "-" +
    String(x.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(x.getDate()).padStart(2, "0")
  );
};


/* GET DAY DATA */

const day = d => {
  return data[key(d)] || {
    tasks: {},
    goal: ""
  };
};


/* SAVE */

const save = () => {
  localStorage.setItem(
    "protrackData",
    JSON.stringify(data)
  );
};


/* PERFECT DAY */

const perfect = d => {
  return T.every(
    (_, i) => day(d).tasks?.[i]
  );
};


/* HAS ACTIVITY */

const active = d => {
  return (
    Object.keys(day(d).tasks || {}).length > 0 ||
    !!day(d).goal
  );
};


/* CURRENT STREAK */

function streak() {

  let d = new Date(today);
  let n = 0;

  while (perfect(d)) {

    n++;

    d.setDate(
      d.getDate() - 1
    );
  }

  return n;
}


/* BEST STREAK */

function best() {

  const ks = Object.keys(data).sort();

  let b = 0;
  let r = 0;
  let p = null;

  ks.forEach(k => {

    const d = new Date(
      k + "T00:00:00"
    );

    if (perfect(d)) {

      r =
        p &&
        (d - p) / 864e5 === 1
          ? r + 1
          : 1;

      b = Math.max(b, r);

      p = d;

    } else {

      p = null;

    }

  });

  return b;
}


/* TOTALS */

function totals() {

  let c = 0;
  let i = 0;
  let g = 0;

  Object.keys(data).forEach(k => {

    const d = new Date(
      k + "T00:00:00"
    );

    if (perfect(d)) {
      c++;
    } else if (active(d)) {
      i++;
    }

    if (data[k].goal) {
      g++;
    }

  });

  return [c, i, g];
}


/* RENDER MAIN PAGE */

function render() {

  let x = day(today);

  data[key(today)] = x;


  /* DATE */

  $("weekday").textContent =
    today
      .toLocaleDateString(undefined, {
        weekday: "long"
      })
      .toUpperCase();


  $("dateText").textContent =
    today.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });


  /* GOAL */

  $("goal").value =
    x.goal || "";


  /* TASKS */

  $("tasks").innerHTML = "";


  T.forEach((t, i) => {

    const e =
      document.createElement("div");

    e.className =
      "task " +
      (x.tasks?.[i] ? "done" : "");


    e.innerHTML = `
      <div class="dot"></div>

      <div>
        <b>${t}</b>

        <small>
          ${
            x.tasks?.[i]
              ? "Completed"
              : "Tap to complete"
          }
        </small>
      </div>
    `;


    e.onclick = () => {

      data[key(today)].tasks[i] =
        !data[key(today)].tasks[i];

      save();

      render();
    };


    $("tasks").appendChild(e);

  });


  /* PROGRESS */

  const n =
    T.filter(
      (_, i) => x.tasks?.[i]
    ).length;


  $("count").textContent =
    n + " / " + N + " complete";


  $("bar").style.width =
    n / N * 100 + "%";


  $("status").textContent =
    n === N
      ? "PERFECT DAY"
      : "Incomplete";


  /* STREAK */

  $("topStreak").textContent =
    streak();


  /* STATISTICS */

  const [c, i, g] = totals();

  $("sc").textContent = c;
  $("si").textContent = i;
  $("sb").textContent = best();


  /* REMINDER */

  $("toggle").classList.toggle(
    "on",
    settings.on
  );


  $("rtime").value =
    settings.time;


  calendar();
  report();
}


/* CALENDAR */

function calendar() {

  const y = view.getFullYear();
  const m = view.getMonth();


  $("month").textContent =
    view.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric"
    });


  $("days").innerHTML = "";


  /* EMPTY DAYS BEFORE MONTH */

  const firstDay =
    new Date(y, m, 1).getDay();


  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    const e =
      document.createElement("div");

    e.className =
      "day empty";

    $("days").appendChild(e);
  }


  /* MONTH DAYS */

  const total =
    new Date(y, m + 1, 0).getDate();


  for (
    let n = 1;
    n <= total;
    n++
  ) {

    const d =
      new Date(y, m, n);


    const e =
      document.createElement("div");


    let classes = "day";


    if (perfect(d)) {
      classes += " perfect";
    } else if (active(d)) {
      classes += " incomplete";
    }


    if (d > today) {
      classes += " future";
    }


    if (key(d) === key(today)) {
      classes += " today";
    }


    e.className = classes;


    e.innerHTML =
      "<b>" + n + "</b>";


    $("days").appendChild(e);
  }
}


/* REPORT */

function report() {

  const [c, i, g] =
    totals();


  $("rc").textContent = c;
  $("ri").textContent = i;
  $("rs").textContent = streak();

  $("best").textContent =
    best();

  $("goals").textContent =
    g;


  $("rate").textContent =
    (
      c + i
        ? Math.round(
            c / (c + i) * 100
          )
        : 0
    ) + "%";


  /* WEEKLY HISTORY */

  $("wr").innerHTML = "";


  const start =
    new Date(today);


  start.setDate(
    start.getDate() - 6
  );


  for (let j = 0; j < 7; j++) {

    const d =
      new Date(start);


    d.setDate(
      start.getDate() + j
    );


    const e =
      document.createElement("div");


    e.className = "wd";


    let circleClass = "";


    if (perfect(d)) {
      circleClass = "done";
    } else if (active(d)) {
      circleClass = "partial";
    }


    const icon =
      perfect(d)
        ? "✓"
        : d.getDate();


    e.innerHTML = `
      ${d.toLocaleDateString(
        undefined,
        { weekday: "short" }
      )}

      <div class="circle ${circleClass}">
        ${icon}
      </div>
    `;


    $("wr").appendChild(e);
  }
}


/* VIEW SWITCHING */

function show(v) {

  ["day", "cal", "rep"].forEach(x => {

    $(x + "View")
      .classList.toggle(
        "active",
        x === v
      );

  });


  $("dayTab")
    .classList.toggle(
      "active",
      v === "day"
    );


  $("calTab")
    .classList.toggle(
      "active",
      v === "cal"
    );


  $("repTab")
    .classList.toggle(
      "active",
      v === "rep"
    );
}


/* NAVIGATION */

$("dayTab").onclick =
  () => show("day");


$("calTab").onclick =
  () => show("cal");


$("repTab").onclick =
  () => show("rep");


/* PREVIOUS MONTH */

$("prev").onclick = () => {

  view.setMonth(
    view.getMonth() - 1
  );

  calendar();
};


/* NEXT MONTH */

$("next").onclick = () => {

  view.setMonth(
    view.getMonth() + 1
  );

  calendar();
};


/* SAVE DAILY GOAL */

$("saveGoal").onclick = () => {

  data[key(today)].goal =
    $("goal").value.trim();


  save();


  $("saved").textContent =
    " Saved";


  setTimeout(() => {

    $("saved").textContent =
      "";

  }, 1200);


  render();
};


/* REMINDER TOGGLE */

$("toggle").onclick =
  async () => {

    settings.on =
      !settings.on;


    if (
      settings.on &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {

      await Notification.requestPermission();

    }


    localStorage.setItem(
      "protrackSettings",
      JSON.stringify(settings)
    );


    render();
  };


/* REMINDER TIME */

$("rtime").onchange =
  e => {

    settings.time =
      e.target.value;


    localStorage.setItem(
      "protrackSettings",
      JSON.stringify(settings)
    );

  };


/* DAILY NOTIFICATION */

setInterval(() => {

  if (
    settings.on &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {

    const n = new Date();


    const hm =
      String(n.getHours()).padStart(2, "0") +
      ":" +
      String(n.getMinutes()).padStart(2, "0");


    if (
      hm === settings.time &&
      n.getSeconds() < 10 &&
      !perfect(today)
    ) {

      new Notification(
        "ProTrack reminder",
        {
          body:
            "Complete today's routine and protect your streak."
        }
      );

    }

  }

}, 10000);


/* SERVICE WORKER */

if ("serviceWorker" in navigator) {

  navigator.serviceWorker.register(
    "sw.js"
  );

}


/* INITIAL LOAD */

render();
