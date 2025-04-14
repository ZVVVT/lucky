
let deviceID = null;
let userName = localStorage.getItem("user_name") || "";
let isFingerprintReady = false;

async function initDeviceID() {
  try {
    const fp = await window.FingerprintJS.load(); // ✅ 使用 window 引用全局对象
    const result = await fp.get();
    deviceID = result.visitorId;
    isFingerprintReady = true;

    const deviceEl = document.getElementById("device-id");
    if (deviceEl) deviceEl.innerText = `设备号：${deviceID}`;

    loadAndRenderHistory();
  } catch (err) {
    console.error("❌ 指纹识别失败", err);
    alert("无法初始化设备号，请刷新页面后重试。");
  }
}


let prizes = [];

fetch("config.json")
  .then(response => response.json())
  .then(data => {
    prizes = data.prizes;
  })
  .catch(err => {
    console.error("配置加载失败", err);
    prizes = ["谢谢参与"];
  });

document.addEventListener("DOMContentLoaded", () => {
  const resultEl = document.getElementById("result");
  const nameInput = document.getElementById("nameInput");

  if (userName) {
    nameInput.value = userName;
  }

  nameInput.addEventListener("input", (e) => {
    userName = e.target.value.trim();
    localStorage.setItem("user_name", userName);
  });

  document.getElementById("drawBtn").addEventListener("click", () => {
    if (!isFingerprintReady || !deviceID) {
      alert("设备识别中，请稍候...");
      return;
    }
    if (!userName) {
      alert("请输入您的姓名！");
      return;
    }
    if (prizes.length === 0) {
      resultEl.innerText = "奖项未加载，请稍后再试";
      return;
    }

    const index = Math.floor(Math.random() * prizes.length);
    const prize = prizes[index];
    resultEl.innerText = `🎁 ${prize}`;
    saveToServer(prize);
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    resultEl.innerText = "点击上方按钮抽奖";
  });

  initDeviceID();
});

function saveToServer(prize) {
  const time = new Date().toLocaleString();
  console.log("正在提交：", { deviceID, name: userName, prize, time });

  fetch("https://lucky-server-masx.onrender.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      deviceID,
      name: userName,
      prize,
      time
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log("🎯 记录成功", data);
      loadAndRenderHistory();
    })
    .catch(err => console.error("❌ 提交失败", err));
}

function loadAndRenderHistory() {
  fetch("https://lucky-server-masx.onrender.com/history")
    .then(res => res.json())
    .then(all => {
      const historyList = document.getElementById("history-list");
      const mine = all.filter(r => r.deviceID === deviceID).slice(-7).reverse();
      if (mine.length === 0) {
        historyList.innerHTML = "<i>暂无记录</i>";
      } else {
        historyList.innerHTML = mine.map(r =>
          `<li>${r.time} | 🎁 ${r.prize} | 👤 ${r.name}</li>`
        ).join("");
      }
    });
}
