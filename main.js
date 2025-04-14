// 获取或生成设备ID
function getDeviceID() {
  let deviceID = localStorage.getItem("device_id");
  if (!deviceID) {
    deviceID = crypto.randomUUID(); // 浏览器原生生成 UUID
    localStorage.setItem("device_id", deviceID);
  }
  return deviceID;
}

let prizes = [];
const deviceID = getDeviceID();

fetch('config.json')
  .then(response => response.json())
  .then(data => {
    prizes = data.prizes;
  })
  .catch(err => {
    console.error("配置加载失败", err);
    prizes = ["谢谢参与"];
  });

document.addEventListener('DOMContentLoaded', () => {
  const resultEl = document.getElementById("result");
  const deviceEl = document.getElementById("device-id");

document.getElementById("drawBtn").addEventListener("click", () => {
  if (prizes.length === 0) {
    resultEl.innerText = "奖项未加载，请稍后再试";
    return;
  }
  const index = Math.floor(Math.random() * prizes.length);
  const prize = prizes[index];  // ✅ 加上这行
  resultEl.innerText = `🎁 ${prize}`;
  saveToServer(deviceID, prize);
});


  document.getElementById("resetBtn").addEventListener("click", () => {
    resultEl.innerText = "点击上方按钮抽奖";
  });

  // 显示设备号
  deviceEl.innerText = `设备号：${deviceID}`;
});
function saveToServer(deviceID, prize) {
  fetch("https://lucky-server-masx.onrender.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      deviceID,
      prize,
      time: new Date().toLocaleString()
    })
  }).then(res => res.json())
    .then(data => {
      console.log("🎯 后端记录成功：", data);
      loadAndRenderHistory(); // ✅ ✅ ✅ 第四步：成功后刷新记录
    })
    .catch(err => console.error("❌ 后端记录失败：", err));
}


// 从后端获取所有历史记录，筛选出本设备记录后显示
function loadAndRenderHistory() {
  fetch("https://lucky-server-masx.onrender.com/history")
    .then(res => res.json())
    .then(allRecords => {
      const myRecords = allRecords
        .filter(r => r.deviceID === deviceID)
        .slice(-7)
        .reverse();

      const listEl = document.getElementById("history-list");
      if (myRecords.length === 0) {
        listEl.innerHTML = "<i>暂无记录</i>";
      } else {
        listEl.innerHTML = myRecords.map(r =>
          `<li>${r.time} | 🎁 ${r.prize}</li>`).join("");
      }
    })
    .catch(err => {
      console.error("❌ 无法加载历史记录", err);
    });
}

