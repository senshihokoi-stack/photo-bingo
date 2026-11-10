// ============================
// Firebase
// ============================

import {
    db
} from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
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
// ミッション
// ============================

let missions =
    defaultMissions;


// ============================
// Firestoreから最新ミッション取得
// ============================

async function loadMissionsFromFirestore() {

    try {

        console.log(
            "★★ Firestoreからミッション取得開始 ★★"
        );


        const missionDoc =
            await getDocs(
                collection(
                    db,
                    "settings"
                )
            );


        let found =
            false;


        missionDoc.forEach(
            function (
                item
            ) {

                if (
                    item.id === "missions"
                ) {

                    const data =
                        item.data();


                    if (
                        Array.isArray(
                            data.missions
                        ) &&
                        data.missions.length === 25
                    ) {

                        missions =
                            data.missions;

                        found =
                            true;

                    }

                }

            }
        );


        if (
            found
        ) {

            console.log(
                "★★ 管理者設定のミッションを読み込みました ★★",
                missions
            );

        } else {

            console.log(
                "★★ Firestoreに設定がないため初期ミッションを使用 ★★"
            );

        }


    } catch (error) {

        console.error(
            "ミッション取得エラー:",
            error
        );


        console.log(
            "初期ミッションを使用します"
        );

    }

}


// ============================
// チーム
// ============================

const team =
    localStorage.getItem("team") ||
    "未選択";


document.getElementById("team").textContent =
    "チーム " + team;


// ============================
// グリッド
// ============================

const grid =
    document.getElementById("grid");


// ============================
// ポップアップ
// ============================

const modal =
    document.getElementById("modal");

const modalTitle =
    document.getElementById("modalTitle");

const modalHint =
    document.getElementById("modalHint");

const cameraButton =
    document.getElementById("cameraButton");

const albumButton =
    document.getElementById("albumButton");

const closeButton =
    document.getElementById("closeButton");


let currentInput =
    null;


// ============================
// Cloudinary
// ============================

const CLOUDINARY_CLOUD_NAME =
    "ihnq3gpi";

const CLOUDINARY_UPLOAD_PRESET =
    "photo_bingo";


// ============================
// Cloudinaryアップロード
// ============================

async function uploadToCloudinary(
    imageData
) {

    try {

        const formData =
            new FormData();


        const response =
            await fetch(
                imageData
            );


        const blob =
            await response.blob();


        formData.append(
            "file",
            blob
        );


        formData.append(
            "upload_preset",
            CLOUDINARY_UPLOAD_PRESET
        );


        const uploadResponse =
            await fetch(

                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,

                {
                    method:
                        "POST",

                    body:
                        formData
                }

            );


        if (
            !uploadResponse.ok
        ) {

            console.error(
                "Cloudinaryアップロード失敗"
            );

            return null;

        }


        const data =
            await uploadResponse.json();


        return data.secure_url;


    } catch (error) {

        console.error(
            "Cloudinaryエラー:",
            error
        );

        return null;

    }

}


// ============================
// 画像圧縮
// ============================

function compressImage(
    file,
    callback
) {

    const reader =
        new FileReader();


    reader.onload =
        function (
            event
        ) {

            const img =
                new Image();


            img.onload =
                function () {

                    const canvas =
                        document.createElement(
                            "canvas"
                        );


                    const maxSize =
                        800;


                    let width =
                        img.width;

                    let height =
                        img.height;


                    if (
                        width > maxSize ||
                        height > maxSize
                    ) {

                        if (
                            width > height
                        ) {

                            height =
                                height *
                                (
                                    maxSize /
                                    width
                                );

                            width =
                                maxSize;

                        } else {

                            width =
                                width *
                                (
                                    maxSize /
                                    height
                                );

                            height =
                                maxSize;

                        }

                    }


                    canvas.width =
                        width;

                    canvas.height =
                        height;


                    const ctx =
                        canvas.getContext(
                            "2d"
                        );


                    ctx.drawImage(
                        img,
                        0,
                        0,
                        width,
                        height
                    );


                    const compressed =
                        canvas.toDataURL(
                            "image/jpeg",
                            0.7
                        );


                    callback(
                        compressed
                    );

                };


            img.src =
                event.target.result;

        };


    reader.readAsDataURL(
        file
    );

}


// ============================
// Firestore保存
// ============================

async function saveToFirestore(
    index,
    imageUrl,
    mission
) {

    try {

        const teamDoc =
            doc(
                db,
                "teams",
                String(team)
            );


        const missionDoc =
            doc(
                collection(
                    teamDoc,
                    "photos"
                ),
                String(index)
            );


        await setDoc(
            missionDoc,
            {

                team:
                    String(team),

                missionIndex:
                    index,

                missionTitle:
                    mission.title,

                imageUrl:
                    imageUrl,

                createdAt:
                    serverTimestamp()

            }
        );


        return true;


    } catch (error) {

        console.error(
            "Firestore保存エラー:",
            error
        );


        return false;

    }

}
// ============================
// 写真読み込み
// ============================

async function loadPhotosFromFirestore() {

    try {

        const photosRef =
            collection(
                db,
                "teams",
                String(team),
                "photos"
            );


        const photosSnapshot =
            await getDocs(
                photosRef
            );


        const cells =
            document.querySelectorAll(
                ".cell"
            );


        // 古いBINGO表示を解除
        cells.forEach(
            function (cell) {

                cell.classList.remove(
                    "bingo-line"
                );

            }
        );


        photosSnapshot.forEach(
            function (photoDoc) {

                const data =
                    photoDoc.data();


                const index =
                    Number(
                        photoDoc.id
                    );


                const cell =
                    cells[index];


                if (!cell) {
                    return;
                }


                if (!data.imageUrl) {
                    return;
                }


                const photoArea =
                    cell.querySelector(
                        ".photo"
                    );


                if (photoArea) {

                    photoArea.innerHTML = `

                        <img
                            src="${data.imageUrl}"
                            class="photoImage"
                            alt="${data.missionTitle || "登録写真"}"
                        >

                    `;

                }


                if (
                    !cell.querySelector(
                        ".complete"
                    )
                ) {

                    cell.insertAdjacentHTML(

                        "beforeend",

                        `

                        <div class="complete">
                            ✓
                        </div>

                        `

                    );

                }


                // 写真削除ボタンを表示
                addDeleteButton(
                    cell,
                    index
                );

            }
        );


        updateProgressFromFirestore(
            photosSnapshot
        );


        await checkBingoFromFirestore(
            photosSnapshot
        );


    } catch (error) {

        console.error(
            "Firestore写真読み込みエラー:",
            error
        );

    }

}


// ============================
// 写真削除ボタン
// ============================

function addDeleteButton(
    cell,
    index
) {

    // すでにボタンがある場合は重複させない
    if (
        cell.querySelector(
            ".delete-photo-button"
        )
    ) {

        return;

    }


    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "delete-photo-button";


    button.textContent =
        "🗑 写真を削除";


    button.style.cssText = `

        display: block;
        margin: 6px auto;
        padding: 6px 10px;
        border: none;
        border-radius: 6px;
        background: #d9534f;
        color: white;
        font-size: 12px;
        cursor: pointer;
        position: relative;
        z-index: 5;

    `;


    button.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            event.stopPropagation();


            const confirmed =
                window.confirm(

                    `「${missions[index]?.title || "このミッション"}」の写真を削除しますか？`

                );


            if (!confirmed) {
                return;
            }


            button.disabled =
                true;


            button.textContent =
                "削除中...";


            try {

                const photoRef =
                    doc(
                        db,
                        "teams",
                        String(team),
                        "photos",
                        String(index)
                    );


                // Firestoreの写真登録を削除
                await deleteDoc(
                    photoRef
                );


                // 写真マスを未登録状態に戻す
                const photoArea =
                    cell.querySelector(
                        ".photo"
                    );


                if (photoArea) {

                    photoArea.innerHTML =
                        "📷";

                }


                // 完了マークを削除
                const completeMark =
                    cell.querySelector(
                        ".complete"
                    );


                if (completeMark) {

                    completeMark.remove();

                }


                // 削除ボタンを削除
                button.remove();


                // 最新の進捗とBINGO判定を再読み込み
                await loadPhotosFromFirestore();


                await restoreBingoLinesFromFirestore();


            } catch (error) {

                console.error(
                    "写真削除エラー:",
                    error
                );


                alert(
                    "写真の削除に失敗しました。通信状況を確認して、もう一度お試しください。"
                );


                button.disabled =
                    false;


                button.textContent =
                    "🗑 写真を削除";

            }

        }
    );


    cell.appendChild(
        button
    );

}


// ============================
// 進捗
// ============================

function updateProgressFromFirestore(
    photosSnapshot
) {

    const progress =
        document.getElementById(
            "progress"
        );


    const count =
        photosSnapshot.size;


    if (progress) {

        progress.textContent =
            count +
            " / " +
            missions.length;

    }


    if (
        count >= 25 &&
        missions.length === 25
    ) {

        setTimeout(
            showComplete,
            500
        );

    }

}


// ============================
// 紙吹雪
// ============================

function launchConfetti() {

    if (
        typeof confetti === "function"
    ) {

        confetti({

            particleCount: 150,

            spread: 100,

            origin: {
                y: 0.6
            }

        });

    }

}


// ============================
// COMPLETE演出
// ============================

function showComplete() {

    const completeMessage =
        document.getElementById(
            "completeMessage"
        );


    if (completeMessage) {

        completeMessage.style.display =
            "block";

    }


    launchConfetti();

}


// ============================
// BINGOライン
// ============================

const bingoLines = [

    [0, 1, 2, 3, 4],

    [5, 6, 7, 8, 9],

    [10, 11, 12, 13, 14],

    [15, 16, 17, 18, 19],

    [20, 21, 22, 23, 24],


    [0, 5, 10, 15, 20],

    [1, 6, 11, 16, 21],

    [2, 7, 12, 17, 22],

    [3, 8, 13, 18, 23],

    [4, 9, 14, 19, 24],


    [0, 6, 12, 18, 24],

    [4, 8, 12, 16, 20]

];


// ============================
// BINGO判定
// ============================

async function checkBingoFromFirestore(
    photosSnapshot
) {

    const completed =
        [];


    for (
        let i = 0;
        i < 25;
        i++
    ) {

        completed[i] =
            photosSnapshot.docs.some(
                function (photoDoc) {

                    return (
                        Number(
                            photoDoc.id
                        ) === i
                    );

                }
            );

    }


    const cells =
        document.querySelectorAll(
            ".cell"
        );


    // 以前のBINGO表示を解除
    cells.forEach(
        function (cell) {

            cell.classList.remove(
                "bingo-line"
            );

        }
    );


    bingoLines.forEach(
        function (line) {

            const isBingo =
                line.every(
                    function (index) {

                        return completed[
                            index
                        ];

                    }
                );


            if (isBingo) {

                line.forEach(
                    function (index) {

                        if (cells[index]) {

                            cells[index]
                                .classList
                                .add(
                                    "bingo-line"
                                );

                        }

                    }
                );

            }

        }
    );

}


// ============================
// BINGOライン復元
// ============================

async function restoreBingoLinesFromFirestore() {

    try {

        const photosRef =
            collection(
                db,
                "teams",
                String(team),
                "photos"
            );


        const photosSnapshot =
            await getDocs(
                photosRef
            );


        await checkBingoFromFirestore(
            photosSnapshot
        );


    } catch (error) {

        console.error(
            "BINGOライン復元エラー:",
            error
        );

    }

}


// ============================
// BINGO演出
// ============================

function showBingo() {

    const bingoMessage =
        document.getElementById(
            "bingoMessage"
        );


    if (bingoMessage) {

        bingoMessage.style.display =
            "block";

    }


    launchConfetti();

}

// ============================
// 25マス生成
// ============================

function createMissionGrid() {

    grid.innerHTML = "";


    missions.forEach(
        function (
            mission,
            index
        ) {

            const cell =
                document.createElement(
                    "div"
                );


            cell.className =
                "cell";


            cell.dataset.index =
                index;


            cell.innerHTML = `

                <div class="missionNumber">
                    ${index + 1}
                </div>

                <div class="missionTitle">
                    ${mission.title}
                </div>

                <div class="missionHint">
                    ${mission.hint}
                </div>

                <div class="photo">
                    📷
                </div>

            `;


            cell.addEventListener(
                "click",
                function () {

                    openModal(
                        index
                    );

                }
            );


            grid.appendChild(
                cell
            );

        }
    );

}


// ============================
// モーダル表示
// ============================

function openModal(
    index
) {

    currentInput =
        index;


    const mission =
        missions[index];


    modalTitle.textContent =
        mission.title;


    modalHint.textContent =
        mission.hint;


    modal.style.display =
        "flex";

}


// ============================
// モーダル閉じる
// ============================

function closeModal() {

    modal.style.display =
        "none";


    currentInput =
        null;

}


// ============================
// 写真登録
// ============================

async function registerPhoto(
    file
) {

    if (
        currentInput === null
    ) {

        return;

    }


    const index =
        currentInput;


    const mission =
        missions[index];


    const cell =
        document.querySelector(
            `.cell[data-index="${index}"]`
        );


    if (!cell) {

        closeModal();

        return;

    }


    closeModal();


    // 画像圧縮
    compressImage(
        file,
        async function (
            compressedImage
        ) {

            try {

                console.log(
                    "写真アップロード開始"
                );


                // Cloudinaryにアップロード
                const imageUrl =
                    await uploadToCloudinary(
                        compressedImage
                    );


                if (!imageUrl) {

                    alert(
                        "写真のアップロードに失敗しました。"
                    );

                    return;

                }


                // Firestoreに保存
                const saved =
                    await saveToFirestore(
                        index,
                        imageUrl,
                        mission
                    );


                if (!saved) {

                    alert(
                        "写真の登録に失敗しました。"
                    );

                    return;

                }


                // 写真表示
                const photoArea =
                    cell.querySelector(
                        ".photo"
                    );


                if (photoArea) {

                    photoArea.innerHTML = `

                        <img
                            src="${imageUrl}"
                            class="photoImage"
                            alt="${mission.title}"
                        >

                    `;

                }


                // 完了マーク
                if (
                    !cell.querySelector(
                        ".complete"
                    )
                ) {

                    cell.insertAdjacentHTML(

                        "beforeend",

                        `

                        <div class="complete">
                            ✓
                        </div>

                        `

                    );

                }


                // 削除ボタン
                addDeleteButton(
                    cell,
                    index
                );


                // 最新状態を読み込み
                await loadPhotosFromFirestore();


                await restoreBingoLinesFromFirestore();


                console.log(
                    "写真登録完了"
                );


            } catch (error) {

                console.error(
                    "写真登録エラー:",
                    error
                );


                alert(
                    "写真の登録に失敗しました。"
                );

            }

        }
    );

}


// ============================
// カメラ・アルバム
// ============================

function createFileInput(
    capture
) {

    const input =
        document.createElement(
            "input"
        );


    input.type =
        "file";


    input.accept =
        "image/*";


    if (capture) {

        input.capture =
            "environment";

    }


    input.addEventListener(
        "change",
        async function () {

            if (
                input.files &&
                input.files[0]
            ) {

                await registerPhoto(
                    input.files[0]
                );

            }

        }
    );


    input.click();

}


// ============================
// カメラボタン
// ============================

cameraButton.addEventListener(
    "click",
    function () {

        createFileInput(
            true
        );

    }
);


// ============================
// アルバムボタン
// ============================

albumButton.addEventListener(
    "click",
    function () {

        createFileInput(
            false
        );

    }
);


// ============================
// 閉じるボタン
// ============================

closeButton.addEventListener(
    "click",
    closeModal
);


// ============================
// モーダル外クリック
// ============================

modal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === modal
        ) {

            closeModal();

        }

    }
);

// ============================
// 初期化
// ============================

async function init() {

    console.log(
        "★★ ゲーム起動 ★★"
    );


    // ① 最新ミッション取得
    await loadMissionsFromFirestore();


    // ② 25マス生成
    createMissionGrid();


    // ③ 保存済み写真読み込み
    await loadPhotosFromFirestore();


    // ④ BINGOライン復元
    await restoreBingoLinesFromFirestore();


    console.log(
        "★★ ゲーム初期化完了 ★★"
    );

}


// ============================
// ゲーム起動
// ============================

init();