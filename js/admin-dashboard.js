// ============================
// Firebase
// ============================

import {
    db
} from "./firebase.js";

import {
    collection,
    collectionGroup,
    getDocs,
    doc,
    deleteDoc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ============================
// 初期ミッション
// ============================

const defaultMissions = [

    {
        title: "桜島",
        hint: "鹿児島のシンボル！",
        info: "現在も噴火活動を続ける世界有数の活火山です。"
    },

    {
        title: "しろくま",
        hint: "鹿児島名物のかき氷、店頭のオブジェを撮影",
        info: "天文館むじゃきが発祥として有名です。"
    },

    {
        title: "西郷隆盛の銅像",
        hint: "鹿児島の英雄",
        info: "愛称はせごどん、鹿児島と上野の銅像の違いに気付いた？"
    },

    {
        title: "城門",
        hint: "歴史を感じる門を探そう",
        info: "鶴丸城跡周辺で見つかるかも。"
    },

    {
        title: "大久保利通",
        hint: "維新三傑の一人",
        info: "鹿児島中央駅近くにも銅像があります。"
    },

    {
        title: "山路実行委員長",
        hint: "見つけたら一緒に写真！",
        info: "山路さんが皆と写真を撮るのを楽しみにしています😊"
    },

    {
        title: "鹿児島名物",
        hint: "食べ物でも飲み物でもOK",
        info: "黒豚・さつま揚げ・芋焼酎など！"
    },

    {
        title: "〇〇に乗った鰻",
        hint: "とある乗り物に乗った鰻を撮影",
        info: "鹿児島県は養殖うなぎの名産地です。"
    },

    {
        title: "ロケット",
        hint: "宇宙に関するもの",
        info: "天文館宇宙ビルの外壁に...🚀"
    },

    {
        title: "全員自撮り",
        hint: "チーム全員集合！",
        info: "最高の笑顔で撮影しよう！"
    },

    {
        title: "他チーム",
        hint: "他地区の人と写真",
        info: "交流が今回のテーマです！"
    },

    {
        title: "観覧車",
        hint: "赤い観覧車を探そう",
        info: "アミュプラザ鹿児島のシンボルです。"
    },

    {
        title: "路面電車",
        hint: "鹿児島市電を撮影",
        info: "観光客にも人気です。"
    },

    {
        title: "天文館",
        hint: "天文館らしい風景",
        info: "鹿児島最大の繁華街です。"
    },

    {
        title: "黒豚",
        hint: "黒豚グルメを探そう",
        info: "鹿児島ブランドの代表格！"
    },

    {
        title: "顔はめパネル",
        hint: "顔はめパネルで撮影",
        info: "鹿児島らしいパネルを探してみよう！"
    },

    {
        title: "噴水",
        hint: "噴水を見つけよう",
        info: "公園や駅前にあります。"
    },

    {
        title: "マンホール",
        hint: "デザインマンホール",
        info: "鹿児島らしい絵柄を探してみよう！"
    },

    {
        title: "神社",
        hint: "神社で一枚",
        info: "照國神社などがおすすめです。"
    },

    {
        title: "商店街",
        hint: "商店街の景色",
        info: "天文館アーケードも対象です。"
    },

    {
        title: "笑顔",
        hint: "最高の笑顔を撮ろう",
        info: "みんなが笑顔ならOK！"
    },

    {
        title: "灰色の物",
        hint: "灰色のものを探そう",
        info: "桜島の火山灰をイメージ！"
    },

    {
        title: "アーケードのステンドグラス",
        hint: "屋根付き商店街",
        info: "上も見て歩いてみよう！"
    },

    {
        title: "看板",
        hint: "面白い看板を探そう",
        info: "鹿児島らしいものなら何でもOK！"
    },

    {
        title: "自由枠",
        hint: "好きなものを撮影！",
        info: "チームの個性を見せよう！"
    }

];


// ============================
// HTML要素
// ============================

const teamList =
    document.getElementById(
        "teamList"
    );


// ============================
// HTMLエスケープ
// ============================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ============================
// ミッション編集エリア作成
// ============================

function createMissionEditor() {

    const editor =
        document.getElementById(
            "missionEditor"
        );


    if (!editor) {

        console.error(
            "missionEditor が見つかりません"
        );

        return null;

    }


    // すでに一覧があるか確認
    let list =
        document.getElementById(
            "missionEditorList"
        );


    // なければ missionEditor の中に作る
    if (!list) {

        list =
            document.createElement(
                "div"
            );

        list.id =
            "missionEditorList";

        list.className =
            "mission-editor-list";


        // ★ここが今回の修正ポイント
        // insertBefore は使わず、
        // missionEditor の中に直接追加する

        editor.appendChild(
            list
        );

    }


    return list;

}


// ============================
// Firestoreからミッション取得
// ============================

async function loadMissions() {

    try {

        const missionDoc =
            await getDoc(
                doc(
                    db,
                    "settings",
                    "missions"
                )
            );


        if (
            missionDoc.exists()
        ) {

            const data =
                missionDoc.data();


            if (
                Array.isArray(
                    data.missions
                ) &&
                data.missions.length === 25
            ) {

                console.log(
                    "Firestoreからミッション設定を読み込みました"
                );

                return data.missions;

            }

        }


        console.log(
            "Firestoreにミッション設定がないため初期値を使用します"
        );


        return defaultMissions;


    } catch (error) {

        console.error(
            "ミッション取得エラー:",
            error
        );


        return defaultMissions;

    }

}


// ============================
// ミッション編集画面表示
// ============================

async function renderMissionEditor() {

    const list =
        createMissionEditor();


    if (!list) {

        return;

    }


    const missions =
        await loadMissions();


    list.innerHTML =
        "";


    missions.forEach(
        function (
            mission,
            index
        ) {

            const box =
                document.createElement(
                    "div"
                );


            box.className =
                "mission-edit-box";


            box.style.marginBottom =
                "20px";

            box.style.padding =
                "15px";

            box.style.border =
                "1px solid #ddd";

            box.style.borderRadius =
                "10px";

            box.style.background =
                "#fafafa";


            box.innerHTML = `

                <h3>
                    ${index + 1}. ミッション
                </h3>


                <label>
                    ミッション名
                </label>


                <input
                    type="text"
                    class="mission-title-input"
                    value="${escapeHtml(
                        mission.title || ""
                    )}"
                    data-index="${index}"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:10px;
                        margin:5px 0 12px;
                        font-size:16px;
                    "
                >


                <label>
                    ヒント
                </label>


                <textarea
                    class="mission-hint-input"
                    data-index="${index}"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        min-height:70px;
                        padding:10px;
                        margin:5px 0 12px;
                        font-size:15px;
                    "
                >${escapeHtml(
                    mission.hint || ""
                )}</textarea>


                <label>
                    豆知識
                </label>


                <textarea
                    class="mission-info-input"
                    data-index="${index}"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        min-height:70px;
                        padding:10px;
                        margin:5px 0;
                        font-size:15px;
                    "
                >${escapeHtml(
                    mission.info || ""
                )}</textarea>

            `;


            list.appendChild(
                box
            );

        }
    );


    const saveButton =
        document.getElementById(
            "saveMissionsButton"
        );


    if (saveButton) {

        // 重複登録を防ぐため、
        // 一度ボタンを置き換える

        const newSaveButton =
            saveButton.cloneNode(true);


        saveButton.parentNode.replaceChild(
            newSaveButton,
            saveButton
        );


        newSaveButton.addEventListener(
            "click",
            saveMissions
        );

    }

}


// ============================
// ミッション保存
// ============================

async function saveMissions() {

    const button =
        document.getElementById(
            "saveMissionsButton"
        );


    const message =
        document.getElementById(
            "missionSaveMessage"
        );


    const titleInputs =
        document.querySelectorAll(
            ".mission-title-input"
        );


    const hintInputs =
        document.querySelectorAll(
            ".mission-hint-input"
        );


    const infoInputs =
        document.querySelectorAll(
            ".mission-info-input"
        );


    if (
        titleInputs.length !== 25 ||
        hintInputs.length !== 25 ||
        infoInputs.length !== 25
    ) {

        alert(
            "ミッション入力欄が25個見つかりません。"
        );

        return;

    }


    const missions = [];


    for (
        let i = 0;
        i < 25;
        i++
    ) {

        missions.push({

            title:
                titleInputs[i]
                    .value
                    .trim(),

            hint:
                hintInputs[i]
                    .value
                    .trim(),

            info:
                infoInputs[i]
                    .value
                    .trim()

        });

    }


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "💾 保存中...";

    }


    if (message) {

        message.textContent =
            "";

    }


    try {

        await setDoc(

            doc(
                db,
                "settings",
                "missions"
            ),

            {
                missions:
                    missions,

                updatedAt:
                    serverTimestamp()
            }

        );


        // 管理者ブラウザにも保存
        localStorage.setItem(
            "adminMissions",
            JSON.stringify(
                missions
            )
        );


        if (message) {

            message.textContent =
                "✅ ミッション設定を保存しました！";

            message.style.color =
                "green";

        }


        alert(
            "ミッション設定を保存しました！"
        );


        console.log(
            "ミッション保存完了:",
            missions
        );


    } catch (error) {

        console.error(
            "ミッション保存エラー:",
            error
        );


        if (message) {

            message.textContent =
                "❌ 保存に失敗しました。";

            message.style.color =
                "red";

        }


        alert(
            "ミッションの保存に失敗しました。\n\n" +
            error.message
        );


    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "💾 ミッションを保存";

        }

    }

}


// ============================
// チーム一覧取得
// ============================

async function loadTeams() {

    try {

        teamList.innerHTML = `

            <p>
                チーム情報を読み込んでいます...
            </p>

        `;


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
            "写真ドキュメント数:",
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


                let team =
                    data.team;


                // teamフィールドがない場合
                // パスからチーム番号を取得

                if (!team) {

                    const parentTeam =
                        photoDoc.ref
                            .parent
                            .parent;


                    if (parentTeam) {

                        team =
                            parentTeam.id;

                    }

                }


                if (!team) {

                    return;

                }


                if (!teams[team]) {

                    teams[team] = {

                        photos: {},

                        photoList: []

                    };

                }


                const missionIndex =
                    data.missionIndex;


                const photoData = {

                    id:
                        photoDoc.id,

                    imageUrl:
                        data.imageUrl,

                    missionIndex:
                        missionIndex,

                    missionTitle:
                        data.missionTitle || "",

                    createdAt:
                        data.createdAt || null

                };


                teams[team]
                    .photoList
                    .push(
                        photoData
                    );


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


        const teamNumbers =
            Object.keys(
                teams
            );


        // ============================
        // チームなし
        // ============================

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


        teamList.innerHTML =
            "";


        // ============================
        // チーム表示
        // ============================

        teamNumbers.forEach(
            function(team) {

                const teamData =
                    teams[team];


                const completedCount =
                    Object.keys(
                        teamData.photos
                    ).length;


                const progress =
                    Math.round(
                        (
                            completedCount /
                            25
                        ) *
                        100
                    );


                const isComplete =
                    completedCount >= 25;


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
                                data-image-url="${escapeHtml(
                                    photo.imageUrl
                                )}"
                                data-mission-title="${escapeHtml(
                                    photo.missionTitle
                                )}"
                                style="
                                    width:140px;
                                    cursor:pointer;
                                "
                            >

                                <img
                                    src="${escapeHtml(
                                        photo.imageUrl
                                    )}"
                                    alt="${escapeHtml(
                                        photo.missionTitle
                                    )}"
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
                                    ${escapeHtml(
                                        photo.missionTitle
                                    )}

                                </div>

                            </div>

                        `;

                    }
                );


                // ============================
                // カード
                // ============================

                card.innerHTML = `

                    <div
                        class="admin-team-name"
                    >

                        チーム ${escapeHtml(team)}

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
                // 写真クリック
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

                                showPhotoModal(
                                    item.dataset.imageUrl,
                                    item.dataset.missionTitle
                                );

                            }
                        );

                    }
                );


                // ============================
                // カード追加
                // ============================

                teamList.appendChild(
                    card
                );

            }
        );


        console.log(
            "★★ 管理者画面表示完了 ★★"
        );


    } catch (error) {

        console.error(
            "チーム情報取得エラー:",
            error
        );


        teamList.innerHTML = `

            <div class="error-message">

                <p>
                    チーム情報の取得に失敗しました。
                </p>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            </div>

        `;

    }

}


// ============================
// 写真モーダル表示
// ============================

function showPhotoModal(
    imageUrl,
    missionTitle
) {

    let photoModal =
        document.getElementById(
            "photoModal"
        );


    let photoModalImage =
        document.getElementById(
            "photoModalImage"
        );


    let photoModalTitle =
        document.getElementById(
            "photoModalTitle"
        );


    // HTMLにモーダルがある場合
    if (
        photoModal &&
        photoModalImage &&
        photoModalTitle
    ) {

        photoModalImage.src =
            imageUrl;

        photoModalTitle.textContent =
            missionTitle || "";

        photoModal.style.display =
            "flex";

        return;

    }


    // HTMLにない場合は
    // JavaScriptで作成

    photoModal =
        document.createElement(
            "div"
        );


    photoModal.id =
        "photoModal";


    photoModal.style.position =
        "fixed";

    photoModal.style.left =
        "0";

    photoModal.style.top =
        "0";

    photoModal.style.width =
        "100%";

    photoModal.style.height =
        "100%";

    photoModal.style.background =
        "rgba(0,0,0,0.85)";

    photoModal.style.zIndex =
        "99999";

    photoModal.style.display =
        "flex";

    photoModal.style.flexDirection =
        "column";

    photoModal.style.alignItems =
        "center";

    photoModal.style.justifyContent =
        "center";


    photoModal.innerHTML = `

        <button
            id="photoModalCloseButton"
            style="
                position:absolute;
                top:20px;
                right:20px;
                font-size:30px;
                color:white;
                background:none;
                border:none;
                cursor:pointer;
            "
        >
            ✕
        </button>


        <img
            id="photoModalImage"
            src="${escapeHtml(imageUrl)}"
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
        >
            ${escapeHtml(
                missionTitle || ""
            )}
        </div>

    `;


    document.body.appendChild(
        photoModal
    );


    document
        .getElementById(
            "photoModalCloseButton"
        )
        .addEventListener(
            "click",
            function() {

                photoModal.style.display =
                    "none";

            }
        );


    photoModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === photoModal
            ) {

                photoModal.style.display =
                    "none";

            }

        }
    );

}


// ============================
// 初期処理
// ============================

async function init() {

    console.log(
        "★★ 管理者ダッシュボード起動 ★★"
    );


    await renderMissionEditor();


    await loadTeams();


    console.log(
        "★★ 管理者ダッシュボード起動完了 ★★"
    );

}


init();