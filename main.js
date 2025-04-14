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
    resultEl.innerText = `🎁 ${prizes[index]}`;
	// ✅ 记录抽奖结果到后端
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
    .then(data => console.log("🎯 后端记录成功：", data))
    .catch(err => console.error("❌ 后端记录失败：", err));
}
