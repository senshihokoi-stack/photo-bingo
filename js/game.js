const missions = [
    "桜島","しろくま","せごどん","城門","大久保利通",
    "山地委員長","鹿児島名物","鰻","ロケット","全員自撮り",
    "他チーム","観覧車","路面電車","天文館","黒豚",
    "西郷像","噴水","マンホール","神社","商店街",
    "笑顔","灰色の物","アーケード","看板","自由枠"
];

const team = localStorage.getItem("team") || "未選択";
document.getElementById("team").textContent = "チーム " + team;

const grid = document.getElementById("grid");

// 進捗表示
function updateProgress() {
    let count = 0;

    for (let i = 0; i < missions.length; i++) {
        if (localStorage.getItem("photo" + i)) {
            count++;
        }
    }

    document.getElementById("progress").textContent = `${count} / ${missions.length}`;
}

missions.forEach((mission, index) => {

    const cell = document.createElement("div");
    cell.className = "cell";

    cell.innerHTML = `
        <div class="photo">📷</div>
        <div>${mission}</div>
    `;

    // 保存済み写真
    const saved = localStorage.getItem("photo" + index);

    if (saved) {
        cell.querySelector(".photo").innerHTML =
            `<img src="${saved}" class="photoImage">`;
    }

    // ファイル選択
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    input.addEventListener("change", function (e) {

        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = function () {

            cell.querySelector(".photo").innerHTML =
                `<img src="${reader.result}" class="photoImage">`;

            localStorage.setItem("photo" + index, reader.result);

            updateProgress();

        };

        reader.readAsDataURL(file);

    });

    cell.addEventListener("click", function () {
        input.click();
    });

    document.body.appendChild(input);
    grid.appendChild(cell);

});

updateProgress();