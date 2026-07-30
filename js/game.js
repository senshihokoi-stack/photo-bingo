// ============================
// Firebase
// ============================

import {
    db
} from "./firebase.js";

import {
    collection,
    doc,
    setDoc,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ============================
// 管理者が編集したミッションを読み込む
// ============================

let savedMissions =
    localStorage.getItem("adminMissions");

if (savedMissions) {

    try {

        missions =
            JSON.parse(savedMissions);

        console.log(
            "管理者設定のミッションを読み込みました"
        );

    } catch (error) {

        console.error(
            "ミッション読み込みエラー:",
            error
        );

    }

}


// ============================
// チーム名
// ============================

const team =
    localStorage.getItem("team") || "未選択";

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


// 現在選択中のファイル入力
let currentInput = null;


// ============================
// Cloudinary設定
// ============================

const CLOUDINARY_CLOUD_NAME =
    "ihnq3gpi";

const CLOUDINARY_UPLOAD_PRESET =
    "photo_bingo";


// ============================
// Cloudinaryへアップロード
// ============================

async function uploadToCloudinary(
    imageData
) {

    try {

        const formData =
            new FormData();


        // DataURLをBlobへ変換
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

            const errorText =
                await uploadResponse.text();

            console.error(
                "Cloudinaryアップロード失敗:",
                errorText
            );

            return null;

        }


        const data =
            await uploadResponse.json();


        console.log(
            "Cloudinaryアップロード成功:",
            data.secure_url
        );


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


                    // 縦横比を維持して縮小
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


                    // JPEGとして圧縮
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
// Firestoreへ写真情報を保存
// ============================

async function saveToFirestore(
    index,
    imageUrl,
    mission
) {

    try {

        // ============================
        // チーム
        // teams
        //   └ チーム番号
        //       └ photos
        //           └ ミッション番号
        // ============================

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


        console.log(
            "Firestore保存成功:",
            "チーム",
            team,
            "ミッション",
            index
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
// Firestoreからチームの写真を読み込む
// ============================

async function loadPhotosFromFirestore() {

    try {

        console.log(
            "Firestoreから写真を読み込みます:",
            "チーム",
            team
        );


        // ============================
        // 現在のチームのphotosを取得
        // ============================

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


        console.log(
            "Firestore写真取得件数:",
            photosSnapshot.size
        );


        // ============================
        // 現在表示されているマス
        // ============================

        const cells =
            document.querySelectorAll(
                ".cell"
            );


        // ============================
        // Firestoreの写真を1枚ずつ表示
        // ============================

        photosSnapshot.forEach(
            function (
                photoDoc
            ) {

                const data =
                    photoDoc.data();


                // ドキュメントIDは
                // ミッション番号
                const index =
                    Number(
                        photoDoc.id
                    );


                const cell =
                    cells[index];


                if (
                    !cell
                ) {

                    console.warn(
                        "対応するマスがありません:",
                        index
                    );

                    return;

                }


                if (
                    !data.imageUrl
                ) {

                    console.warn(
                        "画像URLがありません:",
                        index
                    );

                    return;

                }


                // ============================
                // 写真表示
                // ============================

                const photoArea =
                    cell.querySelector(
                        ".photo"
                    );


                if (
                    photoArea
                ) {

                    photoArea.innerHTML = `

                        <img
                            src="${data.imageUrl}"
                            class="photoImage"
                            alt="${data.missionTitle || "登録写真"}"
                        >

                    `;

                }


                // ============================
                // 完了マーク
                // ============================

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

            }
        );


        // ============================
        // 進捗表示
        // ============================

        updateProgressFromFirestore(
            photosSnapshot
        );


        console.log(
            "Firestore写真読み込み完了"
        );


    } catch (error) {

        console.error(
            "Firestore写真読み込みエラー:",
            error
        );

    }

}


// ============================
// Firestoreの写真数から進捗更新
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


    if (
        progress
    ) {

        progress.textContent =
            count +
            " / " +
            missions.length;

    }


    console.log(
        "現在の進捗:",
        count,
        "/",
        missions.length
    );


    // ============================
    // 25個すべて登録
    // ============================

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

    const duration =
        3000;


    const end =
        Date.now() +
        duration;


    function frame() {

        const colors = [

            "#ff0000",
            "#00aaff",
            "#00cc66",
            "#ffcc00",
            "#ff66cc"

        ];


        const particle =
            document.createElement(
                "div"
            );


        particle.className =
            "confetti";


        particle.style.left =
            Math.random() *
            100 +
            "vw";


        particle.style.backgroundColor =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];


        particle.style.animationDuration =
            (
                Math.random() *
                2 +
                2
            ) +
            "s";


        document.body.appendChild(
            particle
        );


        setTimeout(
            function () {

                particle.remove();

            },
            4000
        );


        if (
            Date.now() <
            end
        ) {

            requestAnimationFrame(
                frame
            );

        }

    }


    frame();

}


// ============================
// COMPLETE表示
// ============================

function showComplete() {

    if (
        document.getElementById(
            "completeMessage"
        )
    ) {

        return;

    }


    const message =
        document.createElement(
            "div"
        );


    message.id =
        "completeMessage";


    message.innerHTML = `

        <div class="complete-overlay">

            <div class="complete-box">

                <div class="complete-icon">
                    🏆
                </div>

                <h1>
                    COMPLETE!!
                </h1>

                <p>
                    25個すべての<br>
                    ミッション達成！
                </p>

                <div class="complete-team">
                    チーム ${team}
                </div>

                <button id="completeClose">
                    閉じる
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        message
    );


    document
        .getElementById(
            "completeClose"
        )
        .addEventListener(
            "click",
            function () {

                message.remove();

            }
        );


    launchConfetti();


    setTimeout(
        launchConfetti,
        1000
    );

}


// ============================
// BINGOライン
// ============================

const bingoLines = [

    // 横
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],

    // 縦
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],

    // 斜め
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20]

];


// ============================
// FirestoreからBINGO判定
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
                function (
                    photoDoc
                ) {

                    return Number(
                        photoDoc.id
                    ) === i;

                }
            );

    }


    const cells =
        document.querySelectorAll(
            ".cell"
        );


    bingoLines.forEach(
        function (
            line
        ) {

            const isBingo =
                line.every(
                    function (
                        index
                    ) {

                        return completed[
                            index
                        ];

                    }
                );


            if (
                isBingo
            ) {

                line.forEach(
                    function (
                        index
                    ) {

                        if (
                            cells[index]
                        ) {

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
// BINGOラインをFirestoreから復元
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

    const message =
        document.createElement(
            "div"
        );


    message.className =
        "bingo-message";


    message.innerHTML = `

        <div class="bingo-box">

            <div class="bingo-icon">
                🎉
            </div>

            <h1>
                BINGO!!
            </h1>

            <p>
                BINGO達成！
            </p>

            <button id="bingoClose">
                OK
            </button>

        </div>

    `;


    document.body.appendChild(
        message
    );


    launchConfetti();


    document
        .getElementById(
            "bingoClose"
        )
        .addEventListener(
            "click",
            function () {

                message.remove();

            }
        );

}


// ============================
// ミッション生成
// ============================

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


        cell.innerHTML = `

            <div class="photo">
                📷
            </div>

            <div class="mission-title">
                ${mission.title}
            </div>

        `;


        // ============================
        // ファイル入力
        // ============================

        const input =
            document.createElement(
                "input"
            );


        input.type =
            "file";


        input.accept =
            "image/*";


        input.style.display =
            "none";


        // ============================
        // 写真選択
        // ============================

        input.addEventListener(
            "change",
            function (
                event
            ) {

                const file =
                    event.target.files[0];


                if (
                    !file
                ) {

                    return;

                }


                // ============================
                // 画像圧縮
                // ============================

                compressImage(

                    file,

                    async function (
                        compressedImage
                    ) {

                        // ============================
                        // まず画面に表示
                        // ============================

                        cell
                            .querySelector(
                                ".photo"
                            )
                            .innerHTML = `

                                <img
                                    src="${compressedImage}"
                                    class="photoImage"
                                >

                            `;


                        // ============================
                        // Cloudinaryアップロード
                        // ============================

                        const cloudinaryUrl =
                            await uploadToCloudinary(
                                compressedImage
                            );


                        if (
                            !cloudinaryUrl
                        ) {

                            alert(
                                "写真のアップロードに失敗しました。"
                            );


                            return;

                        }


                        // ============================
                        // Firestore保存
                        // ============================

                        const firestoreSaved =
                            await saveToFirestore(

                                index,

                                cloudinaryUrl,

                                mission

                            );


                        if (
                            !firestoreSaved
                        ) {

                            alert(
                                "写真情報の保存に失敗しました。"
                            );


                            return;

                        }


                        // ============================
                        // 完了マーク
                        // ============================

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


                        // ============================
                        // Firestoreから最新データを取得
                        // ============================

                        await loadPhotosFromFirestore();


                        await restoreBingoLinesFromFirestore();


                        console.log(
                            "写真登録完了:",
                            "チーム",
                            team,
                            "ミッション",
                            index
                        );


                        // ============================
                        // 同じ写真を再選択可能にする
                        // ============================

                        input.value =
                            "";

                    }

                );

            }

        );


        // ============================
        // マスクリック
        // ============================

        cell.addEventListener(
            "click",
            function () {

                modal.style.display =
                    "flex";


                modalTitle.textContent =
                    mission.title;


                modalHint.innerHTML = `

                    <strong>
                        💡 ヒント
                    </strong>

                    <br>

                    ${mission.hint || ""}

                    <br><br>

                    <strong>
                        📚 豆知識
                    </strong>

                    <br>

                    ${mission.info || ""}

                `;


                currentInput =
                    input;

            }
        );


        document.body.appendChild(
            input
        );


        grid.appendChild(
            cell
        );

    }
);


// ============================
// カメラ
// ============================

cameraButton.addEventListener(
    "click",
    function () {

        if (
            !currentInput
        ) {

            return;

        }


        currentInput.setAttribute(
            "capture",
            "environment"
        );


        currentInput.click();


        modal.style.display =
            "none";

    }
);


// ============================
// アルバム
// ============================

albumButton.addEventListener(
    "click",
    function () {

        if (
            !currentInput
        ) {

            return;

        }


        currentInput.removeAttribute(
            "capture"
        );


        currentInput.click();


        modal.style.display =
            "none";

    }
);


// ============================
// 閉じる
// ============================

closeButton.addEventListener(
    "click",
    function () {

        modal.style.display =
            "none";


        currentInput =
            null;

    }
);


// ============================
// 背景クリック
// ============================

modal.addEventListener(
    "click",
    function (
        event
    ) {

        if (
            event.target === modal
        ) {

            modal.style.display =
                "none";


            currentInput =
                null;

        }

    }
);


// ============================
// 初期化
// ============================

async function init() {

    console.log(
        "ゲーム開始:",
        "チーム",
        team
    );


    // ============================
    // まずFirestoreから
    // 現在のチームの写真を読み込む
    // ============================

    await loadPhotosFromFirestore();


    // ============================
    // BINGOラインを復元
    // ============================

    await restoreBingoLinesFromFirestore();


    console.log(
        "初期化完了:",
        "チーム",
        team
    );

}


// ============================
// 起動
// ============================

init();