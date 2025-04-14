let deviceID = null;
let userName = localStorage.getItem("user_name") || ""; // 本地缓存用户名


async function initDeviceID() {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  deviceID = result.visitorId;

  const deviceEl = document.getElementById("device-id");
  if (deviceEl) deviceEl.innerText = `设备号：${deviceID}`;

  loadAndRenderHistory(); // 等 fingerprint 获取完再加载历史
}



let prizes = [];


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
  const nameInput = document.getElementById("nameInput");

  if (userName) {
    nameInput.value = userName;
  }

  nameInput.addEventListener("input", (e) => {
    userName = e.target.value.trim();
    localStorage.setItem("user_name", userName);
  });

  initDeviceID(); // 获取 fingerprint 并加载记录
});



function saveToServer(prize) {
  if (!userName) {
    alert("请先输入您的姓名！");
    return;
  }

  fetch("https://lucky-server-masx.onrender.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceID,
      name: userName,
      prize,
      time: new Date().toLocaleString()
    })
  }).then(res => res.json())
    .then(data => {
      console.log("🎯 记录成功：", data);
      loadAndRenderHistory();
    })
    .catch(err => console.error("❌ 提交失败：", err));
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

