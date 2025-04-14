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
  const resultEl = document.getElementById("result");

  document.getElementById("drawBtn").addEventListener("click", () => {
    if (prizes.length === 0) {
      resultEl.innerText = "奖项未加载，请稍后再试";
      return;
    }
    const index = Math.floor(Math.random() * prizes.length);
    resultEl.innerText = `🎁 ${prizes[index]}`;
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    resultEl.innerText = "点击上方按钮抽奖";
  });
});
