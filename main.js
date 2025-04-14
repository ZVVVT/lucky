
let prizes = [];
let userName = "";

fetch("config.json")
  .then(res => res.json())
  .then(data => prizes = data.prizes || []);

document.addEventListener("DOMContentLoaded", () => {
  const resultEl = document.getElementById("result");
  const nameInput = document.getElementById("nameInput");

  document.getElementById("drawBtn").addEventListener("click", () => {
    userName = nameInput.value.trim();
    if (!userName) return alert("请输入姓名");
    if (!["ZVVT", "ZVVVT"].includes(userName)) return alert("用户不在名单中");
    if (prizes.length === 0) return alert("奖项加载失败");

    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    resultEl.innerText = "🎁 " + prize;
    saveToServer(userName, prize);
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    resultEl.innerText = "点击上方按钮抽奖";
  });

  nameInput.addEventListener("input", () => {
    userName = nameInput.value.trim();
    if (["ZVVT", "ZVVVT"].includes(userName)) {
      loadHistory(userName);
    }
  });
});

function saveToServer(name, prize) {
  fetch("https://lucky-server-masx.onrender.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, prize, time: new Date().toLocaleString() })
  })
  .then(res => res.json())
  .then(() => loadHistory(name))
  .catch(err => console.error("记录失败：", err));
}

function loadHistory(name) {
  fetch("https://lucky-server-masx.onrender.com/history")
    .then(res => res.json())
    .then(data => {
      const ul = document.getElementById("history-list");
      ul.innerHTML = "";
      const filtered = data.filter(x => x.name === name).slice(-7).reverse();
      if (filtered.length === 0) {
        ul.innerHTML = "<li>暂无记录</li>";
        return;
      }
      for (const item of filtered) {
        const li = document.createElement("li");
        li.textContent = `${item.time} 🎁 ${item.prize}`;
        ul.appendChild(li);
      }
    });
}
