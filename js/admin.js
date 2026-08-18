console.log("★★ 管理者画面 強化版 admin.js 読み込み ★★");

// ============================
// Firebase
// ============================

import {
    db
} from "./firebase.js";

import {
    collectionGroup,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ============================
// HTML要素
// ============================

const teamList = document.getElementById("teamList");


// ============================
// 写真拡大モーダル
// ============================

const modal = document.createElement("div");

modal.id = "photoModal";

modal.style.display = "none";
modal.style.position = "fixed";
modal.style.left = "0";
modal.style.top = "0";
modal.style.width = "100%";
modal.style.height = "100%";
modal.style.background = "rgba(0,0,0,0.85)";
modal.style.zIndex = "9999";
modal.style.justifyContent = "center";
modal.style.alignItems = "center";
modal.style.flexDirection = "column";

modal.innerHTML = `
    <button
        id="photoModalClose"
        style="
            position:absolute;
            top:20px;
            right:20px;
            font-size:30px;
            background:none;
            border:none;
            color:white;
            cursor:pointer;
            z-index:10000;
        "
    >
        ✕
    </button>

    <img
        id="photoModalImage"
        src=""
        alt=""
        style="
            max-width:90%;
            max-height:80%;
            object-fit:contain;
            border-radius:10px;
            box-shadow:0 5px 30px rgba(0,0,0,0.5);
        "
    >

    <div
        id="photoModalTitle"
        style="
            color:white;
            font-size:18px;
            margin-top:15px;
            text-align:center;
        "
    ></div>
`;

document.body.appendChild(modal);


// ============================
// モーダルを閉じる
// ============================

document
    .getElementById("photoModalClose")
    .addEventListener("click", function() {

        modal.style.display = "none";

    });


modal.addEventListener("click", function(event) {

    if (event.target === modal) {

        modal.style.display = "none";

    }

});


// ============================
// 写真を拡大
// ============================

function openPhoto(imageUrl, missionTitle) {

    const image =
        document.getElementById("photoModalImage");

    const title =
        document.getElementById("photoModalTitle");

    image.src = imageUrl;

    title.textContent = missionTitle || "";

    modal.style.display = "flex";

}


// ============================
// 更新ボタン
// ============================

const refreshButton = document.createElement("button");

refreshButton.textContent = "🔄 最新情報に更新";

refreshButton.style.display = "block";
refreshButton.style.margin = "0 auto 20px";
refreshButton.style.padding = "10px 20px";
refreshButton.style.border = "none";
refreshButton.style.borderRadius = "8px";
refreshButton.style.background = "#1976d2";
refreshButton.style.color = "white";
refreshButton.style.fontSize = "15px";
refreshButton.style.cursor = "pointer";

refreshButton.addEventListener("click", function() {

    loadTeams();

});


// teamListの前に追加
if (teamList) {

    teamList.parentNode.insertBefore(
        refreshButton,
        teamList
    );

}


// ============================
// チーム読み込み
// ============================

async function loadTeams() {

    console.log("★★ 写真データ取得開始 ★★");

    refreshButton.disabled = true;
    refreshButton.textContent = "⏳ 読み込み中...";


    teamList.innerHTML = `
        <p style="text-align:center;">
            チーム情報を読み込んでいます...
        </p>
    `;


    try {

        // ============================
        // photosを全部取得
        // ============================

        const photosSnapshot = await getDocs(
            collectionGroup(db, "photos")
        );


        console.log(
            "★★ 写真ドキュメント数:",
            photosSnapshot.size
        );


        // ============================
        // チーム別に整理
        // ============================

        const teams = {};


        photosSnapshot.forEach(function(photoDoc) {

            const data = photoDoc.data();


            // ============================
            // チーム番号
            // ============================

            let team = data.team;


            // teamがない場合は
            // Firestoreのパスから取得

            if (!team) {

                const parentTeam =
                    photoDoc.ref.parent.parent;

                if (parentTeam) {

                    team = parentTeam.id;

                }

            }


            if (!team) {

                console.warn(
                    "チーム番号なし:",
                    photoDoc.id
                );

                return;

            }


            // ============================
            // チーム作成
            // ============================

            if (!teams[team]) {

                teams[team] = {

                    photos: {},

                    photoList: []

                };

            }


            // ============================
            // ミッション番号
            // ============================

            const missionIndex =
                data.missionIndex;


            // ============================
            // 写真情報
            // ============================

            const photoData = {

                id: photoDoc.id,

                imageUrl:
                    data.imageUrl,

                missionIndex:
                    missionIndex,

                missionTitle:
                    data.missionTitle || "",

                createdAt:
                    data.createdAt || null

            };


            // ============================
            // 写真一覧
            // ============================

            teams[team]
                .photoList
                .push(photoData);


            // ============================
            // ミッション別
            // 同じミッションは1枚として扱う
            // ============================

            if (
                missionIndex !== undefined &&
                missionIndex !== null
            ) {

                teams[team]
                    .photos[missionIndex] =
                    photoData;

            }

        });


        console.log(
            "★★ チーム集計:",
            teams
        );


        // ============================
        // チーム番号取得
        // ============================

        const teamNumbers =
            Object.keys(teams);


        // ============================
        // チームなし
        // ============================

        if (teamNumbers.length === 0) {

            teamList.innerHTML = `
                <div
                    class="no-team"
                    style="
                        background:white;
                        padding:30px;
                        border-radius:15px;
                        text-align:center;
                    "
                >
                    <p>
                        まだ写真を登録したチームがありません。
                    </p>
                </div>
            `;

            return;

        }


        // ============================
        // チーム番号順
        // ============================

        teamNumbers.sort(function(a, b) {

            return Number(a) - Number(b);

        });


        // ============================
        // 画面クリア
        // ============================

        teamList.innerHTML = "";


        // ============================
        // チーム表示
        // ============================

        teamNumbers.forEach(function(team) {

            const teamData = teams[team];


            // ============================
            // 完了ミッション数
            // ============================

            const completedCount =
                Object.keys(
                    teamData.photos
                ).length;


            // ============================
            // 進捗率
            // ============================

            const progress =
                Math.round(
                    (
                        completedCount / 25
                    ) * 100
                );


            // ============================
            // COMPLETE判定
            // ============================

            const isComplete =
                completedCount >= 25;


            // ============================
            // カード
            // ============================

            const card =
                document.createElement("div");

            card.className =
                "admin-team-card";


            card.style.background = "white";
            card.style.borderRadius = "15px";
            card.style.padding = "20px";
            card.style.marginBottom = "20px";
            card.style.boxShadow =
                "0 3px 12px rgba(0,0,0,0.08)";


            if (isComplete) {

                card.style.border =
                    "3px solid #f5b400";

            }


            // ============================
            // 写真一覧
            // ============================

            const photos =
                Object.values(
                    teamData.photos
                ).sort(function(a, b) {

                    return (
                        Number(a.missionIndex) -
                        Number(b.missionIndex)
                    );

                });


            // ============================
            // 写真HTML
            // ============================

            let photosHTML = "";


            photos.forEach(function(photo) {

                if (!photo.imageUrl) {

                    return;

                }


                photosHTML += `
                    <div
                        class="admin-photo-item"
                        data-image-url="${photo.imageUrl}"
                        data-mission-title="${photo.missionTitle}"
                        style="
                            width:140px;
                            cursor:pointer;
                        "
                    >

                        <img
                            src="${photo.imageUrl}"
                            alt="${photo.missionTitle}"
                            style="
                                width:140px;
                                height:100px;
                                object-fit:cover;
                                border-radius:8px;
                                display:block;
                            "
                        >

                        <div
                            style="
                                font-size:13px;
                                margin-top:5px;
                                line-height:1.4;
                            "
                        >
                            ${photo.missionIndex}.
                            ${photo.missionTitle}
                        </div>

                    </div>
                `;

            });


            // ============================
            // カードHTML
            // ============================

            card.innerHTML = `

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:10px;
                        flex-wrap:wrap;
                    "
                >

                    <div
                        class="admin-team-name"
                        style="
                            font-size:24px;
                            font-weight:bold;
                        "
                    >
                        チーム ${team}
                    </div>


                    <div
                        style="
                            font-size:24px;
                            font-weight:bold;
                        "
                    >
                        ${completedCount} / 25
                    </div>

                </div>


                <!-- 進捗バー -->

                <div
                    style="
                        width:100%;
                        height:18px;
                        background:#e5e5e5;
                        border-radius:10px;
                        overflow:hidden;
                        margin-top:15px;
                    "
                >

                    <div
                        style="
                            width:${Math.min(progress, 100)}%;
                            height:100%;
                            background:#1976d2;
                            border-radius:10px;
                            transition:width 0.3s;
                        "
                    ></div>

                </div>


                <!-- 進捗率 -->

                <div
                    style="
                        text-align:right;
                        margin-top:5px;
                        font-size:14px;
                        color:#555;
                    "
                >
                    ${progress}%
                </div>


                <!-- 完了表示 -->

                ${
                    isComplete
                    ?
                    `
                        <div
                            style="
                                margin-top:15px;
                                padding:12px;
                                background:#fff4c2;
                                border-radius:10px;
                                text-align:center;
                                font-size:20px;
                                font-weight:bold;
                            "
                        >
                            🏆 COMPLETE!!
                        </div>
                    `
                    :
                    ""
                }


                <!-- 写真を見るボタン -->

                <button
                    class="photo-toggle-button"
                    style="
                        margin-top:15px;
                        padding:10px 18px;
                        border:none;
                        border-radius:8px;
                        background:#1976d2;
                        color:white;
                        font-size:15px;
                        cursor:pointer;
                    "
                >
                    📷 写真を見る（${photos.length}枚）
                </button>


                <!-- 写真一覧 -->

                <div
                    class="admin-photo-container"
                    style="
                        display:none;
                        margin-top:15px;
                    "
                >

                    <div
                        class="admin-photo-grid"
                        style="
                            display:flex;
                            flex-wrap:wrap;
                            gap:15px;
                        "
                    >

                        ${
                            photosHTML ||
                            `
                                <p>
                                    登録写真がありません。
                                </p>
                            `
                        }

                    </div>

                </div>

            `;


            // ============================
            // 写真を見るボタン
            // ============================

            const toggleButton =
                card.querySelector(
                    ".photo-toggle-button"
                );


            const photoContainer =
                card.querySelector(
                    ".admin-photo-container"
                );


            toggleButton.addEventListener(
                "click",
                function() {

                    if (
                        photoContainer.style.display ===
                        "none"
                    ) {

                        photoContainer.style.display =
                            "block";

                        toggleButton.textContent =
                            `📷 写真を隠す（${photos.length}枚）`;

                    } else {

                        photoContainer.style.display =
                            "none";

                        toggleButton.textContent =
                            `📷 写真を見る（${photos.length}枚）`;

                    }

                }
            );


            // ============================
            // 写真クリックイベント
            // ============================

            const photoItems =
                card.querySelectorAll(
                    ".admin-photo-item"
                );


            photoItems.forEach(function(item) {

                item.addEventListener(
                    "click",
                    function() {

                        openPhoto(

                            item.dataset.imageUrl,

                            item.dataset.missionTitle

                        );

                    }
                );

            });


            // ============================
            // チームカード追加
            // ============================

            teamList.appendChild(card);

        });


        console.log(
            "★★ 管理者画面表示完了 ★★"
        );

    }


    catch(error) {

        console.error(
            "★★ 写真データ取得エラー ★★",
            error
        );


        teamList.innerHTML = `

            <div
                class="error-message"
                style="
                    background:#ffe5e5;
                    padding:20px;
                    border-radius:10px;
                "
            >

                <p>
                    チーム情報の取得に失敗しました。
                </p>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }


    finally {

        refreshButton.disabled = false;

        refreshButton.textContent =
            "🔄 最新情報に更新";

    }

}


// ============================
// 初回読み込み
// ============================

loadTeams();


// ============================
// 10秒ごとに自動更新
// ============================

setInterval(function() {

    loadTeams();

}, 10000);