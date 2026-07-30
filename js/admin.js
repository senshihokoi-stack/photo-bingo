console.log("★★ 写真表示対応版 admin.js 読み込み ★★");

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

const teamList =
    document.getElementById("teamList");


// ============================
// 写真拡大モーダル
// ============================

const modal =
    document.createElement("div");

modal.id =
    "photoModal";

modal.style.display =
    "none";

modal.style.position =
    "fixed";

modal.style.left =
    "0";

modal.style.top =
    "0";

modal.style.width =
    "100%";

modal.style.height =
    "100%";

modal.style.background =
    "rgba(0,0,0,0.85)";

modal.style.zIndex =
    "9999";

modal.style.justifyContent =
    "center";

modal.style.alignItems =
    "center";

modal.style.flexDirection =
    "column";


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
        "
    >
        ✕
    </button>


    <img
        id="photoModalImage"
        src=""
        style="
            max-width:90%;
            max-height:80%;
            object-fit:contain;
            border-radius:10px;
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

document.body.appendChild(
    modal
);


// ============================
// モーダルを閉じる
// ============================

document
    .getElementById("photoModalClose")
    .addEventListener(
        "click",
        function() {

            modal.style.display =
                "none";

        }
    );


modal.addEventListener(
    "click",
    function(event) {

        if (
            event.target === modal
        ) {

            modal.style.display =
                "none";

        }

    }
);


// ============================
// 写真を拡大
// ============================

function openPhoto(
    imageUrl,
    missionTitle
) {

    const image =
        document.getElementById(
            "photoModalImage"
        );

    const title =
        document.getElementById(
            "photoModalTitle"
        );


    image.src =
        imageUrl;


    title.textContent =
        missionTitle || "";


    modal.style.display =
        "flex";

}


// ============================
// チーム読み込み
// ============================

async function loadTeams() {

    console.log(
        "★★ 写真データ取得開始 ★★"
    );


    teamList.innerHTML = `

        <p>
            チーム情報を読み込んでいます...
        </p>

    `;


    try {

        // ============================
        // photosを全部取得
        // ============================

        const photosSnapshot =
            await getDocs(
                collectionGroup(
                    db,
                    "photos"
                )
            );


        console.log(
            "★★ 写真ドキュメント数:",
            photosSnapshot.size
        );


        // ============================
        // チーム別に整理
        // ============================

        const teams = {};


        photosSnapshot.forEach(
            function(photoDoc) {

                const data =
                    photoDoc.data();


                // ----------------------------
                // チーム番号
                // ----------------------------

                let team =
                    data.team;


                // teamがない場合は
                // パスから取得

                if (!team) {

                    const parentTeam =
                        photoDoc.ref
                            .parent
                            .parent;


                    if (
                        parentTeam
                    ) {

                        team =
                            parentTeam.id;

                    }

                }


                if (!team) {

                    console.warn(
                        "チーム番号なし:",
                        photoDoc.id
                    );

                    return;

                }


                // ----------------------------
                // チーム作成
                // ----------------------------

                if (
                    !teams[team]
                ) {

                    teams[team] = {

                        photos: {},

                        photoList: []

                    };

                }


                // ----------------------------
                // ミッション番号
                // ----------------------------

                const missionIndex =
                    data.missionIndex;


                // ----------------------------
                // 写真情報
                // ----------------------------

                const photoData = {

                    id:
                        photoDoc.id,

                    imageUrl:
                        data.imageUrl,

                    missionIndex:
                        missionIndex,

                    missionTitle:
                        data.missionTitle ||
                        "",

                    createdAt:
                        data.createdAt || null

                };


                // ----------------------------
                // 写真一覧
                // ----------------------------

                teams[team]
                    .photoList
                    .push(
                        photoData
                    );


                // ----------------------------
                // ミッション別
                // 同じミッションは1枚として扱う
                // ----------------------------

                if (
                    missionIndex !== undefined &&
                    missionIndex !== null
                ) {

                    teams[team]
                        .photos[
                            missionIndex
                        ] =
                        photoData;

                }

            }
        );


        console.log(
            "★★ チーム集計:",
            teams
        );


        // ============================
        // チームなし
        // ============================

        const teamNumbers =
            Object.keys(
                teams
            );


        if (
            teamNumbers.length === 0
        ) {

            teamList.innerHTML = `

                <div class="no-team">

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

        teamNumbers.sort(
            function(a, b) {

                return (
                    Number(a) -
                    Number(b)
                );

            }
        );


        // ============================
        // 画面クリア
        // ============================

        teamList.innerHTML =
            "";


        // ============================
        // チーム表示
        // ============================

        teamNumbers.forEach(
            function(team) {

                const teamData =
                    teams[team];


                // ----------------------------
                // 完了ミッション数
                // ----------------------------

                const completedCount =
                    Object.keys(
                        teamData.photos
                    ).length;


                // ----------------------------
                // 進捗率
                // ----------------------------

                const progress =
                    Math.round(
                        (
                            completedCount /
                            25
                        ) *
                        100
                    );


                // ----------------------------
                // COMPLETE
                // ----------------------------

                const isComplete =
                    completedCount >= 25;


                // ============================
                // カード
                // ============================

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "admin-team-card";


                if (
                    isComplete
                ) {

                    card.classList.add(
                        "team-complete"
                    );

                }


                // ============================
                // 写真HTML
                // ============================

                let photosHTML =
                    "";


                // ミッション番号順
                // に並べる

                const photos =
                    Object.values(
                        teamData.photos
                    ).sort(
                        function(a, b) {

                            return (
                                Number(
                                    a.missionIndex
                                ) -
                                Number(
                                    b.missionIndex
                                )
                            );

                        }
                    );


                photos.forEach(
                    function(photo) {

                        if (
                            !photo.imageUrl
                        ) {

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
                                    "
                                >

                                    ${photo.missionIndex}.
                                    ${photo.missionTitle}

                                </div>

                            </div>

                        `;

                    }
                );


                // ============================
                // カードHTML
                // ============================

                card.innerHTML = `

                    <div
                        class="admin-team-name"
                    >

                        チーム ${team}

                    </div>


                    <div
                        class="admin-progress"
                    >

                        ${completedCount} / 25

                    </div>


                    <div
                        class="admin-progress-bar"
                    >

                        <div
                            class="admin-progress-fill"
                            style="
                                width:${Math.min(
                                    progress,
                                    100
                                )}%;
                            "
                        ></div>

                    </div>


                    <div
                        class="admin-percentage"
                    >

                        ${progress}%

                    </div>


                    <div
                        style="
                            margin-top:15px;
                            margin-bottom:10px;
                            font-weight:bold;
                        "
                    >

                        📷 登録写真
                        ${photos.length}枚

                    </div>


                    <div
                        class="admin-photo-grid"
                        style="
                            display:flex;
                            flex-wrap:wrap;
                            gap:10px;
                        "
                    >

                        ${photosHTML}

                    </div>


                    ${
                        isComplete
                        ?
                        `
                        <div
                            class="admin-complete"
                            style="
                                margin-top:15px;
                            "
                        >

                            🏆 COMPLETE!!

                        </div>
                        `
                        :
                        ""
                    }

                `;


                // ============================
                // 写真クリックイベント
                // ============================

                const photoItems =
                    card.querySelectorAll(
                        ".admin-photo-item"
                    );


                photoItems.forEach(
                    function(item) {

                        item.addEventListener(
                            "click",
                            function() {

                                openPhoto(

                                    item.dataset
                                        .imageUrl,

                                    item.dataset
                                        .missionTitle

                                );

                            }
                        );

                    }
                );


                // ============================
                // チームカード追加
                // ============================

                teamList.appendChild(
                    card
                );

            }
        );


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

}


// ============================
// 実行
// ============================

loadTeams();